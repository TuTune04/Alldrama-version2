import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User, UserRole } from '../models/User';
import { UserFavorite } from '../models/UserFavorite';
import { UserWatchHistory } from '../models/UserWatchHistory';
import { Movie } from '../models/Movie';
import { Episode } from '../models/Episode';
import { Genre } from '../models/Genre';

// Lấy danh sách người dùng (chỉ admin)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'full_name', 'email', 'role', 'subscriptionExpiredAt', 'createdAt']
    });
    
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng' });
  }
};

// Lấy thông tin người dùng theo ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: ['id', 'full_name', 'email', 'role', 'subscriptionExpiredAt', 'createdAt']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng' });
  }
};

// Cập nhật thông tin người dùng
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { full_name, email, password, role, subscriptionExpiredAt } = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Kiểm tra quyền: chỉ admin mới có thể thay đổi role và subscriptionExpiredAt
    if (req.user && req.user.role !== UserRole.ADMIN) {
      if (role || subscriptionExpiredAt) {
        return res.status(403).json({ message: 'Bạn không có quyền thay đổi vai trò hoặc thời hạn đăng ký' });
      }
      
      // Người dùng chỉ có thể cập nhật thông tin của chính mình
      if (req.user.userId !== parseInt(id)) {
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật thông tin của người dùng khác' });
      }
    }
    
    // Cập nhật thông tin
    const updateData: any = {};
    
    if (full_name) updateData.full_name = full_name;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    
    // Chỉ admin mới có thể cập nhật các trường này
    if (req.user && req.user.role === UserRole.ADMIN) {
      if (role) updateData.role = role;
      if (subscriptionExpiredAt) updateData.subscriptionExpiredAt = subscriptionExpiredAt;
    }
    
    await user.update(updateData);
    
    return res.status(200).json({
      message: 'Cập nhật thông tin người dùng thành công',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        subscriptionExpiredAt: user.subscriptionExpiredAt
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Lỗi khi cập nhật thông tin người dùng' });
  }
};

// Xóa người dùng (chỉ admin)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    await user.destroy();
    
    return res.status(200).json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Lỗi khi xóa người dùng' });
  }
};

// Lấy danh sách phim yêu thích của người dùng
export const getUserFavorites = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra quyền: người dùng chỉ có thể xem danh sách yêu thích của chính mình
    if (req.user && req.user.role !== UserRole.ADMIN && req.user.userId !== parseInt(id)) {
      return res.status(403).json({ message: 'Bạn không có quyền xem danh sách yêu thích của người dùng khác' });
    }
    
    const favorites = await UserFavorite.findAll({
      where: { userId: id },
      include: [
        {
          model: Movie,
          include: [Genre]
        }
      ],
      order: [['favoritedAt', 'DESC']]
    });
    
    return res.status(200).json(favorites);
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách phim yêu thích' });
  }
};

// Lấy lịch sử xem phim của người dùng
export const getUserWatchHistory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra quyền: người dùng chỉ có thể xem lịch sử xem của chính mình
    if (req.user && req.user.role !== UserRole.ADMIN && req.user.userId !== parseInt(id)) {
      return res.status(403).json({ message: 'Bạn không có quyền xem lịch sử xem của người dùng khác' });
    }
    
    const watchHistory = await UserWatchHistory.findAll({
      where: { userId: id },
      include: [
        {
          model: Movie,
          include: [Genre]
        },
        {
          model: Episode
        }
      ],
      order: [['watchedAt', 'DESC']]
    });
    
    return res.status(200).json(watchHistory);
  } catch (error) {
    console.error('Error fetching user watch history:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy lịch sử xem phim' });
  }
}; 
import { Request, Response } from 'express';
import { UserRole } from '../models/User';
import { getUserService, getFavoriteService, getWatchHistoryService } from '../services';

// Lấy danh sách người dùng (chỉ admin)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const userService = getUserService();
    const users = await userService.getUsers();
    
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
    const userService = getUserService();
    
    try {
      const user = await userService.getUserById(Number(id));
      return res.status(200).json(user);
    } catch (error) {
      if (error instanceof Error && error.message === 'Không tìm thấy người dùng') {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
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
    const userService = getUserService();
    
    try {
      const user = await userService.updateUser(
        Number(id),
        { full_name, email, password, role, subscriptionExpiredAt },
        req.user?.id,
        req.user?.role
      );
      
      return res.status(200).json({
        message: 'Cập nhật thông tin người dùng thành công',
        user
      });
    } catch (error) {
      if (error instanceof Error) {
        // Xử lý các lỗi tùy thuộc vào message
        if (error.message.includes('không có quyền') || error.message.includes('Bạn không có quyền')) {
          return res.status(403).json({ message: error.message });
        }
        if (error.message === 'Không tìm thấy người dùng') {
          return res.status(404).json({ message: error.message });
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Lỗi khi cập nhật thông tin người dùng' });
  }
};

// Xóa người dùng (chỉ admin)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userService = getUserService();
    
    try {
      await userService.deleteUser(Number(id));
      return res.status(200).json({ message: 'Xóa người dùng thành công' });
    } catch (error) {
      if (error instanceof Error && error.message === 'Không tìm thấy người dùng') {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
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
    if (req.user && req.user.role !== UserRole.ADMIN && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Bạn không có quyền xem danh sách yêu thích của người dùng khác' });
    }
    
    const favoriteService = getFavoriteService();
    try {
      const favorites = await favoriteService.getUserFavorites(Number(id));
      return res.status(200).json(favorites);
    } catch (error) {
      if (error instanceof Error && error.message === 'Không tìm thấy người dùng') {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
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
    if (req.user && req.user.role !== UserRole.ADMIN && req.user.id !== parseInt(id)) {
      return res.status(403).json({ message: 'Bạn không có quyền xem lịch sử xem của người dùng khác' });
    }
    
    const watchHistoryService = getWatchHistoryService();
    try {
      const watchHistory = await watchHistoryService.getUserWatchHistory(Number(id));
      return res.status(200).json(watchHistory);
    } catch (error) {
      if (error instanceof Error && error.message === 'Không tìm thấy người dùng') {
        return res.status(404).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching user watch history:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy lịch sử xem phim' });
  }
}; 
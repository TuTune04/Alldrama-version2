import bcrypt from 'bcrypt';
import { User, UserRole } from '../../models/User';

/**
 * Interface cho dữ liệu cập nhật user
 */
export interface UpdateUserData {
  full_name?: string;
  email?: string;
  password?: string;
  role?: string;
  subscriptionExpiredAt?: Date;
}

/**
 * Interface cho User response (không bao gồm password)
 */
export interface UserResponse {
  id: number;
  full_name: string;
  email: string;
  role: string;
  subscriptionExpiredAt?: Date;
  createdAt: Date;
}

/**
 * Service xử lý business logic cho User
 */
export class UserService {
  /**
   * Lấy danh sách người dùng
   */
  public async getUsers(): Promise<UserResponse[]> {
    const users = await User.findAll({
      attributes: ['id', 'full_name', 'email', 'role', 'subscriptionExpiredAt', 'createdAt']
    });
    
    return users;
  }

  /**
   * Lấy thông tin người dùng theo ID
   */
  public async getUserById(id: number): Promise<UserResponse> {
    const user = await User.findByPk(id, {
      attributes: ['id', 'full_name', 'email', 'role', 'subscriptionExpiredAt', 'createdAt']
    });
    
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }
    
    return user;
  }

  /**
   * Cập nhật thông tin người dùng
   */
  public async updateUser(
    id: number, 
    data: UpdateUserData, 
    currentUserId?: number, 
    currentUserRole?: string
  ): Promise<UserResponse> {
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }
    
    // Kiểm tra quyền: chỉ admin mới có thể thay đổi role và subscriptionExpiredAt
    if (currentUserRole !== UserRole.ADMIN) {
      if (data.role || data.subscriptionExpiredAt) {
        throw new Error('Bạn không có quyền thay đổi vai trò hoặc thời hạn đăng ký');
      }
      
      // Người dùng chỉ có thể cập nhật thông tin của chính mình
      if (currentUserId !== id) {
        throw new Error('Bạn không có quyền cập nhật thông tin của người dùng khác');
      }
    }
    
    // Cập nhật thông tin
    const updateData: any = {};
    
    if (data.full_name) updateData.full_name = data.full_name;
    if (data.email) updateData.email = data.email;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);
    
    // Chỉ admin mới có thể cập nhật các trường này
    if (currentUserRole === UserRole.ADMIN) {
      if (data.role) updateData.role = data.role;
      if (data.subscriptionExpiredAt) updateData.subscriptionExpiredAt = data.subscriptionExpiredAt;
    }
    
    await user.update(updateData);
    
    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      subscriptionExpiredAt: user.subscriptionExpiredAt,
      createdAt: user.createdAt
    };
  }

  /**
   * Xóa người dùng
   */
  public async deleteUser(id: number): Promise<boolean> {
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }
    
    await user.destroy();
    
    return true;
  }
} 
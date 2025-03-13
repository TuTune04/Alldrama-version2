import { UserService, UpdateUserData } from '../../services/user/userService';
import { User, UserRole } from '../../models/User';
import bcrypt from 'bcrypt';

// Mock Sequelize models
jest.mock('../../models/User', () => {
  return {
    User: {
      findAll: jest.fn(),
      findByPk: jest.fn(),
    },
    UserRole: {
      USER: 'USER',
      ADMIN: 'ADMIN',
      SUBSCRIBER: 'SUBSCRIBER',
    }
  };
});

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation(() => 'hashed_password'),
}));

describe('UserService', () => {
  let userService: UserService;
  let mockUser: any;
  let mockUsers: any[];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    userService = new UserService();

    // Default mock user
    mockUser = {
      id: 1,
      full_name: 'Test User',
      email: 'test@example.com',
      role: UserRole.USER,
      createdAt: new Date(),
      update: jest.fn().mockImplementation(function (this: any, data: any) {
        Object.assign(this, data);
        return Promise.resolve(this);
      }),
      destroy: jest.fn().mockResolvedValue(true),
    };

    // Default mock users array
    mockUsers = [
      { ...mockUser },
      {
        id: 2,
        full_name: 'Admin User',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
        createdAt: new Date(),
      }
    ];

    // Default mock behaviors
    (User.findAll as jest.Mock).mockResolvedValue(mockUsers);
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const result = await userService.getUsers();

      expect(User.findAll).toHaveBeenCalledWith({
        attributes: ['id', 'full_name', 'email', 'role', 'subscriptionExpiredAt', 'createdAt']
      });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });

  describe('getUserById', () => {
    it('should return a user by id', async () => {
      const result = await userService.getUserById(1);

      expect(User.findByPk).toHaveBeenCalledWith(1, {
        attributes: ['id', 'full_name', 'email', 'role', 'subscriptionExpiredAt', 'createdAt']
      });
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('full_name', 'Test User');
    });

    it('should throw an error if user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.getUserById(999)
      ).rejects.toThrow('Không tìm thấy người dùng');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData: UpdateUserData = {
        full_name: 'Updated Name',
        email: 'updated@example.com',
      };

      const result = await userService.updateUser(1, updateData, 1, UserRole.USER);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.update).toHaveBeenCalled();
      expect(result).toHaveProperty('full_name', 'Updated Name');
      expect(result).toHaveProperty('email', 'updated@example.com');
    });

    it('should allow admin to update role and subscription', async () => {
      const updateData: UpdateUserData = {
        role: UserRole.SUBSCRIBER,
        subscriptionExpiredAt: new Date(),
      };

      const result = await userService.updateUser(1, updateData, 2, UserRole.ADMIN);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.update).toHaveBeenCalled();
      expect(result).toHaveProperty('role', UserRole.SUBSCRIBER);
      expect(result).toHaveProperty('subscriptionExpiredAt');
    });

    it('should throw error if non-admin tries to update role', async () => {
      const updateData: UpdateUserData = {
        role: UserRole.ADMIN,
      };

      await expect(
        userService.updateUser(1, updateData, 1, UserRole.USER)
      ).rejects.toThrow('Bạn không có quyền thay đổi vai trò hoặc thời hạn đăng ký');
    });

    it('should throw error if user tries to update another user', async () => {
      const updateData: UpdateUserData = {
        full_name: 'Updated Name',
      };

      await expect(
        userService.updateUser(2, updateData, 1, UserRole.USER)
      ).rejects.toThrow('Bạn không có quyền cập nhật thông tin của người dùng khác');
    });

    it('should throw an error if user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.updateUser(999, { full_name: 'Test' }, 1, UserRole.USER)
      ).rejects.toThrow('Không tìm thấy người dùng');
    });

    it('should hash password if provided', async () => {
      const updateData: UpdateUserData = {
        password: 'newpassword',
      };

      await userService.updateUser(1, updateData, 1, UserRole.USER);

      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(mockUser.update).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      const result = await userService.deleteUser(1);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw an error if user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.deleteUser(999)
      ).rejects.toThrow('Không tìm thấy người dùng');
    });
  });
}); 
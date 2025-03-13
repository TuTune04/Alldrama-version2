import { AuthService } from '../../services/auth/authService';
import { User, UserRole } from '../../models/User';

// Mock Sequelize models
jest.mock('../../models/User', () => {
  return {
    User: {
      findOne: jest.fn(),
      findByPk: jest.fn(),
      create: jest.fn(),
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
  compare: jest.fn().mockImplementation(() => true),
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockImplementation(() => 'token'),
  verify: jest.fn().mockImplementation(() => ({ id: 1, tokenVersion: 1 })),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUser: any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    authService = new AuthService();

    // Mặc định mock user
    mockUser = {
      id: 1,
      full_name: 'Test User',
      email: 'test@example.com',
      password: 'hashed_password',
      role: UserRole.USER,
      tokenVersion: 1,
      update: jest.fn().mockImplementation(function (this: any, data: any) {
        Object.assign(this, data);
        return Promise.resolve(this);
      }),
    };

    // Mock default behavior
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
    (User.create as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const result = await authService.register('Test User', 'test@example.com', 'password');

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(User.create).toHaveBeenCalled();
      
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens).toHaveProperty('accessToken');
      expect(result.tokens).toHaveProperty('refreshToken');
    });

    it('should throw an error if email is already used', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        authService.register('Test User', 'test@example.com', 'password')
      ).rejects.toThrow('Email đã được sử dụng');
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.login('test@example.com', 'password');

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('tokens');
    });

    it('should throw an error if credentials are missing', async () => {
      await expect(
        authService.login('', 'password')
      ).rejects.toThrow('Email và mật khẩu là bắt buộc');
    });

    it('should throw an error if user not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login('test@example.com', 'password')
      ).rejects.toThrow('Email hoặc mật khẩu không chính xác');
    });
  });

  describe('logout', () => {
    it('should logout a user successfully', async () => {
      const result = await authService.logout(1);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.update).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await authService.logout(999);

      expect(result).toBe(false);
    });
  });

  describe('logoutAllDevices', () => {
    it('should logout a user from all devices', async () => {
      const result = await authService.logoutAllDevices(1);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(mockUser.update).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await authService.logoutAllDevices(999);

      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user info', async () => {
      const result = await authService.getCurrentUser(1);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('full_name', 'Test User');
      expect(result).toHaveProperty('email', 'test@example.com');
    });

    it('should throw an error if user not found', async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.getCurrentUser(999)
      ).rejects.toThrow('Không tìm thấy người dùng');
    });
  });
}); 
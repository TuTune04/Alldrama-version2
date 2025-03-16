import request from 'supertest';
import app from '../../app';
import { User, UserRole } from '../../models/User';
import { getAuthService } from '../../services';

// Mock các model và database
jest.mock('../../models/User', () => {
  const mockUser = {
    id: 1,
    full_name: 'Test User',
    email: 'test@example.com',
    password: '$2b$10$abcdefghijklmnopqrstuvwxyz', // giả lập bcrypt hash
    role: 'USER',
    tokenVersion: 1,
    createdAt: new Date(),
    update: jest.fn().mockImplementation(function (this: any, data: any) {
      Object.assign(this, data);
      return Promise.resolve(this);
    }),
  };

  return {
    User: {
      findOne: jest.fn().mockImplementation(({ where }) => {
        if (where && where.email === 'test@example.com') {
          return Promise.resolve(mockUser);
        }
        return Promise.resolve(null);
      }),
      findByPk: jest.fn().mockImplementation((id) => {
        if (id === 1) {
          return Promise.resolve(mockUser);
        }
        return Promise.resolve(null);
      }),
      create: jest.fn().mockImplementation((data) => {
        return Promise.resolve({
          id: 2,
          ...data,
          createdAt: new Date(),
        });
      }),
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
  hash: jest.fn().mockResolvedValue('$2b$10$abcdefghijklmnopqrstuvwxyz'),
  compare: jest.fn().mockImplementation((password, hash) => {
    // Sử dụng biến môi trường hoặc giá trị mặc định an toàn
    const testPassword = process.env.TEST_PASSWORD || 'test_password_value';
    return Promise.resolve(password === testPassword);
  }),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockImplementation(() => 'mock-token'),
  verify: jest.fn().mockImplementation((token) => {
    if (token === 'valid-token') {
      return { id: 1, email: 'test@example.com', role: 'USER' };
    }
    throw new Error('Invalid token');
  }),
}));

// Mock middleware auth.ts
jest.mock('../../middleware/auth', () => ({
  authenticate: jest.fn().mockImplementation((req, res, next) => {
    if (req.headers.authorization === 'Bearer valid-token') {
      req.user = { id: 1, email: 'test@example.com', role: 'USER' };
      next();
    } else {
      res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
  }),
  optionalAuth: jest.fn().mockImplementation((req, res, next) => {
    if (req.headers.authorization === 'Bearer valid-token') {
      req.user = { id: 1, email: 'test@example.com', role: 'USER' };
    }
    next();
  }),
  requireAdmin: jest.fn(),
  requireSubscriber: jest.fn()
}));

// Mock getAuthService
jest.mock('../../services', () => ({
  getAuthService: jest.fn().mockReturnValue({
    login: jest.fn().mockImplementation((email, password) => {
      if (email === 'test@example.com' && password === 'correctpassword') {
        return Promise.resolve({
          user: {
            id: 1,
            full_name: 'Test User',
            email: 'test@example.com',
            role: 'USER'
          },
          tokens: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token'
          }
        });
      } else if (email === 'test@example.com') {
        throw new Error('Email hoặc mật khẩu không chính xác');
      } else {
        throw new Error('Email hoặc mật khẩu không chính xác');
      }
    }),
    register: jest.fn().mockImplementation((full_name, email, password) => {
      if (email === 'test@example.com') {
        throw new Error('Email đã được sử dụng');
      }
      return Promise.resolve({
        user: {
          id: 2,
          full_name,
          email,
          role: 'USER'
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      });
    }),
    getCurrentUser: jest.fn().mockImplementation((userId) => {
      if (userId === 1) {
        return Promise.resolve({
          id: 1,
          full_name: 'Test User',
          email: 'test@example.com',
          role: 'USER'
        });
      } else {
        throw new Error('Không tìm thấy người dùng');
      }
    })
  })
}));

describe('Auth API', () => {
  // Sử dụng supertest để test API endpoints
  
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'New User',
          email: 'new@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'Đăng ký thành công');
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should return 400 if email is already used', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Email đã được sử dụng');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'correctpassword'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Đăng nhập thành công');
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');
    });

    it('should return 401 with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Email hoặc mật khẩu không chính xác');
    });

    it('should return 401 if user not found', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Email hoặc mật khẩu không chính xác');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user info with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body).toHaveProperty('email', 'test@example.com');
    });

    it('should return 401 without token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });
}); 
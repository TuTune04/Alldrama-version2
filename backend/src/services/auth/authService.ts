import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../../models/User';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUserResponse {
  id: number;
  full_name: string;
  email: string;
  role: string;
  subscriptionExpiredAt?: Date;
}

/**
 * Service xử lý authentication và authorization
 */
export class AuthService {
  /**
   * Đăng ký tài khoản mới
   */
  public async register(full_name: string, email: string, password: string): Promise<{ user: AuthUserResponse; tokens: AuthTokens }> {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Email đã được sử dụng');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = await User.create({
      full_name,
      email,
      password: hashedPassword,
      role: UserRole.USER
    });

    // Tạo token
    const tokens = this.generateTokens(newUser);

    // Trả về thông tin người dùng và token
    return {
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role
      },
      tokens
    };
  }

  /**
   * Đăng nhập
   */
  public async login(email: string, password: string): Promise<{ user: AuthUserResponse; tokens: AuthTokens }> {
    // Validate input
    if (!email || !password) {
      throw new Error('Email và mật khẩu là bắt buộc');
    }

    // Tìm user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    // Kiểm tra mật khẩu
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Email hoặc mật khẩu không chính xác');
    }

    // Tạo tokens
    const tokens = this.generateTokens(user);

    // Trả về thông tin
    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        subscriptionExpiredAt: user.subscriptionExpiredAt
      },
      tokens
    };
  }

  /**
   * Refreshes the access token using a valid refresh token
   */
  public async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!token) {
      throw new Error('Không tìm thấy refresh token');
    }

    try {
      // Xác thực refresh token
      const decoded = jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET || 'refresh_default_secret'
      ) as { id: number; tokenVersion: number; tokenId: string };
      
      // Tìm user theo ID
      const user = await User.findByPk(decoded.id);
      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      // Kiểm tra token version (ngăn chặn reuse của token cũ khi logout)
      if (user.tokenVersion !== decoded.tokenVersion) {
        throw new Error('Refresh token không hợp lệ');
      }

      // Tạo tokens mới, sử dụng lại tokenId để duy trì phiên đăng nhập
      return this.generateTokens(user, decoded.tokenId);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token đã hết hạn');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Refresh token không hợp lệ');
      } else {
        throw error;
      }
    }
  }

  /**
   * Lấy thông tin người dùng hiện tại
   */
  public async getCurrentUser(userId: number): Promise<AuthUserResponse> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }

    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      subscriptionExpiredAt: user.subscriptionExpiredAt
    };
  }

  /**
   * Xác thực thông qua liên kết email
   */
  public async emailAuth(email: string, isSignUp: boolean): Promise<{ user: AuthUserResponse; tokens: AuthTokens }> {
    // Nếu là đăng ký mới
    if (isSignUp) {
      // Kiểm tra email đã tồn tại chưa
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error('Email đã được sử dụng');
      }

      // Tạo mật khẩu ngẫu nhiên
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      // Tạo người dùng mới
      const user = await User.create({
        full_name: email.split('@')[0], // Tạm thời lấy phần trước @ làm tên
        email,
        password: hashedPassword,
        role: UserRole.USER
      });

      // Tạo tokens
      const tokens = this.generateTokens(user);

      return {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role
        },
        tokens
      };
    }

    // Nếu là đăng nhập
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Không tìm thấy tài khoản với email này');
    }

    // Tạo tokens
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        subscriptionExpiredAt: user.subscriptionExpiredAt
      },
      tokens
    };
  }

  /**
   * Đăng xuất (vô hiệu hóa refresh token hiện tại)
   * 
   * @param userId ID của người dùng
   * @param tokenId ID của token hiện tại (nếu có)
   * @returns true nếu đăng xuất thành công, false nếu không
   */
  public async logout(userId: number, tokenId?: string): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user) {
      return false;
    }
    
    // Nếu không có tokenId cụ thể thì sẽ vô hiệu hóa tất cả refresh token
    if (!tokenId) {
      await user.update({
        tokenVersion: user.tokenVersion + 1
      });
      return true;
    }
    
    // TODO: Ở đây cần bổ sung thêm cơ chế lưu trữ danh sách các tokenId đã bị vô hiệu hóa
    // để có thể đăng xuất từ một thiết bị cụ thể mà không ảnh hưởng đến các thiết bị khác
    // Có thể sử dụng database hoặc Redis để lưu trữ blacklist tokenId
    
    // Ví dụ: await TokenBlacklist.create({ userId, tokenId, expiredAt: ... });
    
    return true;
  }

  /**
   * Đăng xuất khỏi tất cả thiết bị
   * 
   * Phương thức này luôn vô hiệu hóa tất cả refresh token của người dùng
   * bằng cách tăng tokenVersion, bất kể token nào đang được sử dụng
   * 
   * @param userId ID của người dùng
   * @returns true nếu đăng xuất thành công, false nếu không
   */
  public async logoutAllDevices(userId: number): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user) {
      return false;
    }
    
    // Tăng tokenVersion để vô hiệu hóa tất cả refresh token hiện tại
    await user.update({
      tokenVersion: user.tokenVersion + 1
    });
    
    return true;
  }

  /**
   * Tạo access token và refresh token
   */
  private generateTokens(user: User, existingTokenId?: string): AuthTokens {
    // Sử dụng tokenId hiện có hoặc tạo mới nếu không có
    const tokenId = existingTokenId || 
                   Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);

    // Tạo access token
    const accessToken = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        tokenId
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    // Tạo refresh token
    const refreshToken = jwt.sign(
      { 
        id: user.id, 
        tokenVersion: user.tokenVersion,
        tokenId
      },
      process.env.REFRESH_TOKEN_SECRET || 'refresh_default_secret',
      { expiresIn: '30d' }
    );

    return {
      accessToken,
      refreshToken
    };
  }
} 
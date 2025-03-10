import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    // Cho phép session.user có thể là null khi token hết hạn
    user: (({
      /** Thông tin người dùng từ backend */
      name?: string | null;
      email?: string | null;
      role?: string; // Thêm thuộc tính role
    } & DefaultSession["user"])) | null;
    token?: string; // Thêm thuộc tính token vào session
  }

  interface User extends DefaultUser {
    token?: string; // Thêm thuộc tính token vào user
    role?: string;  // Thêm thuộc tính role cho user
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      name?: string | null;
      email?: string | null;
      role?: string; // Thêm thuộc tính role cho JWT
    };
    token?: string; // Thêm thuộc tính token vào JWT
    exp?: number;   // Thêm thuộc tính exp để lưu thời gian hết hạn của token
  }
}

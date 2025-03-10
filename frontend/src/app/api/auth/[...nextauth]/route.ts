import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

interface CredentialsUser {
  user: { name: string; email: string };
  token: string;
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch("https://alldramaz.com/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });
        if (!res.ok) {
          throw new Error("Login failed");
        }
        const data = await res.json();
        console.log("User (Credentials): ", data);
        return data;
      },
    }),
  ],
  pages: {
    signIn: "/sign-in", // Trang đăng nhập tùy chỉnh
    signOut: "/sign-in", // Sau khi đăng xuất chuyển hướng về trang đăng nhập
  },
  session: {
    strategy: "jwt",
    maxAge: 86400, // 24 giờ tính theo giây
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account) {
        // Xử lý đăng nhập qua Google
        if (account.provider === "google") {
          const { email, name } = profile as { email: string; name: string };
          if (email && name) {
            token.user = { name, email };
            // Đặt thời gian hết hạn token: 24 giờ sau thời điểm đăng nhập
            token.exp = Math.floor(Date.now() / 1000) + 86400;
            try {
              const res = await axios.post(
                "https://alldramaz.com/api/auth/oauth-check",
                { email },
                { withCredentials: true }
              );
              if (res.status === 200) {
                token.token = res.data.token;
                console.log("User checked successfully: ", res.data);
              }
            } catch (error) {
              console.error("Error checking user: ", error);
            }
          } else {
            console.error("Profile information is missing 'name' or 'email'");
          }
        }
        // Xử lý đăng nhập qua Credentials
        else if (account.provider === "credentials") {
          if (user) {
            // Chuyển đổi user sang unknown rồi ép sang CredentialsUser để tránh lỗi kiểu
            const credentialUser = user as unknown as CredentialsUser;
            token.user = credentialUser.user;
            token.token = credentialUser.token;
            token.exp = Math.floor(Date.now() / 1000) + 86400;
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      // Kiểm tra nếu token đã hết hạn
      if (token.exp && Date.now() > token.exp * 1000) {
        session.user = null;
        session.token = "";
      } else {
        session.user = token.user || null;
        session.token = token.token || "";
      }
      console.log("Session: ", session);
      return session;
    },
  },
});

export { handler as GET, handler as POST };

// src/lib/authOptions.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

interface CredentialsUser {
  user: { name: string; email: string };
  token: string;
}

export const authOptions: NextAuthOptions = {
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
        const res = await fetch("http://localhost:5000/api/auth/login", {
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
    signIn: "/sign-in",
    signOut: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account) {
        // Xử lý đăng nhập qua Google
        if (account.provider === "google") {
          const { email, name } = profile as { email: string; name: string };
          if (email && name) {
            token.user = { name, email };
            try {
              const res = await axios.post(
                "http://localhost:5000/api/auth/oauth-check",
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
            const credentialUser = user as unknown as CredentialsUser;
            token.user = credentialUser.user;
            token.token = credentialUser.token;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && token.user) {
        session.user = token.user;
        session.token = token.token ?? "";
      }
      console.log("Session: ", session);
      return session;
    },
  },
};

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email with tenant information
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              isSuperuser: true,
              emailVerified: true,
              tenantUsers: {
                where: { isActive: true },
                select: {
                  tenantId: true,
                  role: true,
                  tenant: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                    },
                  },
                },
                take: 1, // For now, get the first active tenant
              },
            },
          });

          if (!user || !user.password) {
            return null;
          }

          // Verify password
          const isValidPassword = await compare(credentials.password, user.password);
          if (!isValidPassword) {
            return null;
          }

          // Get tenant information
          const tenantUser = user.tenantUsers[0];
          const tenantId = tenantUser?.tenantId || null;
          const tenantRole = tenantUser?.role || user.role;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: tenantRole, // Use tenant-specific role
            isSuperuser: user.isSuperuser,
            tenantId: tenantId,
            tenantName: tenantUser?.tenant?.name || null,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.isSuperuser = user.isSuperuser;
        token.tenantId = user.tenantId;
        token.tenantName = user.tenantName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.isSuperuser = token.isSuperuser;
        session.user.tenantId = token.tenantId;
        session.user.tenantName = token.tenantName;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";
import { UserRole } from "@/types";

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
            where: { email: credentials.email as string },
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
          const isValidPassword = await compare(credentials.password as string, user.password);
          if (!isValidPassword) {
            return null;
          }

          // Get tenant information
          const tenantUser = user.tenantUsers?.[0];
          const tenantId = tenantUser?.tenantId || null;
          const tenantRole = tenantUser?.role || user.role;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: tenantRole as UserRole, // Use tenant-specific role
            isSuperuser: user.isSuperuser,
            tenantId: tenantId,
            tenantSlug: tenantUser?.tenant?.slug || null,
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
        token.tenantSlug = user.tenantSlug;
        // Add security: token issued time and expiry tracking
        token.iat = Math.floor(Date.now() / 1000);
        token.exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as UserRole;
        session.user.isSuperuser = token.isSuperuser as boolean;
        session.user.tenantId = token.tenantId as string | null;
        session.user.tenantSlug = token.tenantSlug as string | null;
        session.user.tenantName = token.tenantName as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 4 * 60 * 60, // Update session every 4 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60, // 24 hours
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { compare } from "bcryptjs";
import { UserRole } from "@/types";
import { createLogger } from "@/lib/logger";

const logger = createLogger('Auth');

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        logger.debug('Authorization attempt', { email: credentials?.email });

        if (!credentials?.email || !credentials?.password) {
          logger.debug('Missing credentials');
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
            logger.debug('User not found or no password set');
            return null;
          }

          // Verify password
          const isValidPassword = await compare(credentials.password as string, user.password);
          if (!isValidPassword) {
            logger.debug('Invalid password attempt');
            return null;
          }

          // Get tenant information
          const tenantUser = user.tenantUsers?.[0];
          const tenantId = tenantUser?.tenantId || null;
          const tenantRole = tenantUser?.role || user.role;

          const authUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: tenantRole as UserRole, // Use tenant-specific role
            isSuperuser: user.isSuperuser ?? false,
            tenantId: tenantId,
            tenantSlug: tenantUser?.tenant?.slug || null,
            tenantName: tenantUser?.tenant?.name || null,
          };

          logger.debug('Authorization successful', { userId: authUser.id, tenantId: authUser.tenantId });
          return authUser;
        } catch (error) {
          logger.error('Authorization error', error);
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

        logger.debug('JWT token updated', { userId: token.sub, tenantId: token.tenantId });
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
      name: process.env.NODE_ENV === 'production'
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});

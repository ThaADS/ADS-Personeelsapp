import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { compare } from "bcryptjs";
import { UserRole } from "@/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('[Authorize] Starting with email:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log('[Authorize] Missing credentials');
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
            console.log('[Authorize] User not found or no password');
            return null;
          }

          // Verify password
          const isValidPassword = await compare(credentials.password as string, user.password);
          if (!isValidPassword) {
            console.log('[Authorize] Invalid password');
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

          console.log('[Authorize] Success! Returning user:', { id: authUser.id, email: authUser.email, tenantId: authUser.tenantId });
          return authUser;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('[JWT Callback] User:', user ? 'Present' : 'Absent');
      console.log('[JWT Callback] Token before:', { sub: token.sub, role: token.role, tenantId: token.tenantId });

      if (user) {
        token.role = user.role;
        token.isSuperuser = user.isSuperuser;
        token.tenantId = user.tenantId;
        token.tenantName = user.tenantName;
        token.tenantSlug = user.tenantSlug;
        // Add security: token issued time and expiry tracking
        token.iat = Math.floor(Date.now() / 1000);
        token.exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60); // 24 hours

        console.log('[JWT Callback] Token after update:', { sub: token.sub, role: token.role, tenantId: token.tenantId });
      }
      return token;
    },
    async session({ session, token }) {
      console.log('[Session Callback] Token:', { sub: token.sub, role: token.role, tenantId: token.tenantId });
      console.log('[Session Callback] Session user before:', session.user);

      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as UserRole;
        session.user.isSuperuser = token.isSuperuser as boolean;
        session.user.tenantId = token.tenantId as string | null;
        session.user.tenantSlug = token.tenantSlug as string | null;
        session.user.tenantName = token.tenantName as string | null;

        console.log('[Session Callback] Session user after:', session.user);
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

import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";
import { getUserTenants, isSuperuser } from "@/lib/tenant";

const prisma = new PrismaClient();

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenantSlug: { label: "Tenant", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
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

          // For superusers, allow access without tenant context
          if (user.isSuperuser) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              isSuperuser: true,
              tenantId: null,
              tenantSlug: null,
            };
          }

          // For regular users, check tenant access
          let tenantId: string | null = null;
          let tenantSlug: string | null = null;

          if (credentials.tenantSlug) {
            // Tenant specified in login
            const tenant = await prisma.tenant.findUnique({
              where: { slug: credentials.tenantSlug },
              select: { id: true, slug: true },
            });

            if (tenant) {
              // Check if user has access to this tenant
              const tenantUser = await prisma.tenantUser.findUnique({
                where: {
                  tenantId_userId: {
                    tenantId: tenant.id,
                    userId: user.id,
                  },
                },
                select: { isActive: true, role: true },
              });

              if (tenantUser?.isActive) {
                tenantId = tenant.id;
                tenantSlug = tenant.slug;
              }
            }
          } else {
            // No tenant specified, get user's first active tenant
            const userTenants = await prisma.tenantUser.findMany({
              where: {
                userId: user.id,
                isActive: true,
              },
              include: {
                tenant: {
                  select: { id: true, slug: true },
                },
              },
              take: 1,
            });

            if (userTenants.length > 0) {
              tenantId = userTenants[0].tenant.id;
              tenantSlug = userTenants[0].tenant.slug;
            }
          }

          // If no valid tenant context found for non-superuser, deny access
          if (!tenantId && !user.isSuperuser) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isSuperuser: user.isSuperuser,
            tenantId,
            tenantSlug,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.isSuperuser = user.isSuperuser;
        token.tenantId = user.tenantId;
        token.tenantSlug = user.tenantSlug;
        token.emailVerified = user.emailVerified;
      }

      // Handle session updates (e.g., tenant switching)
      if (trigger === "update" && session) {
        if (session.tenantId !== undefined) {
          token.tenantId = session.tenantId;
          token.tenantSlug = session.tenantSlug;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.isSuperuser = token.isSuperuser as boolean;
        session.user.tenantId = token.tenantId as string | null;
        session.user.tenantSlug = token.tenantSlug as string | null;
        session.user.emailVerified = token.emailVerified as Date | null;

        // Load user's tenants for tenant switching
        if (token.sub) {
          try {
            const userTenants = await getUserTenants(token.sub as string);
            session.user.tenants = userTenants;
          } catch (error) {
            console.error("Error loading user tenants:", error);
            session.user.tenants = [];
          }
        }
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnSuperAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnPublic = nextUrl.pathname === '/' || nextUrl.pathname.startsWith('/register');

      // Superuser routes
      if (isOnSuperAdmin) {
        if (!isLoggedIn) return false;
        return auth.user.isSuperuser === true;
      }

      // Dashboard routes
      if (isOnDashboard) {
        if (!isLoggedIn) return false;
        
        // Superusers can access any dashboard
        if (auth.user.isSuperuser) return true;
        
        // Regular users need tenant context
        return !!auth.user.tenantId;
      }

      // Redirect authenticated users from login
      if (isOnLogin && isLoggedIn) {
        if (auth.user.isSuperuser) {
          return Response.redirect(new URL('/admin', nextUrl));
        }
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      // Allow public routes
      if (isOnPublic) return true;

      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

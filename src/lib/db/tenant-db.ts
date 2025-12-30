import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { getTenantContext, TenantContext } from '@/lib/auth/tenant-access';

/**
 * Tenant-aware database client that automatically applies tenant filtering
 */
export class TenantDB {
  constructor() {
    // Uses singleton prisma instance
  }

  /**
   * Get the current tenant context and apply to queries
   */
  private async getContext(): Promise<TenantContext> {
    const context = await getTenantContext();
    if (!context) {
      throw new Error('No tenant context available');
    }
    return context;
  }

  /**
   * Tenant-aware timesheet operations
   */
  get timesheet() {
    return {
      findMany: async (args?: Prisma.TimesheetFindManyArgs) => {
        const context = await this.getContext();
        return prisma.timesheet.findMany({
          ...args,
          where: {
            ...args?.where,
            tenantId: context.tenantId,
            // Users can only see their own timesheets unless they have permission
            ...(context.userRole === 'USER' && { userId: context.userId }),
          },
        });
      },

      findUnique: async (args: Prisma.TimesheetFindUniqueArgs) => {
        const context = await this.getContext();
        const timesheet = await prisma.timesheet.findUnique(args);
        
        if (!timesheet) return null;
        
        // Check tenant access
        if (timesheet.tenantId !== context.tenantId) {
          throw new Error('Access denied to this timesheet');
        }
        
        // Check user access for regular users
        if (context.userRole === 'USER' && timesheet.userId !== context.userId) {
          throw new Error('Access denied to this timesheet');
        }
        
        return timesheet;
      },

      create: async (args: Prisma.TimesheetCreateArgs) => {
        const context = await this.getContext();
        // Extract relation fields to avoid type conflicts (tenant/user are relations, not direct data)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { tenant: _tenant, user: _user, ...restData } = args.data as Record<string, unknown>;
        return prisma.timesheet.create({
          ...args,
          data: {
            ...restData,
            tenantId: context.tenantId,
            // Users can only create timesheets for themselves
            userId: context.userRole === 'USER' ? context.userId : (restData.userId as string),
          } as Prisma.TimesheetUncheckedCreateInput,
        });
      },

      update: async (args: Prisma.TimesheetUpdateArgs) => {
        // First verify access to the timesheet
        const existing = await this.timesheet.findUnique({
          where: args.where,
        });

        if (!existing) {
          throw new Error('Timesheet not found');
        }

        return prisma.timesheet.update(args);
      },

      delete: async (args: Prisma.TimesheetDeleteArgs) => {
        // First verify access to the timesheet
        const existing = await this.timesheet.findUnique({
          where: args.where,
        });

        if (!existing) {
          throw new Error('Timesheet not found');
        }

        return prisma.timesheet.delete(args);
      },

      count: async (args?: Prisma.TimesheetCountArgs) => {
        const context = await this.getContext();
        return prisma.timesheet.count({
          ...args,
          where: {
            ...args?.where,
            tenantId: context.tenantId,
            ...(context.userRole === 'USER' && { userId: context.userId }),
          },
        });
      },
    };
  }

  /**
   * Tenant-aware user operations
   */
  get user() {
    return {
      findMany: async (args?: Prisma.UserFindManyArgs) => {
        const context = await this.getContext();

        if (context.isSuperuser) {
          // Superusers can see all users
          return prisma.user.findMany(args);
        }

        // Regular users can only see users in their tenant
        return prisma.user.findMany({
          ...args,
          where: {
            ...args?.where,
            tenantUsers: {
              some: {
                tenantId: context.tenantId,
                isActive: true,
              },
            },
          },
        });
      },

      findUnique: async (args: Prisma.UserFindUniqueArgs) => {
        const context = await this.getContext();
        const user = await prisma.user.findUnique(args);

        if (!user) return null;

        if (context.isSuperuser) {
          return user;
        }

        // Check if user is in the same tenant
        const tenantUser = await prisma.tenantUser.findUnique({
          where: {
            tenantId_userId: {
              tenantId: context.tenantId,
              userId: user.id,
            },
          },
        });

        if (!tenantUser?.isActive) {
          throw new Error('Access denied to this user');
        }

        return user;
      },

      count: async (args?: Prisma.UserCountArgs) => {
        const context = await this.getContext();

        if (context.isSuperuser) {
          return prisma.user.count(args);
        }

        return prisma.user.count({
          ...args,
          where: {
            ...args?.where,
            tenantUsers: {
              some: {
                tenantId: context.tenantId,
                isActive: true,
              },
            },
          },
        });
      },
    };
  }

  /**
   * Tenant-aware tenant user operations
   */
  get tenantUser() {
    return {
      findMany: async (args?: Prisma.TenantUserFindManyArgs) => {
        const context = await this.getContext();

        if (context.isSuperuser) {
          return prisma.tenantUser.findMany(args);
        }

        return prisma.tenantUser.findMany({
          ...args,
          where: {
            ...args?.where,
            tenantId: context.tenantId,
          },
        });
      },

      findUnique: async (args: Prisma.TenantUserFindUniqueArgs) => {
        const context = await this.getContext();
        const tenantUser = await prisma.tenantUser.findUnique(args);

        if (!tenantUser) return null;

        if (context.isSuperuser) {
          return tenantUser;
        }

        if (tenantUser.tenantId !== context.tenantId) {
          throw new Error('Access denied to this tenant user');
        }

        return tenantUser;
      },

      create: async (args: Prisma.TenantUserCreateArgs) => {
        const context = await this.getContext();

        if (!context.isSuperuser) {
          // Regular users can only create in their own tenant
          args.data.tenantId = context.tenantId;
        }

        return prisma.tenantUser.create(args);
      },

      update: async (args: Prisma.TenantUserUpdateArgs) => {
        // First verify access
        const existing = await this.tenantUser.findUnique({
          where: args.where,
        });

        if (!existing) {
          throw new Error('Tenant user not found');
        }

        return prisma.tenantUser.update(args);
      },

      delete: async (args: Prisma.TenantUserDeleteArgs) => {
        // First verify access
        const existing = await this.tenantUser.findUnique({
          where: args.where,
        });

        if (!existing) {
          throw new Error('Tenant user not found');
        }

        return prisma.tenantUser.delete(args);
      },

      count: async (args?: Prisma.TenantUserCountArgs) => {
        const context = await this.getContext();

        if (context.isSuperuser) {
          return prisma.tenantUser.count(args);
        }

        return prisma.tenantUser.count({
          ...args,
          where: {
            ...args?.where,
            tenantId: context.tenantId,
          },
        });
      },
    };
  }

  /**
   * Tenant operations (superuser only for most operations)
   */
  get tenant() {
    return {
      findMany: async (args?: Prisma.TenantFindManyArgs) => {
        const context = await this.getContext();

        if (!context.isSuperuser) {
          // Regular users can only see their own tenant
          return prisma.tenant.findMany({
            ...args,
            where: {
              ...args?.where,
              id: context.tenantId,
            },
          });
        }

        return prisma.tenant.findMany(args);
      },

      findUnique: async (args: Prisma.TenantFindUniqueArgs) => {
        const context = await this.getContext();
        const tenant = await prisma.tenant.findUnique(args);

        if (!tenant) return null;

        if (context.isSuperuser) {
          return tenant;
        }

        if (tenant.id !== context.tenantId) {
          throw new Error('Access denied to this tenant');
        }

        return tenant;
      },

      update: async (args: Prisma.TenantUpdateArgs) => {
        const context = await this.getContext();

        if (!context.isSuperuser) {
          // Regular users can only update their own tenant
          const tenant = await this.tenant.findUnique({
            where: args.where,
          });

          if (!tenant) {
            throw new Error('Tenant not found');
          }
        }

        return prisma.tenant.update(args);
      },
    };
  }

  /**
   * Raw Prisma client for operations that need custom logic
   */
  get raw() {
    return prisma;
  }

  /**
   * Transaction support with tenant context
   */
  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    await this.getContext(); // Verify context exists

    return prisma.$transaction(async (tx) => {
      // Pass the transaction client to the function
      return fn(tx);
    });
  }

  /**
   * Disconnect the client
   */
  async disconnect() {
    await prisma.$disconnect();
  }
}

// Singleton instance
export const tenantDb = new TenantDB();
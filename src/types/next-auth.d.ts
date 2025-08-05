import { UserRole } from './index';
import type { DefaultSession, DefaultUser } from 'next-auth';
import type { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isSuperuser: boolean;
      tenantId: string | null;
      tenantName: string | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: UserRole;
    isSuperuser: boolean;
    tenantId: string | null;
    tenantName: string | null;
    emailVerified?: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: UserRole;
    isSuperuser: boolean;
    tenantId: string | null;
    tenantName: string | null;
    emailVerified?: Date | null;
  }
}

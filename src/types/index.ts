// Enum types to match database schema
export enum UserRole {
  SUPERUSER = 'SUPERUSER',
  TENANT_ADMIN = 'TENANT_ADMIN', 
  MANAGER = 'MANAGER',
  USER = 'USER'
}

export enum PlanType {
  FREEMIUM = 'FREEMIUM',
  STANDARD = 'STANDARD'
}

export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  FREEMIUM = 'FREEMIUM',
  CANCELED = 'CANCELED',
  PAST_DUE = 'PAST_DUE',
  UNPAID = 'UNPAID',
  SUSPENDED = 'SUSPENDED'
}

export type VacationRequest = {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: string;
  createdAt: Date;
}

export type SickLeave = {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  medicalNote?: string;
  uwvReported: boolean;
  expectedReturnDate?: Date;
  status: string;
  createdAt: Date;
}

export type TenantContext = {
  id: string;
  name: string;
  slug: string;
  subscriptionStatus: string;
  currentPlan: string;
  trialEndsAt?: Date;
}
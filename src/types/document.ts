/**
 * Types voor document management en interne opmerkingen
 */

// Document categorieën
export type DocumentCategory = 
  | 'contract'
  | 'identification'
  | 'certificate'
  | 'evaluation'
  | 'medical'
  | 'other';

// Document toegangsniveaus
export type AccessLevel = 
  | 'public'      // Zichtbaar voor alle medewerkers
  | 'restricted'  // Beperkt tot specifieke rollen
  | 'private';    // Alleen voor HR en management

// Document status
export type DocumentStatus = 
  | 'draft'
  | 'active'
  | 'archived'
  | 'deleted';

// Document interface
export interface Document {
  id: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  employeeId?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  expiresAt?: string;
  accessLevel: AccessLevel;
  status: DocumentStatus;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// Document versie interface
export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  changeDescription?: string;
}

// Interne opmerking interface
export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt?: string;
  isPrivate: boolean;
  targetType: 'document' | 'employee' | 'approval' | 'other';
  targetId: string;
  parentId?: string;
  mentions?: string[];
  attachments?: string[];
}

// Document upload request
export interface DocumentUploadRequest {
  title: string;
  description?: string;
  category: DocumentCategory;
  employeeId?: string;
  accessLevel: AccessLevel;
  expiresAt?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// Document update request
export interface DocumentUpdateRequest {
  id: string;
  title?: string;
  description?: string;
  category?: DocumentCategory;
  accessLevel?: AccessLevel;
  expiresAt?: string;
  status?: DocumentStatus;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// Comment create request
export interface CommentCreateRequest {
  content: string;
  targetType: 'document' | 'employee' | 'approval' | 'other';
  targetId: string;
  isPrivate: boolean;
  parentId?: string;
  mentions?: string[];
  attachments?: string[];
}

// Comment update request
export interface CommentUpdateRequest {
  id: string;
  content: string;
  isPrivate?: boolean;
}

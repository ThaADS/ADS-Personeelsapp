/**
 * Document Management Service
 * Handles document uploads, retrieval, and management
 */

import {
  Document,
  DocumentVersion,
  DocumentUploadRequest,
  DocumentUpdateRequest,
  DocumentCategory,
  AccessLevel,
  DocumentStatus
} from "@/types/document";
import { createLogger } from "@/lib/logger";

const logger = createLogger("document-service");

// Interface voor document zoekopties
interface DocumentSearchOptions {
  employeeId?: string;
  category?: DocumentCategory;
  accessLevel?: AccessLevel;
  status?: DocumentStatus;
  tags?: string[];
  query?: string;
  page?: number;
  limit?: number;
}

// Interface voor document response met paginering
interface DocumentResponse {
  items: Document[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Haalt documenten op op basis van zoekopties
 */
export async function fetchDocuments(options: DocumentSearchOptions = {}): Promise<DocumentResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    // Voeg zoekopties toe aan query parameters
    if (options.employeeId) queryParams.append('employeeId', options.employeeId);
    if (options.category) queryParams.append('category', options.category);
    if (options.accessLevel) queryParams.append('accessLevel', options.accessLevel);
    if (options.status) queryParams.append('status', options.status);
    if (options.query) queryParams.append('query', options.query);
    if (options.page) queryParams.append('page', options.page.toString());
    if (options.limit) queryParams.append('limit', options.limit.toString());
    
    // Voeg tags toe als array parameter
    if (options.tags && options.tags.length > 0) {
      options.tags.forEach(tag => queryParams.append('tags', tag));
    }
    
    const response = await fetch(`/api/documents?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error("Error fetching documents", error, { options });
    throw error;
  }
}

/**
 * Haalt een specifiek document op op basis van ID
 */
export async function fetchDocumentById(id: string): Promise<Document> {
  try {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error("Error fetching document", error, { documentId: id });
    throw error;
  }
}

/**
 * Haalt documentversies op voor een specifiek document
 */
export async function fetchDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  try {
    const response = await fetch(`/api/documents/${documentId}/versions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error("Error fetching document versions", error, { documentId });
    throw error;
  }
}

/**
 * Upload een nieuw document
 */
export async function uploadDocument(
  file: File,
  metadata: DocumentUploadRequest
): Promise<Document> {
  try {
    // Maak een FormData object voor het uploaden van het bestand
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await fetch('/api/documents', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error("Error uploading document", error, { fileName: file.name, fileSize: file.size });
    throw error;
  }
}

/**
 * Update een bestaand document
 */
export async function updateDocument(data: DocumentUpdateRequest): Promise<Document> {
  try {
    const response = await fetch(`/api/documents/${data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error("Error updating document", error, { documentId: data.id });
    throw error;
  }
}

/**
 * Upload een nieuwe versie van een bestaand document
 */
export async function uploadDocumentVersion(
  documentId: string,
  file: File,
  changeDescription?: string
): Promise<DocumentVersion> {
  try {
    // Maak een FormData object voor het uploaden van het bestand
    const formData = new FormData();
    formData.append('file', file);
    
    if (changeDescription) {
      formData.append('changeDescription', changeDescription);
    }
    
    const response = await fetch(`/api/documents/${documentId}/versions`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error("Error uploading document version", error, { documentId, fileName: file.name });
    throw error;
  }
}

/**
 * Verwijder een document (markeer als verwijderd)
 */
export async function deleteDocument(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    logger.error("Error deleting document", error, { documentId: id });
    throw error;
  }
}

/**
 * Genereer een beveiligde download URL voor een document
 */
export async function generateDocumentDownloadUrl(id: string): Promise<string> {
  try {
    const response = await fetch(`/api/documents/${id}/download`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.downloadUrl;
  } catch (error) {
    logger.error("Error generating download URL", error, { documentId: id });
    throw error;
  }
}

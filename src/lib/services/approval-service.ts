/**
 * Service voor het ophalen en verwerken van goedkeuringen
 */

import { ApprovalItem, ApprovalResponse, ApprovalActionPayload } from "@/types/approval";
import { createLogger } from "@/lib/logger";

const logger = createLogger("approval-service");
import { validateApproval } from "@/lib/validation/approval-validation";

/**
 * Haalt goedkeuringen op van de API
 */
export async function fetchApprovals(
  type: string = "all",
  status: string = "PENDING",
  page: number = 1,
  limit: number = 10
): Promise<ApprovalResponse> {
  try {
    // Bouw de query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status: status,
    });
    
    if (type !== "all") {
      queryParams.append("type", type);
    }
    
    // Haal de gegevens op van de API
    const response = await fetch(`/api/approvals?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Valideer elk item en voeg validatieresultaten toe
    const validatedApprovals = data.items.map((item: ApprovalItem) => {
      // Type assertion needed because API returns ApprovalItem, not Prisma types
      const validationResult = validateApproval(
        item as unknown as Parameters<typeof validateApproval>[0],
        item.type as "timesheet" | "vacation" | "sickleave"
      );
      return {
        ...item,
        validationWarnings: validationResult.warnings,
        validationErrors: validationResult.errors,
      };
    });
    
    return {
      items: validatedApprovals,
      pagination: data.pagination,
    };
  } catch (error) {
    logger.error("Error fetching approvals", error, { type, status, page, limit });
    throw error;
  }
}

/**
 * Verwerkt goedkeuringen (goedkeuren of afkeuren)
 */
export async function processApprovals(
  payload: ApprovalActionPayload
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch("/api/approvals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    return {
      success: true,
      message: result.message || `${payload.ids.length} item(s) succesvol ${
        payload.action === "approve" ? "goedgekeurd" : "afgekeurd"
      }`,
    };
  } catch (error) {
    logger.error("Error processing approvals", error, { action: payload.action, ids: payload.ids });
    throw error;
  }
}

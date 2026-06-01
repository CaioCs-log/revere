export interface AuditFields {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

/**
 * Helper to create audit fields for a new document.
 * @param userId The ID of the user creating the document.
 * @returns An object containing the audit fields.
 */
export function createAuditFields(userId: string): AuditFields {
  const now = new Date();
  return {
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
    updatedBy: userId,
  };
}

/**
 * Helper to update audit fields for an existing document.
 * @param userId The ID of the user updating the document.
 * @returns An object containing the updated audit fields.
 */
export function updateAuditFields(
  userId: string,
): Pick<AuditFields, "updatedAt" | "updatedBy"> {
  return {
    updatedAt: new Date(),
    updatedBy: userId,
  };
}

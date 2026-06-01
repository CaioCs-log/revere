import { describe, it, expect } from "vitest";
import { createAuditFields, updateAuditFields } from "./auditFields";

describe("auditFields helpers", () => {
  it("should create audit fields correctly", () => {
    const userId = "test-user-id";
    const audit = createAuditFields(userId);

    expect(audit.createdBy).toBe(userId);
    expect(audit.updatedBy).toBe(userId);
    expect(audit.createdAt).toBeInstanceOf(Date);
    expect(audit.updatedAt).toBeInstanceOf(Date);
  });

  it("should update audit fields correctly", () => {
    const userId = "update-user-id";
    const update = updateAuditFields(userId);

    expect(update.updatedBy).toBe(userId);
    expect(update.updatedAt).toBeInstanceOf(Date);
  });
});

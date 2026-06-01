import { describe, it, expect } from "vitest";
import { validateOrder } from "./order.validator";

describe("order validator", () => {
  it("should validate a valid order", () => {
    const result = validateOrder({
      items: [{ productId: "p1", quantity: 2 }],
      customerEmail: "test@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("should fail on invalid email", () => {
    const result = validateOrder({
      items: [{ productId: "p1", quantity: 2 }],
      customerEmail: "invalid-email",
    });
    expect(result.success).toBe(false);
  });
});

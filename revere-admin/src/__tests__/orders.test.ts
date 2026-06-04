import { beforeEach, describe, expect, it } from "vitest";
import {
  cancelOrder,
  changeOrderStatus,
  getOrderById,
  getOrders,
  resetOrders,
  updateOrderInternalNote,
} from "@/lib/data/orders";
import {
  cancelOrderSchema,
  internalNoteSchema,
  statusChangeSchema,
} from "@/lib/validation/order";

describe("M8 — Orders Data Layer", () => {
  beforeEach(() => {
    resetOrders();
  });

  it("should list seeded orders sorted by createdAt desc", async () => {
    const orders = await getOrders();
    expect(orders.length).toBeGreaterThanOrEqual(3);
    for (let i = 1; i < orders.length; i++) {
      const prev = orders[i - 1];
      const curr = orders[i];
      expect(prev.createdAt.getTime()).toBeGreaterThanOrEqual(
        curr.createdAt.getTime(),
      );
    }
  });

  it("should filter orders by status", async () => {
    const confirmed = await getOrders({ status: "confirmed" });
    expect(confirmed.length).toBeGreaterThan(0);
    confirmed.forEach((order) => {
      expect(order.status).toBe("confirmed");
    });
  });

  it("should filter orders by delivery date", async () => {
    const orders = await getOrders({ deliveryDate: "2026-06-10" });
    expect(orders.length).toBeGreaterThan(0);
    orders.forEach((order) => {
      expect(order.delivery.scheduledDate).toBe("2026-06-10");
    });
  });

  it("should find an order by id", async () => {
    const order = await getOrderById("ord-1");
    expect(order).toBeDefined();
    expect(order?.orderNumber).toBe("REV-2026-000001");
  });

  it("should return undefined when order is not found", async () => {
    const order = await getOrderById("non-existent");
    expect(order).toBeUndefined();
  });

  it("should change status and append entry to statusHistory", async () => {
    const before = await getOrderById("ord-3");
    const historyLengthBefore = before!.statusHistory.length;
    const updated = await changeOrderStatus("ord-3", {
      to: "ready_for_delivery",
      reason: "Produção finalizada pela cozinha.",
    });
    expect(updated.status).toBe("ready_for_delivery");
    expect(updated.statusHistory.length).toBe(historyLengthBefore + 1);
    const last = updated.statusHistory[updated.statusHistory.length - 1];
    expect(last.from).toBe("in_production");
    expect(last.to).toBe("ready_for_delivery");
    expect(last.reason).toBe("Produção finalizada pela cozinha.");
    expect(last.changedAt).toBeDefined();
    expect(last.changedBy).toBeDefined();
  });

  it("should set confirmedAt when transitioning to confirmed", async () => {
    const updated = await changeOrderStatus("ord-2", {
      to: "confirmed",
      reason: "Pagamento confirmado por exceção operacional.",
    });
    expect(updated.status).toBe("confirmed");
    expect(updated.confirmedAt).toBeInstanceOf(Date);
  });

  it("should reject changing to the same status", async () => {
    await expect(
      changeOrderStatus("ord-1", { to: "confirmed", reason: "noop" }),
    ).rejects.toThrow("precisa ser diferente");
  });

  it("should require a reason when changing status (Zod)", () => {
    const result = statusChangeSchema.safeParse({
      to: "in_production",
      reason: "",
    });
    expect(result.success).toBe(false);
  });

  it("should reject cancelled transition through changeOrderStatus", async () => {
    await expect(
      changeOrderStatus("ord-1", { to: "cancelled", reason: "qualquer" }),
    ).rejects.toThrow(/cancelOrder/);
  });

  it("should cancel an order with reason and set audit fields", async () => {
    const updated = await cancelOrder("ord-1", {
      reason: "Cliente solicitou cancelamento por WhatsApp.",
    });
    expect(updated.status).toBe("cancelled");
    expect(updated.cancelledAt).toBeInstanceOf(Date);
    expect(updated.audit.cancelledBy).toBeDefined();
    expect(updated.audit.cancellationReason).toBe(
      "Cliente solicitou cancelamento por WhatsApp.",
    );
    const lastEntry = updated.statusHistory[updated.statusHistory.length - 1];
    expect(lastEntry.to).toBe("cancelled");
    expect(lastEntry.from).toBe("confirmed");
  });

  it("should not allow cancelling twice", async () => {
    await cancelOrder("ord-1", { reason: "Cancelamento inicial." });
    await expect(
      cancelOrder("ord-1", { reason: "Tentativa duplicada." }),
    ).rejects.toThrow("já está cancelado");
  });

  it("should not allow cancelling delivered orders", async () => {
    const updated = await changeOrderStatus("ord-3", {
      to: "delivered",
      reason: "Entrega confirmada.",
    });
    expect(updated.status).toBe("delivered");
    await expect(
      cancelOrder("ord-3", { reason: "Tentativa inválida." }),
    ).rejects.toThrow(/entregues/);
  });

  it("should require cancellation reason (Zod)", () => {
    const result = cancelOrderSchema.safeParse({ reason: "" });
    expect(result.success).toBe(false);
  });

  it("should update internal note and trim values", async () => {
    const updated = await updateOrderInternalNote("ord-2", {
      internalNote: "  Anotar alinhamento com cliente.  ",
    });
    expect(updated.notes.internalNote).toBe("Anotar alinhamento com cliente.");
  });

  it("should set internal note to null when empty", async () => {
    const updated = await updateOrderInternalNote("ord-1", {
      internalNote: "",
    });
    expect(updated.notes.internalNote).toBeNull();
  });

  it("should accept null internal note via schema", () => {
    const result = internalNoteSchema.safeParse({ internalNote: null });
    expect(result.success).toBe(true);
  });

  it("should not allow changing status to non-existent status", async () => {
    await expect(
      changeOrderStatus("ord-1", {
        to: "not_a_status" as never,
        reason: "teste",
      }),
    ).rejects.toThrow();
  });
});

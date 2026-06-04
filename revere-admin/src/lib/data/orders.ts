import { updateAuditFields } from "@/lib/audit/auditFields";
import { getCurrentUser } from "@/lib/auth/adminAuth";
import {
  Order,
  OrderItem,
  OrderStatus,
  ORDER_STATUSES,
} from "@/lib/firebase/orders";
import {
  CancelOrderInput,
  InternalNoteInput,
  StatusChangeInput,
} from "@/lib/validation/order";

const baseDate = new Date("2026-06-01T10:00:00Z");
const days = (n: number) => n * 24 * 60 * 60 * 1000;

const seedOrders: Order[] = [
  {
    id: "ord-1",
    orderNumber: "REV-2026-000001",
    userId: "user-mock-1",
    customer: {
      name: "Mariana Souza",
      email: "mariana.souza@example.com",
      phone: "+55 47 99999-1001",
    },
    status: "confirmed",
    payment: {
      provider: "mercado_pago",
      method: "pix",
      status: "approved",
      preferenceId: "pref-001",
      paymentId: "pay-001",
      externalReference: "REV-2026-000001",
      paidAt: new Date(baseDate.getTime() - days(1)),
    },
    items: [
      {
        type: "product_variant",
        productId: "prod-frango",
        variantId: "var-frango-360",
        kitPresetId: null,
        name: "Frango cremoso com purê de abóbora",
        variantName: "Porção 360g",
        quantity: 7,
        unitPriceCents: 2490,
        subtotalCents: 17430,
        imageId: null,
      },
      {
        type: "product_variant",
        productId: "prod-bowl",
        variantId: "var-bowl-360",
        kitPresetId: null,
        name: "Bowl proteico de frango",
        variantName: "Porção 360g",
        quantity: 3,
        unitPriceCents: 2690,
        subtotalCents: 8070,
        imageId: null,
      },
    ],
    coupon: {
      code: "BEMVINDO10",
      discountType: "percentage",
      discountCents: 2550,
    },
    pricing: {
      itemsSubtotalCents: 25500,
      discountCents: 2550,
      deliveryFeeCents: 1500,
      totalCents: 24450,
    },
    delivery: {
      type: "scheduled_delivery",
      neighborhoodId: "nbh-velha",
      neighborhoodName: "Velha",
      address: {
        zipCode: "89045-000",
        street: "Rua XV de Novembro",
        number: "123",
        complement: "Apto 45",
        city: "Blumenau",
        state: "SC",
        reference: "Próximo ao mercado",
      },
      scheduledDate: "2026-06-10",
      scheduledWindow: {
        label: "Manhã",
        startTime: "08:00",
        endTime: "12:00",
      },
      minimumLeadTimeDaysApplied: 5,
    },
    notes: {
      customerNote: "Por favor, entregar com a nota fiscal.",
      internalNote: "Cliente VIP — confirmar entrega por WhatsApp.",
    },
    statusHistory: [
      {
        from: null,
        to: "pending_payment",
        changedAt: new Date(baseDate.getTime() - days(2)),
        changedBy: "system",
        reason: "Pedido criado no checkout.",
      },
      {
        from: "pending_payment",
        to: "confirmed",
        changedAt: new Date(baseDate.getTime() - days(1)),
        changedBy: "system",
        reason: "Pagamento aprovado via webhook Mercado Pago.",
      },
    ],
    audit: {
      createdBy: "system",
      updatedBy: "system",
      cancelledBy: null,
      cancellationReason: null,
    },
    createdAt: new Date(baseDate.getTime() - days(2)),
    updatedAt: new Date(baseDate.getTime() - days(1)),
    createdBy: "system",
    updatedBy: "system",
    confirmedAt: new Date(baseDate.getTime() - days(1)),
    cancelledAt: null,
  },
  {
    id: "ord-2",
    orderNumber: "REV-2026-000002",
    userId: null,
    customer: {
      name: "Rafael Oliveira",
      email: "rafael.oliveira@example.com",
      phone: "+55 47 99999-2002",
    },
    status: "pending_payment",
    payment: {
      provider: "mercado_pago",
      method: "credit_card",
      status: "pending",
      preferenceId: "pref-002",
      paymentId: null,
      externalReference: "REV-2026-000002",
      paidAt: null,
    },
    items: [
      {
        type: "kit_preset",
        productId: null,
        variantId: null,
        kitPresetId: "kit-semana-leve",
        name: "Kit Semana Leve — 7 refeições",
        variantName: null,
        quantity: 1,
        unitPriceCents: 19900,
        subtotalCents: 19900,
        imageId: null,
      },
    ],
    coupon: {
      code: null,
      discountType: null,
      discountCents: 0,
    },
    pricing: {
      itemsSubtotalCents: 19900,
      discountCents: 0,
      deliveryFeeCents: 1000,
      totalCents: 20900,
    },
    delivery: {
      type: "scheduled_delivery",
      neighborhoodId: "nbh-centro",
      neighborhoodName: "Centro",
      address: {
        zipCode: "89010-100",
        street: "Rua das Palmeiras",
        number: "456",
        complement: null,
        city: "Blumenau",
        state: "SC",
        reference: null,
      },
      scheduledDate: "2026-06-12",
      scheduledWindow: {
        label: "Tarde",
        startTime: "13:00",
        endTime: "18:00",
      },
      minimumLeadTimeDaysApplied: 5,
    },
    notes: {
      customerNote: null,
      internalNote: null,
    },
    statusHistory: [
      {
        from: null,
        to: "pending_payment",
        changedAt: new Date(baseDate.getTime() - days(1)),
        changedBy: "system",
        reason: "Pedido criado no checkout.",
      },
    ],
    audit: {
      createdBy: "system",
      updatedBy: "system",
      cancelledBy: null,
      cancellationReason: null,
    },
    createdAt: new Date(baseDate.getTime() - days(1)),
    updatedAt: new Date(baseDate.getTime() - days(1)),
    createdBy: "system",
    updatedBy: "system",
    confirmedAt: null,
    cancelledAt: null,
  },
  {
    id: "ord-3",
    orderNumber: "REV-2026-000003",
    userId: "user-mock-2",
    customer: {
      name: "Camila Pereira",
      email: "camila.pereira@example.com",
      phone: "+55 47 99999-3003",
    },
    status: "in_production",
    payment: {
      provider: "mercado_pago",
      method: "pix",
      status: "approved",
      preferenceId: "pref-003",
      paymentId: "pay-003",
      externalReference: "REV-2026-000003",
      paidAt: new Date(baseDate.getTime() - days(3)),
    },
    items: [
      {
        type: "product_variant",
        productId: "prod-sopa",
        variantId: "var-sopa-300",
        kitPresetId: null,
        name: "Sopa low carb",
        variantName: "Porção 300g",
        quantity: 5,
        unitPriceCents: 1990,
        subtotalCents: 9950,
        imageId: null,
      },
    ],
    coupon: {
      code: null,
      discountType: null,
      discountCents: 0,
    },
    pricing: {
      itemsSubtotalCents: 9950,
      discountCents: 0,
      deliveryFeeCents: 0,
      totalCents: 9950,
    },
    delivery: {
      type: "scheduled_delivery",
      neighborhoodId: "nbh-velha",
      neighborhoodName: "Velha",
      address: {
        zipCode: "89045-200",
        street: "Rua dos Lírios",
        number: "789",
        complement: "Casa 2",
        city: "Blumenau",
        state: "SC",
        reference: "Portão branco",
      },
      scheduledDate: "2026-06-08",
      scheduledWindow: {
        label: "Manhã",
        startTime: "08:00",
        endTime: "12:00",
      },
      minimumLeadTimeDaysApplied: 5,
    },
    notes: {
      customerNote: "Sem cebola, por favor.",
      internalNote: "Verificar produção com cozinha antes do envio.",
    },
    statusHistory: [
      {
        from: null,
        to: "pending_payment",
        changedAt: new Date(baseDate.getTime() - days(4)),
        changedBy: "system",
        reason: "Pedido criado no checkout.",
      },
      {
        from: "pending_payment",
        to: "confirmed",
        changedAt: new Date(baseDate.getTime() - days(3)),
        changedBy: "system",
        reason: "Pagamento aprovado via webhook Mercado Pago.",
      },
      {
        from: "confirmed",
        to: "in_production",
        changedAt: new Date(baseDate.getTime() - days(2)),
        changedBy: "admin@revere.com.br",
        reason: "Pedido liberado para cozinha.",
      },
    ],
    audit: {
      createdBy: "system",
      updatedBy: "admin@revere.com.br",
      cancelledBy: null,
      cancellationReason: null,
    },
    createdAt: new Date(baseDate.getTime() - days(4)),
    updatedAt: new Date(baseDate.getTime() - days(2)),
    createdBy: "system",
    updatedBy: "admin@revere.com.br",
    confirmedAt: new Date(baseDate.getTime() - days(3)),
    cancelledAt: null,
  },
];

const orders: Order[] = [...seedOrders];

const ensureValidStatus = (status: OrderStatus) => {
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error(`Status inválido: ${status}`);
  }
};

const appendHistory = (
  order: Order,
  to: OrderStatus,
  changedBy: string,
  reason: string,
): Order["statusHistory"] => {
  const entry = {
    from: order.status,
    to,
    changedAt: new Date(),
    changedBy,
    reason,
  };
  return [...order.statusHistory, entry];
};

export interface OrderFilters {
  status?: OrderStatus | "all";
  deliveryDate?: string;
}

export const getOrders = async (
  filters: OrderFilters = {},
): Promise<Order[]> => {
  const { status = "all", deliveryDate } = filters;
  let list = [...orders];
  if (status !== "all") {
    list = list.filter((order) => order.status === status);
  }
  if (deliveryDate) {
    list = list.filter(
      (order) => order.delivery.scheduledDate === deliveryDate,
    );
  }
  return Promise.resolve(
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
  );
};

export const getOrderById = async (id: string): Promise<Order | undefined> => {
  return Promise.resolve(orders.find((order) => order.id === id));
};

export const getOrderStatusOptions = (): readonly OrderStatus[] =>
  ORDER_STATUSES;

const assertOrderExists = (id: string): Order => {
  const index = orders.findIndex((order) => order.id === id);
  if (index === -1) {
    throw new Error("Pedido não encontrado.");
  }
  return orders[index];
};

const persistOrder = (order: Order) => {
  const index = orders.findIndex((o) => o.id === order.id);
  orders[index] = order;
  return order;
};

export const changeOrderStatus = async (
  id: string,
  input: StatusChangeInput,
): Promise<Order> => {
  const user = await getCurrentUser();
  const userId = user?.uid || "system";

  const current = assertOrderExists(id);
  ensureValidStatus(input.to);

  if (current.status === input.to) {
    throw new Error("O novo status precisa ser diferente do atual.");
  }

  if (input.to === "cancelled") {
    throw new Error(
      "Use cancelOrder() para cancelar pedidos — exige motivo dedicado.",
    );
  }

  const now = new Date();
  const updated: Order = {
    ...current,
    status: input.to,
    statusHistory: appendHistory(current, input.to, userId, input.reason),
    audit: {
      ...current.audit,
      updatedBy: userId,
    },
    confirmedAt:
      input.to === "confirmed" && !current.confirmedAt
        ? now
        : current.confirmedAt,
    ...updateAuditFields(userId),
  };

  return Promise.resolve(persistOrder(updated));
};

export const cancelOrder = async (
  id: string,
  input: CancelOrderInput,
): Promise<Order> => {
  const user = await getCurrentUser();
  const userId = user?.uid || "system";

  const current = assertOrderExists(id);

  if (current.status === "cancelled") {
    throw new Error("Este pedido já está cancelado.");
  }

  if (current.status === "delivered" || current.status === "refunded") {
    throw new Error(
      "Pedidos entregues ou reembolsados não podem ser cancelados.",
    );
  }

  const now = new Date();
  const updated: Order = {
    ...current,
    status: "cancelled",
    statusHistory: appendHistory(current, "cancelled", userId, input.reason),
    audit: {
      ...current.audit,
      updatedBy: userId,
      cancelledBy: userId,
      cancellationReason: input.reason,
    },
    cancelledAt: now,
    ...updateAuditFields(userId),
  };

  return Promise.resolve(persistOrder(updated));
};

export const updateOrderInternalNote = async (
  id: string,
  input: InternalNoteInput,
): Promise<Order> => {
  const user = await getCurrentUser();
  const userId = user?.uid || "system";

  const current = assertOrderExists(id);

  const updated: Order = {
    ...current,
    notes: {
      ...current.notes,
      internalNote: input.internalNote?.trim()
        ? input.internalNote.trim()
        : null,
    },
    audit: {
      ...current.audit,
      updatedBy: userId,
    },
    ...updateAuditFields(userId),
  };

  return Promise.resolve(persistOrder(updated));
};

export const resetOrders = () => {
  orders.length = 0;
  orders.push(...seedOrders.map((o) => ({ ...o, id: o.id })));
};

export const getOrderItemsTotalCents = (items: OrderItem[]): number =>
  items.reduce((sum, item) => sum + item.subtotalCents, 0);

export const formatOrderNumber = (orderNumber: string): string => orderNumber;

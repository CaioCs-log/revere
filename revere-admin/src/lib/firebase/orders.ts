import { AuditFields } from "../audit/auditFields";

export type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "in_production"
  | "ready_for_delivery"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentMethod = "pix" | "credit_card" | "unknown";

export type PaymentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "refunded";

export type PaymentProvider = "mercado_pago";

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface OrderPayment {
  provider: PaymentProvider;
  method: PaymentMethod;
  status: PaymentStatus;
  preferenceId: string | null;
  paymentId: string | null;
  externalReference: string | null;
  paidAt: Date | null;
}

export type OrderItemType = "product_variant" | "kit_preset";

export interface OrderItem {
  type: OrderItemType;
  productId: string | null;
  variantId: string | null;
  kitPresetId: string | null;
  name: string;
  variantName: string | null;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
  imageId: string | null;
}

export type OrderCouponDiscountType =
  | "percentage"
  | "fixed_amount"
  | "free_shipping"
  | null;

export interface OrderCoupon {
  code: string | null;
  discountType: OrderCouponDiscountType;
  discountCents: number;
}

export interface OrderPricing {
  itemsSubtotalCents: number;
  discountCents: number;
  deliveryFeeCents: number;
  totalCents: number;
}

export interface OrderDeliveryWindow {
  label: string;
  startTime: string;
  endTime: string;
}

export interface OrderDeliveryAddress {
  zipCode: string;
  street: string;
  number: string;
  complement: string | null;
  city: string;
  state: string;
  reference: string | null;
}

export interface OrderDelivery {
  type: "scheduled_delivery";
  neighborhoodId: string;
  neighborhoodName: string;
  address: OrderDeliveryAddress;
  scheduledDate: string;
  scheduledWindow: OrderDeliveryWindow;
  minimumLeadTimeDaysApplied: number;
}

export interface OrderNotes {
  customerNote: string | null;
  internalNote: string | null;
}

export interface OrderStatusHistoryEntry {
  from: OrderStatus | null;
  to: OrderStatus;
  changedAt: Date;
  changedBy: string | null;
  reason: string | null;
}

export interface OrderAudit {
  createdBy: string | null;
  updatedBy: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
}

export interface Order extends AuditFields {
  id: string;
  orderNumber: string;

  userId: string | null;
  customer: OrderCustomer;

  status: OrderStatus;

  payment: OrderPayment;

  items: OrderItem[];

  coupon: OrderCoupon;

  pricing: OrderPricing;

  delivery: OrderDelivery;

  notes: OrderNotes;

  statusHistory: OrderStatusHistoryEntry[];

  audit: OrderAudit;

  confirmedAt: Date | null;
  cancelledAt: Date | null;
}

export const ORDER_STATUSES: readonly OrderStatus[] = [
  "pending_payment",
  "confirmed",
  "in_production",
  "ready_for_delivery",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
];

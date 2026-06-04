import { z } from "zod";
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  OrderItemType,
  ORDER_STATUSES,
} from "../firebase/orders";

export const orderStatusSchema = z.enum([
  "pending_payment",
  "confirmed",
  "in_production",
  "ready_for_delivery",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
]);

export const orderItemTypeSchema = z.enum(["product_variant", "kit_preset"]);

export const paymentMethodSchema = z.enum(["pix", "credit_card", "unknown"]);

export const paymentStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "refunded",
]);

const trimmed = (s: string) => s.trim();

export const statusChangeSchema = z
  .object({
    to: orderStatusSchema,
    reason: z
      .string()
      .transform(trimmed)
      .refine((value) => value.length > 0, {
        message: "Motivo é obrigatório para registrar a mudança de status.",
      }),
  })
  .refine(
    (data) => {
      const allowedFromCancellation = ["cancelled", "refunded"] as const;
      if (allowedFromCancellation.includes(data.to as never)) {
        return true;
      }
      return data.reason.length >= 3;
    },
    {
      message: "Motivo deve ter pelo menos 3 caracteres.",
      path: ["reason"],
    },
  );

export const cancelOrderSchema = z.object({
  reason: z
    .string()
    .transform(trimmed)
    .refine((value) => value.length >= 3, {
      message: "Motivo de cancelamento é obrigatório (mínimo 3 caracteres).",
    }),
});

export const internalNoteSchema = z.object({
  internalNote: z.string().nullable(),
});

export type StatusChangeInput = z.infer<typeof statusChangeSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type InternalNoteInput = z.infer<typeof internalNoteSchema>;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Aguardando pagamento",
  confirmed: "Confirmado",
  in_production: "Em produção",
  ready_for_delivery: "Pronto para entrega",
  out_for_delivery: "Saiu para entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pagamento pendente",
  approved: "Pagamento aprovado",
  rejected: "Pagamento recusado",
  cancelled: "Pagamento cancelado",
  refunded: "Pagamento reembolsado",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: "PIX",
  credit_card: "Cartão de crédito",
  unknown: "Não definido",
};

export const ORDER_ITEM_TYPE_LABELS: Record<OrderItemType, string> = {
  product_variant: "Produto",
  kit_preset: "Kit",
};

export { ORDER_STATUSES };

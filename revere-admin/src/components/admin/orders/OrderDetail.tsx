"use client";

import { useState } from "react";
import {
  Ban,
  Info,
  Package,
  ShieldCheck,
  StickyNote,
  Truck,
  User as UserIcon,
  Wallet,
} from "lucide-react";
import { Order, OrderStatus } from "@/lib/firebase/orders";
import {
  ORDER_STATUS_LABELS,
  ORDER_ITEM_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/validation/order";
import { StatusChangeForm } from "./StatusChangeForm";
import { CancelOrderDialog } from "./CancelOrderDialog";

interface OrderDetailProps {
  order: Order;
  onChangeStatus: (to: OrderStatus, reason: string) => Promise<void>;
  onCancel: (reason: string) => Promise<void>;
  onSaveInternalNote: (note: string | null) => Promise<void>;
  isMutating: boolean;
}

const formatBRL = (cents: number): string =>
  `R$ ${(cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDateTime = (date: Date | string | null) => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (date: Date | string | null) => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
};

const CANCELLABLE_STATUSES: OrderStatus[] = [
  "pending_payment",
  "confirmed",
  "in_production",
  "ready_for_delivery",
  "out_for_delivery",
];

export function OrderDetail({
  order,
  onChangeStatus,
  onCancel,
  onSaveInternalNote,
  isMutating,
}: OrderDetailProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(order.notes.internalNote ?? "");
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  const handleSaveNote = async () => {
    try {
      setNoteSaving(true);
      setNoteSaved(false);
      await onSaveInternalNote(noteDraft.trim() ? noteDraft.trim() : null);
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2500);
    } finally {
      setNoteSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs tracking-wide text-zinc-500 uppercase">
              Pedido
            </p>
            <h1 className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {order.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Criado em {formatDateTime(order.createdAt)} · Atualizado em{" "}
              {formatDateTime(order.updatedAt)}
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-800">
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            {canCancel && (
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                disabled={isMutating}
                className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-900/20"
              >
                <Ban className="h-3.5 w-3.5" />
                Cancelar pedido
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-6 sm:grid-cols-2 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start gap-3">
          <UserIcon className="mt-0.5 h-5 w-5 text-zinc-400" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Cliente
            </h3>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {order.customer.name}
            </p>
            <p className="text-sm text-zinc-500">{order.customer.email}</p>
            <p className="text-sm text-zinc-500">{order.customer.phone}</p>
            {order.userId && (
              <p className="text-xs text-zinc-400">userId: {order.userId}</p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Truck className="mt-0.5 h-5 w-5 text-zinc-400" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Entrega
            </h3>
            <p className="text-sm text-zinc-700 dark:text-zinc-200">
              {order.delivery.address.street}, {order.delivery.address.number}
              {order.delivery.address.complement
                ? ` · ${order.delivery.address.complement}`
                : ""}
            </p>
            <p className="text-sm text-zinc-500">
              {order.delivery.address.city}/{order.delivery.address.state} · CEP{" "}
              {order.delivery.address.zipCode}
            </p>
            <p className="text-sm text-zinc-500">
              Bairro: {order.delivery.neighborhoodName}
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-200">
              {formatDate(order.delivery.scheduledDate)} ·{" "}
              {order.delivery.scheduledWindow.label} (
              {order.delivery.scheduledWindow.startTime}–
              {order.delivery.scheduledWindow.endTime})
            </p>
            {order.delivery.address.reference && (
              <p className="text-xs text-zinc-500">
                Ref.: {order.delivery.address.reference}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-4 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Pagamento
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1 text-sm">
            <p className="text-zinc-500">Status</p>
            <p className="font-medium text-zinc-800 dark:text-zinc-200">
              {PAYMENT_STATUS_LABELS[order.payment.status]}
            </p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-zinc-500">Método</p>
            <p className="font-medium text-zinc-800 dark:text-zinc-200">
              {PAYMENT_METHOD_LABELS[order.payment.method]}
            </p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-zinc-500">Provedor</p>
            <p className="font-medium text-zinc-800 dark:text-zinc-200">
              {order.payment.provider}
            </p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-zinc-500">Pago em</p>
            <p className="font-medium text-zinc-800 dark:text-zinc-200">
              {formatDateTime(order.payment.paidAt)}
            </p>
          </div>
          {order.payment.preferenceId && (
            <div className="space-y-1 text-sm sm:col-span-2">
              <p className="text-zinc-500">Referências</p>
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                preferenceId: {order.payment.preferenceId}
              </p>
              {order.payment.paymentId && (
                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                  paymentId: {order.payment.paymentId}
                </p>
              )}
              {order.payment.externalReference && (
                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                  externalReference: {order.payment.externalReference}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 flex items-start gap-3 rounded-md bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            O Admin <strong>não</strong> marca pagamento como aprovado
            automaticamente. A confirmação de pagamento real deve vir do
            Backend/webhook do Mercado Pago.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Itens
          </h3>
        </div>
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {order.items.map((item, index) => (
            <li
              key={`${item.type}-${item.productId ?? item.kitPresetId ?? index}`}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {item.name}
                </p>
                {item.variantName && (
                  <p className="text-xs text-zinc-500">{item.variantName}</p>
                )}
                <p className="text-xs text-zinc-400">
                  {ORDER_ITEM_TYPE_LABELS[item.type]} · {item.quantity}x ·{" "}
                  {formatBRL(item.unitPriceCents)}
                </p>
              </div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {formatBRL(item.subtotalCents)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-2 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
          <div className="flex justify-between">
            <dt className="text-zinc-500">Subtotal dos itens</dt>
            <dd className="font-medium text-zinc-800 dark:text-zinc-200">
              {formatBRL(order.pricing.itemsSubtotalCents)}
            </dd>
          </div>
          {order.coupon.code && (
            <div className="flex justify-between text-zinc-700 dark:text-zinc-300">
              <dt>
                Cupom{" "}
                <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                  {order.coupon.code}
                </code>
                {order.coupon.discountType && (
                  <span className="ml-1 text-xs text-zinc-500">
                    ({order.coupon.discountType})
                  </span>
                )}
              </dt>
              <dd>-{formatBRL(order.coupon.discountCents)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-zinc-500">Descontos</dt>
            <dd className="font-medium text-zinc-800 dark:text-zinc-200">
              -{formatBRL(order.pricing.discountCents)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-500">Frete</dt>
            <dd className="font-medium text-zinc-800 dark:text-zinc-200">
              {formatBRL(order.pricing.deliveryFeeCents)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold dark:border-zinc-800">
            <dt className="text-zinc-900 dark:text-zinc-50">Total</dt>
            <dd className="text-zinc-900 dark:text-zinc-50">
              {formatBRL(order.pricing.totalCents)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-3 flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Observações
          </h3>
        </div>

        {order.notes.customerNote ? (
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <p className="text-xs font-semibold text-zinc-500 uppercase">
              Cliente
            </p>
            <p className="mt-1 whitespace-pre-line">
              {order.notes.customerNote}
            </p>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Cliente não deixou observação.
          </p>
        )}

        <div className="mt-4 space-y-2">
          <label
            htmlFor="internal-note"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Observação interna (somente Admin)
          </label>
          <textarea
            id="internal-note"
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            rows={3}
            placeholder="Anote alinhamentos operacionais, exceções, próximos passos."
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              {noteSaved
                ? "Observação interna salva."
                : "Use para registrar contexto operacional do pedido."}
            </p>
            <button
              type="button"
              onClick={handleSaveNote}
              disabled={isMutating || noteSaving}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {noteSaving ? "Salvando..." : "Salvar observação"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-zinc-400" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Histórico de status
          </h3>
        </div>
        <ol className="space-y-3 border-l-2 border-zinc-200 pl-4 dark:border-zinc-800">
          {order.statusHistory.map((entry, index) => (
            <li
              key={`${entry.changedAt.toString()}-${index}`}
              className="text-sm"
            >
              <p className="font-medium text-zinc-900 dark:text-zinc-50">
                {entry.from
                  ? `${ORDER_STATUS_LABELS[entry.from]} → `
                  : "Início: "}
                {ORDER_STATUS_LABELS[entry.to]}
              </p>
              <p className="text-xs text-zinc-500">
                {formatDateTime(entry.changedAt)} ·{" "}
                {entry.changedBy ?? "sistema"}
              </p>
              {entry.reason && (
                <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                  Motivo: {entry.reason}
                </p>
              )}
            </li>
          ))}
        </ol>
        {order.audit.cancellationReason && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
            <p className="font-semibold">Cancelamento</p>
            <p>
              Responsável: {order.audit.cancelledBy ?? "—"} · Data:{" "}
              {formatDateTime(order.cancelledAt)}
            </p>
            <p>Motivo: {order.audit.cancellationReason}</p>
          </div>
        )}
      </section>

      {order.status !== "cancelled" &&
        order.status !== "delivered" &&
        order.status !== "refunded" && (
          <StatusChangeForm
            currentStatus={order.status}
            onSubmit={onChangeStatus}
            isSubmitting={isMutating}
          />
        )}

      <CancelOrderDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={async (reason) => {
          await onCancel(reason);
          setCancelOpen(false);
        }}
        isSubmitting={isMutating}
        orderNumber={order.orderNumber}
      />
    </div>
  );
}

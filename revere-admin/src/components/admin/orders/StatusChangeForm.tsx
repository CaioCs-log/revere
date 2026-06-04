"use client";

import { useState } from "react";
import { z } from "zod";
import { Info } from "lucide-react";
import { OrderStatus, ORDER_STATUSES } from "@/lib/firebase/orders";
import {
  statusChangeSchema,
  ORDER_STATUS_LABELS,
} from "@/lib/validation/order";

interface StatusChangeFormProps {
  currentStatus: OrderStatus;
  onSubmit: (to: OrderStatus, reason: string) => Promise<void>;
  isSubmitting: boolean;
}

const EXCLUDED_FROM_MANUAL: OrderStatus[] = ["cancelled"];

const isTransitionAllowed = (current: OrderStatus, to: OrderStatus) => {
  if (current === to) return false;
  if (EXCLUDED_FROM_MANUAL.includes(to)) return false;
  return ORDER_STATUSES.includes(to);
};

export function StatusChangeForm({
  currentStatus,
  onSubmit,
  isSubmitting,
}: StatusChangeFormProps) {
  const [target, setTarget] = useState<OrderStatus>("in_production");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const payload: { to: OrderStatus; reason: string } = {
        to: target,
        reason,
      };
      const validated = statusChangeSchema.parse(payload);
      await onSubmit(validated.to, validated.reason);
      setReason("");
    } catch (err) {
      if (err instanceof z.ZodError) {
        const first = err.issues[0];
        setError(first?.message ?? "Dados inválidos.");
      } else {
        const message =
          err instanceof Error ? err.message : "Erro ao alterar status.";
        setError(message);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div>
        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Alterar status
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Status atual:{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {ORDER_STATUS_LABELS[currentStatus]}
          </span>
          . Toda mudança é registrada em{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            statusHistory
          </code>{" "}
          com data, responsável e motivo.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-md bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Confirmação de pagamento aprovado continua vindo do Backend/webhook
          Mercado Pago. O Admin altera status apenas para ajustes operacionais e
          exceções.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="status-target"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Novo status
          </label>
          <select
            id="status-target"
            value={target}
            onChange={(event) => setTarget(event.target.value as OrderStatus)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          >
            {ORDER_STATUSES.filter((status) =>
              isTransitionAllowed(currentStatus, status),
            ).map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="status-reason"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Motivo *
          </label>
          <input
            id="status-reason"
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Ex: liberar para produção"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Salvando..." : "Registrar mudança"}
        </button>
      </div>
    </form>
  );
}

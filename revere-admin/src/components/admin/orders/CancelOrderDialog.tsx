"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { z } from "zod";
import { cancelOrderSchema } from "@/lib/validation/order";

interface CancelOrderDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isSubmitting: boolean;
  orderNumber: string;
}

export function CancelOrderDialog({
  open,
  onClose,
  onConfirm,
  isSubmitting,
  orderNumber,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setReason("");
    setError(null);
    onClose();
  };

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const validated = cancelOrderSchema.parse({ reason });
      await onConfirm(validated.reason);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const first = err.issues[0];
        setError(first?.message ?? "Motivo inválido.");
      } else {
        const message =
          err instanceof Error ? err.message : "Erro ao cancelar pedido.";
        setError(message);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-order-title"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-950">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2
              id="cancel-order-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Cancelar pedido
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {orderNumber} · esta ação registra motivo e responsável.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="cancel-reason"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Motivo do cancelamento *
            </label>
            <textarea
              id="cancel-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              placeholder="Ex: cliente solicitou cancelamento por telefone"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Cancelando..." : "Cancelar pedido"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

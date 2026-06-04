"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { use } from "react";
import { ChevronLeft } from "lucide-react";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingState } from "@/components/admin/LoadingState";
import { OrderDetail } from "@/components/admin/orders/OrderDetail";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  cancelOrder,
  changeOrderStatus,
  getOrderById,
  updateOrderInternalNote,
} from "@/lib/data/orders";
import { Order, OrderStatus } from "@/lib/firebase/orders";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getOrderById(id);
      if (!data) {
        setError("Pedido não encontrado.");
        return;
      }
      setOrder(data);
    } catch (err) {
      setError("Erro ao carregar pedido.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      await fetchOrder();
    };
    load();
  }, [fetchOrder]);

  const handleChangeStatus = async (to: OrderStatus, reason: string) => {
    if (!order) return;
    try {
      setIsMutating(true);
      const updated = await changeOrderStatus(order.id, { to, reason });
      setOrder(updated);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao alterar status.";
      alert(message);
      console.error(err);
    } finally {
      setIsMutating(false);
    }
  };

  const handleCancel = async (reason: string) => {
    if (!order) return;
    try {
      setIsMutating(true);
      const updated = await cancelOrder(order.id, { reason });
      setOrder(updated);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao cancelar pedido.";
      alert(message);
      console.error(err);
    } finally {
      setIsMutating(false);
    }
  };

  const handleSaveNote = async (note: string | null) => {
    if (!order) return;
    try {
      setIsMutating(true);
      const updated = await updateOrderInternalNote(order.id, {
        internalNote: note,
      });
      setOrder(updated);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Erro ao salvar observação interna.";
      alert(message);
      console.error(err);
    } finally {
      setIsMutating(false);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error || !order) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Pedido"
          description="Detalhe operacional do pedido."
        />
        <ErrorState
          message={error || "Pedido não encontrado."}
          onRetry={fetchOrder}
        />
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para a lista
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar para a lista
      </Link>

      <OrderDetail
        order={order}
        onChangeStatus={handleChangeStatus}
        onCancel={handleCancel}
        onSaveInternalNote={handleSaveNote}
        isMutating={isMutating}
      />
    </div>
  );
}

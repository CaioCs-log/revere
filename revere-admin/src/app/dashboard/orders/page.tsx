"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { LoadingState } from "@/components/admin/LoadingState";
import { PageHeader } from "@/components/admin/PageHeader";
import { OrderList } from "@/components/admin/orders/OrderList";
import { getOrders } from "@/lib/data/orders";
import { Order, OrderStatus, ORDER_STATUSES } from "@/lib/firebase/orders";
import { ORDER_STATUS_LABELS } from "@/lib/validation/order";

const ALL_FILTER = "all" as const;
type StatusFilter = OrderStatus | typeof ALL_FILTER;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL_FILTER);
  const [deliveryDate, setDeliveryDate] = useState<string>("");

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getOrders({
        status: statusFilter,
        deliveryDate: deliveryDate || undefined,
      });
      setOrders(data);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar pedidos.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, deliveryDate]);

  useEffect(() => {
    const load = async () => {
      await fetchOrders();
    };
    load();
  }, [fetchOrders]);

  const showInitialLoading = isLoading && orders.length === 0;

  const visibleCount = useMemo(() => orders.length, [orders]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos"
        description="Acompanhe pedidos recentes, altere status manualmente e cancele com motivo."
      />

      <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:flex-row sm:items-end dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex-1 space-y-1">
          <label
            htmlFor="order-status-filter"
            className="text-xs font-semibold tracking-wide text-zinc-500 uppercase"
          >
            Status
          </label>
          <select
            id="order-status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value={ALL_FILTER}>Todos os status</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 space-y-1">
          <label
            htmlFor="order-delivery-date"
            className="text-xs font-semibold tracking-wide text-zinc-500 uppercase"
          >
            Data de entrega
          </label>
          <input
            id="order-delivery-date"
            type="date"
            value={deliveryDate}
            onChange={(event) => setDeliveryDate(event.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        {(statusFilter !== ALL_FILTER || deliveryDate) && (
          <button
            type="button"
            onClick={() => {
              setStatusFilter(ALL_FILTER);
              setDeliveryDate("");
            }}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {showInitialLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOrders} />
      ) : visibleCount === 0 ? (
        <EmptyState
          title="Nenhum pedido encontrado"
          description={
            statusFilter !== ALL_FILTER || deliveryDate
              ? "Nenhum pedido corresponde aos filtros aplicados."
              : "A lista de pedidos está vazia. Quando houver pedidos, eles aparecerão aqui."
          }
        />
      ) : (
        <OrderList orders={orders} />
      )}
    </div>
  );
}

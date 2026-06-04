"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, Eye } from "lucide-react";
import { Order, OrderStatus, ORDER_STATUSES } from "@/lib/firebase/orders";
import { ORDER_STATUS_LABELS } from "@/lib/validation/order";

interface OrderListProps {
  orders: Order[];
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  in_production: "bg-blue-100 text-blue-800",
  ready_for_delivery: "bg-teal-100 text-teal-800",
  out_for_delivery: "bg-violet-100 text-violet-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-zinc-200 text-zinc-800",
};

const formatBRL = (cents: number): string =>
  `R$ ${(cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (date: Date | string | null): string => {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
};

const formatDateTime = (date: Date | string | null): string => {
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

const summarizeItems = (order: Order): string => {
  const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
  return `${order.items.length} ${order.items.length === 1 ? "item" : "itens"} · ${count} ${count === 1 ? "unidade" : "unidades"}`;
};

export function OrderList({ orders }: OrderListProps) {
  const sorted = useMemo(
    () =>
      [...orders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [orders],
  );

  return (
    <div className="space-y-3">
      {ORDER_STATUSES.map((status) => {
        const inStatus = sorted.filter((order) => order.status === status);
        if (inStatus.length === 0) return null;
        return (
          <section
            key={status}
            className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
          >
            <header className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-semibold text-zinc-700 uppercase dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 ${STATUS_COLOR[status]}`}
                >
                  {ORDER_STATUS_LABELS[status]}
                </span>
                <span className="text-zinc-500">
                  {inStatus.length}{" "}
                  {inStatus.length === 1 ? "pedido" : "pedidos"}
                </span>
              </div>
            </header>
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {inStatus.map((order) => (
                <li
                  key={order.id}
                  className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          {order.orderNumber}
                        </span>
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {summarizeItems(order)}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {order.customer.name}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {order.customer.email} · {order.customer.phone}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-6">
                      <div className="flex flex-col text-left sm:text-right">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          Entrega
                        </span>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {formatDate(order.delivery.scheduledDate)} ·{" "}
                          {order.delivery.scheduledWindow.label}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {order.delivery.neighborhoodName}
                        </span>
                      </div>
                      <div className="flex flex-col text-left sm:text-right">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          Total
                        </span>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                          {formatBRL(order.pricing.totalCents)}
                        </span>
                        <span className="text-xs text-zinc-500">
                          Criado {formatDateTime(order.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-400">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 group-hover:border-indigo-300 group-hover:text-indigo-600 dark:border-zinc-800">
                          <Eye className="h-4 w-4" />
                        </span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

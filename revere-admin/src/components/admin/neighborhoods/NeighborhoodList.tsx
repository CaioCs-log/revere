"use client";

import React from "react";
import Link from "next/link";
import { Neighborhood } from "@/lib/validation/neighborhood";
import { toggleNeighborhoodStatus } from "@/lib/data/neighborhoods";
import { Edit2, Power, PowerOff } from "lucide-react";

interface Props {
  initialData: Neighborhood[];
}

export function NeighborhoodList({ initialData }: Props) {
  const [items, setItems] = React.useState(initialData);

  const handleToggleStatus = async (id: string) => {
    try {
      const updated = await toggleNeighborhoodStatus(id);
      setItems(items.map((item) => (item.id === id ? updated : item)));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Bairro
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Cidade/UF
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Frete
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">
                  {item.name}
                </div>
                <div className="text-xs text-gray-500">
                  Ordem: {item.sortOrder}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {item.city}/{item.state}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                R$ {(item.deliveryFeeCents / 100).toFixed(2)}
                {item.freeShippingMinimumCents && (
                  <div className="text-xs text-green-600">
                    Grátis &gt; R${" "}
                    {(item.freeShippingMinimumCents / 100).toFixed(2)}
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${item.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {item.status === "active" ? "Ativo" : "Inativo"}
                </span>
              </td>
              <td className="space-x-2 px-6 py-4 text-right">
                <Link
                  href={`/dashboard/neighborhoods/${item.id}/edit`}
                  className="inline-block text-blue-600 hover:text-blue-900"
                >
                  <Edit2 size={18} />
                </Link>
                <button
                  onClick={() => handleToggleStatus(item.id)}
                  title={item.status === "active" ? "Inativar" : "Ativar"}
                  className={`${item.status === "active" ? "text-orange-600" : "text-green-600"} hover:opacity-75`}
                >
                  {item.status === "active" ? (
                    <PowerOff size={18} />
                  ) : (
                    <Power size={18} />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

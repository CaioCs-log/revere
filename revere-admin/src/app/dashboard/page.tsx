import { PageHeader } from "@/components/admin/PageHeader";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Bem-vindo ao painel administrativo da Revere."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards for metrics */}
        {[
          { label: "Vendas hoje", value: "R$ 0,00" },
          { label: "Pedidos pendentes", value: "0" },
          { label: "Novos clientes", value: "0" },
          { label: "Pratos ativos", value: "0" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {item.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";

export default function OrdersPage() {
  return (
    <div>
      <PageHeader
        title="Pedidos"
        description="Acompanhe os pedidos realizados."
      />
      <EmptyState
        title="Nenhum pedido encontrado"
        description="A lista de pedidos está vazia."
      />
    </div>
  );
}

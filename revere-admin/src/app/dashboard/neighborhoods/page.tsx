import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";

export default function NeighborhoodsPage() {
  return (
    <div>
      <PageHeader
        title="Bairros e Frete"
        description="Gerencie bairros atendidos e taxas de frete."
        action={{ label: "Adicionar Bairro", href: "#" }}
      />
      <EmptyState
        title="Nenhum bairro encontrado"
        description="A lista de bairros está vazia."
      />
    </div>
  );
}

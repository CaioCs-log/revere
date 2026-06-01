import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";

export default function KitsPage() {
  return (
    <div>
      <PageHeader
        title="Kits"
        description="Gerencie os kits prontos e customizáveis."
        action={{ label: "Adicionar Kit", href: "#" }}
      />
      <EmptyState
        title="Nenhum kit encontrado"
        description="A lista de kits está vazia."
      />
    </div>
  );
}

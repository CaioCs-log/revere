import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";

export default function VariantsPage() {
  return (
    <div>
      <PageHeader
        title="Variantes"
        description="Gerencie as variantes de gramatura e preço."
        action={{ label: "Adicionar Variante", href: "#" }}
      />
      <EmptyState
        title="Nenhuma variante encontrada"
        description="A lista de variantes está vazia."
      />
    </div>
  );
}

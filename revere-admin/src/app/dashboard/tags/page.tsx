import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";

export default function TagsPage() {
  return (
    <div>
      <PageHeader
        title="Tags"
        description="Gerencie as tags e filtros públicos."
        action={{ label: "Adicionar Tag", href: "#" }}
      />
      <EmptyState
        title="Nenhuma tag encontrada"
        description="A lista de tags está vazia."
      />
    </div>
  );
}

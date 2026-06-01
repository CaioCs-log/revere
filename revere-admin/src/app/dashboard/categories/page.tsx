import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";

export default function CategoriesPage() {
  return (
    <div>
      <PageHeader
        title="Categorias"
        description="Gerencie as categorias de produtos."
        action={{ label: "Adicionar Categoria", href: "#" }}
      />
      <EmptyState
        title="Nenhuma categoria encontrada"
        description="A lista de categorias está vazia."
      />
    </div>
  );
}

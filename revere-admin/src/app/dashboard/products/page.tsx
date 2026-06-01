import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";

export default function ProductsPage() {
  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Gerencie os produtos da plataforma."
        action={{ label: "Adicionar Produto", href: "#" }}
      />
      <EmptyState
        title="Nenhum produto encontrado"
        description="A lista de produtos está vazia."
      />
    </div>
  );
}

import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";

export default function ContentPage() {
  return (
    <div>
      <PageHeader
        title="Conteúdo"
        description="Gerencie banners e seções dinâmicas da Home."
        action={{ label: "Adicionar Bloco", href: "#" }}
      />
      <EmptyState
        title="Nenhum conteúdo encontrado"
        description="A lista de blocos de conteúdo está vazia."
      />
    </div>
  );
}

import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { getNeighborhoods } from "@/lib/data/neighborhoods";
import { NeighborhoodList } from "@/components/admin/neighborhoods/NeighborhoodList";

export default async function NeighborhoodsPage() {
  const neighborhoods = await getNeighborhoods();

  return (
    <div>
      <PageHeader
        title="Bairros e Frete"
        description="Gerencie bairros atendidos e taxas de frete."
        action={{
          label: "Adicionar Bairro",
          href: "/dashboard/neighborhoods/new",
        }}
      />
      {neighborhoods.length === 0 ? (
        <EmptyState
          title="Nenhum bairro encontrado"
          description="A lista de bairros está vazia."
        />
      ) : (
        <NeighborhoodList initialData={neighborhoods} />
      )}
    </div>
  );
}

import { EmptyState } from "@/components/admin/EmptyState";
import { ErrorState } from "@/components/admin/ErrorState";
import { PageHeader } from "@/components/admin/PageHeader";
import { NeighborhoodList } from "@/components/admin/neighborhoods/NeighborhoodList";
import { getNeighborhoods } from "@/lib/data/neighborhoods";

export const dynamic = "force-dynamic";

export default async function NeighborhoodsPage() {
  const result = await getNeighborhoods()
    .then((data) => ({ data, error: null as string | null }))
    .catch((error) => {
      console.error(error);
      return { data: null, error: "Erro ao carregar bairros." };
    });

  if (result.error || !result.data) {
    return <ErrorState message="Erro ao carregar bairros." />;
  }

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
      {result.data.length === 0 ? (
        <EmptyState
          title="Nenhum bairro encontrado"
          description="A lista de bairros está vazia."
        />
      ) : (
        <NeighborhoodList initialData={result.data} />
      )}
    </div>
  );
}

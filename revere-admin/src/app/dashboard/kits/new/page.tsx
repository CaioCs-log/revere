"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { KitForm } from "@/components/admin/kits/KitForm";
import { createKitPreset } from "@/lib/data/kitPresets";
import { KitPresetInput } from "@/lib/validation/kitPreset";

export default function NewKitPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: KitPresetInput) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createKitPreset(data);
      router.push("/dashboard/kits");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao criar kit.";
      setError(message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo Kit"
        description="Cadastre kits prontos, sugeridos ou customizáveis no padrão do MVP."
      />

      <KitForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
}

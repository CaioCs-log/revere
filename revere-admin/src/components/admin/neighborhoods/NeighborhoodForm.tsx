"use client";

import React from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { neighborhoodSchema, DeliveryDay } from "@/lib/validation/neighborhood";
import { slugify } from "@/lib/utils/slugify";
import { Trash2, Plus } from "lucide-react";
import type { z } from "zod";

type NeighborhoodInput = z.infer<typeof neighborhoodSchema>;

interface NeighborhoodFormProps {
  initialData?: Partial<NeighborhoodInput>;
  onSubmit: (data: NeighborhoodInput) => Promise<void>;
}

const DAYS_LABELS: Record<DeliveryDay, string> = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
  sunday: "Domingo",
};

export function NeighborhoodForm({
  initialData,
  onSubmit,
}: NeighborhoodFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NeighborhoodInput>({
    resolver: zodResolver(
      neighborhoodSchema,
    ) as unknown as Resolver<NeighborhoodInput>,
    defaultValues: initialData || {
      city: "Blumenau",
      state: "SC",
      status: "active",
      deliveryFeeCents: 0,
      freeShippingMinimumCents: 19900,
      deliveryDays: [],
      deliveryWindows: [
        { label: "Manhã", startTime: "08:00", endTime: "12:00", active: true },
      ],
      minimumLeadTimeDays: 5,
      sortOrder: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "deliveryWindows",
  });

  const name = useWatch({ control, name: "name" });

  React.useEffect(() => {
    if (name && !initialData) {
      setValue("slug", slugify(String(name)), { shouldValidate: true });
    }
  }, [name, setValue, initialData]);

  const onFormSubmit = async (data: NeighborhoodInput) => {
    // Normaliza campos numéricos para evitar enviar NaN e garantir tipos esperados
    const normalized: Partial<NeighborhoodInput> = { ...data };
    const asRecord = data as unknown as Record<string, unknown>;

    // deliveryFeeCents: se vazio ou NaN => 0
    const rawDeliveryFee = asRecord.deliveryFeeCents;
    const parsedDeliveryFee = Number(rawDeliveryFee as unknown as number);
    normalized.deliveryFeeCents =
      rawDeliveryFee === "" ||
      rawDeliveryFee == null ||
      Number.isNaN(parsedDeliveryFee)
        ? 0
        : Math.round(parsedDeliveryFee);

    // freeShippingMinimumCents: se vazio => null, se válido => inteiro
    const rawFreeMin = asRecord.freeShippingMinimumCents;
    const parsedFreeMin = Number(rawFreeMin as unknown as number);
    normalized.freeShippingMinimumCents =
      rawFreeMin === "" || rawFreeMin == null
        ? null
        : Number.isNaN(parsedFreeMin)
          ? null
          : Math.round(parsedFreeMin);

    // minimumLeadTimeDays: fallback para 5 se inválido
    const rawLead = asRecord.minimumLeadTimeDays;
    const parsedLead = Number(rawLead as unknown as number);
    normalized.minimumLeadTimeDays =
      rawLead === "" || rawLead == null || Number.isNaN(parsedLead)
        ? 5
        : Math.round(parsedLead);

    // sortOrder: fallback para 0 se inválido
    const rawSort = asRecord.sortOrder;
    const parsedSort = Number(rawSort as unknown as number);
    normalized.sortOrder =
      rawSort === "" || rawSort == null || Number.isNaN(parsedSort)
        ? 0
        : Math.round(parsedSort);

    await onSubmit(normalized as NeighborhoodInput);
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-8 rounded-lg bg-white p-6 shadow"
    >
      {/* Form content copied/adapted from previous implementation */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nome do Bairro
          </label>
          <input
            {...register("name")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">
              {errors.name.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            {...register("slug")}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
          />
          {errors.slug && (
            <p className="mt-1 text-xs text-red-500">
              {errors.slug.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cidade
          </label>
          <input
            {...register("city")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">UF</label>
          <input
            {...register("state")}
            maxLength={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Taxa de Entrega (Centavos)
          </label>
          <input
            type="number"
            {...register("deliveryFeeCents", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mínimo para Frete Grátis (Centavos)
          </label>
          <input
            type="number"
            {...register("freeShippingMinimumCents", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Dias de Entrega
        </label>
        <div className="flex flex-wrap gap-4">
          {Object.entries(DAYS_LABELS).map(([key, label]) => (
            <label key={key} className="inline-flex items-center">
              <input
                type="checkbox"
                value={key}
                {...register("deliveryDays")}
                className="rounded border-gray-300 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-600">{label}</span>
            </label>
          ))}
        </div>
        {errors.deliveryDays && (
          <p className="mt-1 text-xs text-red-500">
            {errors.deliveryDays.message as string}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Janelas de Horário
          </label>
          <button
            type="button"
            onClick={() =>
              append({
                label: "",
                startTime: "08:00",
                endTime: "12:00",
                active: true,
              })
            }
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <Plus size={16} className="mr-1" /> Adicionar Janela
          </button>
        </div>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 items-end gap-4 rounded-md bg-gray-50 p-4 md:grid-cols-4"
          >
            <div>
              <label className="block text-xs text-gray-500">
                Rótulo (ex: Manhã)
              </label>
              <input
                {...register(`deliveryWindows.${index}.label` as const)}
                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">
                Início (HH:mm)
              </label>
              <input
                {...register(`deliveryWindows.${index}.startTime` as const)}
                placeholder="08:00"
                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Fim (HH:mm)</label>
              <input
                {...register(`deliveryWindows.${index}.endTime` as const)}
                placeholder="12:00"
                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  {...register(`deliveryWindows.${index}.active` as const)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm"
                />
                <span className="ml-2 text-xs text-gray-600">Ativa</span>
              </label>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-500 hover:text-red-700"
                disabled={fields.length === 1}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Lead Time Mínimo (Dias)
          </label>
          <input
            type="number"
            {...register("minimumLeadTimeDays", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ordenação
          </label>
          <input
            type="number"
            {...register("sortOrder", { valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            {...register("status")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Salvando..." : "Salvar Bairro"}
        </button>
      </div>
    </form>
  );
}

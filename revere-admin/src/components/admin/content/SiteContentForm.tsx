"use client";

import { useState } from "react";
import {
  SiteContent,
  SiteContentType,
  SiteContentStatus,
  ImageMode,
} from "@/lib/firebase/siteContent";
import { SiteContentInput } from "@/lib/validation/siteContent";

interface SiteContentFormProps {
  initialData?: SiteContent;
  onSubmit: (data: SiteContentInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  error?: string | null;
}

const typeOptions: { value: SiteContentType; label: string }[] = [
  { value: "home_hero", label: "Hero da Home" },
  { value: "home_how_it_works", label: "Como Funciona" },
  { value: "home_product_highlight", label: "Destaque de Produto" },
  { value: "home_kit_highlight", label: "Destaque de Kit" },
  { value: "home_category_highlight", label: "Destaque de Categoria" },
  { value: "campaign_banner", label: "Banner de Campanha" },
  { value: "notice", label: "Aviso" },
  { value: "delivery_info", label: "Informações de Entrega" },
  { value: "checkout_notice", label: "Aviso do Checkout" },
  { value: "final_cta", label: "CTA Final" },
  { value: "faq_preview", label: "Preview FAQ" },
  { value: "social_proof", label: "Prova Social" },
  { value: "generic", label: "Genérico" },
];

const statusOptions: { value: SiteContentStatus; label: string }[] = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
  { value: "inactive", label: "Inativo" },
  { value: "archived", label: "Arquivado" },
];

const imageModeOptions: { value: ImageMode; label: string }[] = [
  { value: "real_photo", label: "Foto real" },
  { value: "brand_placeholder", label: "Placeholder da marca" },
  { value: "editorial", label: "Editorial" },
  { value: "illustration", label: "Ilustração" },
];

export function SiteContentForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}: SiteContentFormProps) {
  const [key, setKey] = useState(initialData?.key || "");
  const [type, setType] = useState<SiteContentType>(
    initialData?.type || "home_hero",
  );
  const [status, setStatus] = useState<SiteContentStatus>(
    initialData?.status || "draft",
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [imageId, setImageId] = useState(initialData?.imageId || "");
  const [imageAlt, setImageAlt] = useState(initialData?.imageAlt || "");
  const [imageMode, setImageMode] = useState<ImageMode>(
    initialData?.imageMode || "brand_placeholder",
  );
  const [ctaLabel, setCtaLabel] = useState(initialData?.ctaLabel || "");
  const [ctaHref, setCtaHref] = useState(initialData?.ctaHref || "");
  const [linkedProductIds, setLinkedProductIds] = useState(
    initialData?.linkedProductIds.join(", ") || "",
  );
  const [linkedCategoryIds, setLinkedCategoryIds] = useState(
    initialData?.linkedCategoryIds.join(", ") || "",
  );
  const [linkedKitPresetIds, setLinkedKitPresetIds] = useState(
    initialData?.linkedKitPresetIds.join(", ") || "",
  );
  const [startsAt, setStartsAt] = useState(
    initialData?.displayRules.startsAt
      ? initialData.displayRules.startsAt.slice(0, 16)
      : "",
  );
  const [endsAt, setEndsAt] = useState(
    initialData?.displayRules.endsAt
      ? initialData.displayRules.endsAt.slice(0, 16)
      : "",
  );
  const [priority, setPriority] = useState(
    initialData?.displayRules.priority ?? 0,
  );
  const [showOnHome, setShowOnHome] = useState(
    initialData?.displayRules.showOnHome || false,
  );
  const [showOnCheckout, setShowOnCheckout] = useState(
    initialData?.displayRules.showOnCheckout || false,
  );
  const [showOnCatalog, setShowOnCatalog] = useState(
    initialData?.displayRules.showOnCatalog || false,
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const parseIdList = (value: string): string[] =>
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!key) {
      setValidationError("Key é obrigatória.");
      return;
    }

    if (!type) {
      setValidationError("Tipo é obrigatório.");
      return;
    }

    const hasCtaLabel = ctaLabel.trim().length > 0;
    const hasCtaHref = ctaHref.trim().length > 0;
    if (hasCtaLabel !== hasCtaHref) {
      setValidationError("CTA exige label e href preenchidos juntos.");
      return;
    }

    const payload: SiteContentInput = {
      key,
      type,
      status,
      title: title || null,
      subtitle: subtitle || null,
      body: body || null,
      imageId: imageId || null,
      imageAlt: imageAlt || null,
      imageMode,
      ctaLabel: ctaLabel || null,
      ctaHref: ctaHref || null,
      linkedProductIds: parseIdList(linkedProductIds),
      linkedCategoryIds: parseIdList(linkedCategoryIds),
      linkedKitPresetIds: parseIdList(linkedKitPresetIds),
      displayRules: {
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
        priority,
        showOnHome,
        showOnCheckout,
        showOnCatalog,
      },
      metadata: {},
    };

    await onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg bg-white p-6 shadow dark:bg-zinc-900"
    >
      {(error || validationError) && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error || validationError}
        </div>
      )}

      <div className="flex items-start rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-400">
        <span>
          Validações finais de exibição e conteúdo serão processadas pelo
          Storefront/Backend futuramente.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6 lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          <div>
            <label
              htmlFor="key"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Key *
            </label>
            <input
              type="text"
              id="key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              required
              placeholder="ex: homeHero"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Identificador único do bloco. Ex: homeHero, campaignBanner
            </p>
          </div>

          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Tipo *
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as SiteContentType)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              required
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as SiteContentStatus)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {status === "inactive" && (
            <p className="mt-1 text-xs text-amber-600">
              Conteúdo inativo não aparece no Storefront.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Prioridade
          </label>
          <input
            type="number"
            id="priority"
            value={priority}
            onChange={(e) => setPriority(parseInt(e.target.value, 10) || 0)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Ordem de exibição. Valores menores aparecem primeiro.
          </p>
        </div>
      </div>

      <div className="border-t border-zinc-200 pt-6 dark:border-zinc-700">
        <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Conteúdo editorial
        </h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Título
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Título principal do bloco"
            />
          </div>
          <div>
            <label
              htmlFor="subtitle"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Subtítulo
            </label>
            <input
              type="text"
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Subtítulo ou descrição breve"
            />
          </div>
          <div className="lg:col-span-2">
            <label
              htmlFor="body"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Corpo do texto
            </label>
            <textarea
              id="body"
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Texto principal do bloco"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 pt-6 dark:border-zinc-700">
        <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Imagem
        </h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <label
              htmlFor="imageId"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              ID da Imagem
            </label>
            <input
              type="text"
              id="imageId"
              value={imageId}
              onChange={(e) => setImageId(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Referência lógica da imagem"
            />
          </div>
          <div>
            <label
              htmlFor="imageAlt"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Texto alternativo (alt)
            </label>
            <input
              type="text"
              id="imageAlt"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Descrição para acessibilidade"
            />
          </div>
          <div>
            <label
              htmlFor="imageMode"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Modo da imagem
            </label>
            <select
              id="imageMode"
              value={imageMode}
              onChange={(e) => setImageMode(e.target.value as ImageMode)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {imageModeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 pt-6 dark:border-zinc-700">
        <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          CTA (Call to Action)
        </h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <label
              htmlFor="ctaLabel"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Texto do CTA
            </label>
            <input
              type="text"
              id="ctaLabel"
              value={ctaLabel}
              onChange={(e) => setCtaLabel(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="ex: Ver cardápio"
            />
          </div>
          <div>
            <label
              htmlFor="ctaHref"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Link do CTA
            </label>
            <input
              type="text"
              id="ctaHref"
              value={ctaHref}
              onChange={(e) => setCtaHref(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="ex: /cardapio"
            />
          </div>
        </div>
        {ctaLabel && !ctaHref && (
          <p className="mt-2 text-xs text-amber-600">
            Preencha também o link do CTA.
          </p>
        )}
      </div>

      <div className="border-t border-zinc-200 pt-6 dark:border-zinc-700">
        <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Vínculos (IDs separados por vírgula)
        </h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <label
              htmlFor="linkedProductIds"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              IDs de Produtos
            </label>
            <input
              type="text"
              id="linkedProductIds"
              value={linkedProductIds}
              onChange={(e) => setLinkedProductIds(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="prod-1, prod-2"
            />
          </div>
          <div>
            <label
              htmlFor="linkedCategoryIds"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              IDs de Categorias
            </label>
            <input
              type="text"
              id="linkedCategoryIds"
              value={linkedCategoryIds}
              onChange={(e) => setLinkedCategoryIds(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="cat-1, cat-2"
            />
          </div>
          <div>
            <label
              htmlFor="linkedKitPresetIds"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              IDs de Kits
            </label>
            <input
              type="text"
              id="linkedKitPresetIds"
              value={linkedKitPresetIds}
              onChange={(e) => setLinkedKitPresetIds(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="kit-1, kit-2"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 pt-6 dark:border-zinc-700">
        <h3 className="mb-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Regras de Exibição
        </h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <label
              htmlFor="startsAt"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Início da exibição
            </label>
            <input
              type="datetime-local"
              id="startsAt"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label
              htmlFor="endsAt"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Fim da exibição
            </label>
            <input
              type="datetime-local"
              id="endsAt"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="showOnHome"
                type="checkbox"
                checked={showOnHome}
                onChange={(e) => setShowOnHome(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="showOnHome"
                className="font-medium text-zinc-700 dark:text-zinc-300"
              >
                Mostrar na Home
              </label>
              <p className="text-xs text-zinc-500">
                Exibir este bloco na página inicial.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="showOnCheckout"
                type="checkbox"
                checked={showOnCheckout}
                onChange={(e) => setShowOnCheckout(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="showOnCheckout"
                className="font-medium text-zinc-700 dark:text-zinc-300"
              >
                Mostrar no Checkout
              </label>
              <p className="text-xs text-zinc-500">
                Exibir este bloco na página de checkout.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="showOnCatalog"
                type="checkbox"
                checked={showOnCatalog}
                onChange={(e) => setShowOnCatalog(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="showOnCatalog"
                className="font-medium text-zinc-700 dark:text-zinc-300"
              >
                Mostrar no Catálogo
              </label>
              <p className="text-xs text-zinc-500">
                Exibir este bloco na página de catálogo.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
        >
          {isSubmitting ? "Salvando..." : "Salvar Bloco"}
        </button>
      </div>
    </form>
  );
}

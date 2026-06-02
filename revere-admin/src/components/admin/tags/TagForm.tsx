import React, { useState, useEffect } from "react";
import { Tag } from "@/lib/data/tags";
import { slugify } from "@/lib/utils/slugify";

interface TagFormProps {
  initialData?: Tag;
  onSubmit: (
    data: Omit<Tag, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  error?: string;
}

const TagForm: React.FC<TagFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [type, setType] = useState<Tag["type"]>(
    initialData?.type || "nutrition",
  );
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [status, setStatus] = useState<Tag["status"]>(
    initialData?.status || "inactive",
  );
  const [showInFilters, setShowInFilters] = useState(
    initialData?.showInFilters || false,
  );
  const [showInProductCard, setShowInProductCard] = useState(
    initialData?.showInProductCard || false,
  );

  useEffect(() => {
    const init = () => {
      if (initialData) {
        setName(initialData.name);
        setSlug(initialData.slug);
        setType(initialData.type);
        setDescription(initialData.description || "");
        setStatus(initialData.status);
        setShowInFilters(initialData.showInFilters);
        setShowInProductCard(initialData.showInProductCard);
      }
    };
    init();
  }, [initialData]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setSlug(slugify(newName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !type) {
      alert("Nome, Slug e Tipo são obrigatórios.");
      return;
    }
    await onSubmit({
      name,
      slug,
      type,
      description,
      status,
      color: null,
      showInFilters,
      showInProductCard,
      sortOrder: 0,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg bg-white p-6 shadow"
    >
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Nome da Tag *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={handleNameChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
          required
        />
      </div>
      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-gray-700"
        >
          Slug *
        </label>
        <input
          type="text"
          id="slug"
          value={slug}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 shadow-sm sm:text-sm"
          required
          readOnly
        />
      </div>
      <div>
        <label
          htmlFor="type"
          className="block text-sm font-medium text-gray-700"
        >
          Tipo *
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as Tag["type"])}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
          required
        >
          <option value="nutrition">Nutricional</option>
          <option value="restriction">Restrição</option>
          <option value="commercial">Comercial</option>
          <option value="preference">Preferência</option>
          <option value="operational">Operacional</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700"
        >
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as Tag["status"])}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
        >
          <option value="active">Ativa</option>
          <option value="inactive">Inativa</option>
        </select>
        {status === "inactive" && (
          <p className="mt-2 text-sm text-yellow-600">
            A tag inativa ficará invisível no Storefront.
          </p>
        )}
      </div>
      <div className="flex space-x-6">
        <div className="flex items-center">
          <input
            id="showInFilters"
            type="checkbox"
            checked={showInFilters}
            onChange={(e) => setShowInFilters(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600"
          />
          <label
            htmlFor="showInFilters"
            className="ml-2 block text-sm text-gray-900"
          >
            Mostrar nos Filtros
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="showInProductCard"
            type="checkbox"
            checked={showInProductCard}
            onChange={(e) => setShowInProductCard(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600"
          />
          <label
            htmlFor="showInProductCard"
            className="ml-2 block text-sm text-gray-900"
          >
            Mostrar no Card
          </label>
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded bg-gray-200 px-4 py-2 text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-indigo-600 px-4 py-2 text-sm text-white"
        >
          {isSubmitting ? "Salvando..." : "Salvar Tag"}
        </button>
      </div>
    </form>
  );
};

export default TagForm;

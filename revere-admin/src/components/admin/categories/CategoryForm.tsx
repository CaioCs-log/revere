import React, { useState, useEffect } from "react";
import { Category } from "@/lib/data/categories";
import { slugify } from "@/lib/utils/slugify";

interface CategoryFormProps {
  initialData?: Category;
  onSubmit: (
    data: Omit<Category, "id" | "createdAt" | "updatedAt" | "parentCategoryId">,
  ) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  error?: string;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
}) => {
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [status, setStatus] = useState<Category["status"]>(
    initialData?.status || "inactive",
  ); // M1 Rule: Default to inactive
  const [showInMenu, setShowInMenu] = useState(
    initialData?.showInMenu || false,
  );
  const [showInHome, setShowInHome] = useState(
    initialData?.showInHome || false,
  );
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder || 0);

  useEffect(() => {
    const init = () => {
      if (initialData) {
        setName(initialData.name);
        setSlug(initialData.slug);
        setDescription(initialData.description || "");
        setStatus(initialData.status);
        setShowInMenu(initialData.showInMenu);
        setShowInHome(initialData.showInHome);
        setSortOrder(initialData.sortOrder);
      }
    };
    init();
  }, [initialData]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setSlug(slugify(newName)); // M1 Rule: Slug normalized from name
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) {
      // M1 Rule: name and slug are mandatory
      alert("Nome e Slug são obrigatórios.");
      return;
    }

    await onSubmit({
      name,
      slug,
      description,
      status,
      imageId: null, // Assuming no image upload in M1
      showInMenu,
      showInHome,
      sortOrder,
    });
  };

  const isInactive = status === "inactive"; // M1 Rule: Inactivation precedence

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
          Nome da Categoria *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={handleNameChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
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
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
          required
          readOnly // Slug is generated, can be manually edited but for MVP let's keep it readOnly after generation from name
        />
        <p className="mt-2 text-sm text-gray-500">
          O slug é gerado automaticamente a partir do nome. Deve ser único.
        </p>
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Descrição
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
        ></textarea>
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
          onChange={(e) => setStatus(e.target.value as Category["status"])}
          className="mt-1 block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
        >
          <option value="active">Ativa</option>
          <option value="inactive">Inativa</option>
        </select>
        {isInactive && (
          <p className="mt-2 text-sm text-yellow-600">
            A categoria inativa não aparecerá no Storefront, ignorando as flags
            &quot;Mostrar no Menu&quot; e &quot;Mostrar na Home&quot;.
          </p>
        )}
      </div>
      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            id="showInMenu"
            name="showInMenu"
            type="checkbox"
            checked={showInMenu && !isInactive} // M1 Rule: Inactivation precedence
            onChange={(e) => setShowInMenu(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            disabled={isInactive} // Disable if inactive
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="showInMenu" className="font-medium text-gray-700">
            Mostrar no Menu
          </label>
          <p className="text-gray-500">
            Exibir esta categoria na navegação principal do Storefront.
          </p>
        </div>
      </div>
      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            id="showInHome"
            name="showInHome"
            type="checkbox"
            checked={showInHome && !isInactive} // M1 Rule: Inactivation precedence
            onChange={(e) => setShowInHome(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            disabled={isInactive} // Disable if inactive
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="showInHome" className="font-medium text-gray-700">
            Mostrar na Home
          </label>
          <p className="text-gray-500">
            Exibir esta categoria em seções de destaque na página inicial.
          </p>
        </div>
      </div>
      <div>
        <label
          htmlFor="sortOrder"
          className="block text-sm font-medium text-gray-700"
        >
          Ordem de Exibição
        </label>
        <input
          type="number"
          id="sortOrder"
          value={sortOrder}
          onChange={(e) => setSortOrder(parseInt(e.target.value, 10))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
        />
      </div>

      {/* M1 Rule: parentCategoryId hidden and blocked */}
      {/* <input type="hidden" name="parentCategoryId" value={null} /> */}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Salvando..." : "Salvar Categoria"}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;

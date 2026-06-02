import React from "react";
import Link from "next/link";
import { Category } from "@/lib/data/categories";

interface CategoryListProps {
  categories: Category[];
  onInactivate: (id: string) => Promise<void>;
  isMutating: boolean;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  onInactivate,
  isMutating,
}) => {
  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="flex items-center justify-between px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Categorias
        </h3>
        <Link href="/categories/new">
          <a className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none">
            Nova Categoria
          </a>
        </Link>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          {categories.length === 0 ? (
            <div className="px-4 py-5 text-gray-500 sm:px-6">
              Nenhuma categoria encontrada.
            </div>
          ) : (
            <ul role="list" className="divide-y divide-gray-200">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 sm:px-6"
                >
                  <div>
                    <div className="text-sm font-medium text-indigo-600">
                      <Link href={`/categories/${category.id}/edit`}>
                        <a>{category.name}</a>
                      </Link>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Slug: {category.slug}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Status:{" "}
                      <span
                        className={`font-semibold ${category.status === "active" ? "text-green-600" : "text-red-600"}`}
                      >
                        {category.status === "active" ? "Ativa" : "Inativa"}
                      </span>
                      {category.status === "inactive" && (
                        <span className="ml-2 text-xs text-yellow-600">
                          (Não visível no Storefront)
                        </span>
                      )}
                    </div>
                    {category.description && (
                      <div className="mt-1 text-sm text-gray-500">
                        {category.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link href={`/categories/${category.id}/edit`}>
                      <a className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                        Editar
                      </a>
                    </Link>
                    {category.status === "active" && (
                      <button
                        onClick={() => onInactivate(category.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-900"
                        disabled={isMutating}
                      >
                        Inativar
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </dl>
      </div>
    </div>
  );
};

export default CategoryList;

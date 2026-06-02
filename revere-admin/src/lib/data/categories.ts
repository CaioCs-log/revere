export interface Category {
  id: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
  description: string | null;
  parentCategoryId: string | null; // Hidden in UI for MVP
  imageId: string | null;
  showInMenu: boolean;
  showInHome: boolean;
  sortOrder: number;
  createdAt: string; // Using string for simplicity, would be Timestamp in real Firestore
  updatedAt: string; // Using string for simplicity
}

// Simulated in-memory database
let categories: Category[] = [
  {
    id: "cat-1",
    name: "Pratos",
    slug: "pratos",
    status: "active",
    description: "Refeições completas e saborosas.",
    parentCategoryId: null,
    imageId: null,
    showInMenu: true,
    showInHome: true,
    sortOrder: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cat-2",
    name: "Sopas",
    slug: "sopas",
    status: "active",
    description: "Sopas nutritivas para aquecer.",
    parentCategoryId: null,
    imageId: null,
    showInMenu: true,
    showInHome: false,
    sortOrder: 20,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "cat-3",
    name: "Kits Promocionais",
    slug: "kits-promocionais",
    status: "inactive", // Inactive example
    description: "Kits com desconto para a semana.",
    parentCategoryId: null,
    imageId: null,
    showInMenu: true,
    showInHome: true,
    sortOrder: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getCategories = async (): Promise<Category[]> => {
  return Promise.resolve(categories);
};

export const getCategoryById = async (
  id: string,
): Promise<Category | undefined> => {
  return Promise.resolve(categories.find((cat) => cat.id === id));
};

export const createCategory = async (
  data: Omit<Category, "id" | "createdAt" | "updatedAt">,
): Promise<Category> => {
  const newCategory: Category = {
    ...data,
    id: `cat-${Date.now()}`, // Simple ID generation
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "inactive", // M1 Rule: Default status for new records is inactive
  };

  // M1 Rule: Slug uniqueness check
  const existingSlug = categories.some((cat) => cat.slug === newCategory.slug);
  if (existingSlug) {
    throw new Error("Slug already exists. Please choose a different name.");
  }

  categories.push(newCategory);
  return Promise.resolve(newCategory);
};

export const updateCategory = async (
  id: string,
  data: Partial<Omit<Category, "id" | "createdAt">>,
): Promise<Category> => {
  const index = categories.findIndex((cat) => cat.id === id);
  if (index === -1) {
    throw new Error("Category not found");
  }

  const updatedCategory = {
    ...categories[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  // M1 Rule: Slug uniqueness check (excluding current category)
  if (
    data.slug &&
    categories.some((cat) => cat.slug === data.slug && cat.id !== id)
  ) {
    throw new Error("Slug already exists. Please choose a different name.");
  }

  categories[index] = updatedCategory;
  return Promise.resolve(updatedCategory);
};

export const inactivateCategory = async (id: string): Promise<Category> => {
  const index = categories.findIndex((cat) => cat.id === id);
  if (index === -1) {
    throw new Error("Category not found");
  }
  const categoryToInactivate = categories[index];
  categoryToInactivate.status = "inactive"; // M1 Rule: Logical inactivation
  categoryToInactivate.updatedAt = new Date().toISOString();
  categories[index] = categoryToInactivate;
  return Promise.resolve(categoryToInactivate);
};

// For testing purposes, to reset the simulated data
export const resetCategories = () => {
  categories = [
    {
      id: "cat-1",
      name: "Pratos",
      slug: "pratos",
      status: "active",
      description: "Refeições completas e saborosas.",
      parentCategoryId: null,
      imageId: null,
      showInMenu: true,
      showInHome: true,
      sortOrder: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "cat-2",
      name: "Sopas",
      slug: "sopas",
      status: "active",
      description: "Sopas nutritivas para aquecer.",
      parentCategoryId: null,
      imageId: null,
      showInMenu: true,
      showInHome: false,
      sortOrder: 20,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "cat-3",
      name: "Kits Promocionais",
      slug: "kits-promocionais",
      status: "inactive", // Inactive example
      description: "Kits com desconto para a semana.",
      parentCategoryId: null,
      imageId: null,
      showInMenu: true,
      showInHome: true,
      sortOrder: 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

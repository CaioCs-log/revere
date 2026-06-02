export interface Tag {
  id: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
  type:
    | "nutrition"
    | "restriction"
    | "commercial"
    | "preference"
    | "operational";
  description: string | null;
  color: string | null;
  showInFilters: boolean;
  showInProductCard: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const tags: Tag[] = [
  {
    id: "tag-1",
    name: "Proteico",
    slug: "proteico",
    status: "active",
    type: "nutrition",
    description: "Alto teor de proteína.",
    color: "#f3f4f6",
    showInFilters: true,
    showInProductCard: true,
    sortOrder: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getTags = async (): Promise<Tag[]> => Promise.resolve(tags);

export const getTagById = async (id: string): Promise<Tag | undefined> =>
  Promise.resolve(tags.find((tag) => tag.id === id));

export const createTag = async (
  data: Omit<Tag, "id" | "createdAt" | "updatedAt">,
): Promise<Tag> => {
  if (tags.some((tag) => tag.slug === data.slug)) {
    throw new Error("Slug já existe.");
  }

  const newTag: Tag = {
    ...data,
    id: `tag-${Date.now()}`,
    status: "inactive", // M2 Rule: Default conservador
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tags.push(newTag);
  return Promise.resolve(newTag);
};

export const updateTag = async (
  id: string,
  data: Partial<Omit<Tag, "id" | "createdAt">>,
): Promise<Tag> => {
  const index = tags.findIndex((tag) => tag.id === id);
  if (index === -1) throw new Error("Tag não encontrada.");

  if (
    data.slug &&
    tags.some((tag) => tag.slug === data.slug && tag.id !== id)
  ) {
    throw new Error("Slug já em uso.");
  }

  tags[index] = {
    ...tags[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  return Promise.resolve(tags[index]);
};

export const inactivateTag = async (id: string): Promise<Tag> => {
  const index = tags.findIndex((tag) => tag.id === id);
  if (index === -1) throw new Error("Tag não encontrada.");

  tags[index].status = "inactive";
  tags[index].updatedAt = new Date().toISOString();

  return Promise.resolve(tags[index]);
};

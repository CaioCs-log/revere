import { Neighborhood } from "@/lib/validation/neighborhood";
import { slugify } from "@/lib/utils/slugify";

// In-memory store for neighborhoods
const neighborhoods: Neighborhood[] = [
  {
    id: "1",
    name: "Centro",
    slug: "centro",
    city: "Blumenau",
    state: "SC",
    status: "active",
    deliveryFeeCents: 1000,
    freeShippingMinimumCents: 19900,
    deliveryDays: ["monday", "wednesday", "friday"],
    deliveryWindows: [
      { label: "Manhã", startTime: "08:00", endTime: "12:00", active: true },
      { label: "Tarde", startTime: "13:00", endTime: "18:00", active: true },
    ],
    minimumLeadTimeDays: 5,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const getNeighborhoods = async (): Promise<Neighborhood[]> => {
  return [...neighborhoods].sort((a, b) => a.sortOrder - b.sortOrder);
};

export const getNeighborhoodById = async (
  id: string,
): Promise<Neighborhood | undefined> => {
  return neighborhoods.find((n) => n.id === id);
};

export const checkSlugUnique = async (
  slug: string,
  excludeId?: string,
): Promise<boolean> => {
  return !neighborhoods.some((n) => n.slug === slug && n.id !== excludeId);
};

export const createNeighborhood = async (
  data: Omit<Neighborhood, "id" | "createdAt" | "updatedAt">,
): Promise<Neighborhood> => {
  // normalize slug
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);
  const isUnique = await checkSlugUnique(slug);
  if (!isUnique) throw new Error("Slug já está em uso.");

  const newNeighborhood: Neighborhood = {
    ...data,
    id: Math.random().toString(36).substring(2, 9),
    slug,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Neighborhood;

  neighborhoods.push(newNeighborhood);
  return newNeighborhood;
};

export const updateNeighborhood = async (
  id: string,
  data: Partial<Neighborhood>,
): Promise<Neighborhood> => {
  const index = neighborhoods.findIndex((n) => n.id === id);
  if (index === -1) throw new Error("Bairro não encontrado.");

  if (data.slug) {
    data.slug = slugify(data.slug);
    const isUnique = await checkSlugUnique(data.slug, id);
    if (!isUnique) throw new Error("Slug já está em uso.");
  }

  const updatedNeighborhood = {
    ...neighborhoods[index],
    ...data,
    updatedAt: new Date(),
  } as Neighborhood;

  neighborhoods[index] = updatedNeighborhood;
  return updatedNeighborhood;
};

export const toggleNeighborhoodStatus = async (
  id: string,
): Promise<Neighborhood> => {
  const neighborhood = neighborhoods.find((n) => n.id === id);
  if (!neighborhood) throw new Error("Bairro não encontrado.");

  const newStatus = neighborhood.status === "active" ? "inactive" : "active";

  if (
    newStatus === "active" &&
    (neighborhood.deliveryDays.length === 0 ||
      !neighborhood.deliveryWindows.some((w) => w.active))
  ) {
    throw new Error(
      "Não é possível ativar um bairro sem dias ou janelas de entrega configurados.",
    );
  }

  return updateNeighborhood(id, { status: newStatus });
};

export const archiveNeighborhood = async (
  id: string,
): Promise<Neighborhood> => {
  return updateNeighborhood(id, { status: "inactive" });
};

// For tests
export const resetNeighborhoods = () => {
  neighborhoods.length = 0;
};

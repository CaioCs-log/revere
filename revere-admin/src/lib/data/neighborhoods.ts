import { Neighborhood } from "@/lib/validation/neighborhood";
import { slugify } from "@/lib/utils/slugify";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import {
  fieldValueExists,
  getCollectionDocuments,
  getDocumentById,
  readDate,
  readNumber,
} from "@/lib/firebase/firestoreHelpers";

const NEIGHBORHOODS_COLLECTION = "neighborhoods";

const mapNeighborhood = (snapshot: QueryDocumentSnapshot): Neighborhood => {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: typeof data.name === "string" ? data.name : "",
    slug: typeof data.slug === "string" ? data.slug : "",
    city: typeof data.city === "string" ? data.city : "Blumenau",
    state: typeof data.state === "string" ? data.state : "SC",
    status: data.status === "inactive" ? "inactive" : "active",
    deliveryFeeCents: readNumber(data.deliveryFeeCents),
    freeShippingMinimumCents:
      typeof data.freeShippingMinimumCents === "number"
        ? data.freeShippingMinimumCents
        : null,
    deliveryDays: Array.isArray(data.deliveryDays) ? data.deliveryDays : [],
    deliveryWindows: Array.isArray(data.deliveryWindows)
      ? data.deliveryWindows
      : [],
    minimumLeadTimeDays: readNumber(data.minimumLeadTimeDays, 5),
    sortOrder: readNumber(data.sortOrder),
    createdAt: readDate(data.createdAt),
    updatedAt: readDate(data.updatedAt),
  };
};

export const getNeighborhoods = async (): Promise<Neighborhood[]> => {
  const neighborhoods = await getCollectionDocuments(
    NEIGHBORHOODS_COLLECTION,
    mapNeighborhood,
  );
  return neighborhoods.sort((left, right) => left.sortOrder - right.sortOrder);
};

export const getNeighborhoodById = async (
  id: string,
): Promise<Neighborhood | undefined> => {
  return getDocumentById(NEIGHBORHOODS_COLLECTION, id, mapNeighborhood);
};

export const checkSlugUnique = async (
  slug: string,
  excludeId?: string,
): Promise<boolean> => {
  return !(await fieldValueExists(
    NEIGHBORHOODS_COLLECTION,
    "slug",
    slug,
    excludeId,
  ));
};

export const createNeighborhood = async (
  data: Omit<Neighborhood, "id" | "createdAt" | "updatedAt">,
): Promise<Neighborhood> => {
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);
  const isUnique = await checkSlugUnique(slug);
  if (!isUnique) throw new Error("Slug já está em uso.");

  const payload = {
    ...data,
    slug,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const reference = await addDoc(
    collection(getDb(), NEIGHBORHOODS_COLLECTION),
    payload,
  );
  const created = await getNeighborhoodById(reference.id);
  if (!created) throw new Error("Erro ao carregar bairro recém-criado.");

  return created;
};

export const updateNeighborhood = async (
  id: string,
  data: Partial<Neighborhood>,
): Promise<Neighborhood> => {
  const existing = await getNeighborhoodById(id);
  if (!existing) throw new Error("Bairro não encontrado.");

  const nextData = { ...data };
  if (data.slug) {
    nextData.slug = slugify(data.slug);
    const isUnique = await checkSlugUnique(nextData.slug, id);
    if (!isUnique) throw new Error("Slug já está em uso.");
  }

  const updatedNeighborhood = {
    ...existing,
    ...nextData,
    updatedAt: new Date(),
  } as Neighborhood;

  await updateDoc(doc(getDb(), NEIGHBORHOODS_COLLECTION, id), {
    ...nextData,
    updatedAt: updatedNeighborhood.updatedAt,
  });

  return updatedNeighborhood;
};

export const toggleNeighborhoodStatus = async (
  id: string,
): Promise<Neighborhood> => {
  const neighborhood = await getNeighborhoodById(id);
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

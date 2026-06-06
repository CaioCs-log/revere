import { Product } from "../firebase/products";
import { ProductInput } from "../validation/product";
import { createAuditFields, updateAuditFields } from "../audit/auditFields";
import { getCurrentUser } from "../auth/adminAuth";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { getDb } from "../firebase/client";
import {
  fieldValueExists,
  getCollectionDocuments,
  getDocumentById,
  readBoolean,
  readDate,
  readNullableString,
  readNumber,
  readStringArray,
} from "../firebase/firestoreHelpers";

const PRODUCTS_COLLECTION = "products";

const mapProduct = (snapshot: QueryDocumentSnapshot): Product => {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: typeof data.name === "string" ? data.name : "",
    slug: typeof data.slug === "string" ? data.slug : "",
    shortDescription:
      typeof data.shortDescription === "string" ? data.shortDescription : "",
    description: typeof data.description === "string" ? data.description : "",
    status:
      data.status === "draft" ||
      data.status === "active" ||
      data.status === "inactive" ||
      data.status === "archived"
        ? data.status
        : "draft",
    isVisible: readBoolean(data.isVisible),
    productType:
      data.productType === "frozen_meal" ||
      data.productType === "frozen_snack" ||
      data.productType === "other"
        ? data.productType
        : "frozen_meal",
    categoryIds: readStringArray(data.categoryIds),
    tagIds: readStringArray(data.tagIds),
    imageIds: readStringArray(data.imageIds),
    mainImageId: readNullableString(data.mainImageId),
    mainImageAlt: readNullableString(data.mainImageAlt),
    imageMode:
      data.imageMode === "real_photo" ||
      data.imageMode === "brand_placeholder" ||
      data.imageMode === "editorial" ||
      data.imageMode === "illustration"
        ? data.imageMode
        : "brand_placeholder",
    ingredients: readStringArray(data.ingredients),
    allergens: readStringArray(data.allergens),
    nutritionalHighlights: readStringArray(data.nutritionalHighlights),
    storageInstructions:
      typeof data.storageInstructions === "string"
        ? data.storageInstructions
        : "",
    consumptionInstructions:
      typeof data.consumptionInstructions === "string"
        ? data.consumptionInstructions
        : "",
    isFeatured: readBoolean(data.isFeatured),
    isNew: readBoolean(data.isNew),
    sortOrder: readNumber(data.sortOrder),
    createdAt: readDate(data.createdAt),
    updatedAt: readDate(data.updatedAt),
    createdBy: typeof data.createdBy === "string" ? data.createdBy : "system",
    updatedBy: typeof data.updatedBy === "string" ? data.updatedBy : "system",
  };
};

export const getProducts = async (): Promise<Product[]> => {
  const products = await getCollectionDocuments(
    PRODUCTS_COLLECTION,
    mapProduct,
  );
  return products
    .filter((product) => product.status !== "archived")
    .sort((left, right) => left.sortOrder - right.sortOrder);
};

export const getProductById = async (
  id: string,
): Promise<Product | undefined> => {
  return getDocumentById(PRODUCTS_COLLECTION, id, mapProduct);
};

export const createProduct = async (data: ProductInput): Promise<Product> => {
  const user = await getCurrentUser();
  const userId = user?.uid || "system";

  if (await fieldValueExists(PRODUCTS_COLLECTION, "slug", data.slug)) {
    throw new Error("Slug já existe. Por favor, escolha um nome diferente.");
  }

  const payload = {
    ...data,
    ...createAuditFields(userId),
  };

  const reference = await addDoc(
    collection(getDb(), PRODUCTS_COLLECTION),
    payload,
  );
  const created = await getProductById(reference.id);
  if (!created) {
    throw new Error("Erro ao carregar produto recém-criado.");
  }

  return created;
};

export const updateProduct = async (
  id: string,
  data: Partial<ProductInput>,
): Promise<Product> => {
  const existing = await getProductById(id);
  if (!existing) {
    throw new Error("Produto não encontrado");
  }

  if (
    data.slug &&
    (await fieldValueExists(PRODUCTS_COLLECTION, "slug", data.slug, id))
  ) {
    throw new Error("Slug já existe. Por favor, escolha um nome diferente.");
  }

  const user = await getCurrentUser();
  const userId = user?.uid || "system";
  const updatedProduct = {
    ...existing,
    ...data,
    ...updateAuditFields(userId),
  };

  await updateDoc(doc(getDb(), PRODUCTS_COLLECTION, id), {
    ...data,
    ...updateAuditFields(userId),
  });

  return updatedProduct;
};

export const archiveProduct = async (id: string): Promise<Product> => {
  return updateProduct(id, { status: "archived" });
};

export const inactivateProduct = async (id: string): Promise<Product> => {
  return updateProduct(id, { status: "inactive" });
};

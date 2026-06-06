import { ProductVariant } from "@/lib/firebase/productVariants";
import { ProductVariantInput } from "@/lib/validation/productVariant";
import { createAuditFields, updateAuditFields } from "@/lib/audit/auditFields";
import { getProductById } from "./products";
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
  readBoolean,
  readDate,
  readNumber,
} from "@/lib/firebase/firestoreHelpers";

const PRODUCT_VARIANTS_COLLECTION = "productVariants";

const mapVariant = (snapshot: QueryDocumentSnapshot): ProductVariant => {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    productId: typeof data.productId === "string" ? data.productId : "",
    name: typeof data.name === "string" ? data.name : "",
    sku: typeof data.sku === "string" ? data.sku : "",
    status:
      data.status === "draft" ||
      data.status === "active" ||
      data.status === "inactive" ||
      data.status === "archived"
        ? data.status
        : "draft",
    portionLabel:
      typeof data.portionLabel === "string" ? data.portionLabel : "",
    weightGrams: readNumber(data.weightGrams),
    priceCents: readNumber(data.priceCents),
    compareAtPriceCents:
      typeof data.compareAtPriceCents === "number"
        ? data.compareAtPriceCents
        : null,
    isVisible: readBoolean(data.isVisible),
    minQuantity: readNumber(data.minQuantity, 1),
    maxQuantity: typeof data.maxQuantity === "number" ? data.maxQuantity : null,
    isDefault: readBoolean(data.isDefault),
    sortOrder: readNumber(data.sortOrder),
    createdAt: readDate(data.createdAt),
    updatedAt: readDate(data.updatedAt),
    createdBy: typeof data.createdBy === "string" ? data.createdBy : "system",
    updatedBy: typeof data.updatedBy === "string" ? data.updatedBy : "system",
  };
};

export const getVariants = async (): Promise<ProductVariant[]> => {
  const variants = await getCollectionDocuments(
    PRODUCT_VARIANTS_COLLECTION,
    mapVariant,
  );
  return variants
    .filter((variant) => variant.status !== "archived")
    .sort((left, right) => left.sortOrder - right.sortOrder);
};

export const getVariantById = async (
  id: string,
): Promise<ProductVariant | undefined> => {
  return getDocumentById(PRODUCT_VARIANTS_COLLECTION, id, mapVariant);
};

export const getVariantsByProductId = async (
  productId: string,
): Promise<ProductVariant[]> => {
  const variants = await getVariants();
  return variants.filter((variant) => variant.productId === productId);
};

const unsetDefaultVariants = async (productId: string, excludeId?: string) => {
  const variants = await getVariantsByProductId(productId);

  await Promise.all(
    variants
      .filter((variant) => variant.isDefault && variant.id !== excludeId)
      .map((variant) =>
        updateDoc(doc(getDb(), PRODUCT_VARIANTS_COLLECTION, variant.id), {
          isDefault: false,
        }),
      ),
  );
};

export const createVariant = async (
  data: ProductVariantInput,
): Promise<ProductVariant> => {
  // Validate product exists
  const product = await getProductById(data.productId);
  if (!product) throw new Error("Produto associado não existe");

  if (await fieldValueExists(PRODUCT_VARIANTS_COLLECTION, "sku", data.sku)) {
    throw new Error("SKU já existe. Escolha outro SKU.");
  }

  if (data.isDefault) {
    await unsetDefaultVariants(data.productId);
  }

  const effectiveStatus = data.status ?? "draft";
  if (data.isVisible && effectiveStatus !== "active") {
    throw new Error("isVisible só pode ser true quando status for 'active'.");
  }

  const payload = {
    ...data,
    status: data.status ?? "draft",
    compareAtPriceCents: data.compareAtPriceCents ?? null,
    isVisible: data.isVisible ?? false,
    minQuantity: data.minQuantity ?? 1,
    maxQuantity: data.maxQuantity ?? null,
    isDefault: data.isDefault ?? false,
    sortOrder: data.sortOrder ?? 0,
    ...createAuditFields("system"),
  };

  const reference = await addDoc(
    collection(getDb(), PRODUCT_VARIANTS_COLLECTION),
    payload,
  );
  const created = await getVariantById(reference.id);
  if (!created) throw new Error("Erro ao carregar variante recém-criada.");

  return created;
};

export const updateVariant = async (
  id: string,
  data: Partial<ProductVariantInput>,
): Promise<ProductVariant> => {
  const existing = await getVariantById(id);
  if (!existing) throw new Error("Variant not found");

  if (data.productId) {
    const product = await getProductById(data.productId);
    if (!product) throw new Error("Produto associado não existe");
  }

  if (
    data.sku &&
    (await fieldValueExists(PRODUCT_VARIANTS_COLLECTION, "sku", data.sku, id))
  ) {
    throw new Error("SKU já existe. Escolha outro SKU.");
  }

  const targetProductId = data.productId ?? existing.productId;
  if (data.isDefault) {
    await unsetDefaultVariants(targetProductId, id);
  }

  const effectiveStatusUpdate = data.status ?? existing.status;
  if (data.isVisible && effectiveStatusUpdate !== "active") {
    throw new Error("isVisible só pode ser true quando status for 'active'.");
  }

  const userId = "system";
  const updated = {
    ...existing,
    ...data,
    ...updateAuditFields(userId),
  } as ProductVariant;

  await updateDoc(doc(getDb(), PRODUCT_VARIANTS_COLLECTION, id), {
    ...data,
    ...updateAuditFields(userId),
  });

  return updated;
};

export const archiveVariant = async (id: string): Promise<ProductVariant> => {
  return updateVariant(id, { status: "archived" });
};

export const inactivateVariant = async (
  id: string,
): Promise<ProductVariant> => {
  return updateVariant(id, { status: "inactive" });
};

export const isAvailableForSale = (v: ProductVariant) => {
  return v.status === "active" && v.isVisible;
};

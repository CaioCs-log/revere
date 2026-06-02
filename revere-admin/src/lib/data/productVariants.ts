import { ProductVariant } from "@/lib/firebase/productVariants";
import { ProductVariantInput } from "@/lib/validation/productVariant";
import { createAuditFields, updateAuditFields } from "@/lib/audit/auditFields";
import { getProductById } from "./products";

// In-memory store for product variants
const variants: ProductVariant[] = [];

export const getVariants = async (): Promise<ProductVariant[]> => {
  return Promise.resolve(variants.filter((v) => v.status !== "archived"));
};

export const getVariantById = async (
  id: string,
): Promise<ProductVariant | undefined> => {
  return Promise.resolve(variants.find((v) => v.id === id));
};

export const getVariantsByProductId = async (
  productId: string,
): Promise<ProductVariant[]> => {
  return Promise.resolve(
    variants.filter(
      (v) => v.productId === productId && v.status !== "archived",
    ),
  );
};

export const createVariant = async (
  data: ProductVariantInput,
): Promise<ProductVariant> => {
  // Validate product exists
  const product = await getProductById(data.productId);
  if (!product) throw new Error("Produto associado não existe");

  // SKU uniqueness
  if (variants.some((v) => v.sku === data.sku)) {
    throw new Error("SKU já existe. Escolha outro SKU.");
  }

  // If this variant is marked as default, unset other defaults for the same product
  if (data.isDefault) {
    for (const v of variants) {
      if (v.productId === data.productId && v.isDefault) v.isDefault = false;
    }
  }

  // Enforce: isVisible only allowed when status === 'active'
  const effectiveStatus = data.status ?? "draft";
  if (data.isVisible && effectiveStatus !== "active") {
    throw new Error("isVisible só pode ser true quando status for 'active'.");
  }

  const newVariant: ProductVariant = {
    id: `var-${Date.now()}`,
    productId: data.productId,
    name: data.name,
    sku: data.sku,
    status: data.status ?? "draft",
    portionLabel: data.portionLabel,
    weightGrams: data.weightGrams,
    priceCents: data.priceCents,
    compareAtPriceCents: data.compareAtPriceCents ?? null,
    isVisible: data.isVisible ?? false,
    minQuantity: data.minQuantity ?? 1,
    maxQuantity: data.maxQuantity ?? null,
    isDefault: data.isDefault ?? false,
    sortOrder: data.sortOrder ?? 0,
    ...createAuditFields("system"),
  };

  variants.push(newVariant);
  return Promise.resolve(newVariant);
};

export const updateVariant = async (
  id: string,
  data: Partial<ProductVariantInput>,
): Promise<ProductVariant> => {
  const index = variants.findIndex((v) => v.id === id);
  if (index === -1) throw new Error("Variant not found");

  // If productId changed, validate existence
  if (data.productId) {
    const product = await getProductById(data.productId);
    if (!product) throw new Error("Produto associado não existe");
  }

  // SKU uniqueness check
  if (data.sku && variants.some((v) => v.sku === data.sku && v.id !== id)) {
    throw new Error("SKU já existe. Escolha outro SKU.");
  }

  // If marking as default, unset other defaults for the (new) productId
  const targetProductId = data.productId ?? variants[index].productId;
  if (data.isDefault) {
    for (const v of variants) {
      if (v.productId === targetProductId && v.id !== id && v.isDefault)
        v.isDefault = false;
    }
  }

  // Enforce: isVisible only allowed when status === 'active'
  const effectiveStatusUpdate = data.status ?? variants[index].status;
  if (data.isVisible && effectiveStatusUpdate !== "active") {
    throw new Error("isVisible só pode ser true quando status for 'active'.");
  }

  const userId = "system";
  const updated = {
    ...variants[index],
    ...data,
    ...updateAuditFields(userId),
  } as ProductVariant;

  variants[index] = updated;
  return Promise.resolve(updated);
};

export const archiveVariant = async (id: string): Promise<ProductVariant> => {
  return updateVariant(id, { status: "archived" });
};

export const inactivateVariant = async (
  id: string,
): Promise<ProductVariant> => {
  return updateVariant(id, { status: "inactive" });
};

// For tests
export const resetVariants = () => {
  variants.length = 0;
};

export const isAvailableForSale = (v: ProductVariant) => {
  return v.status === "active" && v.isVisible;
};

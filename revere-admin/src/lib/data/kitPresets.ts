import { createAuditFields, updateAuditFields } from "@/lib/audit/auditFields";
import { getCurrentUser } from "@/lib/auth/adminAuth";
import { Product, ProductType } from "@/lib/firebase/products";
import { ProductVariant } from "@/lib/firebase/productVariants";
import { KitPreset } from "@/lib/firebase/kitPresets";
import { getProductById } from "./products";
import { getVariantById } from "./productVariants";
import {
  defaultKitDiscountTiers,
  KitPresetInput,
} from "@/lib/validation/kitPreset";

const kitPresets: KitPreset[] = [];

const isActiveAndVisibleProduct = (product?: Product) =>
  Boolean(product && product.status === "active" && product.isVisible);

const isActiveAndVisibleVariant = (variant?: ProductVariant) =>
  Boolean(variant && variant.status === "active" && variant.isVisible);

const validateDiscountTiers = (
  tiers: KitPresetInput["discountTiers"],
  kitType: KitPresetInput["kitType"],
) => {
  if (kitType !== "customizable") return;

  const matches = defaultKitDiscountTiers.every((expected, index) => {
    const current = tiers[index];
    return (
      current?.minItems === expected.minItems &&
      current?.maxItems === expected.maxItems &&
      current?.discountPercent === expected.discountPercent
    );
  });

  if (!matches || tiers.length !== defaultKitDiscountTiers.length) {
    throw new Error(
      "discountTiers devem seguir exatamente as faixas 5% / 8% / 10% do MVP.",
    );
  }
};

const validateKitReferences = async (
  data: KitPresetInput,
  requireActiveVisibleReferences: boolean,
) => {
  for (const item of data.items) {
    const product = await getProductById(item.productId);
    const variant = await getVariantById(item.variantId);

    if (!product) {
      throw new Error("Kit referencia um produto que não existe.");
    }

    if (!variant) {
      throw new Error("Kit referencia uma variante que não existe.");
    }

    if (variant.productId !== product.id) {
      throw new Error(
        "A variante selecionada não pertence ao produto informado no item do kit.",
      );
    }

    if (
      data.kitType === "customizable" &&
      !data.eligibleProductTypes.includes(product.productType as ProductType)
    ) {
      throw new Error(
        "Produto fora dos tipos elegíveis configurados para este kit customizável.",
      );
    }

    if (
      requireActiveVisibleReferences &&
      (!isActiveAndVisibleProduct(product) ||
        !isActiveAndVisibleVariant(variant))
    ) {
      throw new Error(
        "Kit ativo só pode referenciar produtos e variantes ativos e visíveis.",
      );
    }
  }
};

const validateBusinessRules = async (data: KitPresetInput) => {
  if (kitPresets.some((kit) => kit.slug === data.slug)) {
    throw new Error("Slug já existe. Escolha um slug diferente.");
  }

  if (data.kitType === "customizable" && data.minItems !== 7) {
    throw new Error("Kits customizáveis devem ter minItems = 7 no MVP.");
  }

  if (
    data.kitType === "customizable" &&
    !data.eligibleProductTypes.every((type) => type === "frozen_meal")
  ) {
    throw new Error(
      "Apenas frozen_meal é elegível para kits customizáveis com desconto no MVP.",
    );
  }

  validateDiscountTiers(data.discountTiers, data.kitType);
  await validateKitReferences(data, data.status === "active");
};

export const getKitPresets = async (): Promise<KitPreset[]> => {
  return Promise.resolve(kitPresets.filter((kit) => kit.status !== "archived"));
};

export const getKitPresetById = async (
  id: string,
): Promise<KitPreset | undefined> => {
  return Promise.resolve(kitPresets.find((kit) => kit.id === id));
};

export const createKitPreset = async (
  data: KitPresetInput,
): Promise<KitPreset> => {
  await validateBusinessRules(data);

  const user = await getCurrentUser();
  const userId = user?.uid || "system";

  const newKitPreset: KitPreset = {
    id: `kit-${Date.now()}`,
    ...data,
    ...createAuditFields(userId),
  };

  kitPresets.push(newKitPreset);
  return Promise.resolve(newKitPreset);
};

export const updateKitPreset = async (
  id: string,
  data: Partial<KitPresetInput>,
): Promise<KitPreset> => {
  const index = kitPresets.findIndex((kit) => kit.id === id);
  if (index === -1) {
    throw new Error("Kit não encontrado.");
  }

  const nextValue: KitPresetInput = {
    ...kitPresets[index],
    ...data,
  };

  if (
    data.slug &&
    kitPresets.some((kit) => kit.slug === data.slug && kit.id !== id)
  ) {
    throw new Error("Slug já existe. Escolha um slug diferente.");
  }

  if (nextValue.kitType === "customizable" && nextValue.minItems !== 7) {
    throw new Error("Kits customizáveis devem ter minItems = 7 no MVP.");
  }

  if (
    nextValue.kitType === "customizable" &&
    !nextValue.eligibleProductTypes.every((type) => type === "frozen_meal")
  ) {
    throw new Error(
      "Apenas frozen_meal é elegível para kits customizáveis com desconto no MVP.",
    );
  }

  validateDiscountTiers(nextValue.discountTiers, nextValue.kitType);
  await validateKitReferences(nextValue, nextValue.status === "active");

  const user = await getCurrentUser();
  const userId = user?.uid || "system";

  const updatedKitPreset: KitPreset = {
    ...kitPresets[index],
    ...data,
    ...updateAuditFields(userId),
  };

  kitPresets[index] = updatedKitPreset;
  return Promise.resolve(updatedKitPreset);
};

export const archiveKitPreset = async (id: string): Promise<KitPreset> => {
  return updateKitPreset(id, { status: "archived" });
};

export const inactivateKitPreset = async (id: string): Promise<KitPreset> => {
  return updateKitPreset(id, { status: "inactive" });
};

export const resetKitPresets = () => {
  kitPresets.length = 0;
};

export const isKitVisibleForSale = (kit: KitPreset) => kit.status === "active";

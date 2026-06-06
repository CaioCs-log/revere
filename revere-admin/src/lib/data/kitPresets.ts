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
  readNullableString,
  readNumber,
} from "@/lib/firebase/firestoreHelpers";

const KIT_PRESETS_COLLECTION = "kitPresets";

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
  if (await fieldValueExists(KIT_PRESETS_COLLECTION, "slug", data.slug)) {
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

const mapKitPreset = (snapshot: QueryDocumentSnapshot): KitPreset => {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    name: typeof data.name === "string" ? data.name : "",
    slug: typeof data.slug === "string" ? data.slug : "",
    status:
      data.status === "draft" ||
      data.status === "active" ||
      data.status === "inactive" ||
      data.status === "archived"
        ? data.status
        : "draft",
    shortDescription:
      typeof data.shortDescription === "string" ? data.shortDescription : "",
    description: typeof data.description === "string" ? data.description : "",
    imageId: readNullableString(data.imageId),
    imageAlt: readNullableString(data.imageAlt),
    imageMode:
      data.imageMode === "real_photo" ||
      data.imageMode === "brand_placeholder" ||
      data.imageMode === "editorial" ||
      data.imageMode === "illustration"
        ? data.imageMode
        : "brand_placeholder",
    kitType:
      data.kitType === "fixed" ||
      data.kitType === "suggested" ||
      data.kitType === "customizable"
        ? data.kitType
        : "fixed",
    eligibleProductTypes: Array.isArray(data.eligibleProductTypes)
      ? data.eligibleProductTypes
      : [],
    allowRepeatedItems: readBoolean(data.allowRepeatedItems, true),
    items: Array.isArray(data.items) ? data.items : [],
    minItems: readNumber(data.minItems, 7),
    maxItems: typeof data.maxItems === "number" ? data.maxItems : null,
    pricingMode:
      data.pricingMode === "fixed_price" || data.pricingMode === "sum_items"
        ? data.pricingMode
        : "sum_items",
    fixedPriceCents:
      typeof data.fixedPriceCents === "number" ? data.fixedPriceCents : null,
    discountTiers: Array.isArray(data.discountTiers) ? data.discountTiers : [],
    grantsFreeShipping: readBoolean(data.grantsFreeShipping),
    isFeatured: readBoolean(data.isFeatured),
    sortOrder: readNumber(data.sortOrder),
    createdAt: readDate(data.createdAt),
    updatedAt: readDate(data.updatedAt),
    createdBy: typeof data.createdBy === "string" ? data.createdBy : "system",
    updatedBy: typeof data.updatedBy === "string" ? data.updatedBy : "system",
  };
};

const toKitPresetInput = (kit: KitPreset): KitPresetInput => ({
  name: kit.name,
  slug: kit.slug,
  status: kit.status,
  shortDescription: kit.shortDescription,
  description: kit.description,
  imageId: kit.imageId,
  imageAlt: kit.imageAlt,
  imageMode: kit.imageMode,
  kitType: kit.kitType,
  eligibleProductTypes: kit.eligibleProductTypes,
  allowRepeatedItems: kit.allowRepeatedItems,
  items: kit.items,
  minItems: kit.minItems,
  maxItems: kit.maxItems,
  pricingMode: kit.pricingMode,
  fixedPriceCents: kit.fixedPriceCents,
  discountTiers: kit.discountTiers,
  grantsFreeShipping: kit.grantsFreeShipping,
  isFeatured: kit.isFeatured,
  sortOrder: kit.sortOrder,
});

export const getKitPresets = async (): Promise<KitPreset[]> => {
  const kits = await getCollectionDocuments(
    KIT_PRESETS_COLLECTION,
    mapKitPreset,
  );
  return kits
    .filter((kit) => kit.status !== "archived")
    .sort((left, right) => left.sortOrder - right.sortOrder);
};

export const getKitPresetById = async (
  id: string,
): Promise<KitPreset | undefined> => {
  return getDocumentById(KIT_PRESETS_COLLECTION, id, mapKitPreset);
};

export const createKitPreset = async (
  data: KitPresetInput,
): Promise<KitPreset> => {
  await validateBusinessRules(data);

  const user = await getCurrentUser();
  const userId = user?.uid || "system";

  const payload = {
    ...data,
    ...createAuditFields(userId),
  };

  const reference = await addDoc(
    collection(getDb(), KIT_PRESETS_COLLECTION),
    payload,
  );
  const created = await getKitPresetById(reference.id);
  if (!created) throw new Error("Erro ao carregar kit recém-criado.");

  return created;
};

export const updateKitPreset = async (
  id: string,
  data: Partial<KitPresetInput>,
): Promise<KitPreset> => {
  const existing = await getKitPresetById(id);
  if (!existing) {
    throw new Error("Kit não encontrado.");
  }

  const nextValue: KitPresetInput = {
    ...toKitPresetInput(existing),
    ...data,
  };

  if (
    data.slug &&
    (await fieldValueExists(KIT_PRESETS_COLLECTION, "slug", data.slug, id))
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
    ...existing,
    ...data,
    ...updateAuditFields(userId),
  };

  await updateDoc(doc(getDb(), KIT_PRESETS_COLLECTION, id), {
    ...data,
    ...updateAuditFields(userId),
  });

  return updatedKitPreset;
};

export const archiveKitPreset = async (id: string): Promise<KitPreset> => {
  return updateKitPreset(id, { status: "archived" });
};

export const inactivateKitPreset = async (id: string): Promise<KitPreset> => {
  return updateKitPreset(id, { status: "inactive" });
};

export const isKitVisibleForSale = (kit: KitPreset) => kit.status === "active";

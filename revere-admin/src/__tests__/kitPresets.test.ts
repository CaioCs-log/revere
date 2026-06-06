import { beforeEach, describe, expect, it } from "vitest";
import { collection, getDocs } from "firebase/firestore";
import {
  archiveKitPreset,
  createKitPreset,
  getKitPresets,
} from "@/lib/data/kitPresets";
import { createProduct } from "@/lib/data/products";
import { createVariant } from "@/lib/data/productVariants";
import {
  defaultKitDiscountTiers,
  kitPresetSchema,
  KitPresetInput,
} from "@/lib/validation/kitPreset";
import { ProductInput } from "@/lib/validation/product";
import { clearFirestoreEmulator } from "./firestoreTestUtils";
import { getDb } from "@/lib/firebase/client";

const buildProduct = (overrides: Partial<ProductInput> = {}): ProductInput => ({
  name: "Produto Base",
  slug: `produto-base-${Math.random().toString(36).slice(2, 8)}`,
  shortDescription: "Resumo",
  description: "Descrição completa",
  status: "active",
  isVisible: true,
  productType: "frozen_meal",
  categoryIds: ["cat-1"],
  tagIds: [],
  imageIds: [],
  mainImageId: null,
  mainImageAlt: null,
  imageMode: "brand_placeholder",
  ingredients: [],
  allergens: [],
  nutritionalHighlights: [],
  storageInstructions: "",
  consumptionInstructions: "",
  isFeatured: false,
  isNew: false,
  sortOrder: 0,
  ...overrides,
});

describe("M6 — KitPresets Data Layer", () => {
  beforeEach(() => {
    return clearFirestoreEmulator();
  });

  it("should create a customizable kit with fixed MVP discount tiers", async () => {
    const product = await createProduct(buildProduct());
    const variant = await createVariant({
      productId: product.id,
      name: "Variante 360g",
      sku: `KIT-${Math.random().toString(36).slice(2, 8)}`,
      status: "active",
      portionLabel: "360g",
      weightGrams: 360,
      priceCents: 2490,
      compareAtPriceCents: null,
      isVisible: true,
      minQuantity: 1,
      maxQuantity: null,
      isDefault: true,
      sortOrder: 0,
    });

    const input: KitPresetInput = {
      name: "Kit Customizável",
      slug: "kit-customizavel",
      status: "active",
      shortDescription: "Monte como preferir",
      description: "Kit flexível para o MVP",
      imageId: null,
      imageAlt: null,
      imageMode: "brand_placeholder",
      kitType: "customizable",
      eligibleProductTypes: ["frozen_meal"],
      allowRepeatedItems: true,
      items: [{ productId: product.id, variantId: variant.id, quantity: 1 }],
      minItems: 7,
      maxItems: null,
      pricingMode: "sum_items",
      fixedPriceCents: null,
      discountTiers: defaultKitDiscountTiers.map((tier) => ({ ...tier })),
      grantsFreeShipping: false,
      isFeatured: false,
      sortOrder: 0,
    };

    const created = await createKitPreset(input);
    expect(created.id).toBeDefined();
    expect(created.discountTiers).toEqual(defaultKitDiscountTiers);
    expect(created.createdBy).toBeDefined();

    const snapshot = await getDocs(collection(getDb(), "kitPresets"));
    expect(snapshot.docs).toHaveLength(1);
    expect(snapshot.docs[0]?.data().slug).toBe("kit-customizavel");
  });

  it("should reject duplicate slugs", async () => {
    const product = await createProduct(
      buildProduct({ slug: "produto-slug-unico-1" }),
    );
    const variant = await createVariant({
      productId: product.id,
      name: "Variante A",
      sku: "SKU-KIT-A",
      status: "active",
      portionLabel: "300g",
      weightGrams: 300,
      priceCents: 1990,
      compareAtPriceCents: null,
      isVisible: true,
      minQuantity: 1,
      maxQuantity: null,
      isDefault: false,
      sortOrder: 0,
    });

    const input: KitPresetInput = {
      name: "Kit 1",
      slug: "kit-duplicado",
      status: "draft",
      shortDescription: "",
      description: "",
      imageId: null,
      imageAlt: null,
      imageMode: "brand_placeholder",
      kitType: "fixed",
      eligibleProductTypes: ["frozen_meal"],
      allowRepeatedItems: true,
      items: [{ productId: product.id, variantId: variant.id, quantity: 2 }],
      minItems: 2,
      maxItems: null,
      pricingMode: "fixed_price",
      fixedPriceCents: 3990,
      discountTiers: defaultKitDiscountTiers.map((tier) => ({ ...tier })),
      grantsFreeShipping: false,
      isFeatured: false,
      sortOrder: 0,
    };

    await createKitPreset(input);
    await expect(createKitPreset(input)).rejects.toThrow("Slug já existe");
  });

  it("should fail schema validation when customizable minItems is not 7", () => {
    const result = kitPresetSchema.safeParse({
      name: "Kit inválido",
      slug: "kit-invalido",
      status: "draft",
      shortDescription: "",
      description: "",
      imageId: null,
      imageAlt: null,
      imageMode: "brand_placeholder",
      kitType: "customizable",
      eligibleProductTypes: ["frozen_meal"],
      allowRepeatedItems: true,
      items: [],
      minItems: 6,
      maxItems: null,
      pricingMode: "sum_items",
      fixedPriceCents: null,
      discountTiers: defaultKitDiscountTiers.map((tier) => ({ ...tier })),
      grantsFreeShipping: false,
      isFeatured: false,
      sortOrder: 0,
    });

    expect(result.success).toBe(false);
  });

  it("should reject active kits that reference inactive or invisible products/variants", async () => {
    const inactiveProduct = await createProduct(
      buildProduct({
        slug: "produto-inativo",
        status: "inactive",
        isVisible: false,
      }),
    );

    const inactiveVariant = await createVariant({
      productId: inactiveProduct.id,
      name: "Variante oculta",
      sku: "SKU-KIT-INACTIVE",
      status: "inactive",
      portionLabel: "300g",
      weightGrams: 300,
      priceCents: 1890,
      compareAtPriceCents: null,
      isVisible: false,
      minQuantity: 1,
      maxQuantity: null,
      isDefault: false,
      sortOrder: 0,
    });

    await expect(
      createKitPreset({
        name: "Kit ativo inválido",
        slug: "kit-ativo-invalido",
        status: "active",
        shortDescription: "Resumo",
        description: "Descrição",
        imageId: null,
        imageAlt: null,
        imageMode: "brand_placeholder",
        kitType: "fixed",
        eligibleProductTypes: ["frozen_meal"],
        allowRepeatedItems: true,
        items: [
          {
            productId: inactiveProduct.id,
            variantId: inactiveVariant.id,
            quantity: 1,
          },
        ],
        minItems: 1,
        maxItems: null,
        pricingMode: "fixed_price",
        fixedPriceCents: 2990,
        discountTiers: defaultKitDiscountTiers.map((tier) => ({ ...tier })),
        grantsFreeShipping: false,
        isFeatured: false,
        sortOrder: 0,
      }),
    ).rejects.toThrow(
      "Kit ativo só pode referenciar produtos e variantes ativos e visíveis.",
    );
  });

  it("should archive kits without physical deletion", async () => {
    const product = await createProduct(
      buildProduct({ slug: "produto-kit-archive" }),
    );
    const variant = await createVariant({
      productId: product.id,
      name: "Variante archive",
      sku: "SKU-KIT-ARCHIVE",
      status: "active",
      portionLabel: "410g",
      weightGrams: 410,
      priceCents: 2690,
      compareAtPriceCents: null,
      isVisible: true,
      minQuantity: 1,
      maxQuantity: null,
      isDefault: false,
      sortOrder: 0,
    });

    const created = await createKitPreset({
      name: "Kit para arquivar",
      slug: "kit-para-arquivar",
      status: "draft",
      shortDescription: "Resumo",
      description: "Descrição",
      imageId: null,
      imageAlt: null,
      imageMode: "brand_placeholder",
      kitType: "suggested",
      eligibleProductTypes: ["frozen_meal"],
      allowRepeatedItems: true,
      items: [{ productId: product.id, variantId: variant.id, quantity: 1 }],
      minItems: 1,
      maxItems: null,
      pricingMode: "sum_items",
      fixedPriceCents: null,
      discountTiers: defaultKitDiscountTiers.map((tier) => ({ ...tier })),
      grantsFreeShipping: true,
      isFeatured: true,
      sortOrder: 1,
    });

    await archiveKitPreset(created.id);
    const kits = await getKitPresets();
    expect(kits.find((kit) => kit.id === created.id)).toBeUndefined();
  });
});

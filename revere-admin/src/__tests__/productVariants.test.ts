import { describe, it, expect, beforeEach } from "vitest";
import {
  resetVariants,
  createVariant,
  updateVariant,
  archiveVariant,
  getVariants,
} from "@/lib/data/productVariants";
import { createProduct } from "@/lib/data/products";
import { ProductInput } from "@/lib/validation/product";
import { productVariantSchema } from "@/lib/validation/productVariant";

describe("ProductVariants Data Layer", () => {
  beforeEach(() => {
    resetVariants();
  });

  it("should create, update and archive a variant", async () => {
    const prod: ProductInput = {
      name: "PV Test Product",
      slug: "pv-test-product",
      shortDescription: "s",
      description: "d",
      status: "draft",
      isVisible: false,
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
    };

    const p = await createProduct(prod);
    const variant = await createVariant({
      productId: p.id,
      name: "Variant A",
      sku: "SKU-A",
      portionLabel: "300g",
      weightGrams: 300,
      priceCents: 1990,
      compareAtPriceCents: null,
      isVisible: false,
      minQuantity: 1,
      maxQuantity: null,
      isDefault: true,
      sortOrder: 0,
      status: "draft",
    });

    expect(variant.id).toBeDefined();

    const updated = await updateVariant(variant.id, { name: "Variant A2" });
    expect(updated.name).toBe("Variant A2");

    await archiveVariant(variant.id);
    const all = await getVariants();
    expect(all.find((v) => v.id === variant.id)).toBeUndefined();
  });

  it("should prevent duplicate SKU", async () => {
    const p = await createProduct({
      name: "PV Test 2",
      slug: "pv-t2",
      shortDescription: "s",
      description: "d",
      status: "draft",
      isVisible: false,
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
    });

    await createVariant({
      productId: p.id,
      name: "V1",
      sku: "SKU-X",
      portionLabel: "300g",
      weightGrams: 300,
      priceCents: 1000,
      compareAtPriceCents: null,
      isVisible: false,
      minQuantity: 1,
      maxQuantity: null,
      isDefault: false,
      sortOrder: 0,
      status: "draft",
    });
    await expect(
      createVariant({
        productId: p.id,
        name: "V2",
        sku: "SKU-X",
        portionLabel: "400g",
        weightGrams: 400,
        priceCents: 1200,
        compareAtPriceCents: null,
        isVisible: false,
        minQuantity: 1,
        maxQuantity: null,
        isDefault: false,
        sortOrder: 0,
        status: "draft",
      }),
    ).rejects.toThrow(/SKU já existe/);
  });

  it("should keep only the last created default variant per product", async () => {
    const prod = await createProduct({
      name: "DProd",
      slug: "dprod",
      shortDescription: "s",
      description: "d",
      status: "draft",
      isVisible: false,
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
    });
    await createVariant({
      productId: prod.id,
      name: "V1",
      sku: "SKU-D1",
      portionLabel: "300g",
      weightGrams: 300,
      priceCents: 1000,
      compareAtPriceCents: null,
      isVisible: false,
      minQuantity: 1,
      maxQuantity: null,
      isDefault: true,
      sortOrder: 0,
      status: "draft",
    });
    const v2 = await createVariant({
      productId: prod.id,
      name: "V2",
      sku: "SKU-D2",
      portionLabel: "400g",
      weightGrams: 400,
      priceCents: 1200,
      compareAtPriceCents: null,
      isVisible: false,
      minQuantity: 1,
      maxQuantity: null,
      isDefault: true,
      sortOrder: 1,
      status: "draft",
    });

    const all = await getVariants();
    const defaults = all.filter((v) => v.productId === prod.id && v.isDefault);
    expect(defaults.length).toBe(1);
    expect(defaults[0].id).toBe(v2.id);
  });

  it("should unset previous default when editing another variant to default", async () => {
    const prod = await createProduct({
      name: "EProd",
      slug: "eprod",
      shortDescription: "s",
      description: "d",
      status: "draft",
      isVisible: false,
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
    });
    await createVariant({
      productId: prod.id,
      name: "A",
      sku: "SKU-A",
      portionLabel: "300g",
      weightGrams: 300,
      priceCents: 1000,
      compareAtPriceCents: null,
      isVisible: false,
      minQuantity: 1,
      maxQuantity: null,
      isDefault: true,
      sortOrder: 0,
      status: "draft",
    });
    const b = await createVariant({
      productId: prod.id,
      name: "B",
      sku: "SKU-B",
      portionLabel: "400g",
      weightGrams: 400,
      priceCents: 1200,
      compareAtPriceCents: null,
      isVisible: false,
      minQuantity: 1,
      maxQuantity: null,
      isDefault: false,
      sortOrder: 1,
      status: "draft",
    });

    // now edit B to become default
    await updateVariant(b.id, { isDefault: true });
    const all = await getVariants();
    const defaults = all.filter((v) => v.productId === prod.id && v.isDefault);
    expect(defaults.length).toBe(1);
    expect(defaults[0].id).toBe(b.id);
  });

  it("should fail validation if compareAtPriceCents is not greater than priceCents", () => {
    const invalidData = {
      productId: "p1",
      name: "V1",
      sku: "SKU-1",
      portionLabel: "300g",
      weightGrams: 300,
      priceCents: 2000,
      compareAtPriceCents: 1500, // Invalid: less than priceCents
      status: "draft",
    };

    const result = productVariantSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Preço comparativo deve ser maior que o preço original",
      );
    }
  });

  it("should pass validation if compareAtPriceCents is null", () => {
    const validData = {
      productId: "p1",
      name: "V1",
      sku: "SKU-1",
      portionLabel: "300g",
      weightGrams: 300,
      priceCents: 2000,
      compareAtPriceCents: null,
      status: "draft",
    };

    const result = productVariantSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

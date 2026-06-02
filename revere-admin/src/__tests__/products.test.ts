import { describe, it, expect } from "vitest";
import {
  getProducts,
  createProduct,
  updateProduct,
  archiveProduct,
} from "../lib/data/products";
import { ProductInput } from "../lib/validation/product";

describe("Products Data Layer", () => {
  const mockProduct: ProductInput = {
    name: "Test Product",
    slug: "test-product",
    shortDescription: "Short desc",
    description: "Long desc",
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

  it("should create a new product", async () => {
    const product = await createProduct(mockProduct);
    expect(product.name).toBe(mockProduct.name);
    expect(product.id).toBeDefined();
    expect(product.createdAt).toBeDefined();
  });

  it("should not allow duplicate slugs", async () => {
    await expect(createProduct(mockProduct)).rejects.toThrow("Slug já existe");
  });

  it("should list products excluding archived", async () => {
    const products = await getProducts();
    expect(products.length).toBeGreaterThan(0);

    const p = products[0];
    await archiveProduct(p.id);

    const productsAfter = await getProducts();
    expect(productsAfter.find((item) => item.id === p.id)).toBeUndefined();
  });

  it("should update a product", async () => {
    const product = await createProduct({ ...mockProduct, slug: "to-update" });
    const updated = await updateProduct(product.id, { name: "Updated Name" });
    expect(updated.name).toBe("Updated Name");
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
      product.updatedAt.getTime(),
    );
  });
});

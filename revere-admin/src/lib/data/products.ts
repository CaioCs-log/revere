import { Product } from "../firebase/products";
import { ProductInput } from "../validation/product";
import { createAuditFields, updateAuditFields } from "../audit/auditFields";
import { getCurrentUser } from "../auth/adminAuth";

// Simulated in-memory database for Products
const products: Product[] = [];

export const getProducts = async (): Promise<Product[]> => {
  return Promise.resolve(products.filter((p) => p.status !== "archived"));
};

export const getProductById = async (
  id: string,
): Promise<Product | undefined> => {
  return Promise.resolve(products.find((p) => p.id === id));
};

export const createProduct = async (data: ProductInput): Promise<Product> => {
  const user = await getCurrentUser();
  const userId = user?.uid || "system";

  // Slug uniqueness check
  if (products.some((p) => p.slug === data.slug)) {
    throw new Error("Slug já existe. Por favor, escolha um nome diferente.");
  }

  const newProduct: Product = {
    ...data,
    id: `prod-${Date.now()}`,
    ...createAuditFields(userId),
  } as Product;

  products.push(newProduct);
  return Promise.resolve(newProduct);
};

export const updateProduct = async (
  id: string,
  data: Partial<ProductInput>,
): Promise<Product> => {
  const user = await getCurrentUser();
  const userId = user?.uid || "system";

  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error("Produto não encontrado");
  }

  // Slug uniqueness check
  if (data.slug && products.some((p) => p.slug === data.slug && p.id !== id)) {
    throw new Error("Slug já existe. Por favor, escolha um nome diferente.");
  }

  const updatedProduct = {
    ...products[index],
    ...data,
    ...updateAuditFields(userId),
  } as Product;

  products[index] = updatedProduct;
  return Promise.resolve(updatedProduct);
};

export const archiveProduct = async (id: string): Promise<Product> => {
  return updateProduct(id, { status: "archived" });
};

export const inactivateProduct = async (id: string): Promise<Product> => {
  return updateProduct(id, { status: "inactive" });
};

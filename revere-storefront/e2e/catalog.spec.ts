import { expect, test } from "@playwright/test"

test("catalog page loads with product grid", async ({ page }) => {
  await page.goto("/cardapio")
  await expect(page.getByRole("heading", { name: "Cardápio" })).toBeVisible()
  await expect(
    page.getByText("Frango cremoso com pure de abobora")
  ).toBeVisible()
  await expect(page.getByText("Bowl proteico de frango")).toBeVisible()
})

test("catalog page filters by category", async ({ page }) => {
  await page.goto("/cardapio")
  await page.getByRole("link", { name: "Sopas" }).click()
  await expect(page.getByText("Sopa low carb de legumes")).toBeVisible()
  await expect(
    page.getByText("Frango cremoso com pure de abobora")
  ).not.toBeVisible()
})

test("catalog page shows empty state when no products match", async ({
  page,
}) => {
  await page.goto("/cardapio?categoria=cat_pratos&tag=tag_low_carb")
  await expect(
    page.getByText("Nenhum prato encontrado com esses filtros.")
  ).toBeVisible()
  await expect(page.getByRole("link", { name: "Limpar filtros" })).toBeVisible()
})

test("catalog page clears all filters", async ({ page }) => {
  await page.goto("/cardapio?categoria=cat_sopas")
  await page.getByRole("link", { name: "Todas" }).click()
  await expect(
    page.getByText("Frango cremoso com pure de abobora")
  ).toBeVisible()
})

test("navigation from catalog to product detail", async ({ page }) => {
  await page.goto("/cardapio")
  await page.getByText("Frango cremoso com pure de abobora").click()
  await expect(page).toHaveURL(/\/produto\/frango-cremoso-com-pure-de-abobora/)
  await expect(
    page.getByRole("heading", { name: "Frango cremoso com pure de abobora" })
  ).toBeVisible()
})

test("product detail page shows fallback for non-existent slug", async ({
  page,
}) => {
  await page.goto("/produto/prato-inexistente")
  await expect(
    page.getByRole("heading", { name: "Prato não encontrado" })
  ).toBeVisible()
  await expect(page.getByRole("link", { name: "Ver cardápio" })).toBeVisible()
})

test("product detail page shows ingredients and portions", async ({ page }) => {
  await page.goto("/produto/frango-cremoso-com-pure-de-abobora")
  await expect(page.getByText("Ingredientes")).toBeVisible()
  await expect(page.getByText("Porções disponíveis")).toBeVisible()
  await expect(page.getByText("300g")).toBeVisible()
  await expect(page.getByText("R$ 28,90")).toBeVisible()
})

test("product detail page shows back navigation", async ({ page }) => {
  await page.goto("/produto/frango-cremoso-com-pure-de-abobora")
  await expect(
    page.getByRole("link", { name: "Voltar ao cardápio" })
  ).toBeVisible()
})

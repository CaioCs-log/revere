import { expect, test } from "@playwright/test"

test("home page loads with correct title", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveTitle(/Revere/)
})

test("home page renders all published content blocks", async ({ page }) => {
  await page.goto("/")

  await expect(
    page.getByRole("heading", { name: "Comida de verdade, explicada." })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Como funciona" })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Cardápio da semana", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Kits", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Entrega", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Por que confiar" })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", {
      name: "Receba o cardápio da semana e escolha seus pratos.",
    })
  ).toBeVisible()
})

test("home page does not crash with missing optional block data", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (err) => errors.push(err.message))

  await page.goto("/")

  expect(errors).toHaveLength(0)
  await expect(
    page.getByRole("heading", { name: "Comida de verdade, explicada." })
  ).toBeVisible()
})

test("home page renders the hero CTA button", async ({ page }) => {
  await page.goto("/")

  const cta = page.getByRole("link", { name: "Receber cardápio" }).first()
  await expect(cta).toBeVisible()
  await expect(cta).toHaveAttribute("href", "/receber-cardapio")
})

test("home page renders the wordmark logo", async ({ page }) => {
  await page.goto("/")

  const logo = page.locator('img[alt="Revere"]')
  await expect(logo).toBeVisible()
  await expect(logo).toHaveAttribute("src", "/logo-wordmark-revere.svg")
})

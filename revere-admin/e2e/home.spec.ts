import { expect, test } from "@playwright/test";

test("admin home page loads", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Revere|Create Next App/);
});

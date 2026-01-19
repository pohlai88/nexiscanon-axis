import { test, expect } from "@playwright/test";

test.describe("Smoke", () => {
  test("home loads and shows main content", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("not-found shows for unknown route", async ({ page }) => {
    await page.goto("/does-not-exist");
    await expect(page.getByText("Not Found", { exact: true })).toBeVisible();
  });
});

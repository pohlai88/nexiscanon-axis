import { test, expect } from "@playwright/test";

test.describe("API", () => {
  test("GET /api/health returns 200", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body).toHaveProperty("status", "ok");
    expect(body).toHaveProperty("timestamp");
  });

  test("POST /api/echo returns echoed message", async ({ request }) => {
    const res = await request.post("/api/echo", {
      data: { message: "hello" },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body).toEqual({ echoed: "hello" });
  });

  test("POST /api/echo invalid body returns 400", async ({ request }) => {
    const res = await request.post("/api/echo", { data: {} });
    expect(res.status()).toBe(400);
  });
});

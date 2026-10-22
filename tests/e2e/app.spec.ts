import { test, expect } from "@playwright/test";
import fs from "node:fs";
const manifest = JSON.parse(fs.readFileSync("src/manifest.json", "utf8"));
test("home uses local assets and prototype navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("O teu próximo nível.")).toBeVisible();
  await page
    .getByRole("button", { name: "Partidas", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/12%3A172/);
});
test("training persists completed sessions and preferences", async ({
  page,
}) => {
  await page.goto("/#15%3A1052");
  await page.getByRole("button", { name: "Usar a app", exact: true }).click();
  await expect(page.locator(".live-content")).toBeVisible();
  await page
    .getByRole("button", { name: "Adicionar ao plano", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Iniciar", exact: true }).click();
  await page.waitForTimeout(1200);
  await page.getByLabel("Reflexão de treino").fill("Melhorar o primeiro tiro");
  await page
    .getByRole("button", { name: "Concluir sessão", exact: true })
    .click();
  await page.waitForTimeout(400);
  await page.reload();
  const data = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("echo-state") || "{}"),
  );
  expect(data.plan.length).toBe(1);
  expect(data.sessions[0].reflection).toBe("Melhorar o primeiro tiro");
  expect(data.sessions[0].seconds).toBeGreaterThan(0);
});
test("local match imports drive real statistics", async ({ page }) => {
  await page.goto("/#12%3A172");
  await page.getByRole("button", { name: "Usar a app", exact: true }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "matches.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify([
        {
          id: "test",
          map: "Ascent",
          agent: "Omen",
          date: "2026-10-20",
          won: true,
          kills: 20,
          deaths: 10,
          assists: 4,
          roundsWon: 13,
          roundsLost: 8,
        },
      ]),
    ),
  });
  await expect(
    page.locator(".live-content td").filter({ hasText: "20 / 10 / 4" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Início ↗", exact: true }).click();
  await expect(page.locator(".metrics")).toContainText("100%");
});
test("every imported Figma screen renders without missing images", async ({
  page,
}) => {
  test.setTimeout(240000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const screen of manifest) {
    console.log("Checking Figma frame", screen.id);
    await page.goto("/#" + encodeURIComponent(screen.id));
    await page.waitForSelector(`.screen [data-node-id="${screen.id}"]`, {
      timeout: 15000,
    });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(
      () => [...document.images].every((i) => i.complete),
      {},
      { timeout: 15000 },
    );
    const broken = await page.evaluate(() =>
      [...document.images]
        .filter((i) => i.naturalWidth === 0)
        .map((i) => i.src),
    );
    expect(broken, screen.name).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test("motion settles and functional content survives navigation", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Usar a app", exact: true }).click();
  for (const [id, shortcut] of [
    ["12:172", "2"],
    ["15:901", "6"],
    ["14:757", "4"],
    ["12:2", "1"],
  ]) {
    await page.keyboard.press(`Alt+${shortcut}`);
    await expect(page.locator(".live-content")).toBeVisible();
    await page.waitForSelector(`.screen [data-node-id="${id}"]`);
    await page.waitForTimeout(100);
    await expect
      .poll(
        () =>
          page.evaluate(
            () =>
              document.getAnimations().filter((a) => a.playState === "running")
                .length,
          ),
        { timeout: 2000 },
      )
      .toBe(0);
    await expect(page.locator(".live-content")).toBeVisible();
  }
});

test("system reduced motion suppresses transitions and entrance animations", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Usar a app", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await page
    .getByRole("button", { name: "Ecrãs ⌘/Ctrl K", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running")
          .length,
    ),
  ).toBe(0);
});

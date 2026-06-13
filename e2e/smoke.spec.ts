import { test, expect, type Page } from "@playwright/test";

// Runs against seeded data (Acme Inc). Password is shared across seed accounts.
const PASSWORD = "Password123!";

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Work email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard");
}

test("full request lifecycle is visible to both requester and approver", async ({ browser }) => {
  const title = `E2E lunch ${Date.now().toString().slice(-6)}`;

  // --- Requester submits a request ---
  const reqCtx = await browser.newContext();
  const requester = await reqCtx.newPage();
  await login(requester, "requester@acme.test");
  await requester.goto("/requests/new");
  await requester.getByLabel("Title").fill(title);
  await requester.getByLabel(/Amount/).fill("99.00");
  await requester.getByRole("button", { name: "Submit request" }).click();
  await requester.waitForURL(/\/requests\/[0-9a-f-]{36}/);
  await expect(requester.getByText("pending", { exact: true })).toBeVisible();

  // --- Approver sees it in the queue and approves ---
  const apprCtx = await browser.newContext();
  const approver = await apprCtx.newPage();
  await login(approver, "approver@acme.test");
  await approver.goto("/queue");
  await approver.getByRole("link", { name: title }).click();
  await approver.waitForURL(/\/requests\/[0-9a-f-]{36}/);
  await approver.getByRole("button", { name: "Approve" }).click();
  await expect(approver.getByText("approved", { exact: true }).first()).toBeVisible();

  // --- Requester now sees it approved ---
  await requester.reload();
  await expect(requester.getByText("approved", { exact: true }).first()).toBeVisible();

  await reqCtx.close();
  await apprCtx.close();
});

test("role-based navigation differs between requester and approver", async ({ browser }) => {
  const reqCtx = await browser.newContext();
  const requester = await reqCtx.newPage();
  await login(requester, "requester@acme.test");
  // A requester has no approval queue or admin nav.
  await expect(requester.getByRole("link", { name: "Approval queue" })).toHaveCount(0);
  await expect(requester.getByRole("link", { name: "Members" })).toHaveCount(0);
  await reqCtx.close();

  const adminCtx = await browser.newContext();
  const admin = await adminCtx.newPage();
  await login(admin, "admin@acme.test");
  // An admin sees queue + members + settings.
  await expect(admin.getByRole("link", { name: "Approval queue" })).toBeVisible();
  await expect(admin.getByRole("link", { name: "Members" })).toBeVisible();
  await expect(admin.getByRole("link", { name: "Settings" })).toBeVisible();
  await adminCtx.close();
});

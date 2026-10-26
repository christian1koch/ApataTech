import { expect, test, type Page } from "@playwright/test";

const SAVE_RULES = "**/api/save-rules";

const getRoot = (page: Page) =>
  page.getByRole("group", { name: "Query", exact: true });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("builds the brief's nested example and saves it", async ({ page }) => {
  const root = getRoot(page);
  await root
    .getByRole("group", { name: "Rule 1" })
    .getByRole("textbox", { name: "Value" })
    .fill("john");

  await root.getByRole("button", { name: "Add Group" }).click();
  const nested = root.getByRole("group", { name: "Group 1", exact: true });

  const idRule = nested.getByRole("group", { name: "Rule 1" });
  await idRule.getByRole("combobox", { name: "Field name" }).selectOption("id");
  await idRule.getByRole("textbox", { name: "Value" }).fill("123");

  await nested.getByRole("button", { name: "Add Rule" }).click();
  const amountRule = nested.getByRole("group", { name: "Rule 2" });
  await amountRule
    .getByRole("combobox", { name: "Field name" })
    .selectOption("amount");
  await amountRule.getByRole("spinbutton", { name: "Amount" }).fill("10");
  await amountRule
    .getByRole("combobox", { name: "Currency" })
    .selectOption("EUR");

  const requestPromise = page.waitForRequest(SAVE_RULES);
  await page.getByRole("button", { name: "Submit" }).click();
  const request = await requestPromise;

  const expected = {
    combinator: "AND",
    conditions: [
      { fieldName: "name", operation: "EQUAL", value: "john" },
      {
        combinator: "AND",
        subConditions: [
          { fieldName: "id", operation: "EQUAL", value: "123" },
          {
            fieldName: "amount",
            operation: "EQUAL",
            value: { amount: 10, currency: "EUR" },
          },
        ],
      },
    ],
  };

  expect(request.method()).toBe("POST");
  expect(request.postDataJSON()).toEqual(expected);
  expect((await request.response())?.status()).toBe(200);

  await expect(page.getByRole("status")).toHaveText("Rules saved.");
  const json = await page
    .getByRole("region", { name: "Payload" })
    .locator("code")
    .textContent();
  expect(JSON.parse(json ?? "")).toEqual(expected);
});

test("blocks submit and shows hints until the values are valid", async ({
  page,
}) => {
  let saveRequests = 0;
  page.on("request", (request) => {
    if (request.url().endsWith("/api/save-rules")) saveRequests++;
  });

  const root = getRoot(page);
  await root.getByRole("button", { name: "Add Rule" }).click();
  const nameRule = root.getByRole("group", { name: "Rule 1" });
  const ipRule = root.getByRole("group", { name: "Rule 2" });
  await ipRule
    .getByRole("combobox", { name: "Field name" })
    .selectOption("device_ip");

  const name = nameRule.getByRole("textbox", { name: "Value" });
  const ip = ipRule.getByRole("textbox", { name: "Value" });
  const nameHint = nameRule.getByText("Required");
  const ipHint = ipRule.getByText("IPv4, e.g. 192.168.1.1");

  await ip.fill("256.1.1.1");
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(name).toBeFocused();
  await expect(nameHint).toBeVisible();
  await expect(ipHint).toBeVisible();
  await expect(page.getByRole("region", { name: "Payload" })).toHaveCount(0);
  expect(saveRequests).toBe(0);

  await name.fill("john");
  await ip.fill("192.168.1.1");
  await expect(nameHint).toBeHidden();
  await expect(ipHint).toBeHidden();

  const responsePromise = page.waitForResponse(SAVE_RULES);
  await page.getByRole("button", { name: "Submit" }).click();
  expect((await responsePromise).status()).toBe(200);
  expect(saveRequests).toBe(1);
});

test("shows the status code when the server fails", async ({ page }) => {
  await page.route(SAVE_RULES, (route) => route.fulfill({ status: 500 }));

  await getRoot(page).getByRole("textbox", { name: "Value" }).fill("john");
  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page.getByRole("alert")).toHaveText(
    "Saving rules failed with status 500"
  );
});

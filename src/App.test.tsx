import { act, render, screen, within } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import App, { SAVED_MESSAGE_MS } from "./App";
import type { Query } from "./types";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// The initial query is a single empty name rule, which isn't valid yet
const fillName = (user: UserEvent) =>
  user.type(screen.getByRole("textbox", { name: "Value" }), "john");

const getRoot = () => screen.getByRole("group", { name: "Query" });

// Rules are numbered within their group, so look them up inside one
const getRule = (group: HTMLElement, n: number) =>
  within(group).getByRole("group", { name: `Rule ${n}` });

const optionsOf = (select: HTMLElement) =>
  within(select)
    .getAllByRole("option")
    .map((option) => option.textContent);

const mockFetchOk = () =>
  vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response(null, { status: 200 }));

describe("building the query", () => {
  test("adds and removes rules", async () => {
    const user = userEvent.setup();
    render(<App />);
    const root = getRoot();

    await user.click(within(root).getByRole("button", { name: "Add Rule" }));
    expect(getRule(root, 2)).toBeInTheDocument();
    for (const n of [1, 2]) {
      expect(
        within(getRule(root, n)).getByRole("button", { name: "Remove rule" })
      ).toBeEnabled();
    }

    await user.click(
      within(getRule(root, 1)).getByRole("button", { name: "Remove rule" })
    );
    expect(within(root).queryByRole("group", { name: "Rule 2" })).toBeNull();
    expect(
      within(getRule(root, 1)).getByRole("button", { name: "Remove rule" })
    ).toBeDisabled();
  });

  test("adds a nested group with its own controls, and removes it", async () => {
    const user = userEvent.setup();
    render(<App />);
    const root = getRoot();

    await user.click(within(root).getByRole("button", { name: "Add Group" }));
    const nested = within(root).getByRole("group", { name: "Group" });

    expect(
      within(nested).getByRole("combobox", { name: "Combinator" })
    ).toHaveValue("AND");
    expect(getRule(nested, 1)).toBeInTheDocument();

    await user.click(within(nested).getByRole("button", { name: "Add Rule" }));
    expect(getRule(nested, 2)).toBeInTheDocument();

    await user.click(
      within(nested).getByRole("button", { name: "Remove group" })
    );
    expect(within(root).queryByRole("group", { name: "Group" })).toBeNull();
  });

  test("nests groups inside groups", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add Group" }));
    const nested = screen.getByRole("group", { name: "Group" });
    await user.click(within(nested).getByRole("button", { name: "Add Group" }));

    expect(screen.getAllByRole("group", { name: "Group" })).toHaveLength(2);
  });

  test("a group that is its parent's only child can't be removed", async () => {
    const user = userEvent.setup();
    render(<App />);
    const root = getRoot();

    await user.click(within(root).getByRole("button", { name: "Add Group" }));
    const removeGroup = within(root).getByRole("button", {
      name: "Remove group",
    });
    expect(removeGroup).toBeEnabled();

    // Remove the root's own rule, leaving the group as its only child
    await user.click(
      within(root).getAllByRole("button", { name: "Remove rule" })[0]
    );
    expect(removeGroup).toBeDisabled();
  });
});

describe("focus after removing", () => {
  test("moves to the rule that takes the removed one's place", async () => {
    const user = userEvent.setup();
    render(<App />);
    const root = getRoot();
    const addRule = within(root).getByRole("button", { name: "Add Rule" });
    await user.click(addRule);
    await user.click(addRule);

    await user.click(
      within(getRule(root, 2)).getByRole("button", { name: "Remove rule" })
    );

    // The old rule 3 is now rule 2
    expect(
      within(getRule(root, 2)).getByRole("combobox", { name: "Field name" })
    ).toHaveFocus();
  });

  test("moves to Add Rule when the last child is removed", async () => {
    const user = userEvent.setup();
    render(<App />);
    const root = getRoot();
    await user.click(within(root).getByRole("button", { name: "Add Group" }));

    await user.click(
      within(root).getByRole("button", { name: "Remove group" })
    );

    expect(
      within(root).getByRole("button", { name: "Add Rule" })
    ).toHaveFocus();
  });
});

describe("rule fields", () => {
  test("the operations depend on the field type", async () => {
    const user = userEvent.setup();
    render(<App />);
    const field = screen.getByRole("combobox", { name: "Field name" });
    const operation = screen.getByRole("combobox", { name: "Operation" });

    expect(optionsOf(operation)).toEqual(["EQUAL", "NOT_EQUAL"]);

    await user.selectOptions(field, "amount");
    expect(optionsOf(operation)).toEqual([
      "EQUAL",
      "NOT_EQUAL",
      "LESS_THAN",
      "GREATER_THAN",
    ]);
  });

  test("changing the field keeps the operation only if it's supported", async () => {
    const user = userEvent.setup();
    render(<App />);
    const field = screen.getByRole("combobox", { name: "Field name" });
    const operation = screen.getByRole("combobox", { name: "Operation" });

    await user.selectOptions(field, "amount");
    await user.selectOptions(operation, "LESS_THAN");

    await user.selectOptions(field, "installments");
    expect(operation).toHaveValue("LESS_THAN");

    await user.selectOptions(field, "name");
    expect(operation).toHaveValue("EQUAL");
  });

  test.each([
    ["name", () => screen.getByRole("textbox", { name: "Value" })],
    ["id", () => screen.getByRole("textbox", { name: "Value" })],
    ["device_ip", () => screen.getByRole("textbox", { name: "Value" })],
    ["installments", () => screen.getByRole("spinbutton", { name: "Value" })],
    [
      "amount",
      () => {
        screen.getByRole("combobox", { name: "Currency" });
        return screen.getByRole("spinbutton", { name: "Amount" });
      },
    ],
    [
      "transaction_state",
      () => {
        const select = screen.getByRole("combobox", { name: "Value" });
        expect(optionsOf(select)).toEqual([
          "SUCCEEDED",
          "REJECTED",
          "ERROR",
          "TIMEOUT",
          "CANCELLED",
          "FAILED",
          "ABORTED",
        ]);
        return select;
      },
    ],
  ])("%s renders its own widget", async (fieldName, getWidget) => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Field name" }),
      fieldName
    );

    expect(getWidget()).toBeInTheDocument();
  });

  test("rules are numbered groups within their own group", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add Rule" }));
    await user.click(screen.getByRole("button", { name: "Add Group" }));

    const root = getRoot();
    const nested = within(root).getByRole("group", { name: "Group" });

    expect(getRule(nested, 1)).toBeInTheDocument();
    expect(within(nested).queryByRole("group", { name: "Rule 2" })).toBeNull();
    expect(within(root).getAllByRole("group", { name: "Rule 2" })).toHaveLength(
      1
    );
    // Root: two rules and the nested group
    expect(within(root).getAllByRole("list")[0].children).toHaveLength(3);
  });
});

describe("submitting the query", () => {
  test("builds, shows and sends the brief's nested example", async () => {
    const fetchSpy = mockFetchOk();
    const user = userEvent.setup();
    render(<App />);
    const root = getRoot();

    await user.type(
      within(getRule(root, 1)).getByRole("textbox", { name: "Value" }),
      "john"
    );
    await user.click(within(root).getByRole("button", { name: "Add Group" }));
    const nested = within(root).getByRole("group", { name: "Group" });

    const idRule = getRule(nested, 1);
    await user.selectOptions(
      within(idRule).getByRole("combobox", { name: "Field name" }),
      "id"
    );
    await user.type(
      within(idRule).getByRole("textbox", { name: "Value" }),
      "123"
    );

    await user.click(within(nested).getByRole("button", { name: "Add Rule" }));
    const amountRule = getRule(nested, 2);
    await user.selectOptions(
      within(amountRule).getByRole("combobox", { name: "Field name" }),
      "amount"
    );
    const amount = within(amountRule).getByRole("spinbutton", {
      name: "Amount",
    });
    await user.clear(amount);
    await user.type(amount, "10");
    await user.selectOptions(
      within(amountRule).getByRole("combobox", { name: "Currency" }),
      "EUR"
    );

    await user.click(screen.getByRole("button", { name: "Submit" }));

    const expected: Query = {
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

    const payload = await screen.findByRole("region", { name: "Payload" });
    const json = payload.querySelector("code")?.textContent ?? "";
    expect(JSON.parse(json)).toEqual(expected);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("/api/save-rules");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual(expected);
  });

  test("sends the chosen combinator", async () => {
    const fetchSpy = mockFetchOk();
    const user = userEvent.setup();
    render(<App />);

    await fillName(user);
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Combinator" }),
      "OR"
    );
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await screen.findByRole("status");
    const [, init] = fetchSpy.mock.calls[0];
    expect(JSON.parse(init?.body as string).combinator).toBe("OR");
  });

  test("disables Submit while the request is in flight", async () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<App />);

    await fillName(user);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
  });

  test("shows the status code when the server rejects the request", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 400 })
    );
    const user = userEvent.setup();
    render(<App />);

    await fillName(user);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Saving rules failed with status 400"
    );
  });

  test("shows the error message when the request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch")
    );
    const user = userEvent.setup();
    render(<App />);

    await fillName(user);
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Couldn't reach the server, please try again"
    );
    expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
  });

  test("hides the success message after a timeout", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockFetchOk();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App />);

    await fillName(user);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Rules saved.");

    act(() => vi.advanceTimersByTime(SAVED_MESSAGE_MS));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("validation", () => {
  test("doesn't submit while a value is invalid", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const user = userEvent.setup();
    render(<App />);

    const name = screen.getByRole("textbox", { name: "Value" });
    await user.type(name, "   ");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(name).toBeInvalid();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(screen.queryByRole("heading", { name: "Payload" })).toBeNull();
  });

  test("rejects a malformed device IP", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Field name" }),
      "device_ip"
    );
    const ip = screen.getByRole("textbox", { name: "Value" });

    await user.type(ip, "256.1.1.1");
    expect(ip).toBeInvalid();

    await user.clear(ip);
    await user.type(ip, "192.168.1.1");
    expect(ip).toBeValid();
  });

  test("rejects fractional and zero installments", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Field name" }),
      "installments"
    );
    const installments = screen.getByRole("spinbutton", { name: "Value" });

    for (const [input, valid] of [
      ["1.5", false],
      ["0", false],
      ["12", true],
    ] as const) {
      await user.clear(installments);
      await user.type(installments, input);
      expect(installments.matches(":valid")).toBe(valid);
    }
  });

  test("rejects empty, negative and over-precise amounts", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Field name" }),
      "amount"
    );
    const amount = screen.getByRole("spinbutton", { name: "Amount" });

    for (const [input, valid] of [
      ["", false],
      ["-1", false],
      ["1.234", false],
      ["0", true],
      ["10.5", true],
    ] as const) {
      await user.clear(amount);
      if (input) await user.type(amount, input);
      expect(amount.matches(":valid")).toBe(valid);
    }
  });

  test("the only rule in a group can't be removed", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "Remove rule" })).toBeDisabled();
  });
});

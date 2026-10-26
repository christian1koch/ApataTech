import { act, render, screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import App, { SAVED_MESSAGE_MS } from "./App";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

// The initial query is a single empty name rule, which isn't valid yet
const fillName = (user: UserEvent) =>
  user.type(screen.getByRole("textbox", { name: "Value" }), "john");

describe("submitting the query", () => {
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
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 200 })
    );
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

  test("the only rule in a group can't be removed", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "Remove rule" })).toBeDisabled();
  });
});

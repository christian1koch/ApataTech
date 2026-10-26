import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import App, { SAVED_MESSAGE_MS } from "./App";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("submitting the query", () => {
  test("shows the error message when the request fails", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new TypeError("Failed to fetch")
    );
    const user = userEvent.setup();
    render(<App />);

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

    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Rules saved.");

    act(() => vi.advanceTimersByTime(SAVED_MESSAGE_MS));

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

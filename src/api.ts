import type { Query } from "./types";

export async function saveRules(query: Query): Promise<void> {
  let response: Response;
  try {
    response = await fetch("/api/save-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    });
  } catch {
    // fetch only rejects when the request never got a response
    throw new Error("Couldn't reach the server, please try again");
  }
  if (!response.ok) {
    const detail = await readErrorMessage(response);
    throw new Error(
      `Saving rules failed with status ${response.status}` +
        (detail ? `: ${detail}` : "")
    );
  }
}

// The backend sends { error: string } on failure; any other body is ignored
async function readErrorMessage(response: Response) {
  const body: unknown = await response.json().catch(() => null);
  return typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
    ? body.error
    : null;
}

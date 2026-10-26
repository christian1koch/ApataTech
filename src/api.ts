import type { Query } from "./query/types";

export async function saveRules(query: Query): Promise<void> {
  let response: Response;
  try {
    response = await fetch("/api/save-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    });
  } catch {
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

async function readErrorMessage(response: Response) {
  const body: unknown = await response.json().catch(() => null);
  return typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
    ? body.error
    : null;
}

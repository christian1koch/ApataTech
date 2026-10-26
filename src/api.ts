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
    throw new Error(`Saving rules failed with status ${response.status}`);
  }
}

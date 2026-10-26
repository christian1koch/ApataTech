import type { Query } from "./types";

export async function saveRules(query: Query): Promise<void> {
  const response = await fetch("/api/save-rules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });
  if (!response.ok) {
    throw new Error(`Saving rules failed with status ${response.status}`);
  }
}

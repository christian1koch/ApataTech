import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

// Stand-in for the backend, which wasn't provided with the exercise.
// Echoes the query back, or returns 400 if the body isn't a query.

const DELAY_MS = 500;

const isQuery = (body: unknown) =>
  typeof body === "object" &&
  body !== null &&
  "combinator" in body &&
  "conditions" in body &&
  Array.isArray(body.conditions);

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function handleSaveRules(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  let raw = "";
  req.on("data", (chunk) => (raw += chunk));
  req.on("end", () => {
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      sendJson(res, 400, { error: "Body is not valid JSON" });
      return;
    }
    if (!isQuery(body)) {
      sendJson(res, 400, { error: "Body is not a query" });
      return;
    }
    setTimeout(() => sendJson(res, 200, body), DELAY_MS);
  });
}

export function saveRulesMock(): Plugin {
  return {
    name: "save-rules-mock",
    configureServer(server) {
      server.middlewares.use("/api/save-rules", handleSaveRules);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api/save-rules", handleSaveRules);
    },
  };
}

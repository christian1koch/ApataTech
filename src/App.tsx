import { useEffect, useReducer, useState, type FormEvent } from "react";
import { saveRules } from "./api";
import ConditionGroup from "./ConditionGroup";
import { toPayload } from "./payload";
import { QueryDispatchContext } from "./QueryContext";
import { createInitialQuery, queryReducer } from "./queryReducer";
import type { Query } from "./types";

type SaveStatus =
  | { state: "idle" }
  | { state: "saving" }
  | { state: "saved" }
  | { state: "error"; message: string };

export const SAVED_MESSAGE_MS = 3000;

function App() {
  const [query, dispatch] = useReducer(
    queryReducer,
    undefined,
    createInitialQuery
  );
  const [submitted, setSubmitted] = useState<Query | null>(null);
  const [status, setStatus] = useState<SaveStatus>({ state: "idle" });

  // The success message hides itself; an error stays until the next submit
  useEffect(() => {
    if (status.state !== "saved") return;
    const timeout = setTimeout(
      () => setStatus({ state: "idle" }),
      SAVED_MESSAGE_MS
    );
    return () => clearTimeout(timeout);
  }, [status]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = toPayload(query);
    setSubmitted(payload);
    setStatus({ state: "saving" });
    try {
      await saveRules(payload);
      setStatus({ state: "saved" });
    } catch (error) {
      setStatus({
        state: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
      <h1 className="text-2xl font-bold">Query Builder</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <QueryDispatchContext value={dispatch}>
          <ConditionGroup group={query} isRoot />
        </QueryDispatchContext>
        <button
          type="submit"
          className="btn btn-primary self-end"
          disabled={status.state === "saving"}
        >
          {status.state === "saving" ? "Saving…" : "Submit"}
        </button>
      </form>

      {status.state === "saved" && (
        <p role="status" className="alert alert-success">
          Rules saved.
        </p>
      )}
      {status.state === "error" && (
        <p role="alert" className="alert alert-error">
          {status.message}
        </p>
      )}

      {submitted && (
        <section aria-labelledby="payload-heading">
          <h2 id="payload-heading" className="text-lg font-semibold">
            Payload
          </h2>
          <pre className="bg-base-200 rounded-box overflow-x-auto p-4">
            <code>{JSON.stringify(submitted, null, 2)}</code>
          </pre>
        </section>
      )}
    </main>
  );
}

export default App;

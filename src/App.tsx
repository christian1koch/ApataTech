import { useEffect, useReducer, useState, type SubmitEvent } from "react";
import { saveRules } from "./api";
import ConditionGroup from "./components/ConditionGroup";
import PayloadPreview from "./components/PayloadPreview";
import SaveStatus, { type SaveState } from "./components/SaveStatus";
import { toPayload } from "./query/payload";
import { QueryDispatchContext } from "./query/QueryContext";
import { createInitialQuery, queryReducer } from "./query/queryReducer";
import type { Query } from "./query/types";

export const SAVED_MESSAGE_MS = 3000;

function App() {
  const [query, dispatch] = useReducer(
    queryReducer,
    undefined,
    createInitialQuery
  );
  const [submitted, setSubmitted] = useState<Query | null>(null);
  const [status, setStatus] = useState<SaveState>({ state: "idle" });

  // The success message hides itself; an error stays until the next submit
  useEffect(() => {
    if (status.state !== "saved") return;
    const timeout = setTimeout(
      () => setStatus({ state: "idle" }),
      SAVED_MESSAGE_MS
    );
    return () => clearTimeout(timeout);
  }, [status]);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
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
          <ConditionGroup group={query} />
        </QueryDispatchContext>
        <button
          type="submit"
          className="btn btn-primary self-end"
          disabled={status.state === "saving"}
        >
          {status.state === "saving" ? "Saving…" : "Submit"}
        </button>
      </form>

      <SaveStatus status={status} />
      {submitted && <PayloadPreview payload={submitted} />}
    </main>
  );
}

export default App;

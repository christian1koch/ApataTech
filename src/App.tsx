import "./App.css";
import { useReducer } from "react";
import ConditionGroup from "./ConditionGroup";
import { QueryDispatchContext } from "./QueryContext";
import { createInitialQuery, queryReducer } from "./queryReducer";

function App() {
  const [query, dispatch] = useReducer(
    queryReducer,
    undefined,
    createInitialQuery
  );

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-200">
        <QueryDispatchContext value={dispatch}>
          <ConditionGroup group={query} isRoot />
        </QueryDispatchContext>
      </div>
    </div>
  );
}

export default App;

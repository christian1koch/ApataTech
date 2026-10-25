import { Group, ListChecks } from "lucide-react";
import "./App.css";
import { useState } from "react";
import RuleOptions from "./RuleOptions";
import type { Rule } from "./types";

function App() {
  // Temporary single rule until the group/reducer state exists
  const [rule, setRule] = useState<Rule>({
    fieldName: "name",
    operation: "EQUAL",
    value: "",
  });

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-200 border p-4">
        <div className="flex w-full justify-end gap-2">
          <button className="btn">
            <ListChecks />
            Add Rule
          </button>
          <button className="btn">
            <Group size={16} />
            Add Group
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <select defaultValue="ANDs" className="select w-20">
            <option>AND</option>
            <option>OR</option>
          </select>
          <RuleOptions rule={rule} onChange={setRule} onRemove={() => {}} />
        </div>
      </div>
    </div>
  );
}

export default App;

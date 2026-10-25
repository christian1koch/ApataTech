import { Group, ListChecks, Trash } from "lucide-react";
import "./App.css";

function App() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-200 border p-4">
        <div className="flex w-full justify-end gap-2">
          <button className="btn">
            <ListChecks />
            Add Rule
          </button>
          <button className="btn">
            <Group />
            Add Group
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <select defaultValue="ANDs" className="select w-20">
            <option>AND</option>
            <option>OR</option>
          </select>
          <div className="flex gap-2">
            <label className="floating-label">
              <select className="select w-fit min-w-40">
                <option disabled selected>
                  Placeholder
                </option>
                <option>Option</option>
              </select>
              <span>Field name</span>
            </label>
            <label className="floating-label">
              <select className="select w-fit min-w-40">
                <option disabled selected>
                  Placeholder
                </option>
                <option>Option</option>
              </select>
              <span>Operation</span>
            </label>
            <label className="floating-label">
              <select className="select w-fit min-w-40">
                <option disabled selected>
                  Placeholder
                </option>
                <option>Option</option>
              </select>
              <span>Value</span>
            </label>
            <button className="btn btn-error">
              <Trash size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

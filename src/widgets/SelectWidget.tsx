import type { WidgetProps } from "./types";
import ValidatorHint from "./ValidatorHint";

// Binds the options into the widget, so a select field can't be configured
// without them
export function createSelectWidget<T extends string>(options: readonly T[]) {
  return function SelectWidget({ value, onChange }: WidgetProps<T>) {
    return (
      <div>
        <label className="floating-label">
          <select
            className="select w-fit min-w-40"
            value={value}
            onChange={(e) => onChange(e.target.value as T)}
          >
            {options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <span>Value</span>
        </label>
        {/* Can't be invalid; only keeps the row the same height as others */}
        <ValidatorHint />
      </div>
    );
  };
}

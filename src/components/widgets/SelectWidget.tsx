import type { WidgetProps } from "./types";
import ValidatorHint from "./ValidatorHint";

export function createSelectWidget<T extends string>(options: readonly T[]) {
  return function SelectWidget({ value, onChange }: WidgetProps<T>) {
    return (
      <div>
        <label className="floating-label">
          <select
            className="select w-full"
            value={value}
            onChange={(e) => onChange(e.target.value as T)}
          >
            {options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <span>Value</span>
        </label>
        <ValidatorHint />
      </div>
    );
  };
}

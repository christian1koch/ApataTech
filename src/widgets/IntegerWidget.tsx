import { useId } from "react";
import type { WidgetProps } from "./types";

export function createIntegerWidget({ min }: { min: number }) {
  const hint = `Enter a whole number of ${min} or more`;

  return function IntegerWidget({ value, onChange }: WidgetProps<number>) {
    const hintId = useId();
    return (
      <div>
        <label className="floating-label validator">
          <input
            type="number"
            min={min}
            step={1}
            className="input validator"
            placeholder="Value"
            required
            aria-describedby={hintId}
            value={Number.isNaN(value) ? "" : value}
            onChange={(e) => onChange(e.target.valueAsNumber)}
          />
          <span>Value</span>
        </label>
        <p id={hintId} className="validator-hint hidden">
          {hint}
        </p>
      </div>
    );
  };
}

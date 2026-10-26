import { useId } from "react";
import { NON_BLANK_PATTERN } from "../../query/constants";
import type { WidgetProps } from "./types";
import ValidatorHint from "./ValidatorHint";

interface TextWidgetOptions {
  pattern?: string;
  hint?: string;
}

// Text values are always required. Without a `pattern`, any non-blank text is
// accepted; `hint` is shown once the browser marks the input invalid.
export function createTextWidget({
  pattern = NON_BLANK_PATTERN,
  hint = "Required",
}: TextWidgetOptions = {}) {
  return function TextWidget({ value, onChange }: WidgetProps<string>) {
    const hintId = useId();
    return (
      <div>
        <label className="floating-label validator">
          <input
            type="text"
            className="input validator w-full"
            placeholder="Value"
            required
            pattern={pattern}
            title={hint}
            aria-describedby={hintId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <span>Value</span>
        </label>
        <ValidatorHint id={hintId}>{hint}</ValidatorHint>
      </div>
    );
  };
}

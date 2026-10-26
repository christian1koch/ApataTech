import { useId, useState } from "react";
import { NON_BLANK_PATTERN } from "../../query/constants";
import type { WidgetProps } from "./types";
import ValidatorHint from "./ValidatorHint";

interface TextWidgetOptions {
  pattern?: string;
  hint?: string;
}

export function createTextWidget({
  pattern = NON_BLANK_PATTERN,
  hint = "Required",
}: TextWidgetOptions = {}) {
  const regex = new RegExp(`^(?:${pattern})$`, "v");

  return function TextWidget({ value, onChange }: WidgetProps<string>) {
    const hintId = useId();
    const [carriedOver] = useState(value !== "");
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
            aria-invalid={carriedOver && !regex.test(value) ? true : undefined}
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

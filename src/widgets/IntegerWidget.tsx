import type { WidgetProps } from "./types";

export default function IntegerWidget({
  value,
  onChange,
}: WidgetProps<number>) {
  return (
    <label className="floating-label">
      <input
        type="number"
        step={1}
        className="input"
        placeholder="Value"
        value={Number.isNaN(value) ? "" : value}
        onChange={(e) => onChange(e.target.valueAsNumber)}
      />
      <span>Value</span>
    </label>
  );
}

import type { WidgetProps } from "./types";

export default function IntegerWidget({ value, onChange }: WidgetProps) {
  const number = value as number;
  return (
    <label className="floating-label">
      <input
        type="number"
        step={1}
        className="input"
        placeholder="Value"
        value={Number.isNaN(number) ? "" : number}
        onChange={(e) => onChange(e.target.valueAsNumber)}
      />
      <span>Value</span>
    </label>
  );
}

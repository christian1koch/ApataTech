import type { WidgetProps } from "./types";

export default function NumberWidget({ value, onChange }: WidgetProps) {
  const number = value as number;
  return (
    <label className="floating-label">
      <input
        type="number"
        className="input"
        placeholder="Value"
        value={Number.isNaN(number) ? "" : number}
        onChange={(e) => onChange(e.target.valueAsNumber)}
      />
      <span>Value</span>
    </label>
  );
}

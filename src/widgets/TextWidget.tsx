import type { WidgetProps } from "./types";

export default function TextWidget({ value, onChange }: WidgetProps<string>) {
  return (
    <label className="floating-label">
      <input
        type="text"
        className="input"
        placeholder="Value"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span>Value</span>
    </label>
  );
}

import type { WidgetProps } from "./types";

export default function SelectWidget({ value, onChange, config }: WidgetProps) {
  return (
    <label className="floating-label">
      <select
        className="select w-fit min-w-40"
        value={value as string}
        onChange={(e) => onChange(e.target.value)}
      >
        {config.options?.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <span>Value</span>
    </label>
  );
}

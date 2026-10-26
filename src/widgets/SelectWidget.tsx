import type { WidgetProps } from "./types";

export default function SelectWidget<T extends string>({
  value,
  onChange,
  options = [],
}: WidgetProps<T>) {
  return (
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
  );
}

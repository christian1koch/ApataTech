import { CURRENCIES } from "../fields";
import type { Money } from "../types";
import type { WidgetProps } from "./types";

export default function MoneyWidget({ value, onChange }: WidgetProps) {
  const money = value as Money;
  return (
    <div className="flex gap-2">
      <label className="floating-label">
        <input
          type="number"
          className="input w-32"
          placeholder="Amount"
          value={Number.isNaN(money.amount) ? "" : money.amount}
          onChange={(e) =>
            onChange({ ...money, amount: e.target.valueAsNumber })
          }
        />
        <span>Amount</span>
      </label>
      <label className="floating-label">
        <select
          className="select w-24"
          value={money.currency}
          onChange={(e) => onChange({ ...money, currency: e.target.value })}
        >
          {CURRENCIES.map((currency) => (
            <option key={currency}>{currency}</option>
          ))}
        </select>
        <span>Currency</span>
      </label>
    </div>
  );
}

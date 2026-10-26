import { CURRENCIES } from "../constants";
import type { Currency, Money } from "../types";
import type { WidgetProps } from "./types";

export default function MoneyWidget({ value, onChange }: WidgetProps<Money>) {
  return (
    <div className="flex gap-2">
      <label className="floating-label">
        <input
          type="number"
          className="input w-32"
          placeholder="Amount"
          value={Number.isNaN(value.amount) ? "" : value.amount}
          onChange={(e) =>
            onChange({ ...value, amount: e.target.valueAsNumber })
          }
        />
        <span>Amount</span>
      </label>
      <label className="floating-label">
        <select
          className="select w-24"
          value={value.currency}
          onChange={(e) =>
            onChange({ ...value, currency: e.target.value as Currency })
          }
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

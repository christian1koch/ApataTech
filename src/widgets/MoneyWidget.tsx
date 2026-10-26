import { useId } from "react";
import { CURRENCIES } from "../constants";
import type { Currency, Money } from "../types";
import type { WidgetProps } from "./types";

export default function MoneyWidget({ value, onChange }: WidgetProps<Money>) {
  const hintId = useId();
  return (
    <div className="flex items-start gap-2">
      <div>
        <label className="floating-label validator">
          <input
            type="number"
            min={0}
            step={0.01}
            className="input validator w-32"
            placeholder="Amount"
            required
            aria-describedby={hintId}
            value={Number.isNaN(value.amount) ? "" : value.amount}
            onChange={(e) =>
              onChange({ ...value, amount: e.target.valueAsNumber })
            }
          />
          <span>Amount</span>
        </label>
        <p id={hintId} className="validator-hint hidden w-32">
          Enter 0 or more, with up to 2 decimals
        </p>
      </div>
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

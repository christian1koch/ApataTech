import { useId } from "react";
import { CURRENCIES } from "../../query/constants";
import type { Currency, Money } from "../../query/types";
import type { WidgetProps } from "./types";
import ValidatorHint from "./ValidatorHint";

export default function MoneyWidget({ value, onChange }: WidgetProps<Money>) {
  const hintId = useId();
  return (
    <div>
      <div className="validator flex items-start gap-2">
        <label className="floating-label min-w-0 flex-1">
          <input
            type="number"
            min={0}
            step={0.01}
            className="input validator w-full"
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
      <ValidatorHint id={hintId}>0 or more, up to 2 decimals</ValidatorHint>
    </div>
  );
}

import { Trash } from "lucide-react";
import { createRule, FIELD_NAMES, FIELDS, getOperations } from "./fields";
import type { FieldName, OperationsFor, Rule, RuleFor } from "./types";

// Private on purpose: only safe here, where the new operation/value come from
// FIELDS[K] and so always match the rule's field. TS can't prove a generic
// RuleFor<K> is a member of the Rule union, hence the cast.
const toRule = <K extends FieldName>(rule: RuleFor<K>): Rule => rule as Rule;

interface RuleOptionsProps<K extends FieldName> {
  // Names the rule for assistive tech, e.g. "Rule 2", since every rule's
  // inputs share the same visible labels
  label: string;
  rule: RuleFor<K>;
  canRemove: boolean;
  onChange: (rule: Rule) => void;
  onRemove: () => void;
}

export default function RuleOptions<K extends FieldName>({
  label,
  rule,
  canRemove,
  onChange,
  onRemove,
}: RuleOptionsProps<K>) {
  // FIELDS[rule.fieldName] is a FieldConfig<K>, so Widget accepts rule.value
  const { Widget } = FIELDS[rule.fieldName];
  const operations = getOperations(rule.fieldName);

  return (
    <fieldset className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-start gap-2 sm:grid-cols-[10rem_10rem_minmax(0,1fr)_auto]">
      <legend className="sr-only">{label}</legend>
      <label className="floating-label">
        <select
          className="select w-full"
          value={rule.fieldName}
          onChange={(e) =>
            onChange(createRule(e.target.value as FieldName, rule.operation))
          }
        >
          {FIELD_NAMES.map((fieldName) => (
            <option key={fieldName} value={fieldName}>
              {FIELDS[fieldName].label}
            </option>
          ))}
        </select>
        <span>Field name</span>
      </label>
      <label className="floating-label">
        <select
          className="select w-full"
          value={rule.operation}
          onChange={(e) =>
            onChange(
              toRule({
                ...rule,
                operation: e.target.value as OperationsFor<K>,
              })
            )
          }
        >
          {operations.map((operation) => (
            <option key={operation}>{operation}</option>
          ))}
        </select>
        <span>Operation</span>
      </label>
      <div className="col-span-2 row-start-2 sm:col-span-1 sm:col-start-3 sm:row-start-1">
        <Widget
          value={rule.value}
          onChange={(value) => onChange(toRule({ ...rule, value }))}
        />
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-square enabled:text-error"
        aria-label="Remove rule"
        disabled={!canRemove}
        onClick={onRemove}
      >
        <Trash size={16} />
      </button>
    </fieldset>
  );
}

import { Trash } from "lucide-react";
import { createRule, FIELD_NAMES, FIELDS, getOperations } from "./fields";
import type { FieldName, OperationsFor, Rule, RuleFor } from "./types";

// Private on purpose: only safe here, where the new operation/value come from
// FIELDS[K] and so always match the rule's field. TS can't prove a generic
// RuleFor<K> is a member of the Rule union, hence the cast.
const toRule = <K extends FieldName>(rule: RuleFor<K>): Rule => rule as Rule;

interface RuleOptionsProps<K extends FieldName> {
  rule: RuleFor<K>;
  canRemove: boolean;
  onChange: (rule: Rule) => void;
  onRemove: () => void;
}

export default function RuleOptions<K extends FieldName>({
  rule,
  canRemove,
  onChange,
  onRemove,
}: RuleOptionsProps<K>) {
  // FIELDS[rule.fieldName] is a FieldConfig<K>, so Widget accepts rule.value
  const { Widget } = FIELDS[rule.fieldName];
  const operations = getOperations(rule.fieldName);

  return (
    <div className="flex items-start gap-2">
      <label className="floating-label">
        <select
          className="select w-fit min-w-40"
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
          className="select w-fit min-w-40"
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
      <Widget
        value={rule.value}
        onChange={(value) => onChange(toRule({ ...rule, value }))}
      />
      <button
        type="button"
        className="btn btn-error"
        aria-label="Remove rule"
        disabled={!canRemove}
        onClick={onRemove}
      >
        <Trash size={16} />
      </button>
    </div>
  );
}

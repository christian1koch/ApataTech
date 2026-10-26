import { Trash } from "lucide-react";
import {
  createRule,
  FIELD_NAMES,
  FIELDS,
  getOperations,
  toRule,
} from "./fields";
import type { FieldName, OperationsFor, Rule, RuleFor } from "./types";

interface RuleOptionsProps<K extends FieldName> {
  rule: RuleFor<K>;
  onChange: (rule: Rule) => void;
  onRemove: () => void;
}

export default function RuleOptions<K extends FieldName>({
  rule,
  onChange,
  onRemove,
}: RuleOptionsProps<K>) {
  // FIELDS[rule.fieldName] is a FieldConfig<K>, so Widget accepts rule.value
  const { Widget, options } = FIELDS[rule.fieldName];
  const operations = getOperations(rule.fieldName);

  return (
    <div className="flex gap-2">
      <label className="floating-label">
        <select
          className="select w-fit min-w-40"
          value={rule.fieldName}
          onChange={(e) =>
            onChange(
              toRule(createRule(e.target.value as FieldName, rule.operation))
            )
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
        options={options}
        onChange={(value) => onChange(toRule({ ...rule, value }))}
      />
      <button
        type="button"
        className="btn btn-error"
        aria-label="Remove rule"
        onClick={onRemove}
      >
        <Trash size={16} />
      </button>
    </div>
  );
}

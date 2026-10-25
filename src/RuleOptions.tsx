import { Trash } from "lucide-react";
import { FIELDS, getOperations } from "./fields";
import type { FieldName, Operation, Rule } from "./types";
import { WIDGETS } from "./widgets";

interface RuleOptionsProps {
  rule: Rule;
  onChange: (rule: Rule) => void;
  onRemove: () => void;
}

export default function RuleOptions({
  rule,
  onChange,
  onRemove,
}: RuleOptionsProps) {
  const config = FIELDS[rule.fieldName];
  const operations = getOperations(rule.fieldName);
  const Widget = WIDGETS[config.widget];

  const changeField = (fieldName: FieldName) => {
    const allowed = getOperations(fieldName);
    onChange({
      fieldName,
      operation: allowed.includes(rule.operation) ? rule.operation : allowed[0],
      value: FIELDS[fieldName].defaultValue,
    });
  };

  return (
    <div className="flex gap-2">
      <label className="floating-label">
        <select
          className="select w-fit min-w-40"
          value={rule.fieldName}
          onChange={(e) => changeField(e.target.value as FieldName)}
        >
          {Object.entries(FIELDS).map(([key, field]) => (
            <option key={key} value={key}>
              {field.label}
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
            onChange({ ...rule, operation: e.target.value as Operation })
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
        config={config}
        onChange={(value) => onChange({ ...rule, value })}
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

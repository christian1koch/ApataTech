import { OPERATION_LABELS } from "../query/constants";
import {
  createRule,
  FIELD_NAMES,
  FIELDS,
  getOperations,
} from "../query/fields";
import type { FieldName, Operation, Rule, RuleFor } from "../query/types";
import RemoveButton from "./RemoveButton";

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
      <FieldSelect
        value={rule.fieldName}
        onChange={(fieldName) =>
          onChange(createRule(fieldName, rule.operation))
        }
      />
      <OperationSelect
        operations={operations}
        value={rule.operation}
        onChange={(operation) => onChange(toRule({ ...rule, operation }))}
      />
      <div className="col-span-2 row-start-2 sm:col-span-1 sm:col-start-3 sm:row-start-1">
        <Widget
          value={rule.value}
          onChange={(value) => onChange(toRule({ ...rule, value }))}
        />
      </div>
      <RemoveButton
        label={`Remove ${label.toLowerCase()}`}
        disabled={!canRemove}
        onClick={onRemove}
      />
    </fieldset>
  );
}

interface FieldSelectProps {
  value: FieldName;
  onChange: (fieldName: FieldName) => void;
}

function FieldSelect({ value, onChange }: FieldSelectProps) {
  return (
    <label className="floating-label">
      <select
        className="select w-full"
        value={value}
        onChange={(e) => onChange(e.target.value as FieldName)}
      >
        {FIELD_NAMES.map((fieldName) => (
          <option key={fieldName} value={fieldName}>
            {FIELDS[fieldName].label}
          </option>
        ))}
      </select>
      <span>Field name</span>
    </label>
  );
}

// Generic so the selected operation keeps the field's narrower operation type
interface OperationSelectProps<O extends Operation> {
  operations: readonly O[];
  value: O;
  onChange: (operation: O) => void;
}

function OperationSelect<O extends Operation>({
  operations,
  value,
  onChange,
}: OperationSelectProps<O>) {
  return (
    <label className="floating-label">
      <select
        className="select w-full"
        value={value}
        onChange={(e) => onChange(e.target.value as O)}
      >
        {operations.map((operation) => (
          <option key={operation} value={operation}>
            {OPERATION_LABELS[operation]}
          </option>
        ))}
      </select>
      <span>Operation</span>
    </label>
  );
}

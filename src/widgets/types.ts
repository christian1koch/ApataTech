import type { FieldConfig } from "../fields";
import type { Value } from "../types";

export interface WidgetProps {
  value: Value;
  onChange: (value: Value) => void;
  config: FieldConfig;
}

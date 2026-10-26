export interface WidgetProps<V> {
  value: V;
  onChange: (value: V) => void;
  options?: readonly V[];
}

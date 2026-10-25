import type { ComponentType } from "react";
import type { WidgetType } from "../fields";
import IntegerWidget from "./IntegerWidget";
import MoneyWidget from "./MoneyWidget";
import NumberWidget from "./NumberWidget";
import SelectWidget from "./SelectWidget";
import TextWidget from "./TextWidget";
import type { WidgetProps } from "./types";

export type { WidgetProps } from "./types";

export const WIDGETS: Record<WidgetType, ComponentType<WidgetProps>> = {
  text: TextWidget,
  number: NumberWidget,
  integer: IntegerWidget,
  money: MoneyWidget,
  select: SelectWidget,
};

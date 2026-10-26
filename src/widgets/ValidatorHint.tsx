import type { ReactNode } from "react";

interface ValidatorHintProps {
  id?: string;
  children?: ReactNode;
}

// Every widget renders one, even widgets that can't be invalid, so all rules
// reserve the same single line under their value and stay aligned. daisyUI
// hides it with `visibility`, not `display`, so the hint appearing never
// shifts the layout, which would push Submit away mid-click.
// `w-0 min-w-full` keeps the text out of the widget's width calculation, so a
// long hint can't stretch the input above it; hints must fit on one line.
export default function ValidatorHint({ id, children }: ValidatorHintProps) {
  return (
    <p
      id={id}
      className="validator-hint h-4 w-0 min-w-full text-xs whitespace-nowrap"
    >
      {children}
    </p>
  );
}

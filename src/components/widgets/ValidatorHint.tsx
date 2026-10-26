import type { ReactNode } from "react";

interface ValidatorHintProps {
  id?: string;
  children?: ReactNode;
}

// Every widget renders one so rows reserve the same line and the hint never
// shifts the layout. `w-0 min-w-full` stops a long hint widening the input.
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

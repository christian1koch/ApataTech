import { Trash } from "lucide-react";

interface RemoveButtonProps {
  label: string;
  disabled: boolean;
  onClick: () => void;
}

export default function RemoveButton({
  label,
  disabled,
  onClick,
}: RemoveButtonProps) {
  return (
    <button
      type="button"
      className="btn btn-ghost btn-square enabled:text-error"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <Trash size={16} />
    </button>
  );
}

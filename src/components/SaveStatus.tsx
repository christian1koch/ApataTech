export type SaveState =
  | { state: "idle" }
  | { state: "saving" }
  | { state: "saved" }
  | { state: "error"; message: string };

interface SaveStatusProps {
  status: SaveState;
}

export default function SaveStatus({ status }: SaveStatusProps) {
  return (
    <>
      <div role="status">
        {status.state === "saved" && (
          <p className="alert alert-success">Rules saved.</p>
        )}
      </div>
      <div role="alert">
        {status.state === "error" && (
          <p className="alert alert-error">{status.message}</p>
        )}
      </div>
    </>
  );
}

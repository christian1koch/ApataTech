import type { Query } from "../query/types";

interface PayloadPreviewProps {
  payload: Query;
}

export default function PayloadPreview({ payload }: PayloadPreviewProps) {
  return (
    <section aria-labelledby="payload-heading">
      <h2 id="payload-heading" className="text-lg font-semibold">
        Payload
      </h2>
      <pre className="bg-base-200 rounded-box overflow-x-auto p-4">
        <code>{JSON.stringify(payload, null, 2)}</code>
      </pre>
    </section>
  );
}

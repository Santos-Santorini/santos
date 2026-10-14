import { serializeInlineJson } from "@/lib/security/html";
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeInlineJson(data) }}
    />
  );
}

import { siteUrl } from "@/lib/site-brand";

type JsonValue = Record<string, unknown> | Array<unknown>;

export function JsonLd({ data }: { data: JsonValue }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; path: string }>;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: `${siteUrl}${item.path === "/" ? "/" : `${item.path.replace(/\/+$/, "")}/`}`,
        })),
      }}
    />
  );
}

export function ProductJsonLd({
  name,
  description,
  path,
  category,
}: {
  name: string;
  description: string;
  path: string;
  category: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": ["SoftwareApplication", "WebApplication"],
        name,
        description,
        url: `${siteUrl}${path.replace(/\/+$/, "")}/`,
        applicationCategory: category,
        operatingSystem: "Web",
        browserRequirements: "Requires a modern browser",
        provider: {
          "@type": "Organization",
          name: "PrivateDAO",
          url: siteUrl,
        },
      }}
    />
  );
}

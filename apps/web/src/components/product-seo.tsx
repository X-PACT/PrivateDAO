import type { ReactNode } from "react";

import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/seo-structured-data";

export function ProductSeo({
  name,
  description,
  path,
  category,
  children,
}: {
  name: string;
  description: string;
  path: string;
  category: string;
  children: ReactNode;
}) {
  return (
    <>
      <ProductJsonLd name={name} description={description} path={path} category={category} />
      <BreadcrumbJsonLd items={[{ name: "PrivateDAO", path: "/" }, { name, path }]} />
      {children}
    </>
  );
}

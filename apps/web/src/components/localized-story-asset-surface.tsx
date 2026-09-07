"use client";

import { useI18n } from "@/components/i18n-provider";
import { SectionHeader } from "@/components/section-header";

export function LocalizedStoryAssetSurface() {
  const { copy } = useI18n();
  const content = copy.pageContent.storyAsset;

  return <SectionHeader eyebrow={content.eyebrow} title={content.title} description={content.body} />;
}

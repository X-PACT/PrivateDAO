"use client";

import { SectionHeader } from "@/components/section-header";
import { useI18n } from "@/components/i18n-provider";

type LocalizedSecurityDeepDiveProps = {
  section: "selectiveDisclosure" | "operatingReality" | "zkMatrix" | "confidence" | "intelligence";
};

export function LocalizedSecurityDeepDive({ section }: LocalizedSecurityDeepDiveProps) {
  const { copy } = useI18n();
  const content = copy.pageContent.securityDeepDive;

  switch (section) {
    case "selectiveDisclosure":
      return (
        <SectionHeader
          eyebrow={content.selectiveDisclosureEyebrow}
          title={content.selectiveDisclosureTitle}
          description={content.selectiveDisclosureBody}
        />
      );
    case "operatingReality":
      return (
        <SectionHeader
          eyebrow={content.operatingRealityEyebrow}
          title={content.operatingRealityTitle}
          description={content.operatingRealityBody}
        />
      );
    case "zkMatrix":
      return (
        <SectionHeader eyebrow={content.zkMatrixEyebrow} title={content.zkMatrixTitle} description={content.zkMatrixBody} />
      );
    case "confidence":
      return (
        <SectionHeader
          eyebrow={content.confidenceEyebrow}
          title={content.confidenceTitle}
          description={content.confidenceBody}
        />
      );
    case "intelligence":
      return (
        <SectionHeader
          eyebrow={content.intelligenceEyebrow}
          title={content.intelligenceTitle}
          description={content.intelligenceBody}
        />
      );
  }
}

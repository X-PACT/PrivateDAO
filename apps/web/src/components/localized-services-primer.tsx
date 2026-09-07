"use client";

import { useI18n } from "@/components/i18n-provider";

export function LocalizedServicesPrimer() {
  const { copy } = useI18n();
  const content = copy.pageContent.servicesPrimer;

  return (
    <>
      <div className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6 text-sm leading-7 text-white/66">
        {content.learnFirst}
      </div>
      <div className="rounded-[28px] border border-cyan-300/16 bg-cyan-300/[0.08] p-6 text-sm leading-7 text-white/66">
        {content.intelligenceNext}
      </div>
    </>
  );
}

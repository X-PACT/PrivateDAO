import { getPrivacyProofSnapshot } from "@/lib/privacy-proof-snapshot";

import { PrivacyProofExplainerClient } from "@/components/privacy-proof-explainer-client";

type PrivacyProofExplainerProps = {
  compact?: boolean;
};

export function PrivacyProofExplainer({ compact = false }: PrivacyProofExplainerProps) {
  const snapshot = getPrivacyProofSnapshot();

  return <PrivacyProofExplainerClient compact={compact} snapshot={snapshot} />;
}

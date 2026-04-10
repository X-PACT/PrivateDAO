export const authorityHardeningSections = [
  {
    title: "Authority split",
    summary:
      "Mainnet requires a hard separation between upgrade authority, treasury authority, and admin authority. PrivateDAO should not carry a single-wallet super-admin posture into production.",
    bullets: [
      "Upgrade authority must be isolated from treasury execution.",
      "Treasury authority must remain bound to proposal execution and treasury policy.",
      "Admin authority should stay bounded and explicitly reduced before launch.",
    ],
  },
  {
    title: "Production ceremony",
    summary:
      "Authority transfer has to be observable and reviewable. The credible path is a documented multisig ceremony with signer inventory, role assignment, and transaction-backed handoff evidence.",
    bullets: [
      "Create the production multisig and define signer roles.",
      "Transfer upgrade authority with transaction evidence.",
      "Transfer treasury authority and record the evidence path.",
    ],
  },
  {
    title: "Launch boundary",
    summary:
      "Until the ceremony is complete, authority hardening remains part of the explicit Mainnet blocker surface. This is a strength when shown honestly rather than implied away.",
    bullets: [
      "Remove unnecessary single-signer powers.",
      "Keep pending steps visible to reviewers and buyers.",
      "Treat authority transfer as a trust event, not an internal note.",
    ],
  },
] as const;

export const authorityHardeningLinks = [
  { label: "Mainnet blockers", href: "/documents/mainnet-blockers" },
  { label: "Production custody ceremony", href: "/documents/production-custody-ceremony" },
  { label: "Authority hardening brief", href: "/documents/authority-hardening-mainnet" },
] as const;

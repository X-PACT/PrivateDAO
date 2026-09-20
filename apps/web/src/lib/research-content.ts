export type ResearchArticle = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readTime: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
};

export const researchArticles: ResearchArticle[] = [
  {
    slug: "organizational-privacy-vs-transaction-privacy",
    title: "Why organizational privacy is different from transaction privacy",
    description: "Organizations need to protect the context around a decision, not only the movement of money.",
    publishedAt: "2026-09-20",
    readTime: "6 min read",
    sections: [
      { heading: "The private part is usually the process", paragraphs: ["A transaction can be private while the organization around it remains exposed. Salary bands, approval thresholds, vendor comparisons, and committee intent often reveal more than the final payment itself.", "Organizational privacy protects the operating context: who was allowed to act, which policy applied, and which evidence was considered."] },
      { heading: "Privacy needs a useful outcome", paragraphs: ["A private workflow cannot end as an opaque black box. Teams still need a clear result for a board, auditor, partner, or customer.", "PrivateDAO separates the sensitive source from the verifiable outcome so an organization can limit disclosure without losing accountability."] },
      { heading: "A better operating model", paragraphs: ["Start with the workflow, define the disclosure boundary, apply the approval policy, and publish only the claim that another party needs to check. The infrastructure stays behind that sequence."] },
    ],
  },
  {
    slug: "confidential-payroll-that-remains-verifiable",
    title: "How confidential payroll can remain verifiable",
    description: "Payroll privacy is not only about hiding a number; it is about proving the calculation and approval path without exposing employees.",
    publishedAt: "2026-09-20",
    readTime: "5 min read",
    sections: [
      { heading: "The tension", paragraphs: ["Finance teams need payroll data to calculate gross pay, deductions, tax inputs, and net settlement. Employees and external reviewers should not receive everyone else's salary details.", "A public receipt that exposes the source data solves auditability by creating a privacy problem."] },
      { heading: "The proof boundary", paragraphs: ["A stronger design proves the claims that matter: the approved policy was used, the calculation reconciled, duplicate payouts were not introduced, and the settlement total matched the approved batch.", "The proof link can be shared independently while employee-level records remain inside the controlled workflow."] },
      { heading: "What the customer experiences", paragraphs: ["The customer sees a payroll workspace, an approval path, a settlement status, and one verification link. Technical proof material is available when an auditor needs it, not forced into the first screen."] },
    ],
  },
  {
    slug: "private-governance-without-opaque-outcomes",
    title: "Private governance without opaque outcomes",
    description: "Private voting can reduce pressure and exposure while the decision result remains understandable and checkable.",
    publishedAt: "2026-09-20",
    readTime: "5 min read",
    sections: [
      { heading: "Why public intent changes decisions", paragraphs: ["When every vote and discussion is immediately visible, participants may optimize for social pressure instead of the decision itself. Sensitive committees and organizations often need a protected room before they are ready to publish a result."] },
      { heading: "Privacy is not permission to hide the result", paragraphs: ["A private governance process still needs membership rules, proposal scope, approval thresholds, and a result that can be checked against the process. The private part is the protected intent; the public part is the agreed outcome and its evidence."] },
      { heading: "From room to outcome", paragraphs: ["PrivateDAO treats a room, proposal, vote, reveal, approval, and evidence record as one workflow. That lets an organization choose what remains confidential and what the outside world can verify."] },
    ],
  },
];

export function getResearchArticle(slug: string) {
  return researchArticles.find((article) => article.slug === slug);
}

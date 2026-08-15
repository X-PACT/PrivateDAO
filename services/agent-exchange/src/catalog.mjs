export const SERVICES = Object.freeze([
  { id: "verify.basic", title: "Basic verification", price: 0, currency: "USDC", access: "free", input: "JSON evidence", output: "canonical digest and receipt" },
  { id: "verify.deep", title: "Deep verification", price: 0.25, currency: "USDC", access: "paid", input: "JSON evidence and rules", output: "verified receipt and checks" },
  { id: "forensics.trace", title: "Solana transaction trace", price: 0.75, currency: "USDC", access: "paid", input: "public Solana address", output: "read-only transaction summary" },
  { id: "agent.match", title: "Agent capability matching", price: 0.10, currency: "USDC", access: "paid", input: "capabilities and context", output: "ranked registry matches" },
  { id: "sponsored.discovery", title: "Sponsored machine discovery", price: 5, currency: "USDC", access: "paid", input: "verified Agent Card and targeting", output: "explicit sponsored placement" },
  { id: "intelligence.synthesize", title: "Evidence synthesis", price: 1, currency: "USDC", access: "paid", input: "structured evidence", output: "structured synthesis and receipt" }
]);

export function serviceById(id) {
  return SERVICES.find((service) => service.id === id) || null;
}

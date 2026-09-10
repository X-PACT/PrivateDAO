import type { NetworkId, ProductId } from "./index.js";

export interface DeploymentRecord {
  product: ProductId;
  network: NetworkId;
  environment: "devnet" | "testnet" | "mainnet";
  chainId: string;
  contractAddress?: string;
  deploymentTransaction?: string;
  deploymentBlock?: string;
  abiHash?: string;
  bytecodeHash?: string;
  verifierAddress?: string;
  treasuryAddress?: string;
  authority?: string;
  upgradePolicy?: string;
  explorerVerified: boolean;
  buildReference: string;
  status: "planned" | "testnet" | "mainnet_pending_review" | "mainnet_live";
}
export class DeploymentRegistry {
  private readonly records = new Map<string, DeploymentRecord>();

  register(record: DeploymentRecord): void {
    if (record.environment === "mainnet" && record.status === "mainnet_live") {
      throw new Error("Mainnet deployment activation requires an explicit release gate.");
    }
    const key = `${record.product}/${record.network}/${record.environment}`;
    if (this.records.has(key)) throw new Error(`Deployment already registered: ${key}`);
    this.records.set(key, { ...record });
  }

  get(product: ProductId, network: NetworkId, environment: DeploymentRecord["environment"]): DeploymentRecord | undefined {
    const record = this.records.get(`${product}/${network}/${environment}`);
    return record ? { ...record } : undefined;
  }

  list(): readonly DeploymentRecord[] { return [...this.records.values()].map((record) => ({ ...record })); }
}

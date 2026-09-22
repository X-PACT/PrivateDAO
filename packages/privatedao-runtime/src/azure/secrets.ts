import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

export interface SecretProvider {
  get(name: string): Promise<string | undefined>;
}

export class EnvironmentSecretProvider implements SecretProvider {
  async get(name: string): Promise<string | undefined> {
    const value = process.env[name];
    return value && value.length > 0 ? value : undefined;
  }
}

export class AzureKeyVaultSecretProvider implements SecretProvider {
  private readonly client: SecretClient;

  constructor(vaultUrl: string, credential = new DefaultAzureCredential()) {
    this.client = new SecretClient(vaultUrl, credential);
  }

  async get(name: string): Promise<string | undefined> {
    const secret = await this.client.getSecret(name);
    return secret.value;
  }
}

export function createSecretProvider(): SecretProvider {
  const vaultUrl = process.env.AZURE_KEY_VAULT_URL?.trim();
  return vaultUrl ? new AzureKeyVaultSecretProvider(vaultUrl) : new EnvironmentSecretProvider();
}

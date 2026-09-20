# Azure Confidential Payroll Workload

This directory contains a reviewable deployment template only. It does not create Azure resources by itself.

## Safety boundary

- Testnet/Devnet only.
- No AWS, Caddy, production website, game, or existing product is changed.
- No blockchain private key is placed in the template.
- The Azure CLI is not required to build the repository and was not available during the local review.
- A subscription, region, cost approval, Entra App Registration, image registry, and Key Vault must be confirmed before deployment.

## Template

`payroll-container-app.bicep` provisions an isolated Container Apps environment, Log Analytics workspace, Application Insights resource, system-assigned managed identity, and a Container App. The app reads the Application Insights connection string through an existing Key Vault reference. The identity receives the `Key Vault Secrets User` role only.

The template expects a previously built and scanned container image. It does not build an image, create credentials, or configure a blockchain signer.

## Required pre-deployment checks

1. Confirm the Azure subscription and region with Fahd.
2. Register an Entra confidential web application and configure the exact redirect URI.
3. Set the Entra audience and tenant values through deployment parameters, never source control.
4. Create the Key Vault and store only the approved Application Insights connection string secret.
5. Build and scan the Payroll image.
6. Run the local runtime and identity tests.
7. Deploy to a non-production resource group.
8. Run the Testnet E2E gate and retain receipt/evidence artifacts.

No Marketplace or Microsoft Partner claim is valid until the external account and offer requirements are independently verified.

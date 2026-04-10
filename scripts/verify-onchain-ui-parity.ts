import fs from "fs";
import path from "path";

import {
  PRIVATE_DAO_CORE_INSTRUCTION_PARITY,
  PRIVATE_DAO_PROGRAM_ID,
} from "../apps/web/src/lib/onchain-parity.generated";

type IdlAccount = {
  name: string;
  writable?: boolean;
  signer?: boolean;
  accounts?: IdlAccount[];
};

type IdlArg = {
  name: string;
};

type IdlInstruction = {
  name: string;
  accounts: IdlAccount[];
  args: IdlArg[];
};

function flattenAccounts(accounts: IdlAccount[], prefix = "") {
  const flattened: Array<{ name: string; writable: boolean; signer: boolean }> = [];
  for (const account of accounts) {
    if (account.accounts) {
      flattened.push(...flattenAccounts(account.accounts, `${prefix}${account.name}.`));
      continue;
    }
    flattened.push({
      name: `${prefix}${account.name}`,
      writable: Boolean(account.writable),
      signer: Boolean(account.signer),
    });
  }
  return flattened;
}

function main() {
  const idlPath = path.resolve(__dirname, "../target/idl/private_dao.json");
  const idl = JSON.parse(fs.readFileSync(idlPath, "utf8")) as {
    address?: string;
    metadata?: { address?: string };
    instructions: IdlInstruction[];
  };
  const expectedProgramId = idl.address ?? idl.metadata?.address;
  if (expectedProgramId !== PRIVATE_DAO_PROGRAM_ID) {
    throw new Error(`program id mismatch: generated=${PRIVATE_DAO_PROGRAM_ID} idl=${expectedProgramId}`);
  }

  for (const [name, generated] of Object.entries(PRIVATE_DAO_CORE_INSTRUCTION_PARITY)) {
    const instruction = idl.instructions.find((candidate: IdlInstruction) => candidate.name === name);
    if (!instruction) {
      throw new Error(`missing instruction in IDL: ${name}`);
    }

    const expectedFieldOrder = instruction.args.map((arg: IdlArg) => arg.name);
    const generatedFieldOrder = [...generated.fieldOrder];
    if (JSON.stringify(expectedFieldOrder) !== JSON.stringify(generatedFieldOrder)) {
      throw new Error(`field order mismatch for ${name}: ${JSON.stringify(generatedFieldOrder)} !== ${JSON.stringify(expectedFieldOrder)}`);
    }

    const expectedAccounts = flattenAccounts(instruction.accounts);
    const generatedAccounts = generated.accounts.map((account) => ({
      name: account.name,
      writable: account.writable,
      signer: account.signer,
    }));
    if (JSON.stringify(expectedAccounts) !== JSON.stringify(generatedAccounts)) {
      throw new Error(`account list mismatch for ${name}`);
    }
  }

  console.log("on-chain UI parity metadata verified");
}

main();

import assert from "node:assert/strict";
import { MapTenantMembershipStore, EntraIdentityError } from "../packages/privatedao-runtime/src/index.ts";

const store = new MapTenantMembershipStore([
  {
    tenantId: "pdao-demo-tenant",
    directoryTenantId: "directory-tenant",
    subject: "entra-subject",
    roles: ["maker", "auditor"],
    active: true,
  },
]);

const membership = await store.findMembership({ directoryTenantId: "directory-tenant", subject: "entra-subject" });
assert.equal(membership?.tenantId, "pdao-demo-tenant");
assert.deepEqual(membership?.roles, ["maker", "auditor"]);
assert.equal(await store.findMembership({ directoryTenantId: "directory-tenant", subject: "unknown" }), undefined);
assert.equal(new EntraIdentityError("INVALID_TOKEN", "x").code, "INVALID_TOKEN");
console.log("Azure identity boundary tests: PASS");

import { handler, resetForTests } from "../src/handler.mjs";
resetForTests();
const response = await handler({ requestContext: { http: { method: "GET", path: "/api/health" } } });
if (response.statusCode !== 200) throw new Error(`health failed: ${response.statusCode}`);
console.log("agent-exchange local smoke: PASS");

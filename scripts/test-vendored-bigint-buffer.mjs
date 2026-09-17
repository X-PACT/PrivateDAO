import assert from "node:assert/strict";
import { toBigIntLE, toBufferLE, toBufferBE } from "../vendor/bigint-buffer/index.js";

assert.equal(toBigIntLE(Buffer.from([0x01, 0x02, 0x03])), 0x030201n);
assert.equal(toBigIntLE(Buffer.alloc(0)), 0n);
assert.deepEqual(toBufferLE(0x0102n, 2), Buffer.from([0x02, 0x01]));
assert.deepEqual(toBufferBE(0x0102n, 2), Buffer.from([0x01, 0x02]));
assert.throws(() => toBigIntLE(new Uint8Array([1])), TypeError);
assert.throws(() => toBufferLE(-1n, 2), RangeError);
assert.throws(() => toBufferLE(0x10000n, 2), RangeError);
assert.throws(() => toBufferBE(1n, -1), RangeError);
assert.throws(() => toBufferLE(1n, Number.MAX_SAFE_INTEGER), RangeError);

console.log("Vendored bigint-buffer bounds and type checks PASS");

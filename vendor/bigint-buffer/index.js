"use strict";

function assertWidth(width) {
  if (!Number.isSafeInteger(width) || width < 0) throw new RangeError("width must be a non-negative safe integer");
}

function toBigIntLE(buffer) {
  if (!Buffer.isBuffer(buffer)) throw new TypeError("buffer must be a Buffer");
  let value = 0n;
  for (let index = buffer.length - 1; index >= 0; index -= 1) value = (value << 8n) | BigInt(buffer[index]);
  return value;
}

function toBigIntBE(buffer) {
  if (!Buffer.isBuffer(buffer)) throw new TypeError("buffer must be a Buffer");
  let value = 0n;
  for (const byte of buffer) value = (value << 8n) | BigInt(byte);
  return value;
}

function toBuffer(num, width, littleEndian) {
  assertWidth(width);
  if (typeof num !== "bigint") num = BigInt(num);
  if (num < 0n) throw new RangeError("num must be non-negative");
  const limit = 1n << BigInt(width * 8);
  if (num >= limit && width !== 0) throw new RangeError("num does not fit in width");
  const output = Buffer.alloc(width);
  let value = num;
  for (let index = 0; index < width; index += 1) {
    const position = littleEndian ? index : width - index - 1;
    output[position] = Number(value & 255n);
    value >>= 8n;
  }
  return output;
}

exports.toBigIntLE = toBigIntLE;
exports.toBigIntBE = toBigIntBE;
exports.toBufferLE = (num, width) => toBuffer(num, width, true);
exports.toBufferBE = (num, width) => toBuffer(num, width, false);

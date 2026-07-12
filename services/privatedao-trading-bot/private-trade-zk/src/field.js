const crypto = require('crypto');

const BN254_PRIME = BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495617');

function sha256Hex(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function fieldFromHex(hex) {
  const clean = String(hex).replace(/^0x/, '');
  return (BigInt('0x' + clean) % BN254_PRIME).toString();
}

function fieldHash(value) {
  return fieldFromHex(sha256Hex(value));
}

function randomField() {
  return fieldFromHex(crypto.randomBytes(32).toString('hex'));
}

function canonicalJson(value) {
  if (Array.isArray(value)) return '[' + value.map(canonicalJson).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map((k) => JSON.stringify(k) + ':' + canonicalJson(value[k])).join(',') + '}';
  }
  return JSON.stringify(value);
}

module.exports = {
  BN254_PRIME,
  sha256Hex,
  fieldFromHex,
  fieldHash,
  randomField,
  canonicalJson
};

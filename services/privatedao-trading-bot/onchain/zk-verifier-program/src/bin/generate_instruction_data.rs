use ark_bn254::g1::G1Affine;
use ark_serialize::{CanonicalDeserialize, CanonicalSerialize, Compress, Validate};
use num_bigint::BigUint;
use serde_json::Value;
use std::{env, fs, ops::Neg, path::PathBuf};

fn change_endianness(bytes: &[u8]) -> Vec<u8> {
    let mut vec = Vec::new();
    for b in bytes.chunks(32) {
        for byte in b.iter().rev() {
            vec.push(*byte);
        }
    }
    vec
}

fn decimal_to_be32(value: &str) -> [u8; 32] {
    let n = BigUint::parse_bytes(value.as_bytes(), 10).expect("invalid decimal field");
    let mut out = [0u8; 32];
    let bytes = n.to_bytes_be();
    out[32 - bytes.len()..].copy_from_slice(&bytes);
    out
}

fn g1_from_json(point: &Value) -> [u8; 64] {
    let arr = point.as_array().expect("g1 point must be array");
    let mut out = [0u8; 64];
    out[0..32].copy_from_slice(&decimal_to_be32(
        arr[0].as_str().expect("g1 x must be string"),
    ));
    out[32..64].copy_from_slice(&decimal_to_be32(
        arr[1].as_str().expect("g1 y must be string"),
    ));
    out
}

fn g2_from_json(point: &Value) -> [u8; 128] {
    let arr = point.as_array().expect("g2 point must be array");
    let mut out = [0u8; 128];
    for i in 0..2 {
        let coeffs = arr[i].as_array().expect("g2 coordinate must be array");
        let c0 = decimal_to_be32(coeffs[0].as_str().expect("g2 c0 must be string"));
        let c1 = decimal_to_be32(coeffs[1].as_str().expect("g2 c1 must be string"));
        out[i * 64..i * 64 + 32].copy_from_slice(&c1);
        out[i * 64 + 32..i * 64 + 64].copy_from_slice(&c0);
    }
    out
}

fn negated_a(raw_a: [u8; 64]) -> [u8; 64] {
    let proof_a = G1Affine::deserialize_with_mode(
        &*[&change_endianness(&raw_a), &[0u8][..]].concat(),
        Compress::No,
        Validate::Yes,
    )
    .expect("invalid proof A");
    let proof_a_neg = proof_a.neg();
    let mut proof_a_neg_bytes = [0u8; 65];
    proof_a_neg
        .x
        .serialize_with_mode(&mut proof_a_neg_bytes[..32], Compress::No)
        .expect("serialize proof A x");
    proof_a_neg
        .y
        .serialize_with_mode(&mut proof_a_neg_bytes[32..64], Compress::No)
        .expect("serialize proof A y");
    change_endianness(&proof_a_neg_bytes[..64])
        .try_into()
        .expect("negated proof A length")
}

fn main() {
    let root = PathBuf::from(env::args().nth(1).unwrap_or_else(|| ".".to_string()));
    let proof: Value = serde_json::from_str(
        &fs::read_to_string(root.join("private-trade-zk/proofs/trade-intent.proof.json"))
            .expect("read proof"),
    )
    .expect("parse proof");
    let public: Value = serde_json::from_str(
        &fs::read_to_string(root.join("private-trade-zk/proofs/trade-intent.public.json"))
            .expect("read public signals"),
    )
    .expect("parse public signals");

    let raw_a = g1_from_json(&proof["pi_a"]);
    let proof_a = negated_a(raw_a);
    let proof_b = g2_from_json(&proof["pi_b"]);
    let proof_c = g1_from_json(&proof["pi_c"]);

    let mut instruction = Vec::with_capacity(512);
    instruction.extend_from_slice(&proof_a);
    instruction.extend_from_slice(&proof_b);
    instruction.extend_from_slice(&proof_c);
    for i in 0..8 {
        let key = i.to_string();
        let value = public
            .get(i)
            .or_else(|| public.get(key.as_str()))
            .and_then(|v| v.as_str())
            .expect("missing public signal");
        instruction.extend_from_slice(&decimal_to_be32(value));
    }

    let encoded = base64_sim::encode(&instruction);
    println!("{encoded}");
}

mod base64_sim {
    const TABLE: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    pub fn encode(bytes: &[u8]) -> String {
        let mut out = String::new();
        let mut i = 0;
        while i < bytes.len() {
            let b0 = bytes[i];
            let b1 = if i + 1 < bytes.len() { bytes[i + 1] } else { 0 };
            let b2 = if i + 2 < bytes.len() { bytes[i + 2] } else { 0 };
            out.push(TABLE[(b0 >> 2) as usize] as char);
            out.push(TABLE[(((b0 & 0b11) << 4) | (b1 >> 4)) as usize] as char);
            if i + 1 < bytes.len() {
                out.push(TABLE[(((b1 & 0b1111) << 2) | (b2 >> 6)) as usize] as char);
            } else {
                out.push('=');
            }
            if i + 2 < bytes.len() {
                out.push(TABLE[(b2 & 0b111111) as usize] as char);
            } else {
                out.push('=');
            }
            i += 3;
        }
        out
    }
}

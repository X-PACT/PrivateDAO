# Confidential Auction Technical Boundary

The auction is a standalone Anchor program at `programs/privatedao-auction`.

The base layer stores auction rules, authorization commitments, the final result commitment, and a settlement receipt. During the active session, the delegated auction session is executed through MagicBlock's development TEE endpoint and Permission/Delegation programs. Individual bids do not intentionally create base-layer settlement transactions.

The browser is a transaction client only. It does not calculate or publish the winner. The backend may index receipts later, but a public verifier must reconcile the receipt account and reported Solana signature before showing `VERIFIED`.

The current implementation does not claim Groth16 auction verification. Existing PrivateDAO circuits are not interchangeable with an auction-outcome circuit. A dedicated circuit must be designed, tested, and independently verified before the UI can claim ZK verification.

Development configuration:

- MagicBlock devnet TEE RPC: `https://devnet-tee.magicblock.app`
- MagicBlock devnet TEE validator: `MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo`
- MagicBlock Permission Program: `ACLseoPoyC3cBqoUtkbjZ4aDrkurZW86v19pXz2XQnp1`
- MagicBlock Delegation Program: `DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh`

These values are development references only. Mainnet deployment and public support claims require separate certification.

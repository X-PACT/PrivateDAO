// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPrivateDaoGroth16Verifier {
    function verifyProof(
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[4] calldata input
    ) external view returns (bool);
}

contract BlindVerificationRegistry {
    uint256 private constant SNARK_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

    struct Verification {
        bytes32 productId;
        bytes32 schemaId;
        bytes32 recordId;
        bytes32 proofHash;
        uint256 chainId;
        uint64 verifiedAt;
        uint64 expiresAt;
        bool revoked;
    }

    address public immutable verifier;
    address public immutable owner;
    mapping(bytes32 => Verification) public verifications;

    event BlindProofVerified(
        bytes32 indexed verificationId,
        bytes32 indexed productId,
        bytes32 indexed recordId,
        bytes32 schemaId,
        bytes32 proofHash,
        uint256 chainId,
        uint64 expiresAt
    );
    event BlindProofRevoked(bytes32 indexed verificationId, uint64 revokedAt);

    error WrongChain(uint256 expected, uint256 actual);
    error InvalidProof();
    error ExpiryRequired();
    error Expired();
    error AlreadyVerified();
    error UnknownVerification();
    error NotOwner();

    constructor(address verifierAddress) {
        require(verifierAddress != address(0), "verifier required");
        verifier = verifierAddress;
        owner = msg.sender;
    }

    function verifyAndAnchor(
        bytes32 productId,
        bytes32 schemaId,
        bytes32 recordId,
        uint256 declaredChainId,
        uint64 expiresAt,
        uint256[2] calldata a,
        uint256[2][2] calldata b,
        uint256[2] calldata c,
        uint256[4] calldata publicSignals
    ) external returns (bytes32 verificationId) {
        if (declaredChainId != block.chainid) revert WrongChain(declaredChainId, block.chainid);
        if (expiresAt <= block.timestamp) revert ExpiryRequired();

        uint256 domainField = uint256(keccak256(abi.encode(
            "PrivateDAO-Blind-Policy-v1",
            block.chainid,
            address(this),
            productId,
            schemaId,
            recordId
        ))) % SNARK_FIELD;
        if (publicSignals[0] != domainField || publicSignals[3] != 1) revert InvalidProof();
        if (!IPrivateDaoGroth16Verifier(verifier).verifyProof(a, b, c, publicSignals)) revert InvalidProof();

        bytes32 proofHash = keccak256(abi.encode(a, b, c, publicSignals));
        verificationId = keccak256(abi.encode(
            "PrivateDAO-Blind-Verification-v1",
            block.chainid,
            address(this),
            productId,
            schemaId,
            recordId,
            proofHash
        ));
        if (verifications[verificationId].verifiedAt != 0) revert AlreadyVerified();

        verifications[verificationId] = Verification({
            productId: productId,
            schemaId: schemaId,
            recordId: recordId,
            proofHash: proofHash,
            chainId: block.chainid,
            verifiedAt: uint64(block.timestamp),
            expiresAt: expiresAt,
            revoked: false
        });
        emit BlindProofVerified(verificationId, productId, recordId, schemaId, proofHash, block.chainid, expiresAt);
    }

    function revoke(bytes32 verificationId) external {
        if (msg.sender != owner) revert NotOwner();
        Verification storage verification = verifications[verificationId];
        if (verification.verifiedAt == 0) revert UnknownVerification();
        verification.revoked = true;
        emit BlindProofRevoked(verificationId, uint64(block.timestamp));
    }

    function isValid(bytes32 verificationId) external view returns (bool) {
        Verification memory verification = verifications[verificationId];
        return verification.verifiedAt != 0 && !verification.revoked && block.timestamp < verification.expiresAt;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract RecordVerificationRegistry {
    struct Record {
        bytes32 productId;
        bytes32 schemaId;
        bytes32 recordId;
        bytes32 digest;
        bytes32 domain;
        uint256 chainId;
        uint64 createdAt;
        uint64 expiresAt;
        bool revoked;
    }

    mapping(bytes32 => Record) public records;
    address public immutable owner;

    event RecordAnchored(
        bytes32 indexed verificationId,
        bytes32 indexed productId,
        bytes32 indexed recordId,
        bytes32 schemaId,
        bytes32 digest,
        bytes32 domain,
        uint256 chainId,
        uint64 expiresAt
    );
    event RecordRevoked(bytes32 indexed verificationId, uint64 revokedAt);

    error WrongChain(uint256 expected, uint256 actual);
    error ExpiryRequired();
    error AlreadyAnchored();
    error UnknownRecord();
    error NotOwner();

    constructor() {
        owner = msg.sender;
    }

    function anchorRecord(
        bytes32 productId,
        bytes32 schemaId,
        bytes32 recordId,
        bytes32 digest,
        uint256 declaredChainId,
        uint64 expiresAt
    ) external returns (bytes32 verificationId) {
        if (declaredChainId != block.chainid) revert WrongChain(declaredChainId, block.chainid);
        if (expiresAt <= block.timestamp) revert ExpiryRequired();

        bytes32 domain = keccak256(abi.encode(
            "PrivateDAO-Record-v1",
            block.chainid,
            address(this),
            productId,
            schemaId,
            recordId,
            digest
        ));
        verificationId = keccak256(abi.encode(
            "PrivateDAO-Record-Verification-v1",
            domain
        ));
        if (records[verificationId].createdAt != 0) revert AlreadyAnchored();

        records[verificationId] = Record({
            productId: productId,
            schemaId: schemaId,
            recordId: recordId,
            digest: digest,
            domain: domain,
            chainId: block.chainid,
            createdAt: uint64(block.timestamp),
            expiresAt: expiresAt,
            revoked: false
        });
        emit RecordAnchored(verificationId, productId, recordId, schemaId, digest, domain, block.chainid, expiresAt);
    }

    function verifyRecord(bytes32 verificationId, bytes32 digest) external view returns (bool) {
        Record memory record = records[verificationId];
        return record.createdAt != 0 && record.digest == digest && !record.revoked && block.timestamp < record.expiresAt;
    }

    function revoke(bytes32 verificationId) external {
        if (msg.sender != owner) revert NotOwner();
        Record storage record = records[verificationId];
        if (record.createdAt == 0) revert UnknownRecord();
        record.revoked = true;
        emit RecordRevoked(verificationId, uint64(block.timestamp));
    }

    function isValid(bytes32 verificationId) external view returns (bool) {
        Record memory record = records[verificationId];
        return record.createdAt != 0 && !record.revoked && block.timestamp < record.expiresAt;
    }
}

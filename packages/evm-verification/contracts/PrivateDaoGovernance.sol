// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PrivateDaoGovernance {
    enum ProposalStatus { None, Open, Passed, Rejected, Cancelled }

    struct Proposal {
        bytes32 actionHash;
        uint64 commitEnd;
        uint64 revealEnd;
        uint256 quorum;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 revealedVotes;
        ProposalStatus status;
    }

    struct VoteCommitment {
        bytes32 commitment;
        bool revealed;
    }

    address public immutable owner;
    mapping(bytes32 => Proposal) public proposals;
    mapping(bytes32 => mapping(address => VoteCommitment)) public commitments;

    event ProposalCreated(bytes32 indexed proposalId, bytes32 indexed actionHash, uint64 commitEnd, uint64 revealEnd, uint256 quorum);
    event VoteCommitted(bytes32 indexed proposalId, address indexed voter, bytes32 commitment);
    event VoteRevealed(bytes32 indexed proposalId, address indexed voter, bool vote);
    event ProposalFinalized(bytes32 indexed proposalId, ProposalStatus status, uint256 yesVotes, uint256 noVotes);
    event ProposalCancelled(bytes32 indexed proposalId);

    error NotOwner();
    error InvalidProposal();
    error InvalidWindow();
    error InvalidStatus();
    error InvalidCommitment();
    error CommitmentMissing();
    error AlreadyCommitted();
    error AlreadyRevealed();
    error InvalidReveal();

    modifier onlyOwner() { if (msg.sender != owner) revert NotOwner(); _; }

    constructor() { owner = msg.sender; }

    function createProposal(bytes32 proposalId, bytes32 actionHash, uint64 commitEnd, uint64 revealEnd, uint256 quorum) external onlyOwner {
        if (proposalId == bytes32(0) || actionHash == bytes32(0) || quorum == 0) revert InvalidProposal();
        if (commitEnd <= block.timestamp || revealEnd <= commitEnd) revert InvalidWindow();
        if (proposals[proposalId].status != ProposalStatus.None) revert InvalidProposal();
        proposals[proposalId] = Proposal({ actionHash: actionHash, commitEnd: commitEnd, revealEnd: revealEnd, quorum: quorum, yesVotes: 0, noVotes: 0, revealedVotes: 0, status: ProposalStatus.Open });
        emit ProposalCreated(proposalId, actionHash, commitEnd, revealEnd, quorum);
    }

    function commitVote(bytes32 proposalId, bytes32 commitment) external {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.status != ProposalStatus.Open || block.timestamp >= proposal.commitEnd) revert InvalidStatus();
        if (commitment == bytes32(0)) revert InvalidCommitment();
        VoteCommitment storage vote = commitments[proposalId][msg.sender];
        if (vote.commitment != bytes32(0)) revert AlreadyCommitted();
        vote.commitment = commitment;
        emit VoteCommitted(proposalId, msg.sender, commitment);
    }

    function revealVote(bytes32 proposalId, bool vote, bytes32 salt) external {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.status != ProposalStatus.Open || block.timestamp < proposal.commitEnd || block.timestamp >= proposal.revealEnd) revert InvalidStatus();
        VoteCommitment storage commitment = commitments[proposalId][msg.sender];
        if (commitment.commitment == bytes32(0)) revert CommitmentMissing();
        if (commitment.revealed) revert AlreadyRevealed();
        if (commitment.commitment != keccak256(abi.encode(proposalId, msg.sender, vote, salt))) revert InvalidReveal();
        commitment.revealed = true;
        proposal.revealedVotes += 1;
        if (vote) proposal.yesVotes += 1;
        else proposal.noVotes += 1;
        emit VoteRevealed(proposalId, msg.sender, vote);
    }

    function finalizeProposal(bytes32 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.status != ProposalStatus.Open || block.timestamp < proposal.revealEnd) revert InvalidStatus();
        proposal.status = proposal.revealedVotes >= proposal.quorum && proposal.yesVotes > proposal.noVotes ? ProposalStatus.Passed : ProposalStatus.Rejected;
        emit ProposalFinalized(proposalId, proposal.status, proposal.yesVotes, proposal.noVotes);
    }

    function cancelProposal(bytes32 proposalId) external onlyOwner {
        Proposal storage proposal = proposals[proposalId];
        if (proposal.status != ProposalStatus.Open) revert InvalidStatus();
        proposal.status = ProposalStatus.Cancelled;
        emit ProposalCancelled(proposalId);
    }
}

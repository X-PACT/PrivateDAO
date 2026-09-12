// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface PrivateDaoTokenAuctionIERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract PrivateDaoTokenSealedAuction {
    enum AuctionStatus { None, Open, Finalized, Settled, Cancelled }

    struct Bid {
        bytes32 commitment;
        uint256 escrow;
        uint256 amount;
        bool revealed;
        bool refunded;
    }

    struct Auction {
        address seller;
        uint64 biddingEnd;
        uint64 revealEnd;
        uint256 highestBid;
        address highestBidder;
        AuctionStatus status;
    }

    address public immutable owner;
    address public immutable token;
    mapping(bytes32 => Auction) public auctions;
    mapping(bytes32 => mapping(address => Bid)) public bids;
    uint256 private locked;

    event AuctionCreated(bytes32 indexed auctionId, address indexed seller, uint64 biddingEnd, uint64 revealEnd);
    event BidCommitted(bytes32 indexed auctionId, address indexed bidder, uint256 escrow);
    event BidRevealed(bytes32 indexed auctionId, address indexed bidder, uint256 amount);
    event AuctionFinalized(bytes32 indexed auctionId, address indexed winner, uint256 amount);
    event AuctionSettled(bytes32 indexed auctionId, address indexed winner, uint256 amount);
    event BidRefunded(bytes32 indexed auctionId, address indexed bidder, uint256 amount);

    error NotOwner();
    error InvalidAuction();
    error InvalidWindow();
    error InvalidStatus();
    error InvalidBid();
    error AlreadyBid();
    error MissingBid();
    error InvalidReveal();
    error TransferFailed();
    error Reentrancy();

    modifier onlyOwner() { if (msg.sender != owner) revert NotOwner(); _; }
    modifier nonReentrant() { if (locked == 1) revert Reentrancy(); locked = 1; _; locked = 0; }

    constructor(address tokenAddress) {
        if (tokenAddress == address(0)) revert InvalidAuction();
        owner = msg.sender;
        token = tokenAddress;
    }

    function createAuction(bytes32 auctionId, address seller, uint64 biddingEnd, uint64 revealEnd) external onlyOwner {
        if (auctionId == bytes32(0) || seller == address(0)) revert InvalidAuction();
        if (biddingEnd <= block.timestamp || revealEnd <= biddingEnd) revert InvalidWindow();
        if (auctions[auctionId].status != AuctionStatus.None) revert InvalidAuction();
        auctions[auctionId] = Auction({ seller: seller, biddingEnd: biddingEnd, revealEnd: revealEnd, highestBid: 0, highestBidder: address(0), status: AuctionStatus.Open });
        emit AuctionCreated(auctionId, seller, biddingEnd, revealEnd);
    }

    function commitBid(bytes32 auctionId, bytes32 commitment, uint256 escrow) external {
        Auction storage auction = auctions[auctionId];
        if (auction.status != AuctionStatus.Open || block.timestamp >= auction.biddingEnd) revert InvalidStatus();
        if (commitment == bytes32(0) || escrow == 0) revert InvalidBid();
        Bid storage bid = bids[auctionId][msg.sender];
        if (bid.commitment != bytes32(0)) revert AlreadyBid();
        if (!PrivateDaoTokenAuctionIERC20(token).transferFrom(msg.sender, address(this), escrow)) revert TransferFailed();
        bid.commitment = commitment;
        bid.escrow = escrow;
        emit BidCommitted(auctionId, msg.sender, escrow);
    }

    function revealBid(bytes32 auctionId, uint256 amount, bytes32 salt) external {
        Auction storage auction = auctions[auctionId];
        if (auction.status != AuctionStatus.Open || block.timestamp < auction.biddingEnd || block.timestamp >= auction.revealEnd) revert InvalidStatus();
        Bid storage bid = bids[auctionId][msg.sender];
        if (bid.escrow == 0) revert MissingBid();
        if (bid.revealed) revert InvalidBid();
        if (amount == 0 || amount > bid.escrow || keccak256(abi.encode(auctionId, msg.sender, amount, salt)) != bid.commitment) revert InvalidReveal();
        bid.amount = amount;
        bid.revealed = true;
        if (amount > auction.highestBid) {
            auction.highestBid = amount;
            auction.highestBidder = msg.sender;
        }
        emit BidRevealed(auctionId, msg.sender, amount);
    }

    function finalizeAuction(bytes32 auctionId) external {
        Auction storage auction = auctions[auctionId];
        if (auction.status != AuctionStatus.Open || block.timestamp < auction.revealEnd) revert InvalidStatus();
        auction.status = AuctionStatus.Finalized;
        emit AuctionFinalized(auctionId, auction.highestBidder, auction.highestBid);
    }

    function settleAuction(bytes32 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        if (auction.status != AuctionStatus.Finalized) revert InvalidStatus();
        auction.status = AuctionStatus.Settled;
        if (auction.highestBidder == address(0)) {
            emit AuctionSettled(auctionId, address(0), 0);
            return;
        }
        Bid storage winningBid = bids[auctionId][auction.highestBidder];
        winningBid.refunded = true;
        if (!PrivateDaoTokenAuctionIERC20(token).transfer(auction.seller, auction.highestBid)) revert TransferFailed();
        uint256 winnerRefund = winningBid.escrow - auction.highestBid;
        if (winnerRefund > 0 && !PrivateDaoTokenAuctionIERC20(token).transfer(auction.highestBidder, winnerRefund)) revert TransferFailed();
        if (winnerRefund > 0) emit BidRefunded(auctionId, auction.highestBidder, winnerRefund);
        emit AuctionSettled(auctionId, auction.highestBidder, auction.highestBid);
    }

    function refundBid(bytes32 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        if (auction.status != AuctionStatus.Settled && auction.status != AuctionStatus.Cancelled) revert InvalidStatus();
        Bid storage bid = bids[auctionId][msg.sender];
        if (bid.escrow == 0 || bid.refunded || msg.sender == auction.highestBidder) revert InvalidBid();
        bid.refunded = true;
        if (!PrivateDaoTokenAuctionIERC20(token).transfer(msg.sender, bid.escrow)) revert TransferFailed();
        emit BidRefunded(auctionId, msg.sender, bid.escrow);
    }
}

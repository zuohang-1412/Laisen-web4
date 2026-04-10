// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract LaisenRuntimeProtocol is Ownable {
    enum MandateStatus {
        None,
        Rejected,
        Executed
    }

    struct MandateRecord {
        bytes32 mandateHash;
        bytes32 signalHash;
        bytes32 decisionHash;
        bytes32 executionHash;
        bytes32 rejectionHash;
        MandateStatus status;
        address actor;
        uint64 updatedAt;
    }

    address public immutable token;
    address public immutable treasury;
    bytes32 public immutable daoHash;
    bytes32 public immutable governanceHash;
    bytes32 public immutable founderHash;

    mapping(bytes32 => MandateRecord) public mandates;

    event ProtocolInitialized(
        address indexed owner,
        address indexed token,
        address indexed treasury,
        bytes32 daoHash,
        bytes32 governanceHash,
        bytes32 founderHash
    );
    event MandateApproved(
        bytes32 indexed mandateId,
        bytes32 mandateHash,
        bytes32 signalHash,
        bytes32 decisionHash,
        address indexed actor
    );
    event MandateExecuted(
        bytes32 indexed mandateId,
        bytes32 executionHash,
        address indexed actor
    );
    event MandateRejected(
        bytes32 indexed mandateId,
        bytes32 mandateHash,
        bytes32 rejectionHash,
        address indexed actor
    );

    constructor(
        address initialOwner,
        address token_,
        address treasury_,
        bytes32 daoHash_,
        bytes32 governanceHash_,
        bytes32 founderHash_
    ) Ownable(initialOwner) {
        token = token_;
        treasury = treasury_;
        daoHash = daoHash_;
        governanceHash = governanceHash_;
        founderHash = founderHash_;

        emit ProtocolInitialized(initialOwner, token_, treasury_, daoHash_, governanceHash_, founderHash_);
    }

    function approveAndExecuteMandate(
        bytes32 mandateId,
        bytes32 mandateHash,
        bytes32 signalHash,
        bytes32 decisionHash,
        bytes32 executionHash
    ) external onlyOwner {
        require(mandates[mandateId].status == MandateStatus.None, "Mandate already handled");

        mandates[mandateId] = MandateRecord({
            mandateHash: mandateHash,
            signalHash: signalHash,
            decisionHash: decisionHash,
            executionHash: executionHash,
            rejectionHash: bytes32(0),
            status: MandateStatus.Executed,
            actor: msg.sender,
            updatedAt: uint64(block.timestamp)
        });

        emit MandateApproved(mandateId, mandateHash, signalHash, decisionHash, msg.sender);
        emit MandateExecuted(mandateId, executionHash, msg.sender);
    }

    function rejectMandate(
        bytes32 mandateId,
        bytes32 mandateHash,
        bytes32 rejectionHash
    ) external onlyOwner {
        require(mandates[mandateId].status == MandateStatus.None, "Mandate already handled");

        mandates[mandateId] = MandateRecord({
            mandateHash: mandateHash,
            signalHash: bytes32(0),
            decisionHash: bytes32(0),
            executionHash: bytes32(0),
            rejectionHash: rejectionHash,
            status: MandateStatus.Rejected,
            actor: msg.sender,
            updatedAt: uint64(block.timestamp)
        });

        emit MandateRejected(mandateId, mandateHash, rejectionHash, msg.sender);
    }
}

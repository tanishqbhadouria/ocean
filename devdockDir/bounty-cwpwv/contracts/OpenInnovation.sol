// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract OpenInnovation is Ownable, ReentrancyGuard {
    struct Project {
        string name;
        string description;
        string githubUrl;
        string telegramId;
        address submitter;
        bool approved;
    }

    Project[] public projects;
    uint256 public bountyAmount = 50000;
    uint256 public projectsLeft = 25;
    uint256 public deadline = 1743782400; // 3/4/2025

    event ProjectSubmitted(address indexed submitter, string githubUrl, string telegramId);
    event ProjectApproved(uint256 indexed projectId);

    function submitProject(
        string memory _name,
        string memory _description,
        string memory _githubUrl,
        string memory _telegramId
    ) external nonReentrant {
        require(block.timestamp < deadline, "Submission period ended");
        require(projectsLeft > 0, "No more submissions accepted");
        
        projects.push(Project({
            name: _name,
            description: _description,
            githubUrl: _githubUrl,
            telegramId: _telegramId,
            submitter: msg.sender,
            approved: false
        }));

        emit ProjectSubmitted(msg.sender, _githubUrl, _telegramId);
        projectsLeft--;
    }

    function approveProject(uint256 _projectId) external onlyOwner {
        require(_projectId < projects.length, "Invalid project ID");
        require(!projects[_projectId].approved, "Project already approved");

        projects[_projectId].approved = true;
        emit ProjectApproved(_projectId);
    }

    function getProject(uint256 _projectId) external view returns (Project memory) {
        require(_projectId < projects.length, "Invalid project ID");
        return projects[_projectId];
    }

    function getProjectsCount() external view returns (uint256) {
        return projects.length;
    }
}
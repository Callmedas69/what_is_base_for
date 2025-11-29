// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./WhatIsBaseForPhrases.sol";

/**
 * @title WhatIsBaseForPhrasesRegistry
 * @notice Manages phrases for WhatIsBaseFor NFT collection
 * @dev Uses WhatIsBaseForPhrases library for base phrases (1-299), supports adding new phrases
 */
contract WhatIsBaseForPhrasesRegistry is Ownable {
    // Storage for new phrases added after deployment
    mapping(uint256 => string) private _newPhrases;
    uint256 private _totalPhrases = 299; // 299 phrases in library

    // Events
    event PhraseAdded(uint256 indexed phraseId, string phrase);

    // Errors
    error InvalidPhraseId();
    error EmptyPhrase();

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Get phrase by ID
     * @param phraseId The phrase ID
     * @return The phrase string
     */
    function getPhrase(uint256 phraseId) external view returns (string memory) {
        if (phraseId == 0 || phraseId > _totalPhrases) revert InvalidPhraseId();

        // Use library for original 299 phrases
        if (phraseId <= 299) {
            return WhatIsBaseForPhrases.getPhrase(phraseId);
        }

        // Use storage for new phrases
        return _newPhrases[phraseId];
    }

    /**
     * @notice Add multiple new phrases in batch (owner only)
     * @param phrases Array of phrases to add
     * @return phraseIds Array of IDs for the newly added phrases
     */
    function addPhrases(string[] calldata phrases) external onlyOwner returns (uint256[] memory phraseIds) {
        phraseIds = new uint256[](phrases.length);

        for (uint256 i = 0; i < phrases.length; i++) {
            if (bytes(phrases[i]).length == 0) revert EmptyPhrase();

            _totalPhrases++;
            phraseIds[i] = _totalPhrases;
            _newPhrases[_totalPhrases] = phrases[i];

            emit PhraseAdded(_totalPhrases, phrases[i]);
        }
    }

    /**
     * @notice Get total number of phrases
     * @return Total phrase count
     */
    function totalPhrases() external view returns (uint256) {
        return _totalPhrases;
    }
}

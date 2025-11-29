// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

import "./interfaces/IWhatIsBaseForAssets.sol";

interface IWhatIsBaseForPhrasesRegistry {
    function getPhrase(uint256 phraseId) external view returns (string memory);
    function totalPhrases() external view returns (uint256);
}

interface IWhatIsBaseForRenderer {
    function buildSVG(
        string memory phrase1,
        string memory phrase2,
        string memory phrase3,
        string memory textColor1,
        string memory textColor2,
        string memory textColor3
    ) external view returns (string memory);

    function buildStaticSVG(
        string memory phrase1,
        string memory textColor1
    ) external view returns (string memory);
}

contract WhatIsBaseFor is ERC721Enumerable, Ownable, ReentrancyGuard, Pausable {
    using Strings for uint256;

    // --- Constants & State Variables ---
    uint256 public MAX_MINT = 20;
    uint256 public MAX_SUPPLY = 50000;
    uint256 private _nextTokenId = 0;

    // ERC2981 Royalty (basis points: 500 = 5%)
    uint96 public royaltyBasisPoints = 500;

    IWhatIsBaseForPhrasesRegistry public immutable phrasesContract;
    IWhatIsBaseForRenderer public renderer;
    IWhatIsBaseForAssets public assets;

    // Custom phrase overrides per token [phrase1, phrase2, phrase3]
    mapping(uint256 => string[3]) private _customPhrases;

    // Track mints per wallet (separate limits for each mint type)
    mapping(address => uint256) public mintedRegularPerWallet; // Max 3
    mapping(address => uint256) public mintedCustomPerWallet; // Max 20

    // --- Events ---
    event Minted(address indexed to, uint256 indexed tokenId, string phrase);
    event MintedCustom(address indexed to, uint256 indexed tokenId);
    event Withdrawn(address indexed to, uint256 amount);

    // --- Errors ---
    error SoldOut();
    error MaxMintsReached();
    error WithdrawFailed();
    error NonexistentToken();
    error InvalidPhrase();

    constructor(
        address _phrasesContract,
        address _initialRecipient
    ) ERC721("WhatIsBaseFor", "WIBF") Ownable(msg.sender) {
        require(
            _phrasesContract != address(0),
            "Invalid phrases contract address"
        );
        require(_initialRecipient != address(0), "Invalid recipient address");
        phrasesContract = IWhatIsBaseForPhrasesRegistry(_phrasesContract);

        // Set custom phrases for token #0
        _customPhrases[0] = ["[ME]", "[YOU]", "[ALL OF US]"];

        // Initial mint: 20 NFTs to specified recipient (tokens #0-19)
        uint256 initialMintCount = 20;
        require(
            _nextTokenId + initialMintCount <= MAX_SUPPLY,
            "Initial mint exceeds max supply"
        );

        for (uint256 i = 0; i < initialMintCount; i++) {
            uint256 tokenId = _nextTokenId;
            _nextTokenId++;

            _safeMint(_initialRecipient, tokenId);

            // Emit event with appropriate phrase (first phrase only for event)
            string memory emitPhrase;
            if (tokenId == 0) {
                emitPhrase = "[me]";
            } else {
                uint256 phraseId = ((tokenId - 1) %
                    phrasesContract.totalPhrases()) + 1;
                emitPhrase = phrasesContract.getPhrase(phraseId);
            }

            emit Minted(_initialRecipient, tokenId, emitPhrase);
        }
    }

    // --- Mint ---
    function mint() external nonReentrant whenNotPaused {
        if (_nextTokenId >= MAX_SUPPLY) revert SoldOut();
        if (mintedRegularPerWallet[msg.sender] >= 3) revert MaxMintsReached();

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        mintedRegularPerWallet[msg.sender]++;

        _safeMint(msg.sender, tokenId);

        // Emit event with first phrase (3 phrases will be generated algorithmically in tokenURI)
        uint256 phraseId = ((tokenId - 1) % phrasesContract.totalPhrases()) + 1;
        emit Minted(msg.sender, tokenId, phrasesContract.getPhrase(phraseId));
    }

    /**
     * @notice Mint NFT with custom user-provided phrases
     * @dev Phrases are immutable after mint. Max 64 chars each. Empty strings will use random phrases.
     * @param phrase1 First phrase (empty or 1-64 chars)
     * @param phrase2 Second phrase (empty or 1-64 chars)
     * @param phrase3 Third phrase (empty or 1-64 chars)
     */
    function mintWithCustomPhrases(
        string calldata phrase1,
        string calldata phrase2,
        string calldata phrase3
    ) external nonReentrant whenNotPaused {
        if (_nextTokenId >= MAX_SUPPLY) revert SoldOut();
        if (mintedCustomPerWallet[msg.sender] >= 20) revert MaxMintsReached();

        // Count non-empty phrases and validate lengths (max 20 chars)
        uint256 customCount = 0;
        if (bytes(phrase1).length > 0) {
            if (bytes(phrase1).length > 20) revert InvalidPhrase();
            customCount++;
        }
        if (bytes(phrase2).length > 0) {
            if (bytes(phrase2).length > 20) revert InvalidPhrase();
            customCount++;
        }
        if (bytes(phrase3).length > 0) {
            if (bytes(phrase3).length > 20) revert InvalidPhrase();
            customCount++;
        }

        // Require at least one custom phrase
        if (customCount == 0) revert InvalidPhrase();

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        mintedCustomPerWallet[msg.sender]++;

        // Store all phrases (empty strings will be filled with random in _getThreePhrases)
        _customPhrases[tokenId] = [phrase1, phrase2, phrase3];

        _safeMint(msg.sender, tokenId);

        emit MintedCustom(msg.sender, tokenId);
    }

    // --- Withdraw ---
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) revert WithdrawFailed();

        emit Withdrawn(owner(), balance);
    }

    // --- Pause/Unpause ---
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // --- Parameter Setters ---
    function setMaxMint(uint256 _max) external onlyOwner {
        MAX_MINT = _max;
    }

    function setMaxSupply(uint256 _supply) external onlyOwner {
        require(
            _supply >= _nextTokenId,
            "Cannot set supply below current token ID"
        );
        MAX_SUPPLY = _supply;
    }

    function setRenderer(address _renderer) external onlyOwner {
        require(_renderer != address(0), "Invalid renderer address");
        renderer = IWhatIsBaseForRenderer(_renderer);
    }

    function setAssets(address _assets) external onlyOwner {
        require(_assets != address(0), "Invalid assets address");
        assets = IWhatIsBaseForAssets(_assets);
    }

    function setTokenPhrases(
        uint256 tokenId,
        string calldata phrase1,
        string calldata phrase2,
        string calldata phrase3
    ) external onlyOwner {
        _customPhrases[tokenId] = [phrase1, phrase2, phrase3];
    }

    // --- View Functions ---

    /**
     * @notice Contract-level metadata for OpenSea and other platforms
     * @return Contract metadata as base64-encoded JSON
     */
    function contractURI() external view returns (string memory) {
        bytes memory json = abi.encodePacked(
            "{",
            '"name":"What is Base for?",',
            '"description":"Turns words into identity, and phrases into home",',
            '"seller_fee_basis_points":',
            uint256(royaltyBasisPoints).toString(),
            ",",
            '"fee_recipient":"',
            Strings.toHexString(uint160(owner()), 20),
            '"',
            "}"
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(json)
                )
            );
    }

    // --- ERC2981 Royalty ---

    /**
     * @notice ERC2981 royalty info
     * @param salePrice Sale price of the token
     * @return receiver Address to receive royalties (owner)
     * @return royaltyAmount Amount of royalty to pay
     */
    function royaltyInfo(
        uint256 /* tokenId */,
        uint256 salePrice
    ) external view returns (address receiver, uint256 royaltyAmount) {
        receiver = owner();
        royaltyAmount = (salePrice * royaltyBasisPoints) / 10000;
    }

    /**
     * @notice Set royalty percentage (owner only)
     * @param _basisPoints Basis points (100 = 1%, max 1000 = 10%)
     */
    function setRoyalty(uint96 _basisPoints) external onlyOwner {
        require(_basisPoints <= 1000, "Max royalty is 10%");
        royaltyBasisPoints = _basisPoints;
    }

    /**
     * @notice ERC165 interface support
     * @dev Supports ERC721, ERC721Enumerable, ERC721Metadata, ERC2981, and ERC173 (Ownable)
     * @param interfaceId Interface identifier
     * @return True if interface is supported
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721Enumerable) returns (bool) {
        return
            interfaceId == type(IERC2981).interfaceId ||
            interfaceId == 0x7f5828d0 || // ERC173 (Ownable)
            super.supportsInterface(interfaceId);
    }

    // --- Owner Batch Mint ---

    /**
     * @notice Owner batch mint (bypasses payment and MAX_MINT limit)
     * @param recipients Array of addresses to mint to
     */
    function ownersMint(
        address[] calldata recipients
    ) external onlyOwner nonReentrant {
        uint256 quantity = recipients.length;
        require(_nextTokenId + quantity <= MAX_SUPPLY, "Exceeds max supply");

        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId;
            _nextTokenId++;

            _safeMint(recipients[i], tokenId);

            // Emit event with first phrase (3 phrases will be generated algorithmically in tokenURI)
            uint256 phraseId = ((tokenId - 1) %
                phrasesContract.totalPhrases()) + 1;
            emit Minted(
                recipients[i],
                tokenId,
                phrasesContract.getPhrase(phraseId)
            );
        }
    }

    // --- Metadata ---
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert NonexistentToken();

        // Get 3 phrases and 3 colors using modulo pattern
        (
            string memory p1,
            string memory p2,
            string memory p3
        ) = _getThreePhrases(tokenId);
        (
            string memory c1,
            string memory c2,
            string memory c3
        ) = _getThreeColors(tokenId);

        // Build animated SVG using external renderer
        string memory animatedSvg = renderer.buildSVG(p1, p2, p3, c1, c2, c3);
        string memory animatedSvgBase64 = Base64.encode(bytes(animatedSvg));

        // Build static SVG for image (thumbnail) using renderer
        string memory staticSvg = renderer.buildStaticSVG(p1, c1);
        string memory staticSvgBase64 = Base64.encode(bytes(staticSvg));

        bytes memory json = abi.encodePacked(
            "{",
            '"name":"WIBF #',
            tokenId.toString(),
            '",',
            '"description":"Turns words into identity, and phrases into home",',
            '"attributes":[',
            _buildAttributes(p1, p2, p3, c1, c2, c3),
            "],",
            '"image":"data:image/svg+xml;base64,',
            staticSvgBase64,
            '",',
            '"animation_url":"data:image/svg+xml;base64,',
            animatedSvgBase64,
            '"',
            "}"
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(json)
                )
            );
    }

    function _buildAttributes(
        string memory p1,
        string memory p2,
        string memory p3,
        string memory c1,
        string memory c2,
        string memory c3
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '{"trait_type":"Phrase 1","value":"',
                    p1,
                    '"},',
                    '{"trait_type":"Phrase 2","value":"',
                    p2,
                    '"},',
                    '{"trait_type":"Phrase 3","value":"',
                    p3,
                    '"},',
                    '{"trait_type":"Color 1","value":"',
                    c1,
                    '"},',
                    '{"trait_type":"Color 2","value":"',
                    c2,
                    '"},',
                    '{"trait_type":"Color 3","value":"',
                    c3,
                    '"}'
                )
            );
    }

    // --- Helper Functions ---

    /**
     * @notice Get 3 deterministic phrases for a token using modulo pattern
     * @dev Uses prime multipliers to ensure varied distribution. Empty custom phrases use random.
     */
    function _getThreePhrases(
        uint256 tokenId
    )
        internal
        view
        returns (
            string memory phrase1,
            string memory phrase2,
            string memory phrase3
        )
    {
        uint256 total = phrasesContract.totalPhrases();
        uint256[3] memory primes = [uint256(7), 13, 23];

        // For each position, use custom if exists, otherwise random
        for (uint256 i = 0; i < 3; i++) {
            if (bytes(_customPhrases[tokenId][i]).length > 0) {
                if (i == 0) phrase1 = _customPhrases[tokenId][i];
                else if (i == 1) phrase2 = _customPhrases[tokenId][i];
                else phrase3 = _customPhrases[tokenId][i];
            } else {
                string memory randomPhrase = phrasesContract.getPhrase(
                    ((tokenId * primes[i]) % total) + 1
                );
                if (i == 0) phrase1 = randomPhrase;
                else if (i == 1) phrase2 = randomPhrase;
                else phrase3 = randomPhrase;
            }
        }
    }

    /**
     * @notice Get 3 deterministic colors for a token using modulo pattern
     */
    function _getThreeColors(
        uint256 tokenId
    )
        internal
        view
        returns (
            string memory color1,
            string memory color2,
            string memory color3
        )
    {
        uint256 len = assets.textColorsCount();

        // Token #0 gets special colors (blue, yellow, red)
        if (tokenId == 0) {
            return ("#0000FF", "#FFD12F", "#FC401F");
        }

        color1 = assets.getTextColor((tokenId * 3) % len);
        color2 = assets.getTextColor((tokenId * 5) % len);
        color3 = assets.getTextColor((tokenId * 11) % len);
    }
}

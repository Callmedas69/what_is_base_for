// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

interface IBaseforPhrasesRegistry {
    function getPhrase(uint256 phraseId) external view returns (string memory);
    function totalPhrases() external view returns (uint256);
}

interface IBaseforRenderer {
    function buildHTML(
        string memory phrase1,
        string memory phrase2,
        string memory phrase3,
        string memory textColor1,
        string memory textColor2,
        string memory textColor3
    ) external view returns (string memory);
}

contract Basefor is ERC721Enumerable, Ownable, ReentrancyGuard, Pausable {
    using Strings for uint256;

    // --- Constants & State Variables ---
    uint256 public MAX_MINT = 20;
    uint256 public MAX_SUPPLY = 50000;
    uint256 private _nextTokenId = 0;

    // ERC2981 Royalty (basis points: 500 = 5%)
    uint96 public royaltyBasisPoints = 500;

    IBaseforPhrasesRegistry public immutable phrasesContract;
    IBaseforRenderer public renderer;

    // Text colors for rolling animation (8 colors)
    string[8] private _textColors = [
        "#0000FF",
        "#3c8aff",
        "#b8a581",
        "#ffd12f",
        "#66c800",
        "#b6f569",
        "#fc401f",
        "#fea8cd"
    ];

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
    ) ERC721("Basefor", "BASEFOR") Ownable(msg.sender) {
        require(
            _phrasesContract != address(0),
            "Invalid phrases contract address"
        );
        require(_initialRecipient != address(0), "Invalid recipient address");
        phrasesContract = IBaseforPhrasesRegistry(_phrasesContract);

        // Set custom phrases for token #0
        _customPhrases[0] = ["{me}", "{you}", "{all of us}"];

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
                emitPhrase = "{me}";
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

        // Count non-empty phrases and validate lengths
        uint256 customCount = 0;
        if (bytes(phrase1).length > 0) {
            if (bytes(phrase1).length > 64) revert InvalidPhrase();
            customCount++;
        }
        if (bytes(phrase2).length > 0) {
            if (bytes(phrase2).length > 64) revert InvalidPhrase();
            customCount++;
        }
        if (bytes(phrase3).length > 0) {
            if (bytes(phrase3).length > 64) revert InvalidPhrase();
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
        renderer = IBaseforRenderer(_renderer);
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
            '"name":"Basefor",',
            '"description":"A fully onchain collection of base spirits",',
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

        // Build animated HTML using external renderer
        string memory html = renderer.buildHTML(p1, p2, p3, c1, c2, c3);
        string memory htmlBase64 = Base64.encode(bytes(html));

        // Build static SVG for image (thumbnail) - white background, first phrase, first color
        string memory svg = _buildSVGImage(p1, c1);
        string memory svgBase64 = Base64.encode(bytes(svg));

        bytes memory json = abi.encodePacked(
            "{",
            '"name":"Basefor #',
            tokenId.toString(),
            '",',
            '"description":"A fully onchain collection of base spirits",',
            '"attributes":[',
            _buildAttributes(p1, p2, p3, c1, c2, c3),
            "],",
            '"image":"data:image/svg+xml;base64,',
            svgBase64,
            '",',
            '"animation_url":"data:text/html;base64,',
            htmlBase64,
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

    // OLD IMPLEMENTATION - Commented out due to size (>50 KB) causing Blockscout timeout
    // This version used cloud masks with 15 ellipses + patterns which made the SVG too large
    // Replaced with optimized version below (3.9 KB) for better explorer compatibility
    /*
    function _buildSVGImage(
        string memory phrase,
        string memory textColor
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">',
                    _buildSVGDefs(),
                    '<rect width="512" height="512" fill="#FFFFFF"/>',
                    '<rect width="512" height="512" fill="url(#lines)" mask="url(#cloudMask)"/>',
                    _buildLogo(),
                    '<text x="256" y="280" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="24" style="text-transform:lowercase" fill="',
                    textColor,
                    '">',
                    _escapeForHTML(phrase),
                    "</text></svg>"
                )
            );
    }

    function _buildSVGDefs() internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "<defs>",
                    '<pattern id="lines" width="4" height="512" patternUnits="userSpaceOnUse">',
                    '<rect x="3" width="1" height="512" fill="rgba(0,0,0,0.05)"/>',
                    "</pattern>",
                    '<mask id="cloudMask">',
                    '<ellipse cx="256" cy="164" rx="120" ry="100" fill="white"/>',
                    '<ellipse cx="246" cy="205" rx="140" ry="110" fill="white"/>',
                    '<ellipse cx="282" cy="142" rx="100" ry="85" fill="white"/>',
                    '<ellipse cx="26" cy="230" rx="100" ry="80" fill="white"/>',
                    '<ellipse cx="61" cy="282" rx="130" ry="100" fill="white"/>',
                    '<ellipse cx="471" cy="215" rx="110" ry="85" fill="white"/>',
                    '<ellipse cx="450" cy="266" rx="140" ry="105" fill="white"/>',
                    '<ellipse cx="102" cy="333" rx="160" ry="120" fill="white"/>',
                    '<ellipse cx="256" cy="317" rx="180" ry="130" fill="white"/>',
                    '<ellipse cx="410" cy="333" rx="150" ry="110" fill="white"/>',
                    '<ellipse cx="0" cy="435" rx="200" ry="140" fill="white"/>',
                    '<ellipse cx="102" cy="461" rx="220" ry="150" fill="white"/>',
                    '<ellipse cx="256" cy="471" rx="230" ry="160" fill="white"/>',
                    '<ellipse cx="410" cy="450" rx="210" ry="150" fill="white"/>',
                    '<ellipse cx="512" cy="461" rx="200" ry="140" fill="white"/>',
                    "</mask></defs>"
                )
            );
    }
    */

    // OPTIMIZED IMPLEMENTATION - Minimal preview SVG for Blockscout compatibility
    // Design: "base.is" logo + dynamic phrase below
    // Size: ~3 KB Base64
    function _buildSVGImage(
        string memory phrase,
        string memory textColor
    ) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">',
                    // White background
                    '<rect width="512" height="512" fill="#FFFFFF"/>',
                    // Wrapper group with slight left offset
                    '<g transform="translate(-10, 0)">',
                    // Base logo
                    _buildLogo(),
                    // Static ".is" text after logo
                    '<text x="291" y="232.4" text-anchor="middle" font-family="sans-serif" font-size="15" font-weight="900" fill="#000">.is</text>',
                    "</g>",
                    // Dynamic phrase below logo
                    '<text x="256" y="260" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="800" fill="',
                    textColor,
                    '">',
                    _escapeForHTML(phrase),
                    "</text></svg>"
                )
            );
    }

    // Base logo for static image
    function _buildLogo() internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<g transform="translate(231, 220) scale(0.14)">',
                    '<path d="M122.604 89.6974C115.697 89.6974 109.041 87.1857 105.148 80.5299H102.887V87.8137H87.1895V1.16162H102.887V32.6829H105.148C109.166 25.7758 116.701 23.1386 123.483 23.1386C140.436 23.1386 151.865 36.7015 151.865 55.7901C151.865 75.2554 139.306 89.6974 122.604 89.6974ZM119.213 75.6321C128.883 75.6321 135.79 67.7204 135.79 56.418C135.79 45.1156 128.757 37.2038 119.213 37.2038C109.794 37.2038 102.887 44.7388 102.887 56.418C102.887 68.0972 109.794 75.6321 119.213 75.6321ZM180.874 89.6974C168.818 89.6974 159.023 82.4136 159.023 70.4833C159.023 56.418 169.823 51.897 182.883 50.5156L201.344 48.6319V45.1156C201.344 39.7155 196.949 35.948 189.163 35.948C181.753 35.948 177.483 39.2132 176.102 44.1109H161.032C162.539 32.1805 172.46 23.1386 189.163 23.1386C205.237 23.1386 215.912 30.9247 215.912 46.1202V76.7624C215.912 80.6555 216.288 86.0555 216.54 87.5625V87.8137H201.47C201.344 85.6788 201.344 83.6694 201.344 81.5345H199.084C195.191 87.8137 188.409 89.6974 180.874 89.6974ZM185.144 77.8926C195.442 77.8926 201.344 70.1065 201.344 62.1948V59.0552L187.53 60.6878C178.99 61.6925 174.846 64.2041 174.846 69.7298C174.846 74.8786 179.116 77.8926 185.144 77.8926ZM253.586 89.6974C237.763 89.6974 226.461 81.7857 224.702 69.353H240.149C241.907 74.8786 247.684 77.2647 253.712 77.2647C259.866 77.2647 264.889 74.6275 264.889 69.9809C264.889 65.3344 260.117 64.0785 253.586 62.9483L246.931 61.8181C234.372 59.6831 226.586 54.4087 226.586 43.1062C226.586 30.7991 237.386 23.1386 252.331 23.1386C266.898 23.1386 276.568 29.9201 279.205 41.7248H264.135C262.377 37.0783 257.731 35.1945 252.456 35.1945C246.051 35.1945 241.907 37.9573 241.907 41.8504C241.907 45.8691 245.172 47.1249 251.954 48.2551L258.61 49.3854C270.791 51.3947 280.084 56.418 280.084 68.5995C280.084 81.9113 269.033 89.6974 253.586 89.6974ZM319.392 89.6974C300.052 89.6974 287.243 76.5112 287.243 56.2924C287.243 36.4504 300.806 23.1386 319.517 23.1386C339.108 23.1386 350.411 37.7062 350.411 56.9203V59.6831H302.564C303.317 70.1065 310.601 76.2601 319.392 76.2601C326.676 76.2601 331.071 73.7484 333.206 69.353H349.28C346.015 81.1578 334.336 89.6974 319.392 89.6974ZM335.09 49.2598C333.834 40.8457 327.178 35.948 319.392 35.948C311.229 35.948 304.322 40.7202 302.815 49.2598H335.09Z" fill="#0A0B0D"/>',
                    '<path d="M4.02139 87.8138C1.50973 87.8138 0.253906 86.558 0.253906 84.0463V28.7899C0.253906 26.2783 1.50973 25.0225 4.02139 25.0225H59.2778C61.7894 25.0225 63.0452 26.2783 63.0452 28.7899V84.0463C63.0452 86.558 61.7894 87.8138 59.2778 87.8138H4.02139Z" fill="#0000FF"/>',
                    "</g>"
                )
            );
    }

    // Minimal escaping for characters that break HTML (&, <, >, ", ')
    function _escapeForHTML(
        string memory value
    ) internal pure returns (string memory) {
        bytes memory s = bytes(value);
        bytes memory out = new bytes(s.length * 6); // worst case (&quot;)
        uint256 j;

        for (uint256 i = 0; i < s.length; i++) {
            bytes1 c = s[i];
            if (c == bytes1("&")) {
                out[j++] = bytes1("&");
                out[j++] = bytes1("a");
                out[j++] = bytes1("m");
                out[j++] = bytes1("p");
                out[j++] = bytes1(";");
            } else if (c == bytes1("<")) {
                out[j++] = bytes1("&");
                out[j++] = bytes1("l");
                out[j++] = bytes1("t");
                out[j++] = bytes1(";");
            } else if (c == bytes1(">")) {
                out[j++] = bytes1("&");
                out[j++] = bytes1("g");
                out[j++] = bytes1("t");
                out[j++] = bytes1(";");
            } else if (c == bytes1('"')) {
                out[j++] = bytes1("&");
                out[j++] = bytes1("q");
                out[j++] = bytes1("u");
                out[j++] = bytes1("o");
                out[j++] = bytes1("t");
                out[j++] = bytes1(";");
            } else if (c == bytes1("'")) {
                out[j++] = bytes1("&");
                out[j++] = bytes1("#");
                out[j++] = bytes1("3");
                out[j++] = bytes1("9");
                out[j++] = bytes1(";");
            } else {
                out[j++] = c;
            }
        }

        assembly {
            mstore(out, j)
        }
        return string(out);
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
        // Token #0 gets special colors: blue, lighter blue, tan/beige
        if (tokenId == 0) {
            return (
                _textColors[0], // blue (#0000FF)
                _textColors[1], // lighter blue (#3c8aff)
                _textColors[6] // red (#fc401f)
            );
        }

        uint256 len = _textColors.length;
        color1 = _textColors[(tokenId * 3) % len];
        color2 = _textColors[(tokenId * 5) % len];
        color3 = _textColors[(tokenId * 11) % len];
    }
}

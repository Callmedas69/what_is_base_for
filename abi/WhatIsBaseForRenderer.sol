// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IWhatIsBaseForAssets.sol";

/**
 * @title WhatIsBaseForRenderer
 * @notice Builds pure SVG animation for WhatIsBaseFor NFTs
 * @dev Uses WhatIsBaseForAssets for CSS keyframes and embedded Doto font
 */
contract WhatIsBaseForRenderer {
    IWhatIsBaseForAssets public immutable assets;

    constructor(address _assets) {
        assets = IWhatIsBaseForAssets(_assets);
    }

    /**
     * @notice Build complete SVG for NFT animation
     * @param phrase1 First phrase for rolling animation
     * @param phrase2 Second phrase for rolling animation
     * @param phrase3 Third phrase for rolling animation
     * @param textColor1 First text color
     * @param textColor2 Second text color
     * @param textColor3 Third text color
     * @return Complete SVG string
     */
    function buildSVG(
        string memory phrase1,
        string memory phrase2,
        string memory phrase3,
        string memory textColor1,
        string memory textColor2,
        string memory textColor3
    ) external view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="auto" font-family="Roboto">',
                    '<style>', assets.getCSS(), '</style>',
                    _buildGrid(),
                    _buildLogo(),
                    _buildPill(),
                    _buildPhrases(phrase1, phrase2, phrase3, textColor1, textColor2, textColor3),
                    _buildTagline(),
                    '</svg>'
                )
            );
    }

    /**
     * @notice Build static SVG for NFT (no animations, no grid, phrase 1 only)
     * @param phrase1 The phrase to display
     * @param textColor1 Text color for the phrase
     * @return Complete static SVG string
     */
    function buildStaticSVG(
        string memory phrase1,
        string memory textColor1
    ) external view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="auto" font-family="Roboto">',
                    '<style>', assets.getStaticCSS(), '</style>',
                    _buildLogo(),
                    _buildPill(),
                    _buildStaticPhrase(phrase1, textColor1),
                    _buildTagline(),
                    '</svg>'
                )
            );
    }

    function _buildGrid() internal pure returns (string memory) {
        return string(abi.encodePacked(
            _buildGridRow(0, "0"),
            _buildGridRow(1, "51.2"),
            _buildGridRow(2, "102.4"),
            _buildGridRow(3, "153.6"),
            _buildGridRow(4, "204.8"),
            _buildGridRow(5, "256"),
            _buildGridRow(6, "307.2"),
            _buildGridRow(7, "358.4"),
            _buildGridRow(8, "409.6"),
            _buildGridRow(9, "460.8")
        ));
    }

    function _buildGridRow(uint256 rowIndex, string memory y) internal pure returns (string memory) {
        uint256 baseColorIndex = (rowIndex * 10) % 16;

        return string(abi.encodePacked(
            _buildCell("0", y, (baseColorIndex + 0) % 16),
            _buildCell("51.2", y, (baseColorIndex + 1) % 16),
            _buildCell("102.4", y, (baseColorIndex + 2) % 16),
            _buildCell("153.6", y, (baseColorIndex + 3) % 16),
            _buildCell("204.8", y, (baseColorIndex + 4) % 16),
            _buildCell("256", y, (baseColorIndex + 5) % 16),
            _buildCell("307.2", y, (baseColorIndex + 6) % 16),
            _buildCell("358.4", y, (baseColorIndex + 7) % 16),
            _buildCell("409.6", y, (baseColorIndex + 8) % 16),
            _buildCell("460.8", y, (baseColorIndex + 9) % 16)
        ));
    }

    function _buildCell(string memory x, string memory y, uint256 colorIndex) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<rect class="cell c', _uint256ToString(colorIndex), '" x="', x, '" y="', y, '" width="51.2" height="51.2"/>'
        ));
    }

    function _buildLogo() internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<g transform="translate(50,50) scale(0.3)">',
            '<path d="M122.604 89.6974C115.697 89.6974 109.041 87.1857 105.148 80.5299H102.887V87.8137H87.1895V1.16162H102.887V32.6829H105.148C109.166 25.7758 116.701 23.1386 123.483 23.1386C140.436 23.1386 151.865 36.7015 151.865 55.7901C151.865 75.2554 139.306 89.6974 122.604 89.6974ZM119.213 75.6321C128.883 75.6321 135.79 67.7204 135.79 56.418C135.79 45.1156 128.757 37.2038 119.213 37.2038C109.794 37.2038 102.887 44.7388 102.887 56.418C102.887 68.0972 109.794 75.6321 119.213 75.6321ZM180.874 89.6974C168.818 89.6974 159.023 82.4136 159.023 70.4833C159.023 56.418 169.823 51.897 182.883 50.5156L201.344 48.6319V45.1156C201.344 39.7155 196.949 35.948 189.163 35.948C181.753 35.948 177.483 39.2132 176.102 44.1109H161.032C162.539 32.1805 172.46 23.1386 189.163 23.1386C205.237 23.1386 215.912 30.9247 215.912 46.1202V76.7624C215.912 80.6555 216.288 86.0555 216.54 87.5625V87.8137H201.47C201.344 85.6788 201.344 83.6694 201.344 81.5345H199.084C195.191 87.8137 188.409 89.6974 180.874 89.6974ZM185.144 77.8926C195.442 77.8926 201.344 70.1065 201.344 62.1948V59.0552L187.53 60.6878C178.99 61.6925 174.846 64.2041 174.846 69.7298C174.846 74.8786 179.116 77.8926 185.144 77.8926ZM253.586 89.6974C237.763 89.6974 226.461 81.7857 224.702 69.353H240.149C241.907 74.8786 247.684 77.2647 253.712 77.2647C259.866 77.2647 264.889 74.6275 264.889 69.9809C264.889 65.3344 260.117 64.0785 253.586 62.9483L246.931 61.8181C234.372 59.6831 226.586 54.4087 226.586 43.1062C226.586 30.7991 237.386 23.1386 252.331 23.1386C266.898 23.1386 276.568 29.9201 279.205 41.7248H264.135C262.377 37.0783 257.731 35.1945 252.456 35.1945C246.051 35.1945 241.907 37.9573 241.907 41.8504C241.907 45.8691 245.172 47.1249 251.954 48.2551L258.61 49.3854C270.791 51.3947 280.084 56.418 280.084 68.5995C280.084 81.9113 269.033 89.6974 253.586 89.6974ZM319.392 89.6974C300.052 89.6974 287.243 76.5112 287.243 56.2924C287.243 36.4504 300.806 23.1386 319.517 23.1386C339.108 23.1386 350.411 37.7062 350.411 56.9203V59.6831H302.564C303.317 70.1065 310.601 76.2601 319.392 76.2601C326.676 76.2601 331.071 73.7484 333.206 69.353H349.28C346.015 81.1578 334.336 89.6974 319.392 89.6974ZM335.09 49.2598C333.834 40.8457 327.178 35.948 319.392 35.948C311.229 35.948 304.322 40.7202 302.815 49.2598H335.09Z" fill="#0A0B0D"/>',
            '<path d="M4.02139 87.8138C1.50973 87.8138 0.253906 86.558 0.253906 84.0463V28.7899C0.253906 26.2783 1.50973 25.0225 4.02139 25.0225H59.2778C61.7894 25.0225 63.0452 26.2783 63.0452 28.7899V84.0463C63.0452 86.558 61.7894 87.8138 59.2778 87.8138H4.02139Z" fill="#0000FF"/>',
            '</g>'
        ));
    }

    function _buildPill() internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<g transform="scale(0.4) translate(920,140)">',
            '<rect x="0" y="0" width="250" height="60" rx="30" fill="none" stroke="#000" stroke-width="2"/>',
            '<text x="125" y="38" font-size="28" text-anchor="middle" font-weight="500">GEOART.STUDIO</text>',
            '</g>'
        ));
    }

    function _buildPhrases(
        string memory phrase1,
        string memory phrase2,
        string memory phrase3,
        string memory textColor1,
        string memory textColor2,
        string memory textColor3
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<svg width="500" height="45" x="2%" y="47%" overflow="hidden" text-anchor="middle">',
            "<g class=\"rotator\" font-size=\"40\" font-family=\"Doto\">",
            '<text x="50%" y="40" text-anchor="middle" fill="', textColor1, '">', phrase1, '</text>',
            '<text x="50%" y="85" text-anchor="middle" fill="', textColor2, '">', phrase2, '</text>',
            '<text x="50%" y="130" text-anchor="middle" fill="', textColor3, '">', phrase3, '</text>',
            '</g></svg>'
        ));
    }

    function _buildStaticPhrase(
        string memory phrase1,
        string memory textColor1
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '<text x="50%" y="50%" font-size="40" font-family="Doto" text-anchor="middle" fill="', textColor1, '">', phrase1, '</text>'
        ));
    }

    function _buildTagline() internal pure returns (string memory) {
        return '<text x="50%" y="95%" font-size="10" text-anchor="middle" fill="#8A8A8A" letter-spacing="2">TURNS WORDS INTO IDENTITY, AND PHRASES INTO HOME</text>';
    }

    function _uint256ToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";

        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @notice Get assets contract address
     */
    function getAssetsAddress() external view returns (address) {
        return address(assets);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PriceOracle
 * @dev Oracle contract for feeding cryptocurrency prices from CoinGecko
 */
contract PriceOracle is Ownable {
    // Mapping from cryptocurrency symbol to latest price
    mapping(string => uint256) public prices;
    mapping(string => uint256) public lastUpdated;
    
    // Authorized price feeders
    mapping(address => bool) public authorizedFeeders;
    
    // Events
    event PriceUpdated(string indexed cryptocurrency, uint256 price, uint256 timestamp);
    event FeederAuthorized(address indexed feeder, bool authorized);
    
    modifier onlyAuthorizedFeeder() {
        require(authorizedFeeders[msg.sender] || msg.sender == owner(), "Not authorized feeder");
        _;
    }
    
    constructor() {
        authorizedFeeders[msg.sender] = true;
    }
    
    /**
     * @dev Update price for a cryptocurrency
     */
    function updatePrice(string memory _cryptocurrency, uint256 _price) external onlyAuthorizedFeeder {
        require(_price > 0, "Invalid price");
        
        prices[_cryptocurrency] = _price;
        lastUpdated[_cryptocurrency] = block.timestamp;
        
        emit PriceUpdated(_cryptocurrency, _price, block.timestamp);
    }
    
    /**
     * @dev Batch update prices
     */
    function batchUpdatePrices(
        string[] memory _cryptocurrencies, 
        uint256[] memory _prices
    ) external onlyAuthorizedFeeder {
        require(_cryptocurrencies.length == _prices.length, "Array length mismatch");
        
        for (uint256 i = 0; i < _cryptocurrencies.length; i++) {
            if (_prices[i] > 0) {
                prices[_cryptocurrencies[i]] = _prices[i];
                lastUpdated[_cryptocurrencies[i]] = block.timestamp;
                
                emit PriceUpdated(_cryptocurrencies[i], _prices[i], block.timestamp);
            }
        }
    }
    
    /**
     * @dev Get latest price for a cryptocurrency
     */
    function getPrice(string memory _cryptocurrency) external view returns (uint256, uint256) {
        return (prices[_cryptocurrency], lastUpdated[_cryptocurrency]);
    }
    
    /**
     * @dev Authorize/deauthorize a price feeder
     */
    function setAuthorizedFeeder(address _feeder, bool _authorized) external onlyOwner {
        authorizedFeeders[_feeder] = _authorized;
        emit FeederAuthorized(_feeder, _authorized);
    }
    
    /**
     * @dev Check if price is recent (within 1 hour)
     */
    function isPriceRecent(string memory _cryptocurrency) external view returns (bool) {
        return block.timestamp - lastUpdated[_cryptocurrency] <= 3600;
    }
}
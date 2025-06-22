// Test script to verify CoinGecko API integration
const fetch = require('node-fetch');

async function testCoinGeckoIntegration() {
  try {
    const cryptoId = 'dogecoin';
    console.log(`Testing CoinGecko API integration for: ${cryptoId}`);
    
    // Fetch data from CoinGecko API
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log("❌ Cryptocurrency not found on CoinGecko");
        return;
      }
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const coinData = await response.json();
    
    // Extract relevant data
    const cryptoData = {
      id: coinData.id,
      name: coinData.name,
      symbol: coinData.symbol.toUpperCase(),
      currentPrice: coinData.market_data?.current_price?.usd || 0,
      priceChange24h: coinData.market_data?.price_change_percentage_24h || 0,
    };

    console.log('✅ Successfully fetched cryptocurrency data:');
    console.log(JSON.stringify(cryptoData, null, 2));
    
    // Test adding to local server
    const addResponse = await fetch('http://localhost:5000/api/admin/cryptocurrencies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'test-admin=true'
      },
      body: JSON.stringify({ cryptoId })
    });
    
    console.log(`\nServer response status: ${addResponse.status}`);
    const responseText = await addResponse.text();
    console.log('Server response:', responseText);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCoinGeckoIntegration();
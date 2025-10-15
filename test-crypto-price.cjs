const axios = require('axios');

async function testCryptoPrice() {
    try {
        console.log('🔍 Testing crypto price fetching...');

        // Test CoinGecko API directly
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: 'bitcoin',
                vs_currencies: 'usd'
            },
            timeout: 10000,
            headers: {
                'User-Agent': 'Nectiq-Crypto-App/1.0'
            }
        });

        console.log('✅ CoinGecko API response:', response.data);
        const price = response.data['bitcoin']?.usd || 0;
        console.log('💰 Bitcoin price:', price);

    } catch (error) {
        console.error('❌ Error fetching crypto price:', error.message);

        // Test our internal API
        try {
            console.log('🔍 Testing internal API...');
            const internalResponse = await axios.get('http://localhost:5003/api/crypto/prices');
            console.log('✅ Internal API response length:', internalResponse.data?.length || 0);

            const bitcoin = internalResponse.data?.find(c => c.id === 'bitcoin');
            if (bitcoin) {
                console.log('💰 Bitcoin price from internal API:', bitcoin.current_price);
            }
        } catch (internalError) {
            console.error('❌ Internal API error:', internalError.message);
        }
    }
}

testCryptoPrice();

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { cryptocurrencies } from './shared/schema.ts';

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_p5N1ShuDwJBb@ep-fancy-dream-adrhujmt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const db = drizzle(pool);

// COMPLETE list of cryptocurrencies with CORRECT Pyth Feed IDs (with 0x prefix)
const fullCryptoList = [
  { 
    id: 'bitcoin', 
    symbol: 'BTC', 
    name: 'Bitcoin', 
    pythFeedId: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', 
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' 
  },
  { 
    id: 'ethereum', 
    symbol: 'ETH', 
    name: 'Ethereum', 
    pythFeedId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', 
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' 
  },
  { 
    id: 'binancecoin', 
    symbol: 'BNB', 
    name: 'BNB', 
    pythFeedId: '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f', 
    image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png' 
  },
  { 
    id: 'ripple', 
    symbol: 'XRP', 
    name: 'XRP', 
    pythFeedId: '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8', 
    image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png' 
  },
  { 
    id: 'solana', 
    symbol: 'SOL', 
    name: 'Solana', 
    pythFeedId: '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d', 
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' 
  },
  { 
    id: 'cardano', 
    symbol: 'ADA', 
    name: 'Cardano', 
    pythFeedId: '0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d', 
    image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png' 
  },
  { 
    id: 'dogecoin', 
    symbol: 'DOGE', 
    name: 'Dogecoin', 
    pythFeedId: '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c', 
    image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png' 
  },
  { 
    id: 'tron', 
    symbol: 'TRX', 
    name: 'TRON', 
    pythFeedId: '0x67aed5a24fdad045475e7195c98a98aea119c763f272d4523f5bac93a4f33c2b', 
    image: 'https://assets.coingecko.com/coins/images/1094/large/tron-logo.png' 
  },
  { 
    id: 'matic-network', 
    symbol: 'MATIC', 
    name: 'Polygon', 
    pythFeedId: '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52', 
    image: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png' 
  },
  { 
    id: 'polkadot', 
    symbol: 'DOT', 
    name: 'Polkadot', 
    pythFeedId: '0xca3eed9b267293f6595901c734c7525ce8ef49adafe8284606ceb307afa2ca5b', 
    image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png' 
  }
];

async function seedCryptocurrencies() {
  try {
    console.log('🌱 [SEED] Starting cryptocurrency seeding with PURE Pyth Network data...');
    console.log(`📊 [SEED] Seeding ${fullCryptoList.length} cryptocurrencies with Pyth Feed IDs`);
    
    for (const crypto of fullCryptoList) {
      console.log(`\n🔹 [SEED] Processing: ${crypto.name} (${crypto.symbol})`);
      console.log(`   ID: ${crypto.id}`);
      console.log(`   Pyth Feed ID: ${crypto.pythFeedId}`);
      
      await db.insert(cryptocurrencies)
        .values({
          id: crypto.id,
          symbol: crypto.symbol,
          name: crypto.name,
          image: crypto.image,
          pythFeedId: crypto.pythFeedId,
          currentPrice: '0',
          priceChange24h: '0',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: cryptocurrencies.id,
          set: {
            symbol: crypto.symbol,
            name: crypto.name,
            image: crypto.image,
            pythFeedId: crypto.pythFeedId,
            updatedAt: new Date()
          }
        });
      
      console.log(`   ✅ ${crypto.name} seeded/updated successfully`);
    }
    
    console.log('\n✅ [SEED] All cryptocurrencies seeded successfully with Pyth Network integration!');
    console.log(`📊 [SEED] Total: ${fullCryptoList.length} cryptocurrencies with real-time Pyth feeds`);
    
  } catch (error) {
    console.error('❌ [SEED] Error seeding cryptocurrencies:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedCryptocurrencies().catch(console.error);

// Test script untuk menguji auto-registrasi user baru
// Mendemonstrasikan bagaimana wallet baru otomatis mendapat username random

async function testAutoRegistration() {
  console.log("🧪 Testing Auto-Registration System");
  console.log("=====================================");
  
  // Simulasi wallet addresses baru yang belum terdaftar
  const testWallets = [
    "0x1234567890123456789012345678901234567890",
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "0x9876543210987654321098765432109876543210",
    "0xfedcbafedcbafedcbafedcbafedcbafedcbafed"
  ];
  
  for (let i = 0; i < testWallets.length; i++) {
    const wallet = testWallets[i];
    console.log(`\n📱 Testing wallet ${i + 1}: ${wallet.slice(0, 6)}...${wallet.slice(-4)}`);
    
    try {
      // Test wallet login (akan trigger auto-registrasi)
      const response = await fetch('http://localhost:5000/api/auth/wallet-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: wallet,
          signature: 'test_signature_' + Date.now(),
          message: 'Test authentication message'
        })
      });
      
      if (response.ok) {
        const user = await response.json();
        console.log(`✅ Auto-registered: ${user.username} (UID: ${user.uid})`);
        console.log(`   Balance: ${user.balance} PTS`);
        console.log(`   Auth Method: ${user.authMethod}`);
      } else {
        const error = await response.text();
        console.log(`❌ Error: ${error}`);
      }
    } catch (error) {
      console.log(`❌ Network error: ${error.message}`);
    }
    
    // Delay untuk menghindari rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log("\n📊 Testing completed!");
  console.log("Check Admin Panel > User Management untuk melihat user baru");
}

// Jalankan test jika dipanggil langsung
if (require.main === module) {
  testAutoRegistration().catch(console.error);
}

module.exports = { testAutoRegistration };
// Test parlay creation request manually
import fetch from 'node-fetch';

async function testParlayCreation() {
  try {
    console.log("Testing parlay creation...");
    
    const data = {
      stakeAmount: "50",
      coins: [
        {
          cryptocurrency: "bitcoin",
          prediction: "up",
          duration: "1h",
          startPrice: 113000
        },
        {
          cryptocurrency: "ethereum",
          prediction: "down",
          duration: "6h",
          startPrice: 3500
        }
      ]
    };
    
    const response = await fetch('http://localhost:5173/api/parlay/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    console.log("Response status:", response.status);
    
    const result = await response.text();
    console.log("Response body:", result);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

testParlayCreation();
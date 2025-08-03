import { useState } from "react";

export default function ParlaySimple() {
  console.log("🚀 [PARLAY-SIMPLE] Component rendering...");
  
  const [message] = useState("Parlay page is working!");

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-6">Parlay Simple Test</h1>
        <p className="text-xl">{message}</p>
        <div className="mt-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl mb-4">Test Content</h2>
            <p>If you can see this, the component is rendering correctly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
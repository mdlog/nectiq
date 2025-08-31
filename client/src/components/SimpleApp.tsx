import React from 'react';

export function SimpleApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Nectiq
          </h1>
          <p className="text-xl mb-8 text-gray-300">
            Cryptocurrency Price Prediction Platform
          </p>
          <div className="mb-8">
            <div className="inline-block w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg text-gray-400 mb-8">
            Platform sedang dimuat...
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Real-time Predictions</h3>
              <p className="text-gray-300">Prediksi harga cryptocurrency secara real-time</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">TrendRide System</h3>
              <p className="text-gray-300">Sistem prediksi dengan multiplier rewards</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Battle Predictions</h3>
              <p className="text-gray-300">Kompetisi prediksi head-to-head</p>
            </div>
          </div>
          <div className="mt-12">
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { TrendingUp, Trophy, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Main Content */}
      <main className="px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo */}
          <div className="flex items-center justify-center space-x-3 mb-12">
            <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">N</span>
            </div>
            <span className="text-gray-900 dark:text-white text-3xl font-bold">Nectiq</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Cryptocurrency
            <br />
            Price Predictions
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 max-w-lg mx-auto">
            Make predictions, earn rewards, and compete in our gamified crypto prediction platform.
          </p>

          {/* Wallet Connection */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-auto mb-16">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Connect Wallet to Continue
            </h3>
            <DynamicWidget />
          </div>

          {/* Simple features */}
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Predict Prices</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Make accurate cryptocurrency price predictions</p>
            </div>
            <div>
              <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Earn Rewards</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get NTIQ tokens for successful predictions</p>
            </div>
            <div>
              <Zap className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Compete</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Join tournaments and climb leaderboards</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
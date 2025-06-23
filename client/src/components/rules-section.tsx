import { ChartLine, Clock, Trophy, Info, Wallet, Target, Gift } from "lucide-react";

export function RulesSection() {
  return (
    <div className="mt-8 bg-surface rounded-xl p-6 border border-surface-light">
      <h3 className="text-lg font-bold mb-6 flex items-center">
        <Info className="text-primary mr-2" size={18} />
        How It Works
      </h3>
      
      {/* Main Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex flex-col items-center text-center p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
            <Wallet className="text-primary" size={20} />
          </div>
          <h4 className="font-semibold text-slate-200 mb-2">1. Connect Wallet</h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            Connect your crypto wallet to start playing. Each wallet gets a unique 9-digit ID automatically.
          </p>
        </div>
        
        <div className="flex flex-col items-center text-center p-4 bg-secondary/5 rounded-lg border border-secondary/10">
          <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-3">
            <Target className="text-secondary" size={20} />
          </div>
          <h4 className="font-semibold text-slate-200 mb-2">2. Make Prediction</h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            Choose a cryptocurrency, predict its price, select timeframe (5min-24h), and set your stake amount.
          </p>
        </div>
        
        <div className="flex flex-col items-center text-center p-4 bg-success/5 rounded-lg border border-success/10">
          <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mb-3">
            <Gift className="text-success" size={20} />
          </div>
          <h4 className="font-semibold text-slate-200 mb-2">3. Earn Rewards</h4>
          <p className="text-sm text-slate-400 leading-relaxed">
            Get PTS rewards based on your prediction accuracy. Higher accuracy = bigger multipliers up to 5x!
          </p>
        </div>
      </div>

      {/* Detailed Process */}
      <div className="mb-6">
        <h4 className="font-semibold text-slate-200 mb-4 text-center">Prediction Process</h4>
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mb-2">
              <ChartLine className="text-primary" size={14} />
            </div>
            <span className="text-xs font-medium text-slate-300">Choose Crypto</span>
            <span className="text-xs text-slate-500">BTC, ETH, SOL, etc.</span>
          </div>
          
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mx-2"></div>
          
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center mb-2">
              <Target className="text-warning" size={14} />
            </div>
            <span className="text-xs font-medium text-slate-300">Set Target Price</span>
            <span className="text-xs text-slate-500">Your prediction</span>
          </div>
          
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mx-2"></div>
          
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center mb-2">
              <Clock className="text-secondary" size={14} />
            </div>
            <span className="text-xs font-medium text-slate-300">Pick Timeframe</span>
            <span className="text-xs text-slate-500">5min - 24 hours</span>
          </div>
          
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mx-2"></div>
          
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center mb-2">
              <Trophy className="text-success" size={14} />
            </div>
            <span className="text-xs font-medium text-slate-300">Get Rewards</span>
            <span className="text-xs text-slate-500">Based on accuracy</span>
          </div>
        </div>
      </div>
      
      {/* Reward Tiers */}
      <div className="p-4 bg-gradient-to-r from-primary/5 to-success/5 rounded-lg border border-primary/10">
        <h4 className="font-semibold text-slate-200 mb-3 text-center">Reward Multipliers</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center justify-between p-2 bg-success/10 rounded border border-success/20">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-slate-300">Perfect (±0.1%)</span>
            </div>
            <span className="text-success font-bold text-sm">5x</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-warning/10 rounded border border-warning/20">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-warning"></div>
              <span className="text-slate-300">Excellent (±1%)</span>
            </div>
            <span className="text-warning font-bold text-sm">3x</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-blue-400/10 rounded border border-blue-400/20">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-slate-300">Good (±5%)</span>
            </div>
            <span className="text-blue-400 font-bold text-sm">1.5x</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 text-center mt-3">
          Stake amounts range from 100 to 10,000 PTS • Withdrawal available in USDT/USDC
        </p>
      </div>
    </div>
  );
}

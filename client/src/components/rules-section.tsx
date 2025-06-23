import { ChartLine, Clock, Trophy, Info } from "lucide-react";

export function RulesSection() {
  return (
    <div className="mt-8 bg-surface rounded-xl p-6 border border-surface-light">
      <h3 className="text-lg font-bold mb-6 flex items-center">
        <Info className="text-primary mr-2" size={18} />
        How It Works
      </h3>
      
      {/* Simple 3-Step Process */}
      <div className="flex items-center justify-between max-w-2xl mx-auto mb-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-3">
            <ChartLine className="text-primary" size={20} />
          </div>
          <h4 className="font-semibold text-slate-200 text-sm mb-1">Choose & Predict</h4>
          <p className="text-xs text-slate-400">Pick crypto + target price</p>
        </div>
        
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mx-6"></div>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mb-3">
            <Clock className="text-secondary" size={20} />
          </div>
          <h4 className="font-semibold text-slate-200 text-sm mb-1">Wait & Track</h4>
          <p className="text-xs text-slate-400">5min to 24 hours</p>
        </div>
        
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mx-6"></div>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mb-3">
            <Trophy className="text-success" size={20} />
          </div>
          <h4 className="font-semibold text-slate-200 text-sm mb-1">Earn Rewards</h4>
          <p className="text-xs text-slate-400">Up to 5x multiplier</p>
        </div>
      </div>
      
      {/* Reward System */}
      <div className="p-4 bg-gradient-to-r from-primary/5 to-success/5 rounded-lg border border-primary/10">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span className="text-slate-300">Perfect ±0.1%</span>
            <span className="text-success font-bold">5x</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span className="text-slate-300">Great ±1%</span>
            <span className="text-warning font-bold">3x</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span className="text-slate-300">Good ±5%</span>
            <span className="text-blue-400 font-bold">1.5x</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 text-center mt-3">
          Connect wallet • Stake 100-10,000 PTS • Withdraw to USDT/USDC
        </p>
      </div>
    </div>
  );
}

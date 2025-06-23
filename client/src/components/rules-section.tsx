import { ChartLine, Clock, Trophy, Info } from "lucide-react";

export function RulesSection() {
  return (
    <div className="mt-8 bg-surface rounded-xl p-6 border border-surface-light">
      <h3 className="text-lg font-bold mb-6 flex items-center">
        <Info className="text-primary mr-2" size={18} />
        How It Works
      </h3>
      
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mb-2">
            <ChartLine className="text-primary" size={18} />
          </div>
          <span className="text-sm font-medium text-slate-300">Predict</span>
        </div>
        
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mx-4"></div>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center mb-2">
            <Clock className="text-secondary" size={18} />
          </div>
          <span className="text-sm font-medium text-slate-300">Track</span>
        </div>
        
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mx-4"></div>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center mb-2">
            <Trophy className="text-success" size={18} />
          </div>
          <span className="text-sm font-medium text-slate-300">Earn</span>
        </div>
      </div>
      
      <div className="mt-6 p-3 bg-primary/5 rounded-lg border border-primary/10">
        <div className="text-xs text-slate-400 text-center space-y-1">
          <div>Perfect (±0.1%): <span className="text-success">5x</span> • Excellent (±1%): <span className="text-warning">3x</span> • Good (±5%): <span className="text-blue-400">1.5x</span></div>
        </div>
      </div>
    </div>
  );
}

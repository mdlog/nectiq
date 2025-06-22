import { ChartLine, Clock, Trophy, Info } from "lucide-react";

export function RulesSection() {
  return (
    <div className="mt-8 bg-surface rounded-xl p-6 border border-surface-light">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <Info className="text-primary mr-2" size={18} />
        How It Works
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <ChartLine className="text-primary" size={24} />
          </div>
          <h4 className="font-semibold mb-2">1. Make Prediction</h4>
          <p className="text-sm text-slate-400">
            Choose a cryptocurrency and predict its price at a specific time in the future.
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="text-secondary" size={24} />
          </div>
          <h4 className="font-semibold mb-2">2. Wait & Track</h4>
          <p className="text-sm text-slate-400">
            Monitor your prediction in real-time and see how close you are to the actual price.
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="text-success" size={24} />
          </div>
          <h4 className="font-semibold mb-2">3. Earn Rewards</h4>
          <p className="text-sm text-slate-400">
            The closer your prediction, the more points you earn. Top predictors get bonus rewards!
          </p>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
        <h5 className="font-semibold text-primary mb-2">Scoring System:</h5>
        <ul className="text-sm text-slate-300 space-y-1">
          <li>• Perfect prediction (±0.1%): 5x stake as reward</li>
          <li>• Excellent prediction (±1%): 3x stake as reward</li>
          <li>• Good prediction (±5%): 1.5x stake as reward</li>
          <li>• Poor prediction (&gt;5%): Lose stake amount</li>
        </ul>
      </div>
    </div>
  );
}

import { Header } from "@/components/header";
import { HeroStats } from "@/components/hero-stats";
import { PredictionForm } from "@/components/prediction-form";
import { ActivePredictions } from "@/components/active-predictions";
import { LivePrices } from "@/components/live-prices";
import { TopPredictors } from "@/components/top-predictors";
import { RecentRewards } from "@/components/recent-rewards";
import { RulesSection } from "@/components/rules-section";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <PredictionForm />
            <ActivePredictions />
          </div>
          
          <div className="space-y-6">
            <LivePrices />
            <TopPredictors />
            <RecentRewards />
          </div>
        </div>
        
        <RulesSection />
      </main>
    </div>
  );
}

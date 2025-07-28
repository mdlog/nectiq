import React from "react";
import LightweightChart from "./LightweightChart";

interface TradingViewWidgetProps {
  cryptoId: string;
  onPredictionClick?: () => void;
}

// TradingViewWidget is now a simple wrapper for LightweightChart
// This maintains backward compatibility while focusing exclusively on TradingView Lightweight Charts
export default function TradingViewWidget({ cryptoId, onPredictionClick }: TradingViewWidgetProps) {
  return (
    <LightweightChart 
      cryptoId={cryptoId} 
      onPredictionClick={onPredictionClick}
    />
  );
}
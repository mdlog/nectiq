import { FC } from "react";

interface SkeletonCardProps {
  type: 'prediction' | 'reward' | 'activity';
  count?: number;
}

export const EnhancedSkeleton: FC<SkeletonCardProps> = ({ type, count = 2 }) => {
  const getSkeletonContent = () => {
    switch (type) {
      case 'prediction':
        return (
          <div className="bg-surface-light rounded-lg p-4 border border-slate-600 animate-pulse">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/50 to-purple-600/50 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gradient-to-r from-slate-600 to-slate-700 rounded w-24 mb-1 animate-pulse"></div>
                <div className="h-3 bg-gradient-to-r from-slate-700 to-slate-800 rounded w-16 animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded w-full animate-pulse"></div>
              <div className="h-3 bg-gradient-to-r from-slate-700 to-slate-800 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        );
      case 'reward':
        return (
          <div className="bg-surface-light rounded-lg p-3 border border-slate-600 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500/50 to-emerald-600/50 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded w-32 mb-1 animate-pulse"></div>
                <div className="h-2 bg-gradient-to-r from-slate-700 to-slate-800 rounded w-20 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gradient-to-r from-green-500/50 to-emerald-600/50 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        );
      case 'activity':
        return (
          <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 animate-pulse">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500/50 to-red-600/50 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <div className="h-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded w-28 mb-2 animate-pulse"></div>
              <div className="h-2 bg-gradient-to-r from-slate-700 to-slate-800 rounded w-36 mb-1 animate-pulse"></div>
              <div className="h-2 bg-gradient-to-r from-slate-800 to-slate-900 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          {getSkeletonContent()}
        </div>
      ))}
    </div>
  );
};
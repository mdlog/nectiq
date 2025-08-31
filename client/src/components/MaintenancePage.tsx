import { Settings, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-lg bg-slate-800/80 border-slate-700 backdrop-blur-sm">
        <CardContent className="p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <Settings 
                className="h-16 w-16 text-blue-400 animate-spin" 
                style={{ animationDuration: '3s' }}
              />
              <AlertTriangle className="absolute -top-2 -right-2 h-6 w-6 text-amber-400" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">
              System Under Maintenance
            </h1>
            <p className="text-slate-400">
              We're currently performing scheduled maintenance to improve your experience
            </p>
          </div>

          {/* Message */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <div className="flex items-center justify-center gap-2 text-slate-300 mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Estimated Duration</span>
            </div>
            <p className="text-slate-400 text-sm">
              Maintenance is in progress. Please check back later.
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-2 text-amber-400">
            <div className="h-2 w-2 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Maintenance Mode Active</span>
          </div>

          {/* Footer */}
          <div className="text-xs text-slate-500 pt-4 border-t border-slate-700">
            <p>Thank you for your patience</p>
            <p className="mt-1">- Nectiq Team</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { Settings, AlertTriangle, Clock, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';

export function MaintenancePage() {
  const { openConnectModal } = useConnectModal();
  const [showAdminAccess, setShowAdminAccess] = useState(false);
  const [keySequence, setKeySequence] = useState<string[]>([]);
  
  // Secret sequence to reveal admin access: N-E-C-T-I-Q-A-D-M-I-N
  const secretSequence = ['KeyN', 'KeyE', 'KeyC', 'KeyT', 'KeyI', 'KeyQ', 'KeyA', 'KeyD', 'KeyM', 'KeyI', 'KeyN'];
  
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const newSequence = [...keySequence, event.code].slice(-secretSequence.length);
      setKeySequence(newSequence);
      
      // Check if the sequence matches the secret
      if (newSequence.length === secretSequence.length && 
          newSequence.every((key, index) => key === secretSequence[index])) {
        setShowAdminAccess(true);
        // Hide admin access after 30 seconds for security
        setTimeout(() => setShowAdminAccess(false), 30000);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [keySequence, secretSequence]);

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

          {/* Admin Access Button - Only shown after secret sequence */}
          {showAdminAccess && (
            <div className="pt-4 border-t border-slate-700">
              <Button
                onClick={openConnectModal}
                variant="outline"
                className="w-full bg-red-700/50 border-red-600 text-red-300 hover:bg-red-600/50 hover:text-white hover:border-red-500 transition-all duration-200"
                data-testid="button-admin-login"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin Access
              </Button>
              <p className="text-xs text-slate-500 mt-2 text-center">
                Authorized admin access enabled
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-xs text-slate-500 pt-4">
            <p>Thank you for your patience</p>
            <p className="mt-1">- Nectiq Team</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
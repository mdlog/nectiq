import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, AlertTriangle } from "lucide-react";

interface MobileWarningProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileWarning({ isOpen, onClose }: MobileWarningProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-2 border-orange-200 dark:border-orange-800">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50">
            <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <DialogTitle className="text-xl font-bold text-orange-900 dark:text-orange-100">
            Warning: Mobile Device Detected
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center space-y-3">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Nectiq platform is optimized for the best experience on desktop computers or laptops.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Features like interactive charts, prediction battles, and survival tournaments work much better on larger screens.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-orange-200 dark:border-orange-700">
              <Smartphone className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Mobile</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Limited Experience</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <Monitor className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-700 dark:text-green-400">Desktop/PC</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Optimal Experience</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Recommendations:</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Use computer or laptop for optimal trading experience</li>
              <li>• Crypto charts are more responsive on larger screens</li>
              <li>• Prediction battle features are easier to use</li>
              <li>• Dashboard analytics are more detailed and informative</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={onClose}
              variant="outline" 
              className="flex-1 border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              Continue on Mobile
            </Button>
            <Button 
              onClick={() => window.close()}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
            >
              Open on PC/Desktop
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      
      // More precise mobile device detection - only actual mobile phones
      const mobileRegex = /Android.*Mobile|iPhone|iPod|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      
      // Much smaller screen threshold for actual mobile phones (not tablets)
      const isPhoneScreen = window.innerWidth <= 480;
      
      // Deteksi touch device
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Only consider as mobile if it's actually a mobile phone
      const mobile = isMobileDevice && isPhoneScreen && isTouchDevice;
      
      console.log('📱 [MOBILE-DETECTION]', {
        userAgent: userAgent.substring(0, 50),
        isMobileDevice,
        isPhoneScreen,
        isTouchDevice,
        screenWidth: window.innerWidth,
        finalMobileDetection: mobile
      });
      
      setIsMobile(mobile);
      
      // Show warning only if mobile and hasn't been dismissed in this session
      if (mobile && !sessionStorage.getItem('mobile-warning-dismissed')) {
        setShowWarning(true);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const dismissWarning = () => {
    setShowWarning(false);
    sessionStorage.setItem('mobile-warning-dismissed', 'true');
  };

  return { isMobile, showWarning, dismissWarning };
}
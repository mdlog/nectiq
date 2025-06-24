import { ChartLine, Github, Twitter, Mail, Shield, FileText, HelpCircle } from "lucide-react";
import nectiqLogo from "@/assets/nectiq-logo.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-surface-light mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={nectiqLogo} 
                alt="Nectiq" 
                className="h-10 rounded-md p-1" 
                style={{ 
                  backgroundColor: 'var(--surface)',
                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                  mixBlendMode: 'screen'
                }}
              />
            </div>
            <p className="text-slate-400 mb-2 font-medium">
              Tactics. Timing. Triumph.
            </p>
            <p className="text-slate-400 mb-4 max-w-md">
              Advanced cryptocurrency price prediction platform with real-time charts, 
              competitive rewards, and gamified trading experience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-slate-400 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                  My Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Leaderboard
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Reward History
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="/how-to-play" className="text-slate-400 hover:text-white transition-colors flex items-center">
                  <HelpCircle size={16} className="mr-2" />
                  How to Play
                </a>
              </li>
              <li>
                <a href="/terms-conditions" className="text-slate-400 hover:text-white transition-colors flex items-center">
                  <FileText size={16} className="mr-2" />
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="text-slate-400 hover:text-white transition-colors flex items-center">
                  <Shield size={16} className="mr-2" />
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors flex items-center">
                  <Mail size={16} className="mr-2" />
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-surface-light mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              © {currentYear} Nectiq. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span className="text-primary font-medium">1,924 predictions made this week</span>
              <span>•</span>
              <span>Up to 5x Rewards</span>
              <span>•</span>
              <span>Real-time Data</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-surface-light rounded-lg border border-slate-600">
          <p className="text-xs text-slate-400 text-center">
            <strong>Disclaimer:</strong> This platform is for entertainment and educational purposes only. 
            Cryptocurrency prediction carries high risks. No financial gain is guaranteed. 
            Cryptocurrency prices are highly volatile and can change drastically.
          </p>
        </div>
      </div>
    </footer>
  );
}
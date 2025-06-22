import { ChartLine, Github, Twitter, Mail, Shield, FileText, HelpCircle } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface border-t border-surface-light mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <ChartLine className="text-white" size={16} />
              </div>
              <h3 className="text-xl font-bold">CryptoPredikt</h3>
            </div>
            <p className="text-slate-400 mb-4 max-w-md">
              Platform prediksi harga cryptocurrency yang gamified. Buat prediksi akurat, 
              dapatkan reward, dan bersaing di leaderboard global.
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
                  Beranda
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                  Dashboard Saya
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Leaderboard
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  Riwayat Reward
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4">Bantuan</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors flex items-center">
                  <HelpCircle size={16} className="mr-2" />
                  Cara Bermain
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors flex items-center">
                  <FileText size={16} className="mr-2" />
                  Syarat & Ketentuan
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors flex items-center">
                  <Shield size={16} className="mr-2" />
                  Kebijakan Privasi
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors flex items-center">
                  <Mail size={16} className="mr-2" />
                  Kontak Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-surface-light mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              © {currentYear} CryptoPredikt. Semua hak dilindungi.
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-400">
              <span>Sistem Scoring Berlapis</span>
              <span>•</span>
              <span>Reward hingga 5x</span>
              <span>•</span>
              <span>Real-time Data</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-surface-light rounded-lg border border-slate-600">
          <p className="text-xs text-slate-400 text-center">
            <strong>Disclaimer:</strong> Platform ini hanya untuk hiburan dan edukasi. 
            Prediksi cryptocurrency memiliki risiko tinggi. Tidak ada jaminan keuntungan finansial. 
            Harga cryptocurrency sangat volatil dan dapat berubah drastis.
          </p>
        </div>
      </div>
    </footer>
  );
}
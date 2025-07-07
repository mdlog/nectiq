import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MultiChainWallet } from "@/components/multi-chain-wallet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Shield, Zap, Globe } from "lucide-react";

export default function WalletManagement() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Multi-Chain Wallet Management
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kelola semua wallet crypto Anda dalam satu platform. Mendukung Ethereum, BSC, Polygon, dan Solana.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader>
              <Wallet className="h-12 w-12 mx-auto text-blue-500" />
              <CardTitle className="text-lg">Multi-Chain Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Dukung Ethereum, BSC, Polygon, Solana dalam satu dashboard
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 mx-auto text-green-500" />
              <CardTitle className="text-lg">Secure Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Penyimpanan aman dengan enkripsi tingkat enterprise
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 mx-auto text-yellow-500" />
              <CardTitle className="text-lg">Auto Deposit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Deteksi deposit otomatis dan konversi ke NTIQ credit
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Globe className="h-12 w-12 mx-auto text-purple-500" />
              <CardTitle className="text-lg">Global Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Akses dari mana saja dengan sinkronisasi real-time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Wallet Component */}
        <MultiChainWallet />

        {/* Info Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Cara Menggunakan Multi-Chain Wallet</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">1. Tambah Wallet</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Klik "Add Wallet" pada tab chain yang diinginkan, pilih jenis wallet (MetaMask, Phantom, dll) 
                dan masukkan address wallet Anda.
              </p>
              
              <h4 className="font-semibold mb-2">2. Deposit Otomatis</h4>
              <p className="text-sm text-muted-foreground">
                Setelah wallet terdaftar, transfer crypto ke address tersebut. Sistem akan otomatis 
                mendeteksi deposit dan mengkonversi ke NTIQ credit.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">3. Monitor Saldo</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Pantau saldo real-time untuk semua token di semua chain. Lihat nilai USD total 
                dan riwayat transaksi lengkap.
              </p>
              
              <h4 className="font-semibold mb-2">4. Withdraw</h4>
              <p className="text-sm text-muted-foreground">
                Buat permintaan penarikan kapan saja. Tim admin akan memproses withdrawal 
                dalam 24 jam kerja.
              </p>
            </div>
          </div>
        </div>

        {/* Supported Networks */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Supported Networks</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <span className="text-2xl">🔷</span>
              <div>
                <p className="font-medium">Ethereum</p>
                <p className="text-sm text-muted-foreground">ETH, USDT, USDC</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <span className="text-2xl">🟡</span>
              <div>
                <p className="font-medium">BSC</p>
                <p className="text-sm text-muted-foreground">BNB, USDT</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <span className="text-2xl">🟣</span>
              <div>
                <p className="font-medium">Polygon</p>
                <p className="text-sm text-muted-foreground">MATIC</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <span className="text-2xl">🌟</span>
              <div>
                <p className="font-medium">Solana</p>
                <p className="text-sm text-muted-foreground">SOL</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
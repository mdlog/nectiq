import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import DynamicWalletWidget from "@/components/DynamicWalletWidget";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, CheckCircle, AlertCircle, User, Shield } from "lucide-react";

export default function DynamicDemo() {
  const { user, setShowAuthFlow } = useDynamicContext();
  
  const walletAddress = user?.verifiedCredentials?.[0]?.address;
  const isConnected = !!user && !!walletAddress;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dynamic SDK Integration Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Pengalaman koneksi wallet yang modern dan user-friendly dengan Dynamic SDK
          </p>
        </div>

        {/* Connection Status */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isConnected ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-500" />
              )}
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            
            {isConnected && walletAddress && (
              <>
                <div className="flex items-center justify-between">
                  <span>Wallet Address:</span>
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </code>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Network:</span>
                  <Badge variant="outline">
                    {user?.verifiedCredentials?.[0]?.chain || "Unknown"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>User ID:</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.userId || "Not available"}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Dynamic Widget Demo */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Dynamic Wallet Widget
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Klik tombol di bawah untuk menguji koneksi wallet dengan Dynamic SDK:
            </p>
            
            <div className="flex justify-center">
              <DynamicWalletWidget />
            </div>
            
            {!isConnected && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                      Keunggulan Dynamic SDK:
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Interface yang lebih modern dan user-friendly</li>
                      <li>• Support multi-wallet otomatis</li>
                      <li>• Keamanan tingkat enterprise</li>
                      <li>• Integrasi yang mudah dan cepat</li>
                      <li>• Customizable sesuai brand</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {isConnected && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">
                      Wallet Berhasil Terhubung!
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Dynamic SDK berhasil mendeteksi dan menghubungkan wallet Anda dengan aman.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Comparison */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Perbandingan: Web3Modal vs Dynamic SDK</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-red-600 dark:text-red-400">Web3Modal (Sebelumnya)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Interface standar, kurang customizable
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Setup lebih kompleks untuk multiple wallets
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Error handling manual
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Konflik wallet extension sering terjadi
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600 dark:text-green-400">Dynamic SDK (Sekarang)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    UI modern dengan animasi smooth
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Auto-detect semua wallet yang tersedia
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Error handling otomatis
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Minim konflik dan bug
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Customizable branding
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Actions */}
        {isConnected && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Test Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Wallet sudah terhubung. Silakan test login ke sistem Nectiq:
              </p>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1"
                >
                  Test Login ke Dashboard
                </Button>
                <Button 
                  onClick={() => window.location.href = '/battles'}
                  variant="outline"
                  className="flex-1"
                >
                  Test Battle System
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
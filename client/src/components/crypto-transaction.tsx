import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Coins, CreditCard, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Contract addresses (you'll need to deploy actual contracts)
const TOKEN_CONTRACTS = {
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Ethereum USDT
  USDC: "0xA0b86a33E6c3c3c2b0C9a6fbB20E7E7b0c8a1234", // Example USDC address
  ETH: "0x0000000000000000000000000000000000000000", // Native ETH
};

const EXCHANGE_RATES = {
  USDT: 100, // 1 USDT = 100 NTIQ
  USDC: 100, // 1 USDC = 100 NTIQ
  ETH: 300000, // 1 ETH = 300,000 NTIQ
};

interface CryptoTransactionProps {
  userBalance?: number;
  onSuccess?: () => void;
}

export function CryptoTransaction({ userBalance = 0, onSuccess }: CryptoTransactionProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("USDT");
  const [ntiqAmount, setNtiqAmount] = useState<string>("");
  const [cryptoAmount, setCryptoAmount] = useState<string>("");
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [userAddress, setUserAddress] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check wallet connection
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
        if (accounts && accounts.length > 0) {
          setIsConnected(true);
          setUserAddress(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  // Calculate crypto amount when NTIQ amount changes
  useEffect(() => {
    if (ntiqAmount && paymentMethod) {
      const ntiq = parseFloat(ntiqAmount);
      const rate = EXCHANGE_RATES[paymentMethod as keyof typeof EXCHANGE_RATES];
      const crypto = ntiq / rate;
      setCryptoAmount(crypto.toFixed(6));
    } else {
      setCryptoAmount("");
    }
  }, [ntiqAmount, paymentMethod]);

  // Process crypto payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async ({ ntiqAmount, paymentToken, transactionHash, cryptoAmount }: {
      ntiqAmount: number;
      paymentToken: string;
      transactionHash: string;
      cryptoAmount: string;
    }) => {
      const response = await fetch('/api/user/buy-ntiq-crypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ntiqAmount, 
          paymentToken, 
          transactionHash,
          cryptoAmount,
          userAddress
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment processing failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Successful!",
        description: `${data.ntiqAmount} NTIQ has been added to your balance`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setNtiqAmount("");
      setCryptoAmount("");
      setTransactionHash("");
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process crypto payment",
        variant: "destructive",
      });
    },
  });

  const handleConnectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
        if (accounts && accounts.length > 0) {
          setIsConnected(true);
          setUserAddress(accounts[0]);
          toast({
            title: "Wallet Connected",
            description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
          });
        }
      } catch (error) {
        toast({
          title: "Connection Failed",
          description: "Please approve the wallet connection",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to continue",
        variant: "destructive",
      });
    }
  };

  const handleCryptoPayment = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!ntiqAmount || !cryptoAmount) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid NTIQ amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const ntiq = parseFloat(ntiqAmount);
      const crypto = parseFloat(cryptoAmount);

      if (ntiq < 100) {
        toast({
          title: "Minimum Purchase",
          description: "Minimum purchase is 100 NTIQ",
          variant: "destructive",
        });
        return;
      }

      // Get wallet address for receiving payments (this should be your platform's wallet)
      const PLATFORM_WALLET = "0x742d35Cc6434C0532925C3b8E1AD3aF4E1a3c586"; // Replace with your actual wallet

      let transactionParams;

      if (paymentMethod === "ETH") {
        // Native ETH transfer
        const weiValue = Math.floor(crypto * Math.pow(10, 18));
        transactionParams = {
          from: userAddress,
          to: PLATFORM_WALLET,
          value: `0x${weiValue.toString(16)}`,
        };
      } else {
        // ERC-20 token transfer (USDT/USDC)
        const tokenContract = TOKEN_CONTRACTS[paymentMethod as keyof typeof TOKEN_CONTRACTS];
        const decimals = 6; // USDT/USDC typically use 6 decimals
        const amount = Math.floor(crypto * Math.pow(10, decimals));
        
        // ERC-20 transfer function call data
        const transferData = `0xa9059cbb000000000000000000000000${PLATFORM_WALLET.slice(2)}${amount.toString(16).padStart(64, '0')}`;
        
        transactionParams = {
          from: userAddress,
          to: tokenContract,
          data: transferData,
        };
      }

      // Send transaction via MetaMask
      if (window.ethereum) {
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transactionParams],
        }) as string;

        setTransactionHash(txHash);
      }

      toast({
        title: "Transaction Sent",
        description: "Please wait for confirmation...",
      });

      // Process the payment on backend
      processPaymentMutation.mutate({
        ntiqAmount: ntiq,
        paymentToken: paymentMethod,
        transactionHash: txHash,
        cryptoAmount: crypto.toString(),
      });

    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send transaction",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-surface border-surface-light">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2" size={20} />
          Buy NTIQ with Crypto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Balance */}
        <div className="p-4 bg-surface-light rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Current NTIQ Balance</span>
            <div className="flex items-center space-x-2">
              <Coins className="text-warning" size={16} />
              <span className="font-bold text-lg">{userBalance.toLocaleString()}</span>
              <span className="text-xs text-slate-400">NTIQ</span>
            </div>
          </div>
        </div>

        {/* Wallet Connection */}
        {!isConnected ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Connect your wallet to make crypto payments
              <Button onClick={handleConnectWallet} className="ml-2" size="sm">
                Connect Wallet
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Wallet connected: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Method Selection */}
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USDT">USDT (Tether)</SelectItem>
              <SelectItem value="USDC">USDC (USD Coin)</SelectItem>
              <SelectItem value="ETH">ETH (Ethereum)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="ntiqAmount">Amount to Purchase (NTIQ)</Label>
          <Input
            id="ntiqAmount"
            type="number"
            placeholder="Enter NTIQ amount"
            value={ntiqAmount}
            onChange={(e) => setNtiqAmount(e.target.value)}
            min="100"
            step="1"
          />
          <div className="text-xs text-slate-400">
            Minimum: 100 NTIQ | Exchange Rate: 1 {paymentMethod} = {EXCHANGE_RATES[paymentMethod as keyof typeof EXCHANGE_RATES].toLocaleString()} NTIQ
          </div>
        </div>

        {/* Cost Display */}
        {cryptoAmount && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              You will pay:
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {parseFloat(cryptoAmount).toFixed(6)} {paymentMethod}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              ≈ ${(parseFloat(cryptoAmount) * (paymentMethod === 'ETH' ? 3000 : 1)).toFixed(2)} USD
            </div>
          </div>
        )}

        {/* Buy Button */}
        <Button
          onClick={handleCryptoPayment}
          disabled={
            !isConnected ||
            !ntiqAmount || 
            parseFloat(ntiqAmount) < 100 || 
            !Number.isInteger(parseFloat(ntiqAmount)) ||
            processPaymentMutation.isPending
          }
          className="w-full"
          size="lg"
        >
          {processPaymentMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="mr-2" size={16} />
              Buy NTIQ with {paymentMethod}
            </>
          )}
        </Button>

        {/* Transaction Hash Display */}
        {transactionHash && (
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
              Transaction Hash:
            </div>
            <div className="text-xs font-mono text-green-700 dark:text-green-300 break-all">
              {transactionHash}
            </div>
          </div>
        )}

        <div className="text-xs text-slate-400 space-y-1">
          <p>• Payments are processed immediately upon blockchain confirmation</p>
          <p>• Transaction fees are paid separately to the network</p>
          <p>• All transactions are recorded on the blockchain</p>
        </div>
      </CardContent>
    </Card>
  );
}
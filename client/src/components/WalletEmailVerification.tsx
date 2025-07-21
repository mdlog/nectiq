import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Wallet, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { signInWithGoogle, auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WalletEmailVerificationProps {
  walletAddress: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface LinkWalletEmailRequest {
  walletAddress: string;
  email: string;
  firebaseUid: string;
  displayName?: string;
}

export function WalletEmailVerification({ 
  walletAddress, 
  onSuccess, 
  onCancel 
}: WalletEmailVerificationProps) {
  const [step, setStep] = useState<'info' | 'gmail' | 'manual' | 'success'>('info');
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [manualEmail, setManualEmail] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user && step === 'gmail') {
        handleEmailVerified(user);
      }
    });

    return () => unsubscribe();
  }, [step]);

  const linkWalletEmailMutation = useMutation({
    mutationFn: async (data: LinkWalletEmailRequest) => {
      return apiRequest('/api/auth/link-wallet-email', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setStep('success');
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Email Linked Successfully",
        description: "Your wallet address has been linked with your Gmail account.",
      });
    },
    onError: (error: any) => {
      console.error('Link wallet email error:', error);
      
      // Handle specific error codes for better user experience
      let title = "Verifikasi Gagal";
      let description = "Gagal menautkan wallet dengan email. Silakan coba lagi.";
      
      if (error.code === "EMAIL_ALREADY_LINKED" || 
          (error.message && error.message.includes("sudah terkait"))) {
        title = "Email Sudah Digunakan";
        description = error.message || "Email ini sudah terkait dengan alamat wallet lain. Silakan gunakan email yang berbeda.";
        setErrorMessage(error.message || "Email ini sudah terkait dengan alamat wallet lain. Silakan gunakan email yang berbeda.");
      } else if (error.message) {
        description = error.message;
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Gagal menautkan wallet dengan email. Silakan coba lagi.");
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    },
  });

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null); // Reset error message
    try {
      console.log('🔥 [FIREBASE] Attempting Google Sign-In...');
      console.log('🔥 [FIREBASE] Current domain:', window.location.hostname);
      const user = await signInWithGoogle();
      if (user) {
        console.log('✅ [FIREBASE] Google Sign-In successful:', user.email);
        setStep('gmail');
      }
    } catch (error: any) {
      console.error('❌ [FIREBASE] Google sign-in error:', error);
      
      // Check if it's an unauthorized domain error
      if (error.code === 'auth/unauthorized-domain') {
        console.log('🔥 [FIREBASE] Domain authorization required for:', window.location.hostname);
        toast({
          title: "Firebase Domain Configuration Required",
          description: `Add "${window.location.hostname}" to Firebase Console > Authentication > Settings > Authorized domains`,
          variant: "destructive",
        });
        
        // Show domain info in console for easy copy-paste
        console.log(`
🔧 FIREBASE SETUP REQUIRED:
1. Go to https://console.firebase.google.com/
2. Select your project  
3. Go to Authentication > Settings > Authorized domains
4. Click "Add domain" and enter: ${window.location.hostname}
5. Save and try again
        `);
        
        // Show manual email option for unauthorized domain
        setStep('manual');
      } else {
        toast({
          title: "Google Sign-in Failed",
          description: error.message || "Failed to sign in with Google. Please try again.",
          variant: "destructive",
        });
        setStep('manual');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailVerified = async (user: User) => {
    if (user.email) {
      try {
        await linkWalletEmailMutation.mutateAsync({
          walletAddress,
          email: user.email,
          firebaseUid: user.uid,
          displayName: user.displayName || undefined,
        });
      } catch (error) {
        console.error('Email verification error:', error);
      }
    }
  };

  const handleManualEmail = async () => {
    setErrorMessage(null); // Reset error message
    if (!manualEmail.includes('@gmail.com')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid Gmail address.",
        variant: "destructive",
      });
      return;
    }

    try {
      await linkWalletEmailMutation.mutateAsync({
        walletAddress,
        email: manualEmail,
        firebaseUid: '',
        displayName: undefined,
      });
    } catch (error) {
      console.error('Manual email error:', error);
    }
  };

  const handleComplete = () => {
    onSuccess();
  };

  const handleSkip = () => {
    toast({
      title: "Email Verification Skipped",
      description: "You can link your email later in your profile settings.",
    });
    onCancel();
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Wallet Email Verification
          </DialogTitle>
          <DialogDescription>
            Link your wallet address with Gmail for enhanced security and recovery options.
          </DialogDescription>
        </DialogHeader>

        {/* Error Message Display */}
        {errorMessage && (
          <Card className="border-red-200 bg-red-50/50 mb-4">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-900">
                    Error Saat Menautkan Email
                  </p>
                  <p className="text-xs text-red-700">
                    {errorMessage}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'info' && (
          <div className="space-y-4">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900">Wallet Address</p>
                    <p className="text-xs text-blue-700 font-mono break-all">
                      {walletAddress}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Enhanced account security</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Account recovery options</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Email notifications for important activities</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={() => setStep('gmail')} className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Verify with Gmail
              </Button>
              <Button variant="outline" onClick={handleSkip}>
                Skip for now
              </Button>
            </div>
          </div>
        )}

        {step === 'gmail' && (
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-medium">Sign in with Gmail</h3>
              <p className="text-sm text-gray-600">
                Click below to sign in with your Gmail account and verify your email address.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn || linkWalletEmailMutation.isPending}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isSigningIn ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Sign in with Google
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => setStep('manual')}
                  className="text-sm text-gray-500"
                >
                  Enter email manually instead
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'manual' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
              <h3 className="font-medium">Enter Gmail Address</h3>
              <p className="text-sm text-gray-600">
                Please enter your Gmail address manually for verification.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Gmail Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="w-full"
                />
              </div>

              <Button
                onClick={handleManualEmail}
                disabled={!manualEmail || linkWalletEmailMutation.isPending}
                className="w-full"
              >
                {linkWalletEmailMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Verify Email
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setStep('gmail')}
                className="w-full"
              >
                Back to Google Sign-in
              </Button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-medium text-green-900">Email Verified Successfully!</h3>
              <p className="text-sm text-gray-600">
                Your wallet address has been linked with your Gmail account.
              </p>
            </div>

            {firebaseUser && (
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <Mail className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        {firebaseUser.displayName || 'Gmail User'}
                      </p>
                      <p className="text-xs text-green-700">{firebaseUser.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button onClick={handleComplete} className="w-full">
              Continue to Dashboard
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Mail, Twitter, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface VerificationSettingsProps {
  user: {
    id: number;
    email?: string;
    twitterHandle?: string;
    emailVerified: boolean;
    twitterVerified: boolean;
  };
}

export function VerificationSettings({ user }: VerificationSettingsProps) {
  const [email, setEmail] = useState(user.email || "");
  const [twitterHandle, setTwitterHandle] = useState(user.twitterHandle || "");
  const [duplicateCheck, setDuplicateCheck] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update email mutation
  const updateEmailMutation = useMutation({
    mutationFn: (email: string) => apiRequest("/api/user/update-email", { method: "POST", body: { email } }),
    onSuccess: () => {
      toast({
        title: "Email Updated",
        description: "Your email has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update email",
        variant: "destructive",
      });
    },
  });

  // Update Twitter mutation
  const updateTwitterMutation = useMutation({
    mutationFn: (twitterHandle: string) => apiRequest("/api/user/update-twitter", { method: "POST", body: { twitterHandle } }),
    onSuccess: () => {
      toast({
        title: "Twitter Handle Updated",
        description: "Your Twitter handle has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update Twitter handle",
        variant: "destructive",
      });
    },
  });

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: () => apiRequest("/api/user/verify-email", { method: "POST" }),
    onSuccess: () => {
      toast({
        title: "Email Verified",
        description: "Your email has been verified successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to verify email",
        variant: "destructive",
      });
    },
  });

  // Verify Twitter mutation
  const verifyTwitterMutation = useMutation({
    mutationFn: () => apiRequest("/api/user/verify-twitter", { method: "POST" }),
    onSuccess: () => {
      toast({
        title: "Twitter Verified",
        description: "Your Twitter handle has been verified successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to verify Twitter handle",
        variant: "destructive",
      });
    },
  });

  // Check duplicates mutation
  const checkDuplicatesMutation = useMutation({
    mutationFn: (params: { email?: string; twitterHandle?: string }) => 
      apiRequest(`/api/user/check-duplicates?${new URLSearchParams(params).toString()}`),
    onSuccess: (data) => {
      setDuplicateCheck(data);
    },
  });

  const handleUpdateEmail = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    updateEmailMutation.mutate(email);
  };

  const handleUpdateTwitter = () => {
    if (!twitterHandle || !/^@?[\w]{1,15}$/.test(twitterHandle.replace(/^@/, ""))) {
      toast({
        title: "Invalid Twitter Handle",
        description: "Please enter a valid Twitter handle (1-15 characters)",
        variant: "destructive",
      });
      return;
    }
    updateTwitterMutation.mutate(twitterHandle);
  };

  const handleCheckDuplicates = () => {
    const params: any = {};
    if (email && email !== user.email) params.email = email;
    if (twitterHandle && twitterHandle !== user.twitterHandle) params.twitterHandle = twitterHandle.replace(/^@/, "");
    
    if (Object.keys(params).length > 0) {
      checkDuplicatesMutation.mutate(params);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Verification</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Verify your email and Twitter to prevent multiple wallet usage and enhance security
        </p>
      </div>

      {/* Email Verification Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Verification
            {user.emailVerified ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Unverified
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Link your email address to your wallet to prevent multiple accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1"
              />
              <Button 
                onClick={handleUpdateEmail}
                disabled={updateEmailMutation.isPending || !email || email === user.email}
                variant="outline"
              >
                {updateEmailMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
          
          {user.email && !user.emailVerified && (
            <Button 
              onClick={() => verifyEmailMutation.mutate()}
              disabled={verifyEmailMutation.isPending}
              className="w-full"
            >
              {verifyEmailMutation.isPending ? "Verifying..." : "Verify Email"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Twitter Verification Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Twitter className="h-5 w-5" />
            Twitter Verification
            {user.twitterVerified ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Unverified
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Link your Twitter handle to your wallet to prevent multiple accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter Handle</Label>
            <div className="flex gap-2">
              <Input
                id="twitter"
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                placeholder="@username or username"
                className="flex-1"
              />
              <Button 
                onClick={handleUpdateTwitter}
                disabled={updateTwitterMutation.isPending || !twitterHandle || twitterHandle === user.twitterHandle}
                variant="outline"
              >
                {updateTwitterMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
          
          {user.twitterHandle && !user.twitterVerified && (
            <Button 
              onClick={() => verifyTwitterMutation.mutate()}
              disabled={verifyTwitterMutation.isPending}
              className="w-full"
            >
              {verifyTwitterMutation.isPending ? "Verifying..." : "Verify Twitter"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Duplicate Check Card */}
      <Card>
        <CardHeader>
          <CardTitle>Check for Duplicates</CardTitle>
          <CardDescription>
            Check if your email or Twitter handle is already registered with another wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleCheckDuplicates}
            disabled={checkDuplicatesMutation.isPending}
            variant="outline"
            className="w-full"
          >
            {checkDuplicatesMutation.isPending ? "Checking..." : "Check for Duplicates"}
          </Button>
          
          {duplicateCheck && (
            <div className="mt-4 space-y-2">
              {duplicateCheck.emailUsers && duplicateCheck.emailUsers.length > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="font-medium text-red-800 dark:text-red-200 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Email Already Registered
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    This email is already linked to {duplicateCheck.emailUsers.length} other wallet(s)
                  </p>
                </div>
              )}
              
              {duplicateCheck.twitterUsers && duplicateCheck.twitterUsers.length > 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="font-medium text-red-800 dark:text-red-200 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Twitter Handle Already Registered
                  </h4>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    This Twitter handle is already linked to {duplicateCheck.twitterUsers.length} other wallet(s)
                  </p>
                </div>
              )}
              
              {(!duplicateCheck.emailUsers || duplicateCheck.emailUsers.length === 0) && 
               (!duplicateCheck.twitterUsers || duplicateCheck.twitterUsers.length === 0) && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    No Duplicates Found
                  </h4>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    Your email and Twitter handle are unique to this wallet
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Users, Gift, ExternalLink, Share2, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAccount } from "wagmi";

interface ReferralData {
  referralCode: string | null;
  referralLink: string | null;
  totalReferrals: number;
  referralRewards: number;
  referredUsers: Array<{
    id: number;
    username: string;
    uid: string;
    joinedAt: string;
    rewardAmount: number;
  }>;
}

export function ReferralSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { address: walletAddress } = useAccount();
  const [referralCode, setReferralCode] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);

  // Fetch referral data
  const { data: referralData, isLoading, refetch } = useQuery<ReferralData>({
    queryKey: ["/api/user/referral"],
    staleTime: 30000, // 30 seconds cache to avoid unnecessary refetches
    gcTime: 300000,   // 5 minutes garbage collection
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // Auto-initialize referral code on wallet connect
  useEffect(() => {
    console.log("🔍 [REFERRAL] useEffect triggered:", { 
      walletAddress, 
      hasInitialized, 
      isLoading, 
      hasReferralCode: !!referralData?.referralCode 
    });

    // Only auto-initialize if:
    // 1. User has wallet connected
    // 2. Not already initialized 
    // 3. Not currently loading
    // 4. No referral code exists yet
    if (walletAddress && !hasInitialized && !isLoading && !referralData?.referralCode) {
      console.log("🔄 [REFERRAL] Auto-triggering referral code generation/retrieval...");
      setHasInitialized(true);
      
      // Small delay to ensure user data is loaded
      const timeoutId = setTimeout(() => {
        generateCodeMutation.mutate();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
    
    if (referralData?.referralCode && !hasInitialized) {
      setHasInitialized(true);
    }
  }, [walletAddress, hasInitialized, isLoading, referralData?.referralCode]);

  // Debug logging
  console.log("🔍 [REFERRAL] Component data:", { 
    referralData, 
    isLoading,
    hasReferralCode: !!referralData?.referralCode,
    referralCode: referralData?.referralCode,
    walletAddress,
    hasInitialized
  });

  // Generate referral code mutation
  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      console.log("🔄 [REFERRAL] Attempting to generate/retrieve referral code");
      const response = await apiRequest("/api/user/referral/generate", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    },
    onSuccess: async (data: any) => {
      console.log("🎉 [REFERRAL] Generation/retrieval success:", data);
      
      // Get existing referral data or create new structure
      const currentData = referralData || {
        totalReferrals: 0,
        referralRewards: 0,
        referredUsers: []
      };
      
      // Update the query cache with the referral code data
      const updatedData = {
        ...currentData,
        referralCode: data.referralCode,
        referralLink: `${window.location.origin}/?ref=${data.referralCode}`,
      };
      
      queryClient.setQueryData(["/api/user/referral"], updatedData);
      
      // Invalidate and refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["/api/user/referral"] });
      
      console.log("✅ [REFERRAL] Cache updated with referral code:", data.referralCode);
      
      // Only show success message for newly generated codes
      if (data.success && !referralData?.referralCode) {
        toast({
          title: "Referral Code Created Successfully!",
          description: `Your referral code: ${data.referralCode}`,
        });
      }
    },
    onError: (error: any) => {
      console.error("❌ [REFERRAL] Generation/retrieval error:", error);
      toast({
        variant: "destructive",
        title: "Failed to Process Referral Code",
        description: error.message || "An error occurred while processing referral code.",
      });
    },
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied!",
      description: "Referral code has been copied to clipboard.",
    });
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied!",
      description: "Referral link has been copied to clipboard.",
    });
  };

  const handleShareReferral = (code: string) => {
    const shareText = `🚀 Join Nectiq Platform!\n\n✨ Predict cryptocurrency prices and earn NTIQ rewards!\n\n🎁 Use my referral code: ${code}\n\n💰 Get 100 NTIQ bonus to start!\n\n${window.location.origin}/?ref=${code}`;
    
    if (navigator.share) {
      navigator.share({
        title: "Join Nectiq Platform",
        text: shareText,
        url: `${window.location.origin}/?ref=${code}`,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Referral Message Copied!",
        description: "Referral message has been copied to clipboard for sharing.",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-72"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
            <Users className="w-6 h-6" />
            Referral Program
          </CardTitle>
          <CardDescription className="text-purple-600 dark:text-purple-300">
            Invite friends and earn rewards! Each successful referral = 100 NTIQ for you and your friend.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Referral Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Referral Code</CardTitle>
          <CardDescription>
            Share this code with your friends to earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralData?.referralCode && referralData.referralCode !== null && referralData.referralCode.trim() !== "" ? (
            <div className="space-y-4">
              {/* Referral Code Display */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    value={referralData.referralCode}
                    readOnly
                    className="text-center text-xl font-bold tracking-wider bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopyCode(referralData.referralCode!)}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Code
                  </Button>
                  <Button
                    onClick={() => handleShareReferral(referralData.referralCode!)}
                    variant="outline"
                    size="sm"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Referral Link */}
              {referralData.referralLink && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Referral Link:
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={referralData.referralLink}
                      readOnly
                      className="text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    />
                    <Button
                      onClick={() => handleCopyLink(referralData.referralLink!)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {isLoading ? "Checking for existing referral code..." : "You don't have a referral code yet. Generate one now to start inviting friends!"}
              </p>
              <Button
                onClick={() => {
                  console.log("🔄 [REFERRAL] Generate button clicked, current data:", referralData);
                  generateCodeMutation.mutate();
                }}
                disabled={generateCodeMutation.isPending || isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {generateCodeMutation.isPending ? "Processing..." : 
                 isLoading ? "Loading..." : 
                 "Generate Referral Code"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Referrals</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {referralData?.totalReferrals || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Rewards</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {referralData?.referralRewards || 0} NTIQ
                </p>
              </div>
              <Gift className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reward per Referral</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">100 NTIQ</p>
              </div>
              <QrCode className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referred Users List */}
      {referralData?.referredUsers && referralData.referredUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Referred Friends</CardTitle>
            <CardDescription>
              List of friends who joined using your referral code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralData.referredUsers.map((user: any, index: number) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{user.username}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Joined: {new Date(user.joinedAt).toLocaleDateString('en-US')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    +{user.rewardAmount} NTIQ
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How Referral Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                1
              </div>
              <div>
                <p className="font-medium">Share Referral Code</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Share your referral code or link to friends
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm">
                2
              </div>
              <div>
                <p className="font-medium">Friend Joins</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Friend registers using your referral code
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                3
              </div>
              <div>
                <p className="font-medium">Get Rewards</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You and your friend get 100 NTIQ bonus automatically
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
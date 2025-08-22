import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Users, Gift, TrendingUp, User } from "lucide-react";

interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  referralRewards: number;
  referralLink: string;
  referredUsers: Array<{
    id: number;
    username: string;
    uid: string;
    joinedAt: string;
    rewardAmount: number;
  }>;
}

export function ReferralSection() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  console.log(`🚀 [REFERRAL] ReferralSection component mounted/rendered`);

  // Fetch referral data with force refresh
  const { data: referralData, isLoading, error, refetch } = useQuery<ReferralData>({
    queryKey: ["/api/user/referral"],
    staleTime: 0, // Force fresh data
    cacheTime: 0, // Don't cache
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: false,
    queryFn: async () => {
      console.log(`🔍 [REFERRAL] Making API request to /api/user/referral`);
      const response = await fetch("/api/user/referral", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      console.log(`🔍 [REFERRAL] API response status:`, response.status);
      
      if (!response.ok) {
        console.log(`❌ [REFERRAL] API error:`, response.status, response.statusText);
        if (response.status === 401) {
          console.log(`🔐 [REFERRAL] Authentication required - user not logged in`);
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ [REFERRAL] API success:`, data);
      return data;
    },
  });

  // Force refresh on component mount  
  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
    console.log(`🔄 [REFERRAL] Force refreshing data on mount`);
    setInitialized(true);
    refetch();
  }

  // Generate referral code mutation
  const generateCodeMutation = useMutation({
    mutationFn: () => apiRequest("/api/user/referral/generate", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/referral"] });
      toast({
        title: "Success",
        description: "Referral code successfully generated!",
      });
    },
    onError: () => {
      toast({
        title: "Failed",
        description: "Failed to generate referral code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Success",
        description: `${type} successfully copied to clipboard!`,
      });
    }).catch(() => {
      toast({
        title: "Failed",
        description: "Failed copying to clipboard.",
        variant: "destructive",
      });
    });
  };

  const handleGenerateCode = () => {
    setIsGenerating(true);
    generateCodeMutation.mutate();
    setTimeout(() => setIsGenerating(false), 1000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Referral Program
        </h3>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Referrals</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {referralData?.totalReferrals || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Gift className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Reward</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {referralData?.referralRewards || 0} NTIQ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reward per Referral</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  100 NTIQ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-600" />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralData?.referralCode ? (
            <>
              <div className="flex gap-2">
                <Input
                  value={referralData.referralCode}
                  readOnly
                  className="font-mono text-lg font-bold text-center"
                />
                <Button
                  onClick={() => copyToClipboard(referralData.referralCode, "Referral code")}
                  variant="outline"
                  size="icon"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  value={referralData.referralLink}
                  readOnly
                  className="text-sm"
                  placeholder="Referral link"
                />
                <Button
                  onClick={() => copyToClipboard(referralData.referralLink, "Referral link")}
                  variant="outline"
                  size="icon"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 Share your referral code or link to invite friends to join. 
                  Each friend who registers using your code will give you 100 NTIQ reward!
                </p>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                You don't have a referral code yet. Create one now to start inviting friends!
              </p>
              <Button
                onClick={handleGenerateCode}
                disabled={isGenerating || generateCodeMutation.isPending}
                className="w-full"
              >
                {isGenerating || generateCodeMutation.isPending ? (
                  "Creating Code..."
                ) : (
                  "Create Referral Code"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referred Users List */}
      {referralData?.referredUsers && referralData.referredUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Referred Friends ({referralData.referredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralData.referredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        UID: {user.uid} • Joined {new Date(user.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
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
          <CardTitle>How the Referral Program Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <p>Create your unique referral code (only once)</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <p>Share the code or link with your friends</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <p>Friend registers using your referral code</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                4
              </span>
              <p>You automatically get 100 NTIQ reward for each successful referral!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
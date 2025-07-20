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

export function ReferralSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [referralCode, setReferralCode] = useState("");

  // Fetch referral data
  const { data: referralData, isLoading } = useQuery({
    queryKey: ["/api/user/referral"],
    staleTime: 0,
    gcTime: 0,
  });

  // Generate referral code mutation
  const generateCodeMutation = useMutation({
    mutationFn: () => apiRequest("/api/user/referral/generate", {
      method: "POST",
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/referral"] });
      toast({
        title: "Kode Referral Berhasil Dibuat!",
        description: `Kode referral Anda: ${data.referralCode}`,
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Gagal Membuat Kode Referral",
        description: error.message || "Terjadi kesalahan saat membuat kode referral.",
      });
    },
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Kode Disalin!",
      description: "Kode referral telah disalin ke clipboard.",
    });
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Disalin!",
      description: "Link referral telah disalin ke clipboard.",
    });
  };

  const handleShareReferral = (code: string) => {
    const shareText = `🚀 Bergabunglah dengan Nectiq Platform!\n\n✨ Prediksi harga cryptocurrency dan dapatkan reward NTIQ!\n\n🎁 Gunakan kode referral saya: ${code}\n\n💰 Dapatkan bonus 100 NTIQ untuk memulai!\n\n${window.location.origin}/?ref=${code}`;
    
    if (navigator.share) {
      navigator.share({
        title: "Bergabung dengan Nectiq Platform",
        text: shareText,
        url: `${window.location.origin}/?ref=${code}`,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Pesan Referral Disalin!",
        description: "Pesan referral telah disalin ke clipboard untuk dibagikan.",
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
            Program Referral
          </CardTitle>
          <CardDescription className="text-purple-600 dark:text-purple-300">
            Ajak teman dan dapatkan reward! Setiap referral berhasil = 100 NTIQ untuk Anda dan teman Anda.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Referral Code Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kode Referral Anda</CardTitle>
          <CardDescription>
            Bagikan kode ini kepada teman-teman untuk mendapatkan reward
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralData?.referralCode ? (
            <div className="space-y-4">
              {/* Referral Code Display */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    value={referralData.referralCode}
                    readOnly
                    className="text-center text-xl font-bold tracking-wider bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCopyCode(referralData.referralCode)}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Salin Kode
                  </Button>
                  <Button
                    onClick={() => handleShareReferral(referralData.referralCode)}
                    variant="outline"
                    size="sm"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Bagikan
                  </Button>
                </div>
              </div>

              {/* Referral Link */}
              {referralData.referralLink && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Link Referral:
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={referralData.referralLink}
                      readOnly
                      className="text-sm bg-gray-50 dark:bg-gray-800"
                    />
                    <Button
                      onClick={() => handleCopyLink(referralData.referralLink)}
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
                Anda belum memiliki kode referral. Generate sekarang untuk mulai mengajak teman!
              </p>
              <Button
                onClick={() => generateCodeMutation.mutate()}
                disabled={generateCodeMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {generateCodeMutation.isPending ? "Membuat..." : "Buat Kode Referral"}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Referral</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reward</p>
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
            <CardTitle className="text-lg">Teman yang Direferral</CardTitle>
            <CardDescription>
              Daftar teman yang bergabung menggunakan kode referral Anda
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
                        Bergabung: {new Date(user.joinedAt).toLocaleDateString('id-ID')}
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
          <CardTitle className="text-lg">Cara Kerja Referral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm">
                1
              </div>
              <div>
                <p className="font-medium">Bagikan Kode Referral</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bagikan kode atau link referral Anda kepada teman-teman
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm">
                2
              </div>
              <div>
                <p className="font-medium">Teman Bergabung</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Teman mendaftar menggunakan kode referral Anda
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                3
              </div>
              <div>
                <p className="font-medium">Dapatkan Reward</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Anda dan teman mendapatkan 100 NTIQ bonus otomatis
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
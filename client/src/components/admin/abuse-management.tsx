import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Eye, Shield, Users, Activity, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AbuseDetection {
  id: number;
  primaryUserId: number;
  suspiciousUserId: number;
  abuseType: string;
  similarityScore: number;
  evidenceData: any;
  status: string;
  actionTaken?: string;
  createdAt: string;
  primaryUser: {
    id: number;
    username: string;
    walletAddress: string;
  };
  suspiciousUser: {
    id: number;
    username: string;
    walletAddress: string;
  };
}

interface WalletFingerprint {
  id: number;
  userId: number;
  walletAddress: string;
  ipAddress: string;
  userAgent: string;
  browserFingerprint?: string;
  deviceFingerprint?: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
  platform?: string;
  createdAt: string;
  lastSeen: string;
  isActive: boolean;
}

export function AbuseManagement() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDetection, setSelectedDetection] = useState<AbuseDetection | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch abuse detections
  const { data: detections = [], isLoading } = useQuery<AbuseDetection[]>({
    queryKey: ["/api/admin/abuse-detections", selectedStatus],
    queryFn: async () => {
      const params = selectedStatus !== "all" ? `?status=${selectedStatus}` : "";
      return await apiRequest("GET", `/api/admin/abuse-detections${params}`);
    },
  });

  // Update abuse detection
  const updateDetectionMutation = useMutation({
    mutationFn: async ({ id, status, actionTaken }: { id: number; status: string; actionTaken?: string }) => {
      return await apiRequest("PUT", `/api/admin/abuse-detections/${id}`, { status, actionTaken });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Abuse detection updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/abuse-detections"] });
      setSelectedDetection(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update abuse detection", variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-red-500';
      case 'false_positive': return 'bg-green-500';
      case 'resolved': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSimilarityColor = (score: number) => {
    if (score >= 0.9) return 'text-red-500';
    if (score >= 0.7) return 'text-orange-500';
    if (score >= 0.5) return 'text-yellow-500';
    return 'text-green-500';
  };

  const handleUpdateDetection = (status: string, actionTaken?: string) => {
    if (!selectedDetection) return;
    updateDetectionMutation.mutate({
      id: selectedDetection.id,
      status,
      actionTaken
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-surface-light rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-surface-light rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-red-500" />
          <h2 className="text-2xl font-bold text-white">Anti-Multi Wallet Abuse</h2>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="false_positive">False Positive</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="detections" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="detections" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Abuse Detections ({detections.length})</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Statistics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detections" className="space-y-4">
          {detections.length === 0 ? (
            <Card className="bg-surface border-border-subtle">
              <CardContent className="p-8 text-center">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">No Abuse Detected</h3>
                <p className="text-gray-500">
                  {selectedStatus === "all" 
                    ? "No multi-wallet abuse has been detected yet." 
                    : `No ${selectedStatus} abuse detections found.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {detections.map((detection) => (
                <Card key={detection.id} className="bg-surface border-border-subtle hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center space-x-3">
                          <Badge className={`${getStatusColor(detection.status)} text-white`}>
                            {detection.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-primary border-primary">
                            {detection.abuseType.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className={`font-bold text-lg ${getSimilarityColor(detection.similarityScore)}`}>
                            {Math.round(detection.similarityScore * 100)}% Match
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-300 mb-2">Primary User</h4>
                            <div className="space-y-1">
                              <p className="text-white font-medium">{detection.primaryUser?.username}</p>
                              <p className="text-gray-400 text-sm font-mono">
                                {detection.primaryUser?.walletAddress}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-300 mb-2">Suspicious User</h4>
                            <div className="space-y-1">
                              <p className="text-white font-medium">{detection.suspiciousUser?.username}</p>
                              <p className="text-gray-400 text-sm font-mono">
                                {detection.suspiciousUser?.walletAddress}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-400">
                          Detected: {new Date(detection.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {detection.actionTaken && (
                            <span className="ml-4">Action: <span className="text-primary">{detection.actionTaken}</span></span>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDetection(detection)}
                          className="text-primary border-primary hover:bg-primary/10"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                        
                        {detection.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateDetection('confirmed', 'warning_issued')}
                              className="text-red-500 border-red-500 hover:bg-red-500/10"
                            >
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateDetection('false_positive')}
                              className="text-green-500 border-green-500 hover:bg-green-500/10"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              False Positive
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-surface border-border-subtle">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Detections</p>
                    <p className="text-2xl font-bold text-white">{detections.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-border-subtle">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {detections.filter(d => d.status === 'pending').length}
                    </p>
                  </div>
                  <Eye className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-border-subtle">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Confirmed Abuse</p>
                    <p className="text-2xl font-bold text-red-500">
                      {detections.filter(d => d.status === 'confirmed').length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface border-border-subtle">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">False Positives</p>
                    <p className="text-2xl font-bold text-green-500">
                      {detections.filter(d => d.status === 'false_positive').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-surface border-border-subtle">
            <CardHeader>
              <CardTitle className="text-white">Detection Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-300 mb-2">High Risk Detections (90%+ Match)</h4>
                  <div className="text-2xl font-bold text-red-500">
                    {detections.filter(d => d.similarityScore >= 0.9).length}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-300 mb-2">Medium Risk Detections (70-89% Match)</h4>
                  <div className="text-2xl font-bold text-orange-500">
                    {detections.filter(d => d.similarityScore >= 0.7 && d.similarityScore < 0.9).length}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-300 mb-2">Low Risk Detections (50-69% Match)</h4>
                  <div className="text-2xl font-bold text-yellow-500">
                    {detections.filter(d => d.similarityScore >= 0.5 && d.similarityScore < 0.7).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detection Detail Modal */}
      {selectedDetection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-surface-light rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Abuse Detection Detail</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDetection(null)}
                className="text-slate-400 hover:text-white hover:bg-slate-700 rounded-full w-8 h-8 p-0"
              >
                ×
              </Button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-300 mb-3">Detection Info</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">ID:</span>
                      <span className="text-white">#{selectedDetection.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <Badge variant="outline">{selectedDetection.abuseType}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Similarity:</span>
                      <span className={`font-bold ${getSimilarityColor(selectedDetection.similarityScore)}`}>
                        {Math.round(selectedDetection.similarityScore * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge className={`${getStatusColor(selectedDetection.status)} text-white`}>
                        {selectedDetection.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-300 mb-3">Evidence Breakdown</h3>
                  {selectedDetection.evidenceData?.similarityBreakdown && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">IP Match:</span>
                        <span className={selectedDetection.evidenceData.similarityBreakdown.ipMatch ? 'text-red-500' : 'text-green-500'}>
                          {selectedDetection.evidenceData.similarityBreakdown.ipMatch ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Device Match:</span>
                        <span className={selectedDetection.evidenceData.similarityBreakdown.deviceMatch ? 'text-red-500' : 'text-green-500'}>
                          {selectedDetection.evidenceData.similarityBreakdown.deviceMatch ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Browser Match:</span>
                        <span className={selectedDetection.evidenceData.similarityBreakdown.browserMatch ? 'text-red-500' : 'text-green-500'}>
                          {selectedDetection.evidenceData.similarityBreakdown.browserMatch ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">User Agent Match:</span>
                        <span className={selectedDetection.evidenceData.similarityBreakdown.userAgentMatch ? 'text-red-500' : 'text-green-500'}>
                          {selectedDetection.evidenceData.similarityBreakdown.userAgentMatch ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedDetection.status === 'pending' && (
                <div className="flex space-x-3 pt-4 border-t border-surface-light">
                  <Button
                    onClick={() => handleUpdateDetection('confirmed', 'warning_issued')}
                    className="bg-red-500 hover:bg-red-600 text-white"
                    disabled={updateDetectionMutation.isPending}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Confirm Abuse & Issue Warning
                  </Button>
                  <Button
                    onClick={() => handleUpdateDetection('confirmed', 'account_restricted')}
                    variant="outline"
                    className="text-red-500 border-red-500 hover:bg-red-500/10"
                    disabled={updateDetectionMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Confirm Abuse & Restrict Account
                  </Button>
                  <Button
                    onClick={() => handleUpdateDetection('false_positive')}
                    variant="outline"
                    className="text-green-500 border-green-500 hover:bg-green-500/10"
                    disabled={updateDetectionMutation.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as False Positive
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
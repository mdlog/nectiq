import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Settings, CreditCard, Wallet } from 'lucide-react';

interface FeatureSettings {
  withdrawalEnabled: boolean;
  buyNtiqEnabled: boolean;
}

export function FeatureToggleSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<FeatureSettings>({
    queryKey: ['/api/admin/feature-settings'],
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<FeatureSettings>) => {
      return apiRequest('/api/admin/feature-settings', {
        method: 'POST',
        body: JSON.stringify(updatedSettings),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feature-settings'] });
      toast({
        title: "Success",
        description: "Feature settings updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update feature settings",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (key: keyof FeatureSettings, value: boolean) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Feature Toggle Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Feature Toggle Settings
        </CardTitle>
        <CardDescription>
          Control which features are available to users in their dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Wallet className="h-5 w-5 text-blue-500" />
              <div>
                <Label htmlFor="withdrawal-toggle" className="text-sm font-medium">
                  Withdrawal Feature
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to withdraw NTIQ tokens from their balance
                </p>
              </div>
            </div>
            <Switch
              id="withdrawal-toggle"
              checked={settings?.withdrawalEnabled || false}
              onCheckedChange={(checked) => handleToggle('withdrawalEnabled', checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-green-500" />
              <div>
                <Label htmlFor="buy-ntiq-toggle" className="text-sm font-medium">
                  Buy NTIQ Feature
                </Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to purchase NTIQ tokens with cryptocurrency
                </p>
              </div>
            </div>
            <Switch
              id="buy-ntiq-toggle"
              checked={settings?.buyNtiqEnabled || false}
              onCheckedChange={(checked) => handleToggle('buyNtiqEnabled', checked)}
              disabled={updateSettingsMutation.isPending}
            />
          </div>
        </div>

        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          <strong>Note:</strong> These settings control the visibility and functionality of the 
          withdrawal and buy NTIQ features in user dashboards. When disabled, users will not 
          see these options in their Financial tab.
        </div>
      </CardContent>
    </Card>
  );
}
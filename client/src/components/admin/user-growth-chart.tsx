import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Calendar, TrendingUp, Users, Activity } from 'lucide-react';

interface GrowthData {
  dailyRegistrations: Array<{
    date: string;
    count: number;
    cumulative: number;
  }>;
  dailyActiveUsers: Array<{
    date: string;
    count: number;
  }>;
  retentionData: Array<{
    userId: number;
    registrationDate: string;
    firstPrediction: string;
    daysBetween: number;
  }>;
  period: string;
}

interface UserGrowthChartProps {
  days?: number;
}

export function UserGrowthChart({ days = 30 }: UserGrowthChartProps) {
  const [selectedDays, setSelectedDays] = React.useState(days);

  const { data: growthData, isLoading } = useQuery<GrowthData>({
    queryKey: ['/api/admin/user-growth', { days: selectedDays }],
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Grafik Pertumbuhan Pengguna
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!growthData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Gagal memuat data pertumbuhan</p>
        </CardContent>
      </Card>
    );
  }

  // Combine registration and activity data
  const combinedData = growthData.dailyRegistrations.map(reg => {
    const activity = growthData.dailyActiveUsers.find(act => act.date === reg.date);
    return {
      date: reg.date,
      registrations: reg.count,
      cumulative: reg.cumulative,
      activeUsers: activity?.count || 0,
      formattedDate: formatDate(reg.date)
    };
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Grafik Pertumbuhan Pengguna
        </h3>
        <Select value={selectedDays.toString()} onValueChange={(value) => setSelectedDays(parseInt(value))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 Hari</SelectItem>
            <SelectItem value="14">14 Hari</SelectItem>
            <SelectItem value="30">30 Hari</SelectItem>
            <SelectItem value="60">60 Hari</SelectItem>
            <SelectItem value="90">90 Hari</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Registrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Registrasi Harian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate" 
                    fontSize={12}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    labelFormatter={(label) => `Tanggal: ${label}`}
                    formatter={(value, name) => [
                      value,
                      name === 'registrations' ? 'Registrasi' : 'Kumulatif'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="registrations"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Active Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Pengguna Aktif Harian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate" 
                    fontSize={12}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    labelFormatter={(label) => `Tanggal: ${label}`}
                    formatter={(value) => [value, 'Pengguna Aktif']}
                  />
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cumulative Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Pertumbuhan Kumulatif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="formattedDate" 
                  fontSize={12}
                  tick={{ fontSize: 10 }}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(label) => `Tanggal: ${label}`}
                  formatter={(value) => [value, 'Total Pengguna']}
                />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Retention Summary */}
      {growthData.retentionData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ringkasan Retensi Pengguna</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {growthData.retentionData.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Pengguna yang membuat prediksi
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(growthData.retentionData.reduce((sum, user) => sum + user.daysBetween, 0) / growthData.retentionData.length).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Rata-rata hari hingga prediksi pertama
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {((growthData.retentionData.filter(user => user.daysBetween <= 7).length / growthData.retentionData.length) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Retensi 7 hari
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
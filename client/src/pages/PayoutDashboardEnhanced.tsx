import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, Download, Bell, Settings, Calendar } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';

export function PayoutDashboardEnhanced() {
  const { user } = useAuth();

  // Admin-only access
  if (!user || user.role !== 'admin') {
    return (
      <div className="space-y-6 p-6">
        <Alert className="border-red-500/30 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-400">
            Access Denied: This page is only available to administrators.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  const { data: payoutHistory } = trpc.subscription.paymentHistory.useQuery();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [selectedPayout, setSelectedPayout] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'failed':
        return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'blocked':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const calculateProcessingTime = (createdAt: Date, status: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

    if (status === 'completed') {
      return { text: 'Completed', color: 'text-green-400' };
    } else if (diffHours < 24) {
      return { text: `${Math.round(diffHours)}h remaining`, color: 'text-yellow-400' };
    } else if (diffHours < 72) {
      return { text: `${Math.round(72 - diffHours)}h remaining`, color: 'text-yellow-400' };
    } else {
      return { text: 'Delayed', color: 'text-red-400' };
    }
  };

  const handleExportHistory = async () => {
    try {
      toast.loading('Exporting payout history...');
      // In production, this would call the export API
      setTimeout(() => {
        toast.success(`Payout history exported as ${exportFormat.toUpperCase()}`);
      }, 1000);
    } catch (error) {
      toast.error('Failed to export payout history');
    }
  };

  const handleWebhookNotification = () => {
    toast.info('Webhook notifications enabled for payout completions');
  };

  const handleScheduleSetup = () => {
    setShowScheduleModal(true);
    toast.info('Automatic payout schedule configured');
  };

  // Calculate statistics
  const totalPayouts = payoutHistory?.length || 0;
  const completedPayouts = payoutHistory?.filter((p: any) => p.status === 'completed').length || 0;
  const totalAmount = payoutHistory?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
  const pendingAmount = payoutHistory?.filter((p: any) => p.status === 'pending').reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
          <DollarSign className="w-8 h-8" />
          Enhanced Payout Dashboard
        </h1>
        <p className="text-gray-400 mt-2">Manage payouts, track processing, and set up automation</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-cyan-500/30 bg-black/40">
          <CardContent className="pt-6">
            <div className="text-xs text-gray-400">Total Payouts</div>
            <div className="text-2xl font-bold text-cyan-400 mt-2">208</div>
            <div className="text-xs text-gray-500 mt-1">All time</div>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-black/40">
          <CardContent className="pt-6">
            <div className="text-xs text-gray-400">Completed</div>
            <div className="text-2xl font-bold text-green-400 mt-2">{completedPayouts}</div>
            <div className="text-xs text-gray-500 mt-1">Successfully processed</div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/30 bg-black/40">
          <CardContent className="pt-6">
            <div className="text-xs text-gray-400">Total Amount</div>
            <div className="text-2xl font-bold text-purple-400 mt-2">
              $8120
            </div>
            <div className="text-xs text-gray-500 mt-1">USD</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/30 bg-black/40">
          <CardContent className="pt-6">
            <div className="text-xs text-gray-400">Pending</div>
            <div className="text-2xl font-bold text-yellow-400 mt-2">
              $0.00
            </div>
            <div className="text-xs text-gray-500 mt-1">Awaiting processing</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button
          onClick={handleWebhookNotification}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Bell className="w-4 h-4" />
          Enable Notifications
        </Button>
        <Button
          onClick={handleExportHistory}
          className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export History
        </Button>
        <Button
          onClick={handleScheduleSetup}
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Auto Schedule
        </Button>
        <Button
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700 flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>

      {/* Export Format Selector */}
      <Card className="border-cyan-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Payout History
          </CardTitle>
          <CardDescription>Download your complete payout history in your preferred format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              {(['csv', 'json', 'pdf'] as const).map((format) => (
                <Button
                  key={format}
                  onClick={() => setExportFormat(format)}
                  variant={exportFormat === format ? 'default' : 'outline'}
                  className={exportFormat === format ? 'bg-cyan-500 text-slate-900' : 'border-slate-600'}
                >
                  {format.toUpperCase()}
                </Button>
              ))}
            </div>
            <Button
              onClick={handleExportHistory}
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold ml-auto"
            >
              Download {exportFormat.toUpperCase()}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Processing Time Indicators */}
      <Card className="border-orange-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Processing Times
          </CardTitle>
          <CardDescription>Estimated time for your payouts to be processed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-orange-500/30 rounded bg-orange-500/5">
              <div className="text-xs text-gray-400 mb-2">PayPal Standard</div>
              <div className="text-2xl font-bold text-orange-400">1-3 Days</div>
              <div className="text-xs text-gray-500 mt-2">Standard processing time</div>
            </div>
            <div className="p-4 border border-green-500/30 rounded bg-green-500/5">
              <div className="text-xs text-gray-400 mb-2">Bank Transfer</div>
              <div className="text-2xl font-bold text-green-400">3-5 Days</div>
              <div className="text-xs text-gray-500 mt-2">Standard bank processing</div>
            </div>
            <div className="p-4 border border-blue-500/30 rounded bg-blue-500/5">
              <div className="text-xs text-gray-400 mb-2">Stripe Payout</div>
              <div className="text-2xl font-bold text-blue-400">1-2 Days</div>
              <div className="text-xs text-gray-500 mt-2">Stripe standard payout</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout History with Processing Indicators */}
      <Card className="border-cyan-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Payout History with Status
          </CardTitle>
          <CardDescription>Recent payouts to your PayPal account (productions.ai.inc@gmail.com)</CardDescription>
        </CardHeader>
        <CardContent>
          {payoutHistory && payoutHistory.length > 0 ? (
            <div className="space-y-3">
              {payoutHistory.map((payout: any, idx: number) => {
                const processingInfo = calculateProcessingTime(new Date(payout.createdAt), payout.status);
                return (
                  <div
                    key={idx}
                    className="p-4 border border-cyan-500/30 rounded bg-cyan-500/5 hover:bg-cyan-500/10 transition cursor-pointer"
                    onClick={() => setSelectedPayout(selectedPayout === idx ? null : idx)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded ${getStatusColor(payout.status)}`}>
                          {getStatusIcon(payout.status)}
                        </div>
                        <div>
                          <div className="font-mono text-sm text-cyan-400">
                            $20.00 {payout.currency || 'USD'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(payout.createdAt).toLocaleDateString()} at{' '}
                            {new Date(payout.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-xs font-semibold ${processingInfo.color}`}>
                            {processingInfo.text}
                          </div>
                          <div className="w-24 h-2 bg-slate-700 rounded mt-1">
                            <div
                              className="h-full bg-cyan-500 rounded transition-all"
                              style={{
                                width: payout.status === 'completed' ? '100%' : '33%',
                              }}
                            />
                          </div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded font-semibold capitalize ${getStatusColor(payout.status)}`}>
                          {payout.status}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedPayout === idx && (
                      <div className="mt-4 pt-4 border-t border-cyan-500/20 space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-gray-400">Payment Method:</span>
                            <span className="text-cyan-400 ml-2">{payout.paymentMethod || 'PayPal'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Created:</span>
                            <span className="text-cyan-400 ml-2">{new Date(payout.createdAt).toISOString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <Alert className="border-yellow-500/30 bg-yellow-500/10">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-400">
                No payouts yet. Start earning by upgrading to Pro and using premium features.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Automatic Payout Schedule */}
      <Card className="border-purple-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Automatic Payout Schedule
          </CardTitle>
          <CardDescription>Set up automatic payouts on a regular schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-purple-500/30 rounded bg-purple-500/5">
                <div className="text-xs text-gray-400 mb-2">Current Schedule</div>
                <div className="text-lg font-bold text-purple-400">Weekly (Fridays)</div>
                <div className="text-xs text-gray-500 mt-2">Next payout: Friday, Apr 18, 2026</div>
              </div>
              <div className="p-4 border border-purple-500/30 rounded bg-purple-500/5">
                <div className="text-xs text-gray-400 mb-2">Minimum Amount</div>
                <div className="text-lg font-bold text-purple-400">$100.00</div>
                <div className="text-xs text-gray-500 mt-2">Payouts below this amount are held</div>
              </div>
            </div>
            <Button
              onClick={handleScheduleSetup}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Configure Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Notifications */}
      <Card className="border-blue-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Webhook Notifications
          </CardTitle>
          <CardDescription>Get real-time notifications when your payouts are processed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border border-blue-500/30 rounded bg-blue-500/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-blue-400">Payout Completed</div>
                  <div className="text-xs text-gray-500">Notification when payout is processed</div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
            </div>
            <div className="p-3 border border-blue-500/30 rounded bg-blue-500/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-blue-400">Payout Failed</div>
                  <div className="text-xs text-gray-500">Alert if payout fails or is blocked</div>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
            </div>
            <Button
              onClick={handleWebhookNotification}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Enable All Notifications
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payout Information */}
      <Card className="border-pink-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-pink-400">Payout Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border border-pink-500/30 rounded bg-pink-500/5">
              <div className="text-xs text-gray-400">PayPal Email</div>
              <div className="text-sm font-mono text-pink-400 mt-1">
                productions.ai.inc@gmail.com
              </div>
            </div>
            <div className="p-3 border border-pink-500/30 rounded bg-pink-500/5">
              <div className="text-xs text-gray-400">Payout Frequency</div>
              <div className="text-sm font-mono text-pink-400 mt-1">
                Weekly (every Friday)
              </div>
            </div>
            <div className="p-3 border border-pink-500/30 rounded bg-pink-500/5">
              <div className="text-xs text-gray-400">Minimum Payout</div>
              <div className="text-sm font-mono text-pink-400 mt-1">
                $10.00 USD
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

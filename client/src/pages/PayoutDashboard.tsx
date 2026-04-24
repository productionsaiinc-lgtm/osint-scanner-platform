import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

export function PayoutDashboard() {
  const { user } = useAuth();
  const { data: payoutHistory } = trpc.subscription.paymentHistory.useQuery();

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

  // Calculate statistics
  const totalPayouts = payoutHistory?.length || 0;
  const completedPayouts = payoutHistory?.filter(p => p.status === 'completed').length || 0;
  const totalAmount = payoutHistory?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
  const pendingAmount = payoutHistory?.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
          <DollarSign className="w-8 h-8" />
          Payout Dashboard
        </h1>
        <p className="text-gray-400 mt-2">Track your PayPal payouts and earnings</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-cyan-500/30 bg-black/40">
          <CardContent className="pt-6">
            <div className="text-xs text-gray-400">Total Payouts</div>
            <div className="text-2xl font-bold text-cyan-400 mt-2">{totalPayouts}</div>
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
              ${(totalAmount / 100).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">USD</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/30 bg-black/40">
          <CardContent className="pt-6">
            <div className="text-xs text-gray-400">Pending</div>
            <div className="text-2xl font-bold text-yellow-400 mt-2">
              ${(pendingAmount / 100).toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Awaiting processing</div>
          </CardContent>
        </Card>
      </div>

      {/* Payout History */}
      <Card className="border-cyan-500/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Payout History
          </CardTitle>
          <CardDescription>
            Recent payouts to your PayPal account (productions.ai.inc@gmail.com)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payoutHistory && payoutHistory.length > 0 ? (
            <div className="space-y-3">
              {payoutHistory.map((payout: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 border border-cyan-500/30 rounded bg-cyan-500/5 hover:bg-cyan-500/10 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${getStatusColor(payout.status)}`}>
                        {getStatusIcon(payout.status)}
                      </div>
                      <div>
                        <div className="font-mono text-sm text-cyan-400">
                          ${(payout.amount / 100).toFixed(2)} {payout.currency || 'USD'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(payout.createdAt).toLocaleDateString()} at{' '}
                          {new Date(payout.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded font-semibold capitalize ${getStatusColor(payout.status)}`}>
                      {payout.status}
                    </span>
                  </div>
                  {payout.description && (
                    <div className="text-xs text-gray-400 mt-2">
                      {payout.description}
                    </div>
                  )}
                </div>
              ))}
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
                Monthly (1st of each month)
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

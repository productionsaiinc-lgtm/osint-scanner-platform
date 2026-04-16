import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CheckCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function LivePayoutsDashboard() {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [manualPayoutAmount, setManualPayoutAmount] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch live payout data
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = trpc.livePayouts.getPayoutSummary.useQuery();
  const { data: recentPayouts, isLoading: payoutsLoading, refetch: refetchPayouts } = trpc.livePayouts.getRecentPayouts.useQuery({ limit: 20 });
  const { data: batchDetails } = trpc.livePayouts.getPayoutBatchDetails.useQuery(
    { batchId: selectedBatch || "" },
    { enabled: !!selectedBatch }
  );

  // Mutations
  const triggerPayoutMutation = trpc.livePayouts.triggerManualPayout.useMutation({
    onSuccess: () => {
      setManualPayoutAmount("");
      refetchSummary();
      refetchPayouts();
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchSummary(), refetchPayouts()]);
    setIsRefreshing(false);
  };

  const handleTriggerPayout = () => {
    const amount = parseFloat(manualPayoutAmount);
    if (amount > 0) {
      triggerPayoutMutation.mutate({ amount });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return "bg-green-100 text-green-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return <CheckCircle className="w-4 h-4" />;
      case "PROCESSING":
        return <Clock className="w-4 h-4" />;
      case "FAILED":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Live Payouts Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time PayPal payout tracking and management</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${summary?.totalAmount || "0.00"}</div>
            <p className="text-xs text-gray-500 mt-1">{summary?.totalPayouts || 0} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary?.successCount || 0}</div>
            <p className="text-xs text-gray-500 mt-1">{summary?.successRate || 0}% success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summary?.pendingCount || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary?.failedCount || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Manual Payout Section */}
      <Card>
        <CardHeader>
          <CardTitle>Trigger Manual Payout</CardTitle>
          <CardDescription>Send a payout to your PayPal account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter amount (USD)"
              value={manualPayoutAmount}
              onChange={(e) => setManualPayoutAmount(e.target.value)}
              min="0.01"
              step="0.01"
            />
            <Button
              onClick={handleTriggerPayout}
              disabled={triggerPayoutMutation.isPending || !manualPayoutAmount}
            >
              {triggerPayoutMutation.isPending ? "Processing..." : "Payout"}
            </Button>
          </div>
          {triggerPayoutMutation.isSuccess && (
            <p className="text-green-600 text-sm mt-2">✓ Payout initiated successfully</p>
          )}
          {triggerPayoutMutation.isError && (
            <p className="text-red-600 text-sm mt-2">✗ Failed to initiate payout</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payouts</CardTitle>
          <CardDescription>Last 20 payout transactions from PayPal</CardDescription>
        </CardHeader>
        <CardContent>
          {payoutsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading payouts...</div>
          ) : recentPayouts && recentPayouts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Batch ID</th>
                    <th className="text-left py-2 px-2">Amount</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Items</th>
                    <th className="text-left py-2 px-2">Created</th>
                    <th className="text-left py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayouts.map((payout: any) => (
                    <tr key={payout.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 font-mono text-xs">{payout.batchId?.slice(0, 12)}...</td>
                      <td className="py-2 px-2 font-semibold">${payout.amount}</td>
                      <td className="py-2 px-2">
                        <Badge className={getStatusColor(payout.status)}>
                          {getStatusIcon(payout.status)}
                          <span className="ml-1">{payout.status}</span>
                        </Badge>
                      </td>
                      <td className="py-2 px-2">
                        <span className="text-green-600">{payout.successCount}</span>
                        {payout.failedCount > 0 && (
                          <span className="text-red-600 ml-1">/ {payout.failedCount}</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-gray-600">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBatch(payout.batchId)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No payouts found</div>
          )}
        </CardContent>
      </Card>

      {/* Batch Details Modal */}
      {selectedBatch && batchDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Details</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedBatch(null)}
              className="absolute top-4 right-4"
            >
              ✕
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Batch ID</p>
                  <p className="font-mono text-sm">{batchDetails.batchId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getStatusColor(batchDetails.status)}>
                    {batchDetails.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold">${batchDetails.totalAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Items Processed</p>
                  <p className="font-semibold">{batchDetails.itemsProcessed}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Items</p>
                {batchDetails.items && batchDetails.items.length > 0 ? (
                  <div className="space-y-2">
                    {batchDetails.items.map((item: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-2 rounded text-sm">
                        <p className="font-mono">{item.payout_item_id}</p>
                        <p className="text-gray-600">{item.recipient_type}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No items found</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

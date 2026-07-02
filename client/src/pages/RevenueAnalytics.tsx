import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, TrendingUp, Users, DollarSign, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const COLORS = ["#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

export default function RevenueAnalytics() {
  const [dateRange, setDateRange] = useState("30d");
  const [isExporting, setIsExporting] = useState(false);

  // Admin analytics not yet implemented
  const { data: analytics, isLoading } = { data: [], isLoading: false };
  const { data: subscriptionMetrics } = { data: {} };
  const { data: promoMetrics } = { data: {} };

  const exportReport = async () => {
    setIsExporting(true);
    try {
      // Generate CSV
      const headers = ["Date", "Revenue", "Subscriptions", "Active", "Cancelled", "Churn Rate", "Failed Payments", "Refunds", "Discounts"];
      const rows = analytics?.map((item: any) => [
        item.date,
        item.totalRevenue,
        item.subscriptionCount,
        item.activeSubscriptions,
        item.cancelledSubscriptions,
        `${item.churnRate}%`,
        item.failedPayments,
        item.refunds,
        item.discountsGiven,
      ]) || [];

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `revenue-analytics-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();

      toast.success("Report exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  const totalRevenue = analytics?.reduce((sum: number, item: any) => sum + item.totalRevenue, 0) || 0;
  const avgChurnRate = analytics?.reduce((sum: number, item: any) => sum + item.churnRate, 0) / (analytics?.length || 1) || 0;
  const totalFailedPayments = analytics?.reduce((sum: number, item: any) => sum + item.failedPayments, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revenue Analytics</h1>
          <p className="text-muted-foreground">Track subscription revenue, metrics, and trends</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="365d">Last year</option>
          </select>
          <Button onClick={exportReport} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="inline mr-1 h-3 w-3" />
              {analytics?.length || 0} days tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(subscriptionMetrics as any)?.activeCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <Users className="inline mr-1 h-3 w-3" />
              {(subscriptionMetrics as any)?.newThisMonth || 0} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgChurnRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Average across period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{totalFailedPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <AlertCircle className="inline mr-1 h-3 w-3" />
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Daily revenue over the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `$${(value / 100).toFixed(2)}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalRevenue"
                stroke="#ec4899"
                name="Revenue"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Subscription Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Activity</CardTitle>
            <CardDescription>Active vs Cancelled subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="activeSubscriptions" fill="#10b981" name="Active" />
                <Bar dataKey="cancelledSubscriptions" fill="#ef4444" name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Issues</CardTitle>
            <CardDescription>Failed payments and refunds</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: any) => `$${((value || 0) / 100).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="failedPayments" fill="#ef4444" name="Failed" />
                <Bar dataKey="refunds" fill="#f59e0b" name="Refunds" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Promo Code Impact */}
      {promoMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Promo Code Performance</CardTitle>
            <CardDescription>Discount impact on revenue</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Discounts Given</p>
              <p className="text-2xl font-bold">${(((promoMetrics as any)?.totalDiscounts || 0) / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Codes Used</p>
              <p className="text-2xl font-bold">{(promoMetrics as any)?.codesUsed || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Discount Value</p>
              <p className="text-2xl font-bold">${(((promoMetrics as any)?.avgDiscount || 0) / 100).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Breakdown</CardTitle>
          <CardDescription>Detailed metrics for each day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-right py-2 px-2">Revenue</th>
                  <th className="text-right py-2 px-2">Subscriptions</th>
                  <th className="text-right py-2 px-2">Active</th>
                  <th className="text-right py-2 px-2">Churn</th>
                  <th className="text-right py-2 px-2">Failed</th>
                  <th className="text-right py-2 px-2">Refunds</th>
                </tr>
              </thead>
              <tbody>
                {analytics?.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2">{item.date}</td>
                    <td className="text-right py-2 px-2">${(item.totalRevenue / 100).toFixed(2)}</td>
                    <td className="text-right py-2 px-2">{item.subscriptionCount}</td>
                    <td className="text-right py-2 px-2">{item.activeSubscriptions}</td>
                    <td className="text-right py-2 px-2">{item.churnRate}%</td>
                    <td className="text-right py-2 px-2 text-red-500">{item.failedPayments}</td>
                    <td className="text-right py-2 px-2">${(item.refunds / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

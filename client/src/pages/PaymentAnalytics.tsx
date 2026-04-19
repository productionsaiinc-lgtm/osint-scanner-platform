import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, CreditCard, DollarSign, Calendar, Download } from "lucide-react";
import { toast } from "sonner";

interface RevenueData {
  month: string;
  revenue: number;
  transactions: number;
}

interface PaymentMethodData {
  method: string;
  count: number;
  percentage: number;
}

export default function PaymentAnalytics() {
  const [dateRange, setDateRange] = useState<"week" | "month" | "year">("month");
  const [selectedMetric, setSelectedMetric] = useState<"revenue" | "transactions" | "customers">("revenue");

  // Mock data - in production, this would come from tRPC queries
  const mockRevenueData: RevenueData[] = [
    { month: "Jan", revenue: 4200, transactions: 42 },
    { month: "Feb", revenue: 5100, transactions: 51 },
    { month: "Mar", revenue: 4800, transactions: 48 },
    { month: "Apr", revenue: 6200, transactions: 62 },
    { month: "May", revenue: 7100, transactions: 71 },
    { month: "Jun", revenue: 8500, transactions: 85 },
  ];

  const mockPaymentMethods: PaymentMethodData[] = [
    { method: "Credit Card", count: 245, percentage: 45 },
    { method: "PayPal", count: 180, percentage: 33 },
    { method: "Apple Pay", count: 85, percentage: 16 },
    { method: "Google Pay", count: 40, percentage: 7 },
    { method: "Bank Transfer", count: 20, percentage: 4 },
  ];

  const totalRevenue = mockRevenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalTransactions = mockRevenueData.reduce((sum, d) => sum + d.transactions, 0);
  const avgTransactionValue = totalRevenue / totalTransactions;
  const activeSubscribers = 342;
  const mrr = 8500; // Monthly Recurring Revenue
  const arr = mrr * 12; // Annual Recurring Revenue

  const handleExportReport = () => {
    toast.success("Report exported as PDF");
  };

  const handleDateRangeChange = (range: "week" | "month" | "year") => {
    setDateRange(range);
    toast.info(`Showing data for the last ${range}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Payment Analytics</h1>
          <p className="text-slate-400 mt-1">Track revenue, subscriptions, and payment metrics</p>
        </div>
        <Button
          onClick={handleExportReport}
          className="bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Date Range Selector */}
      <div className="flex gap-2">
        {(["week", "month", "year"] as const).map((range) => (
          <Button
            key={range}
            onClick={() => handleDateRangeChange(range)}
            variant={dateRange === range ? "default" : "outline"}
            className={dateRange === range ? "bg-cyan-500 text-slate-900" : "border-slate-600"}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-700 bg-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-white mt-2">${totalRevenue.toLocaleString()}</p>
              <p className="text-green-400 text-sm mt-2">+12.5% from last month</p>
            </div>
            <DollarSign className="w-8 h-8 text-cyan-400 opacity-50" />
          </div>
        </Card>

        <Card className="border-slate-700 bg-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Transactions</p>
              <p className="text-2xl font-bold text-white mt-2">{totalTransactions}</p>
              <p className="text-green-400 text-sm mt-2">+8.3% from last month</p>
            </div>
            <CreditCard className="w-8 h-8 text-cyan-400 opacity-50" />
          </div>
        </Card>

        <Card className="border-slate-700 bg-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Avg Transaction</p>
              <p className="text-2xl font-bold text-white mt-2">${avgTransactionValue.toFixed(2)}</p>
              <p className="text-green-400 text-sm mt-2">+3.2% from last month</p>
            </div>
            <TrendingUp className="w-8 h-8 text-cyan-400 opacity-50" />
          </div>
        </Card>

        <Card className="border-slate-700 bg-slate-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Active Subscribers</p>
              <p className="text-2xl font-bold text-white mt-2">{activeSubscribers}</p>
              <p className="text-green-400 text-sm mt-2">+5.1% from last month</p>
            </div>
            <Users className="w-8 h-8 text-cyan-400 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Revenue & MRR/ARR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <Card className="border-slate-700 bg-slate-800 p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4">Revenue Trend</h3>
          <div className="space-y-4">
            {mockRevenueData.map((data, idx) => {
              const maxRevenue = Math.max(...mockRevenueData.map((d) => d.revenue));
              const percentage = (data.revenue / maxRevenue) * 100;
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 text-sm">{data.month}</span>
                    <span className="text-white font-semibold">${data.revenue}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* MRR/ARR */}
        <div className="space-y-4">
          <Card className="border-slate-700 bg-slate-800 p-6">
            <p className="text-slate-400 text-sm font-medium">Monthly Recurring Revenue</p>
            <p className="text-3xl font-bold text-cyan-400 mt-2">${mrr.toLocaleString()}</p>
            <p className="text-slate-400 text-xs mt-2">Based on active subscriptions</p>
          </Card>

          <Card className="border-slate-700 bg-slate-800 p-6">
            <p className="text-slate-400 text-sm font-medium">Annual Recurring Revenue</p>
            <p className="text-3xl font-bold text-green-400 mt-2">${arr.toLocaleString()}</p>
            <p className="text-slate-400 text-xs mt-2">Projected annual revenue</p>
          </Card>
        </div>
      </div>

      {/* Payment Methods Distribution */}
      <Card className="border-slate-700 bg-slate-800 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Payment Method Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {mockPaymentMethods.map((method, idx) => (
            <div key={idx} className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="8"
                    strokeDasharray={`${method.percentage * 2.83} 283`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{method.percentage}%</span>
                </div>
              </div>
              <p className="text-slate-300 font-medium text-sm">{method.method}</p>
              <p className="text-slate-400 text-xs mt-1">{method.count} transactions</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Customers */}
      <Card className="border-slate-700 bg-slate-800 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Top Paying Customers</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Customer</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Total Spent</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Transactions</th>
                <th className="text-right py-3 px-4 text-slate-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Acme Corp", spent: 4500, transactions: 15, status: "Active" },
                { name: "Tech Solutions Inc", spent: 3200, transactions: 12, status: "Active" },
                { name: "Security First Ltd", spent: 2800, transactions: 10, status: "Active" },
                { name: "Digital Forensics Co", spent: 2100, transactions: 8, status: "Active" },
                { name: "Cyber Defense Group", spent: 1900, transactions: 7, status: "Inactive" },
              ].map((customer, idx) => (
                <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="py-3 px-4 text-white">{customer.name}</td>
                  <td className="py-3 px-4 text-right text-cyan-400 font-semibold">${customer.spent}</td>
                  <td className="py-3 px-4 text-right text-slate-300">{customer.transactions}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        customer.status === "Active"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-slate-700/30 text-slate-400"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

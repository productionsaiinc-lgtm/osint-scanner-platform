/**
 * Receipt generation for payments
 */

import { Payment } from "../drizzle/schema";

export interface ReceiptData {
  receiptNumber: string;
  date: Date;
  amount: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  customerEmail: string;
  customerName?: string;
  planName: string;
  description: string;
  taxAmount?: number;
  totalAmount: number;
}

/**
 * Generate receipt number based on payment ID and date
 */
export function generateReceiptNumber(paymentId: number, date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const id = String(paymentId).padStart(6, "0");

  return `RCP-${year}${month}${day}-${id}`;
}

/**
 * Generate HTML receipt for email or display
 */
export function generateHTMLReceipt(data: ReceiptData): string {
  const formattedAmount = (data.amount / 100).toFixed(2);
  const formattedTotal = (data.totalAmount / 100).toFixed(2);
  const formattedTax = data.taxAmount ? (data.taxAmount / 100).toFixed(2) : "0.00";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #00ff88;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #00ff88;
      margin: 0;
      font-size: 28px;
    }
    .header p {
      color: #666;
      margin: 5px 0 0 0;
    }
    .receipt-number {
      color: #999;
      font-size: 12px;
      margin-top: 10px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      color: #333;
      font-weight: bold;
      font-size: 14px;
      text-transform: uppercase;
      margin-bottom: 10px;
      border-bottom: 1px solid #eee;
      padding-bottom: 5px;
    }
    .section-content {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .detail-label {
      color: #999;
      font-weight: 500;
    }
    .detail-value {
      color: #333;
      font-weight: 600;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
      padding: 15px 0;
      border-top: 2px solid #00ff88;
      border-bottom: 2px solid #00ff88;
      font-size: 16px;
      font-weight: bold;
    }
    .total-label {
      color: #333;
    }
    .total-value {
      color: #00ff88;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #999;
      font-size: 12px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      margin-top: 10px;
    }
    .status-completed {
      background-color: #e8f5e9;
      color: #2e7d32;
    }
    .status-pending {
      background-color: #fff3e0;
      color: #e65100;
    }
    .status-failed {
      background-color: #ffebee;
      color: #c62828;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>OSINT Scanner</h1>
      <p>Payment Receipt</p>
      <div class="receipt-number">Receipt #${data.receiptNumber}</div>
    </div>

    <div class="section">
      <div class="section-title">Customer Information</div>
      <div class="section-content">
        <div class="detail-row">
          <span class="detail-label">Name:</span>
          <span class="detail-value">${data.customerName || "N/A"}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span>
          <span class="detail-value">${data.customerEmail}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Transaction Details</div>
      <div class="section-content">
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${data.date.toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Transaction ID:</span>
          <span class="detail-value">${data.transactionId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Payment Method:</span>
          <span class="detail-value">${data.paymentMethod.toUpperCase()}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Order Summary</div>
      <div class="section-content">
        <div class="detail-row">
          <span class="detail-label">${data.planName}</span>
          <span class="detail-value">${data.currency} ${formattedAmount}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Description:</span>
          <span class="detail-value">${data.description}</span>
        </div>
        ${data.taxAmount ? `
        <div class="detail-row">
          <span class="detail-label">Tax:</span>
          <span class="detail-value">${data.currency} ${formattedTax}</span>
        </div>
        ` : ""}
        <div class="total-row">
          <span class="total-label">Total Amount:</span>
          <span class="total-value">${data.currency} ${formattedTotal}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Status</div>
      <div class="section-content">
        <span class="status-badge status-completed">✓ Payment Completed</span>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for your purchase! Your subscription is now active.</p>
      <p>If you have any questions, please contact support@osintscan.io</p>
      <p style="margin-top: 20px; color: #ccc;">
        This is an automated receipt. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate plain text receipt
 */
export function generateTextReceipt(data: ReceiptData): string {
  const formattedAmount = (data.amount / 100).toFixed(2);
  const formattedTotal = (data.totalAmount / 100).toFixed(2);
  const formattedTax = data.taxAmount ? (data.taxAmount / 100).toFixed(2) : "0.00";

  return `
================================================================================
                            OSINT SCANNER RECEIPT
================================================================================

Receipt Number: ${data.receiptNumber}
Date: ${data.date.toLocaleDateString()} ${data.date.toLocaleTimeString()}

CUSTOMER INFORMATION
================================================================================
Name:  ${data.customerName || "N/A"}
Email: ${data.customerEmail}

TRANSACTION DETAILS
================================================================================
Transaction ID:  ${data.transactionId}
Payment Method:  ${data.paymentMethod.toUpperCase()}
Status:          COMPLETED

ORDER SUMMARY
================================================================================
Plan:            ${data.planName}
Amount:          ${data.currency} ${formattedAmount}
Description:     ${data.description}
${data.taxAmount ? `Tax:             ${data.currency} ${formattedTax}` : ""}

================================================================================
TOTAL:           ${data.currency} ${formattedTotal}
================================================================================

Thank you for your purchase! Your subscription is now active.

If you have any questions, please contact support@osintscan.io

This is an automated receipt. Please do not reply to this email.
================================================================================
  `;
}

/**
 * Create receipt data from payment record
 */
export function createReceiptData(
  payment: Payment,
  customerEmail: string,
  customerName?: string,
  planName: string = "OSINT Scanner Premium"
): ReceiptData {
  return {
    receiptNumber: generateReceiptNumber(payment.id, payment.createdAt),
    date: payment.createdAt,
    amount: payment.amount,
    currency: payment.currency,
    paymentMethod: payment.paymentMethod,
    transactionId: payment.paypalTransactionId,
    customerEmail,
    customerName,
    planName,
    description: "Monthly subscription to OSINT Scanner Premium features",
    totalAmount: payment.amount,
  };
}

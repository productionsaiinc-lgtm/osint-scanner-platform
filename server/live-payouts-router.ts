import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import axios from "axios";

/**
 * Live PayPal Payouts Dashboard Router
 * Fetches real payout data from PayPal API
 */

// Get PayPal access token
async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  try {
    const response = await axios.post(
      "https://api.paypal.com/v1/oauth2/token",
      "grant_type=client_credentials",
      {
        auth: {
          username: clientId,
          password: clientSecret,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error("Failed to get PayPal access token:", error);
    throw new Error("Failed to authenticate with PayPal");
  }
}

export const livePayoutsRouter = router({
  /**
   * Get live payout batches from PayPal
   */
  getPayoutBatches: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }: { input: { limit: number; offset: number } }) => {
      try {
        const accessToken = await getPayPalAccessToken();

        const response = await axios.get(
          "https://api.paypal.com/v1/payments/payouts",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            params: {
              page_size: input.limit,
              page: Math.floor(input.offset / input.limit) + 1,
            },
          }
        );

        return {
          batches: response.data.batch_header || [],
          totalItems: response.data.total_items || 0,
          totalPages: response.data.total_pages || 0,
        };
      } catch (error) {
        console.error("Failed to fetch payout batches:", error);
        return {
          batches: [],
          totalItems: 0,
          totalPages: 0,
          error: "Failed to fetch payout data",
        };
      }
    }),

  /**
   * Get details of a specific payout batch
   */
  getPayoutBatchDetails: protectedProcedure
    .input(z.object({ batchId: z.string() }))
    .query(async ({ input }: { input: { batchId: string } }) => {
      try {
        const accessToken = await getPayPalAccessToken();

        const response = await axios.get(
          `https://api.paypal.com/v1/payments/payouts/${input.batchId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        return {
          batchHeader: response.data.batch_header,
          items: response.data.items || [],
        };
      } catch (error) {
        console.error("Failed to fetch payout batch details:", error);
        return {
          batchHeader: null,
          items: [],
          error: "Failed to fetch batch details",
        };
      }
    }),

  /**
   * Get payout summary statistics
   */
  getPayoutSummary: protectedProcedure.query(async () => {
    try {
      const accessToken = await getPayPalAccessToken();

      // Fetch last 50 payouts to calculate summary
      const response = await axios.get(
        "https://api.paypal.com/v1/payments/payouts",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          params: {
            page_size: 50,
            page: 1,
          },
        }
      );

      const batches = response.data.batch_header || [];

      // Calculate statistics
      let totalAmount = 0;
      let successCount = 0;
      let pendingCount = 0;
      let failedCount = 0;

      batches.forEach((batch: Record<string, any>) => {
        const amount = parseFloat(batch.amount?.value || 0);
        totalAmount += amount;

        switch (batch.batch_status) {
          case "SUCCESS":
            successCount++;
            break;
          case "PROCESSING":
            pendingCount++;
            break;
          case "FAILED":
            failedCount++;
            break;
        }
      });

      return {
        totalPayouts: batches.length,
        totalAmount: totalAmount.toFixed(2),
        successCount,
        pendingCount,
        failedCount,
        successRate:
          batches.length > 0
            ? ((successCount / batches.length) * 100).toFixed(1)
            : 0,
        lastPayout: batches[0]?.create_time || null,
      };
    } catch (error) {
      console.error("Failed to fetch payout summary:", error);
      return {
        totalPayouts: 0,
        totalAmount: "0.00",
        successCount: 0,
        pendingCount: 0,
        failedCount: 0,
        successRate: 0,
        lastPayout: null,
        error: "Failed to fetch summary",
      };
    }
  }),

  /**
   * Get recent payout items with details
   */
  getRecentPayouts: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input }: { input: { limit: number } }) => {
      try {
        const accessToken = await getPayPalAccessToken();

        const response = await axios.get(
          "https://api.paypal.com/v1/payments/payouts",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            params: {
              page_size: input.limit,
              page: 1,
            },
          }
        );

        const batches = response.data.batch_header || [];

        // Transform batch data to payout items
        const payouts = batches.map((batch: Record<string, any>) => ({
          id: batch.payout_batch_id,
          batchId: batch.payout_batch_id,
          amount: batch.amount?.value || "0",
          currency: batch.amount?.currency_code || "USD",
          status: batch.batch_status,
          itemCount: batch.items_processed || 0,
          successCount: batch.successful_items || 0,
          failedCount: batch.failed_items || 0,
          createdAt: batch.create_time,
          updatedAt: batch.update_time,
        }));

        return payouts;
      } catch (error) {
        console.error("Failed to fetch recent payouts:", error);
        return [];
      }
    }),

  /**
   * Trigger a manual payout to your PayPal account
   */
  triggerManualPayout: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(0.01),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ input }: { input: { amount: number; note?: string } }) => {
      try {
        const accessToken = await getPayPalAccessToken();
        const payoutEmail = process.env.PAYPAL_PAYOUT_EMAIL;

        if (!payoutEmail) {
          throw new Error("Payout email not configured");
        }

        const payoutData = {
          sender_batch_header: {
            sender_batch_id: `payout-${Date.now()}`,
            email_subject: "Your OSINT Platform Payout",
            email_message: input.note || "Your payout from OSINT Scanner Platform",
          },
          items: [
            {
              recipient_type: "EMAIL",
              amount: {
                value: input.amount.toFixed(2),
                currency: "USD",
              },
              receiver: payoutEmail,
              note: input.note || "Payout from OSINT Scanner Platform",
            },
          ],
        };

        const response = await axios.post(
          "https://api.paypal.com/v1/payments/payouts",
          payoutData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        return {
          success: true,
          batchId: response.data.batch_header?.payout_batch_id,
          message: `Payout of $${input.amount} initiated successfully`,
        };
      } catch (error: any) {
        console.error("Failed to trigger payout:", error);
        return {
          success: false,
          error: error.response?.data?.message || "Failed to trigger payout",
        };
      }
    }),

  /**
   * Get payout status for a specific batch
   */
  getPayoutStatus: protectedProcedure
    .input(z.object({ batchId: z.string() }))
    .query(async ({ input }: { input: { batchId: string } }) => {
      try {
        const accessToken = await getPayPalAccessToken();

        const response = await axios.get(
          `https://api.paypal.com/v1/payments/payouts/${input.batchId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const header = response.data.batch_header;

        return {
          batchId: header.payout_batch_id,
          status: header.batch_status,
          totalAmount: header.amount?.value || "0",
          itemsProcessed: header.items_processed || 0,
          successfulItems: header.successful_items || 0,
          failedItems: header.failed_items || 0,
          createdAt: header.create_time,
          updatedAt: header.update_time,
        };
      } catch (error) {
        console.error("Failed to get payout status:", error);
        return {
          error: "Failed to fetch payout status",
        };
      }
    }),
});

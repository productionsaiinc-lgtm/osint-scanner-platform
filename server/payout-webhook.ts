import { Request, Response } from 'express';
import crypto from 'crypto';

const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || '';

interface WebhookEvent {
  id: string;
  event_type: string;
  resource: {
    id: string;
    status: string;
    amount?: {
      value: string;
      currency_code: string;
    };
    payer_name?: {
      given_name: string;
      surname: string;
    };
    receiver?: {
      email: string;
    };
    create_time?: string;
  };
  create_time: string;
}

/**
 * Verify PayPal webhook signature
 */
export async function verifyPayPalSignature(
  req: Request,
  transmissionId: string,
  transmissionTime: string,
  certUrl: string,
  actualSignature: string
): Promise<boolean> {
  try {
    // In production, implement full signature verification with certificate
    // For now, we'll do a simple validation using webhook secret
    const expectedSignature = crypto
      .createHmac('sha256', process.env.PAYPAL_WEBHOOK_SECRET || '')
      .update(`${transmissionId}|${transmissionTime}|${PAYPAL_WEBHOOK_ID}|${JSON.stringify(req.body)}`)
      .digest('base64');

    return actualSignature === expectedSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Handle PayPal webhook events
 */
export async function handlePayPalWebhook(req: Request, res: Response) {
  try {
    const event: WebhookEvent = req.body;
    const transmissionId = req.headers['paypal-transmission-id'] as string;
    const transmissionTime = req.headers['paypal-transmission-time'] as string;
    const certUrl = req.headers['paypal-cert-url'] as string;
    const actualSignature = req.headers['paypal-auth-algo'] as string;

    // Verify webhook signature
    const isValid = await verifyPayPalSignature(
      req,
      transmissionId,
      transmissionTime,
      certUrl,
      actualSignature
    );

    if (!isValid) {
      console.warn('Invalid PayPal webhook signature');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log(`Processing PayPal webhook: ${event.event_type}`);

    // Handle different event types
    switch (event.event_type) {
      case 'PAYMENT.PAYOUTSBATCH.SUCCESS':
        await handlePayoutSuccess(event);
        break;

      case 'PAYMENT.PAYOUTSBATCH.DENIED':
        await handlePayoutDenied(event);
        break;

      case 'PAYMENT.PAYOUTS_ITEM.SUCCESS':
        await handlePayoutItemSuccess(event);
        break;

      case 'PAYMENT.PAYOUTS_ITEM.FAILED':
        await handlePayoutItemFailed(event);
        break;

      case 'PAYMENT.PAYOUTS_ITEM.BLOCKED':
        await handlePayoutItemBlocked(event);
        break;

      case 'PAYMENT.PAYOUTS_ITEM.UNCLAIMED':
        await handlePayoutItemUnclaimed(event);
        break;

      default:
        console.log(`Unhandled event type: ${event.event_type}`);
    }

    // Return 200 OK to acknowledge receipt
    res.status(200).json({ status: 'received' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Handle successful payout batch
 */
async function handlePayoutSuccess(event: WebhookEvent) {
  try {
    const batchId = event.resource.id;
    console.log(`Payout batch ${batchId} completed successfully`);
  } catch (error) {
    console.error('Error handling payout success:', error);
  }
}

/**
 * Handle denied payout batch
 */
async function handlePayoutDenied(event: WebhookEvent) {
  try {
    const batchId = event.resource.id;
    console.log(`Payout batch ${batchId} was denied`);
  } catch (error) {
    console.error('Error handling payout denied:', error);
  }
}

/**
 * Handle successful individual payout item
 */
async function handlePayoutItemSuccess(event: WebhookEvent) {
  try {
    const payoutId = event.resource.id;
    const amount = event.resource.amount?.value || '0';
    const payoutBatchId = event.id;
    const amountInCents = Math.floor(parseFloat(amount) * 100);

    // Log the payout for now
    // In production, you'd record this in your database
    console.log(`Recording payout: ${payoutBatchId} - ${amountInCents} cents`);
    console.log(`Payout item ${payoutId} completed successfully for ${amount}`);
  } catch (error) {
    console.error('Error handling payout item success:', error);
  }
}

/**
 * Handle failed individual payout item
 */
async function handlePayoutItemFailed(event: WebhookEvent) {
  try {
    const payoutId = event.resource.id;
    console.log(`Payout item ${payoutId} failed`);
  } catch (error) {
    console.error('Error handling payout item failed:', error);
  }
}

/**
 * Handle blocked individual payout item
 */
async function handlePayoutItemBlocked(event: WebhookEvent) {
  try {
    const payoutId = event.resource.id;
    console.log(`Payout item ${payoutId} was blocked`);
  } catch (error) {
    console.error('Error handling payout item blocked:', error);
  }
}

/**
 * Handle unclaimed individual payout item
 */
async function handlePayoutItemUnclaimed(event: WebhookEvent) {
  try {
    const payoutId = event.resource.id;
    console.log(`Payout item ${payoutId} is unclaimed`);
  } catch (error) {
    console.error('Error handling payout item unclaimed:', error);
  }
}

/**
 * Register webhook endpoint in Express app
 */
export function registerPayoutWebhook(app: any) {
  app.post('/api/webhooks/paypal/payouts', handlePayPalWebhook);
  console.log('PayPal payout webhook registered at /api/webhooks/paypal/payouts');
}

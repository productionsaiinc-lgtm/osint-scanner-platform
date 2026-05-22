# Stripe Production Transition Guide

## Overview

Your OSINT platform is currently using **Stripe Sandbox** (test mode). This guide will help you transition to **Stripe Production** (live mode) to accept real payments.

## Current Status

| Item | Status |
|------|--------|
| Sandbox Testing | ✅ Complete (175 test transactions) |
| Webhook Configuration | ✅ Ready |
| Payment Processing | ✅ Configured |
| Live Keys | ⏳ Needed |

## Step 1: Claim Your Stripe Sandbox

If you haven't already, claim your Stripe sandbox account:

**URL:** https://dashboard.stripe.com/claim_sandbox/YWNjdF8xVEtBRURCMmFEYWVYd1dqLDE3NzYzNDU2MjYv100oG9caUrh

This gives you full access to your Stripe account dashboard.

## Step 2: Complete Stripe KYC Verification

1. Go to **https://dashboard.stripe.com**
2. Sign in with your Stripe account
3. Navigate to **Settings → Account** (or click "Complete verification")
4. Fill out the KYC (Know Your Customer) form:
   - Business information
   - Owner details
   - Bank account for payouts
   - Tax information
5. Submit for verification

**Timeline:** Verification typically takes 1-2 business days

## Step 3: Get Your Live API Keys

Once KYC is approved:

1. Go to **https://dashboard.stripe.com/apikeys**
2. Toggle to **Live** mode (top right)
3. Copy your live keys:
   - **Publishable Key** (starts with `pk_live_`)
   - **Secret Key** (starts with `sk_live_`)
4. Keep these secure - never share them

## Step 4: Update Manus Settings

1. Go to your OSINT platform: **https://osintscan-fftqerzj.manus.space**
2. Click **Settings** (top right)
3. Go to **Payment**
4. Update the following:
   - **Stripe Publishable Key:** Paste your live `pk_live_` key
   - **Stripe Secret Key:** Paste your live `sk_live_` key
   - **Mode:** Switch from "Sandbox" to "Production"
5. Click **Save**

## Step 5: Configure Webhook

Your webhook is already set up, but verify it's using the live endpoint:

1. Go to **https://dashboard.stripe.com/webhooks**
2. Click **Add endpoint**
3. Configure:
   - **Endpoint URL:** `https://osintscan-fftqerzj.manus.space/api/stripe/webhook`
   - **Events:** Select all payment events (payment_intent.succeeded, charge.failed, etc.)
   - **Version:** Use latest API version
4. Copy the **Signing Secret** (starts with `whsec_`)
5. Add to Manus Settings → Secrets as `STRIPE_WEBHOOK_SECRET`

## Step 6: Test Live Payments

Before going fully live, test with a real card:

1. Use Stripe test card: **4242 4242 4242 4242**
   - Expiry: Any future date
   - CVC: Any 3 digits
2. Process a small test payment ($0.50 minimum)
3. Verify:
   - Payment appears in Stripe Dashboard
   - Webhook fires successfully
   - Payment recorded in your database

## Step 7: Enable Production Promo Code

To test production payments safely:

1. Go to **Settings → Payment** on your platform
2. Generate a **99% discount promo code**
3. Use this code for testing (charges only $0.01 instead of full price)
4. Verify the discounted charge processes correctly

## Step 8: Go Live

Once testing is complete:

1. Remove the test promo code
2. Announce to users that live payments are now active
3. Monitor the first few transactions in Stripe Dashboard
4. Set up payout schedule (daily, weekly, or monthly)

## Important Notes

⚠️ **Minimum Transaction Amount:** Stripe requires minimum $0.50 USD per transaction

⚠️ **PCI Compliance:** Your platform is PCI-compliant (Stripe handles card data)

⚠️ **Webhook Security:** Always verify webhook signatures before processing

⚠️ **Payout Schedule:** Configure when funds transfer to your bank account

## Troubleshooting

### Webhook Not Firing
- Check webhook endpoint URL is correct
- Verify signing secret is set
- Check Stripe Dashboard → Webhooks for failed deliveries

### Payments Declining
- Ensure live keys are configured (not test keys)
- Check card is not expired
- Verify amount is >= $0.50

### Funds Not Appearing
- Check payout schedule (may take 1-2 business days)
- Verify bank account is connected
- Check Stripe Dashboard → Payouts for status

## Production Checklist

- [ ] Stripe KYC verification complete
- [ ] Live API keys obtained
- [ ] Manus Settings updated with live keys
- [ ] Webhook configured and tested
- [ ] Test payment processed successfully
- [ ] Payout schedule configured
- [ ] Bank account verified
- [ ] Team notified of production status
- [ ] Monitoring set up for failed payments

## Support

For Stripe-specific issues: https://support.stripe.com

For Manus platform issues: https://help.manus.im

## Next Steps

1. Complete KYC verification (1-2 days)
2. Obtain live API keys
3. Update Manus settings
4. Test with production promo code
5. Go live and monitor transactions

---

**Your Platform is Ready for Production!** 🚀

Once you have your live keys, you can start accepting real payments from your OSINT platform users.

# Webhook Contracts

**Date**: 2026-04-01

## Stripe Webhooks → Platform

**Endpoint**: `POST /api/webhooks/stripe`  
**Verification**: `stripe.webhooks.constructEvent(body, sig, secret)` — reject if signature invalid.  
**Source of truth**: Stripe webhooks are authoritative for all subscription state (Constitution V).

### checkout.session.completed

**Trigger**: User completes Stripe Checkout (new subscription or team license).

**Action**:
1. Create/update `subscriptions` row with `status: 'trialing'` or `status: 'active'`
2. Update `users.role` if team admin purchase
3. Process referral reward if `metadata.referral_code` present
4. Send welcome email via Resend

**Idempotency**: Check if `stripe_subscription_id` already exists before creating.

---

### customer.subscription.updated

**Trigger**: Subscription status change (trial → active, active → canceled, plan change).

**Action**:
1. Update `subscriptions` row: `status`, `current_period_end`, `canceled_at`
2. If `status` changed to `canceled`: send cancellation confirmation email
3. If `status` changed to `active` from `trialing`: send trial-converted email

**Idempotency**: Compare `updated_at` with event timestamp. Skip if stale.

---

### customer.subscription.deleted

**Trigger**: Subscription fully terminated (end of billing period after cancellation, or immediate deletion).

**Action**:
1. Update `subscriptions.status` to `'expired'`
2. If team license: set all `team_members.removed_at` to now
3. Send subscription-ended email

---

### invoice.payment_failed

**Trigger**: Payment attempt failed (card declined, insufficient funds).

**Action**:
1. Update `subscriptions.status` to `'past_due'`
2. Send payment-failed notification email with Stripe portal link
3. Log attempt count (Stripe handles retries; we track for user communication)

**Retry behavior**: Stripe Smart Retries attempt 3 times over ~7 days. After final failure, `customer.subscription.deleted` fires.

---

### invoice.paid

**Trigger**: Successful payment (initial, renewal, or retry after failure).

**Action**:
1. Update `subscriptions.status` to `'active'`, update `current_period_end`
2. If was `past_due`: send payment-recovered email
3. If referral reward pending: apply free month credit via Stripe

---

## Bunny.net Webhooks (Future)

Not used in V1. Video upload and encoding status tracked via Bunny.net dashboard/API polling. Webhook integration deferred until admin panel video upload is built.

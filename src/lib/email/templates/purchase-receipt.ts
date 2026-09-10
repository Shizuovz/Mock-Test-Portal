export interface PurchaseReceiptPayload {
  orderId: string;
  paymentId: string;
  amountPaise: number;
  currency: string;
  planName: string;
  expiresAt: string;
}

export function renderPurchaseReceiptHtml(payload: PurchaseReceiptPayload): string {
  const formattedAmount = (payload.amountPaise / 100).toFixed(2);
  const formattedDate = new Date(payload.expiresAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Receipt — Mock Test Portal</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #0F172A; margin: 0; padding: 32px 16px; }
    .container { max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; padding: 32px; }
    .header { text-align: center; border-bottom: 1px solid #F1F5F9; padding-bottom: 24px; margin-bottom: 24px; }
    .badge { display: inline-block; background: #ECFDF5; color: #059669; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; }
    .title { font-size: 24px; font-weight: 800; margin: 12px 0 4px; color: #0F172A; }
    .receipt-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 24px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E2E8F0; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .label { color: #64748B; }
    .value { font-weight: 600; color: #0F172A; text-align: right; }
    .total-row { font-size: 16px; font-weight: 700; color: #4F46E5; }
    .cta { display: block; text-align: center; background: #4F46E5; color: #FFFFFF; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px; border-radius: 8px; margin-top: 24px; }
    .footer { text-align: center; font-size: 12px; color: #94A3B8; margin-top: 32px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">Payment Confirmed</span>
      <h1 class="title">Your All-Access Pass is Active</h1>
      <p style="color: #64748B; font-size: 14px; margin: 0;">Thank you for subscribing to Mock Test Portal.</p>
    </div>

    <div class="receipt-box">
      <div class="row">
        <span class="label">Plan</span>
        <span class="value">${payload.planName || "All-Access Pass"}</span>
      </div>
      <div class="row">
        <span class="label">Order ID</span>
        <span class="value">${payload.orderId}</span>
      </div>
      <div class="row">
        <span class="label">Payment ID</span>
        <span class="value">${payload.paymentId}</span>
      </div>
      <div class="row">
        <span class="label">Valid Until</span>
        <span class="value">${formattedDate}</span>
      </div>
      <div class="row total-row">
        <span class="label" style="color: #4F46E5;">Amount Paid</span>
        <span class="value" style="color: #4F46E5;">₹${formattedAmount}</span>
      </div>
    </div>

    <a href="https://mocktestportal.com/dashboard" class="cta">Go to My Test Dashboard →</a>

    <div class="footer">
      <p>This document serves as your official payment receipt for subscription access.</p>
      <p>Mock Test Portal &bull; If you have questions, reach us at support@mocktestportal.com</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

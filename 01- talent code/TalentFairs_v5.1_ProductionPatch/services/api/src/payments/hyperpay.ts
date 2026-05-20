// services/api/src/payments/hyperpay.ts
import type { Request, Response } from "express";
import fetch from "node-fetch";

/**
 * HyperPay COPYandPAY best practice:
 * 1) After shopper returns to your returnUrl, DO NOT trust query alone.
 * 2) Server-side GET: /v1/checkouts/{checkoutId}/payment with Authorization header to verify status.
 * 3) Finalize order only on a successful status (e.g., 'completed' or result.code starting with '000.000.').
 */
export async function hyperpayVerify(req: Request, res: Response) {
  const checkoutId = (req.query.id || req.body.id) as string;
  if (!checkoutId) return res.status(400).json({ error: "missing checkout id" });
  const entityId = process.env.HYPERPAY_ENTITY_ID!;
  const token = process.env.HYPERPAY_TOKEN!; // Bearer token from HyperPay backoffice
  const url = `https://oppwa.com/v1/checkouts/${checkoutId}/payment?entityId=${encodeURIComponent(entityId)}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await r.json();
  // TODO: persist raw payload
  return res.json({ ok: true, data });
}

import type { Request, Response } from "express";
import fetch from "node-fetch";
export async function hyperpayVerify(req: Request, res: Response) {
  const checkoutId = (req.query.id || req.body.id) as string;
  if (!checkoutId) return res.status(400).json({ error: "missing checkout id" });
  const entityId = process.env.HYPERPAY_ENTITY_ID!;
  const token = process.env.HYPERPAY_TOKEN!;
  const url = `https://oppwa.com/v1/checkouts/${checkoutId}/payment?entityId=${encodeURIComponent(entityId)}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await r.json();
  return res.json({ ok: true, data });
}

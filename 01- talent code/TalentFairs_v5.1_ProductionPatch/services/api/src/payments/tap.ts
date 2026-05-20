// services/api/src/payments/tap.ts
import type { Request, Response } from "express";
import crypto from "crypto";

function verifyTapSignature(rawBody: string, secret: string, signatureHeader: string | undefined) {
  if (!signatureHeader) return false;
  // Tap sends a hashstring signature header; HMAC-SHA256 validation pattern
  const expected = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  return signatureHeader.indexOf(expected) !== -1;
}

export async function tapWebhook(req: Request, res: Response) {
  const signature = req.header("tap-signature") || req.header("x-tap-signature") || "";
  const secret = process.env.TAP_WEBHOOK_SECRET!;
  const raw = (req as any).rawBody || JSON.stringify(req.body);
  const valid = verifyTapSignature(raw, secret, signature);
  if (!valid) return res.status(400).json({ error: "invalid signature" });
  // idempotent handling by charge id
  const event = req.body;
  // TODO: fetch charge details from Tap if needed, then update ledger
  return res.json({ received: true });
}

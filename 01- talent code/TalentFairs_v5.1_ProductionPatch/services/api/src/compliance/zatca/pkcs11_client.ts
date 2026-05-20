// services/api/src/compliance/zatca/pkcs11_client.ts
/**
 * Replace stub with actual PKCS#11 access to your HSM/Token to produce ECDSA signatures.
 * Typical flow:
 *  - Load PKCS#11 library (vendor .so/.dll)
 *  - Open session with PIN
 *  - Find private key by LABEL
 *  - Sign invoice hash (per ZATCA security spec)
 */
export interface SignRequest { digestHex: string; mechanism?: "ECDSA"; }
export interface SignResult { signatureHex: string; certSerial?: string; }

export async function signWithHSM(req: SignRequest): Promise<SignResult> {
  // Placeholder. Integrate with vendor SDK or pkcs11js.
  if (!req.digestHex) throw new Error("digestHex required");
  return { signatureHex: "DEADBEEF", certSerial: process.env.ZATCA_CERT_SERIAL };
}

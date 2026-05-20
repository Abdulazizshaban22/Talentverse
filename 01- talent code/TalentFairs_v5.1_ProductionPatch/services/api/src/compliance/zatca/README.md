# ZATCA Phase‑2 Integration Notes (PKCS#11 + Clearance/Reporting)

1. Load vendor PKCS#11 library and sign invoice digest using ECDSA per ZATCA "Security Features Implementation Standards".
2. Submit XML invoice to FATOORA "Clearance" (B2B) or "Reporting" (B2C) API endpoints.
3. Persist the API response (including cryptographic stamp / QR details) with the invoice record.
4. Rotate CSID on schedule and handle OTP via Simulation/Portal during onboarding.

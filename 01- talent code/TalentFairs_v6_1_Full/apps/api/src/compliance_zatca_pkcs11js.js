// Stub: replace with pkcs11js + vendor flow in production
export async function zatcaSignHandler(req, res){
  try{
    const digestHex = String(req.body?.digestHex || '')
    if(!digestHex) return res.status(400).json({ ok:false, error:'digestHex required' })
    // Demo signature only (not real ECDSA)
    return res.json({ ok:true, signatureHex:'DEADBEEF', certSerial: process.env.ZATCA_CERT_SERIAL || 'demo' })
  }catch(e){
    return res.status(500).json({ ok:false, error: e.message })
  }
}

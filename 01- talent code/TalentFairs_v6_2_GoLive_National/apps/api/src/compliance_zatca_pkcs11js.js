// Production note: replace with a real PKCS#11 flow from your HSM vendor
export async function zatcaSignHandler(req,res){
  const digestHex = String(req.body?.digestHex||'')
  if(!digestHex) return res.status(400).json({ ok:false, error:'digestHex required' })
  return res.json({ ok:true, signatureHex:'DEADBEEF', certSerial: process.env.ZATCA_CERT_SERIAL || 'demo' })
}

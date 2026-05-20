
import { NextRequest, NextResponse } from 'next/server'
const API_BASE = process.env.API_BASE || 'http://localhost:8000'
export async function GET(req: NextRequest, { params }: { params: { path: string[] } }){
  const url = `${API_BASE}/${params.path.join('/')}${req.nextUrl.search}`
  const res = await fetch(url); const data = await res.text()
  return new NextResponse(data, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } })
}

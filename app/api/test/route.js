import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    hasApiKey: !!process.env.GEMINI_API_KEY,
    keyPreview: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + '...' : 'NOT_FOUND'
  })
}
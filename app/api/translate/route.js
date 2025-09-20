import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()
    const { text, targetLanguage } = body
    
    if (!text || !targetLanguage) {
      return NextResponse.json({ error: 'Text and target language are required' }, { status: 400 })
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env.GEMINI_API_KEY}`

    const payload = {
      contents: [{
        parts: [{
          text: `Translate the following text into the language code "${targetLanguage}".
          \nText: "${text}"`
        }]
      }]
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.status}`)
    }

    const result = await response.json()
    const translatedText = result.candidates[0].content.parts[0].text

    return NextResponse.json({ translatedText })
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json({ error: 'Failed to translate text' }, { status: 500 })
  }
}
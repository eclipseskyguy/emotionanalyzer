import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()
    const { text, language } = body
    
    if (!text || !language) {
      return NextResponse.json({ error: 'Text and language are required' }, { status: 400 })
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${process.env.GEMINI_API_KEY}`

    const payload = {
      contents: [{
        parts: [{
          text: text
        }]
      }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Puck" }
          },
          languageCode: language
        }
      },
      model: "gemini-2.5-flash-preview-tts"
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`TTS failed: ${response.status}`)
    }

    const result = await response.json()
    const part = result?.candidates?.[0]?.content?.parts?.[0]
    const audioData = part?.inlineData?.data
    const mimeType = part?.inlineData?.mimeType

    if (audioData && mimeType && mimeType.startsWith("audio/")) {
      return NextResponse.json({ audioData, mimeType })
    } else {
      throw new Error('Invalid TTS response')
    }
  } catch (error) {
    console.error('TTS error:', error)
    return NextResponse.json({ error: 'Failed to generate audio' }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    console.log('Transcribe API called')
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY)
    
    const body = await req.json()
    const { audioData } = body
    
    if (!audioData) {
      console.log('No audio data provided')
      return NextResponse.json({ error: 'Audio data is required' }, { status: 400 })
    }

    console.log('Audio data length:', audioData.length)

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env.GEMINI_API_KEY}`

    const payload = {
      contents: [{
        parts: [
          { text: "Transcribe the following audio into text." },
          { inlineData: { mimeType: "audio/webm", data: audioData } }
        ]
      }]
    }

    console.log('Calling Gemini API...')
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    console.log('Gemini API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('Gemini API error:', errorText)
      throw new Error(`Transcription failed: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    const transcribedText = result.candidates[0].content.parts[0].text

    console.log('Transcription successful')
    return NextResponse.json({ transcribedText })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json({ 
      error: 'Failed to transcribe audio', 
      details: error.message 
    }, { status: 500 })
  }
}
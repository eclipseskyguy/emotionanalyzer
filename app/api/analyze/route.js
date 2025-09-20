import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()
    const { text } = body
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const emotions = [
      'angry', 'emotional', 'happy', 'irritated', 'frustrated', 
      'annoyed', 'surprised', 'interrogative', 'in need of help', 'overwhelmed'
    ]

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env.GEMINI_API_KEY}`

    const payload = {
      contents: [{
        parts: [{
          text: `Analyze the following text for its primary emotion. Your response must be a JSON object with 'emotion' and 'emoji' keys. The 'emotion' value must be one of these: ${emotions.join(', ')}. The 'emoji' must be a single emoji that best represents the emotion.
          \nText: "${text}"`
        }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            "emotion": {
              "type": "STRING",
              "enum": emotions
            },
            "emoji": {
              "type": "STRING",
            }
          },
          required: ["emotion", "emoji"]
        }
      }
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Emotion analysis failed: ${response.status}`)
    }

    const result = await response.json()
    const jsonText = result.candidates[0].content.parts[0].text
    const parsedJson = JSON.parse(jsonText)

    return NextResponse.json(parsedJson)
  } catch (error) {
    console.error('Emotion analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze emotion' }, { status: 500 })
  }
}
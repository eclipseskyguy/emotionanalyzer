'use client'

import { useState, useRef } from 'react'

export default function EmotionAnalyzer() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcribedText, setTranscribedText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [emotion, setEmotion] = useState('')
  const [emoji, setEmoji] = useState('')
  const [resultText, setResultText] = useState('Press "Start Recording" to begin...')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en-US')
  const [backgroundColor, setBackgroundColor] = useState('#c3a4ff')
  const [audioUrl, setAudioUrl] = useState('')

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const emotionColors = {
    'angry': '#ef4444',
    'emotional': '#a855f7',
    'happy': '#22c55e',
    'irritated': '#f97316',
    'frustrated': '#facc15',
    'annoyed': '#ec4899',
    'surprised': '#14b8a6',
    'interrogative': '#0ea5e9',
    'in need of help': '#9ca3af',
    'overwhelmed': '#d946ef'
  }

  const updateResultState = (text, emojiChar, color) => {
    setResultText(text)
    setEmoji(emojiChar)
    setBackgroundColor(color)
  }

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]
        resolve(base64String)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const pcmToWav = (pcmData, sampleRate) => {
    const buffer = new ArrayBuffer(44 + pcmData.length * 2)
    const view = new DataView(buffer)

    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    // WAV header
    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + pcmData.length * 2, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(view, 36, 'data')
    view.setUint32(40, pcmData.length * 2, true)

    // Write PCM data
    for (let i = 0; i < pcmData.length; i++) {
      view.setInt16(44 + i * 2, pcmData[i], true)
    }

    return new Blob([view], { type: 'audio/wav' })
  }

  const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  const startRecording = async () => {
    console.log('startRecording called')
    try {
      console.log('Requesting microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log('Microphone access granted')
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' })

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        audioChunksRef.current = []
        setIsRecording(false)
        analyzeAudio(audioBlob)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      updateResultState('Recording... Say something!', '🔴', '#dc2626')

    } catch (err) {
      console.error('Error accessing microphone:', err)
      updateResultState('Error: Microphone access denied.', '⚠️', '#ef4444')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }
  }

  const analyzeAudio = async (audioBlob) => {
    setIsLoading(true)
    setTranscribedText('')
    setTranslatedText('')
    setAudioUrl('')
    updateResultState('Transcribing audio...', '...', '#3b82f6')

    try {
      const base64Audio = await blobToBase64(audioBlob)

      // Transcribe audio
      const transcribeResponse = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioData: base64Audio })
      })

      if (!transcribeResponse.ok) {
        throw new Error(`Transcription failed: ${transcribeResponse.status}`)
      }

      const transcribeResult = await transcribeResponse.json()
      const transcribedText = transcribeResult.transcribedText
      setTranscribedText(transcribedText)

      // Parallel emotion analysis and translation
      const [emotionResponse, translationResponse] = await Promise.all([
        fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: transcribedText })
        }),
        fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: transcribedText, 
            targetLanguage: selectedLanguage 
          })
        })
      ])

      if (!emotionResponse.ok || !translationResponse.ok) {
        throw new Error('Analysis or translation failed')
      }

      const emotionResult = await emotionResponse.json()
      const translationResult = await translationResponse.json()

      // Update UI with results
      const { emotion, emoji } = emotionResult
      const color = emotionColors[emotion] || '#a78bfa'
      setEmotion(emotion)
      updateResultState(`Emotion: ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`, emoji, color)
      
      setTranslatedText(translationResult.translatedText)
      await generateTranslatedAudio(translationResult.translatedText, selectedLanguage)

    } catch (error) {
      console.error('Error in audio analysis pipeline:', error)
      updateResultState('Sorry, an error occurred during processing.', '⚠️', '#ef4444')
    } finally {
      setIsLoading(false)
    }
  }

  const generateTranslatedAudio = async (text, language) => {
    try {
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language })
      })

      if (!ttsResponse.ok) {
        throw new Error(`TTS failed: ${ttsResponse.status}`)
      }

      const result = await ttsResponse.json()
      const { audioData, mimeType } = result

      if (audioData && mimeType && mimeType.startsWith("audio/")) {
        const sampleRate = parseInt(mimeType.match(/rate=(\d+)/)[1], 10)
        const pcmData = base64ToArrayBuffer(audioData)
        const pcm16 = new Int16Array(pcmData)
        const wavBlob = pcmToWav(pcm16, sampleRate)
        const audioUrl = URL.createObjectURL(wavBlob)
        setAudioUrl(audioUrl)
      }
    } catch (error) {
      console.error('TTS error:', error)
    }
  }

  return (
    <div 
      className="min-h-screen flex flex-col justify-center items-center p-4 transition-colors duration-500"
      style={{ backgroundColor }}
    >
      <div className="flex flex-col items-center max-w-lg w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
          Emotion Analyzer
        </h1>
        <p className="text-gray-200 mb-8 font-light drop-shadow-md">
          Speak your mind, and let's discover the tone.
        </p>
        
        {/* Language Selection */}
        <div className="mb-4 w-full">
          <label htmlFor="language-select" className="block text-gray-200 text-sm font-bold mb-2">
            Translate to:
          </label>
          <select 
            id="language-select" 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full p-2 text-lg border-2 border-gray-300 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 outline-none font-light text-gray-700 bg-white bg-opacity-80"
          >
            <option value="en-US">English (US)</option>
            <option value="es-US">Spanish (US)</option>
            <option value="fr-FR">French (France)</option>
            <option value="de-DE">German (Germany)</option>
            <option value="ja-JP">Japanese (Japan)</option>
            <option value="ko-KR">Korean (Korea)</option>
            <option value="hi-IN">Hindi (India)</option>
          </select>
        </div>

        {/* Record Button */}
        <div className="mb-6 w-full">
          <button 
            onClick={() => {
              console.log('Button clicked, isRecording:', isRecording)
              if (isRecording) {
                console.log('Stopping recording')
                stopRecording()
              } else {
                console.log('Starting recording')
                startRecording()
              }
            }}
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:bg-indigo-700 transition-all duration-300 transform active:scale-95 disabled:bg-indigo-300 disabled:shadow-none"
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        </div>

        {/* Transcribed Text */}
        <div className="mb-6 w-full">
          <textarea 
            rows="4"
            value={transcribedText}
            readOnly
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 resize-none outline-none font-light text-gray-700 bg-white bg-opacity-80"
            placeholder="Transcribed text will appear here..."
          />
        </div>
        
        {/* Translated Text */}
        <div className="mb-6 w-full">
          <textarea 
            rows="4"
            value={translatedText}
            readOnly
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 resize-none outline-none font-light text-gray-700 bg-white bg-opacity-80"
            placeholder="Translated text will appear here..."
          />
        </div>

        {/* Results */}
        <div className="mt-8">
          <p className="text-2xl font-semibold text-white drop-shadow-md">
            {resultText}
          </p>
          <div className="text-7xl mt-4 drop-shadow-lg">
            {emoji && (
              <span className={isRecording ? 'animate-bounce' : ''}>
                {emoji}
              </span>
            )}
          </div>
          
          {/* Audio Player */}
          {audioUrl && (
            <audio controls className="mt-4">
              <source src={audioUrl} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
      </div>
    </div>
  )
}
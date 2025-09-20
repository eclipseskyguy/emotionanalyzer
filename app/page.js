'use client'

import { useState, useRef, useEffect } from 'react'

export default function EmotionAnalyzer() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcribedText, setTranscribedText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [emotion, setEmotion] = useState('')
  const [emoji, setEmoji] = useState('')
  const [resultText, setResultText] = useState('Press "Start Recording" to begin...')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en-US')
  const [backgroundColor, setBackgroundColor] = useState('#667eea')
  // const [audioUrl, setAudioUrl] = useState('') // Disabled speech generation
  const [anime, setAnime] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const languageOptions = [
    { value: 'en-US', label: 'English (US)', flag: '🇺🇸' },
    { value: 'es-US', label: 'Spanish (US)', flag: '🇺🇸' },
    { value: 'fr-FR', label: 'French (France)', flag: '🇫🇷' },
    { value: 'de-DE', label: 'German (Germany)', flag: '🇩🇪' },
    { value: 'ja-JP', label: 'Japanese (Japan)', flag: '🇯🇵' },
    { value: 'ko-KR', label: 'Korean (Korea)', flag: '🇰🇷' },
    { value: 'hi-IN', label: 'Hindi (India)', flag: '🇮🇳' },
    { value: 'ta-IN', label: 'Tamil (India)', flag: '🇮🇳' },
    { value: 'bn-BD', label: 'Bengali (Bangladesh)', flag: '🇧🇩' },
    { value: 'ar-EG', label: 'Arabic (Egypt)', flag: '🇪🇬' },
    { value: 'mr-IN', label: 'Marathi (India)', flag: '🇮🇳' },
    { value: 'te-IN', label: 'Telugu (India)', flag: '🇮🇳' }
  ]

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

    // Animation refs
  const titleRef = useRef(null)
  const leftColumnRef = useRef(null)
  const rightColumnRef = useRef(null)
  const emojiRef = useRef(null)
  const buttonRef = useRef(null)
  const recordingIndicatorRef = useRef(null)
  const particlesRef = useRef(null)
  const headerRef = useRef(null)
  const footerRef = useRef(null)
  const statsRef = useRef(null)
  const dropdownRef = useRef(null)

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

  // Load anime.js dynamically
  useEffect(() => {
    const loadAnime = async () => {
      try {
        console.log('Loading anime.js...')
        const animeModule = await import('animejs')
        console.log('Anime.js loaded successfully:', !!animeModule.default)
        setAnime(animeModule.default)
      } catch (error) {
        console.error('Failed to load anime.js:', error)
      }
    }
    loadAnime()
  }, [])

  // Initialize animations
  useEffect(() => {
    if (!anime) return

    const initializeAnimations = () => {
      // Initial page load animations
      anime.timeline({
        easing: 'easeOutExpo',
        duration: 1000
      })
      .add({
        targets: '.header',
        translateY: [-50, 0],
        opacity: [0, 1],
        duration: 800
      })
      .add({
        targets: '.main-title',
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 600
      }, '-=400')
      .add({
        targets: '.subtitle',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 500
      }, '-=200')
      .add({
        targets: '.left-column',
        translateX: [-100, 0],
        opacity: [0, 1],
        duration: 800
      }, '-=300')
      .add({
        targets: '.right-column',
        translateX: [100, 0],
        opacity: [0, 1],
        duration: 800
      }, '-=800')
      .add({
        targets: '.footer',
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 600
      }, '-=400')
    }

    // Small delay to ensure DOM is ready
    setTimeout(initializeAnimations, 100)
  }, [anime]) // Add anime as dependency

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const animateButton = (type) => {
    if (!anime) return // Guard clause
    
    if (type === 'recording') {
      anime({
        targets: buttonRef.current,
        scale: [1, 1.05],
        boxShadow: ['0px 4px 20px rgba(239, 68, 68, 0)', '0px 8px 30px rgba(239, 68, 68, 0.4)'],
        backgroundColor: ['#4f46e5', '#dc2626'],
        duration: 300,
        easing: 'easeOutQuad'
      })

      // Pulsing effect while recording
      anime({
        targets: '.recording-pulse',
        scale: [1, 1.2],
        opacity: [0.7, 0.3],
        duration: 1000,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine'
      })
    } else {
      anime({
        targets: buttonRef.current,
        scale: 1,
        boxShadow: '0px 4px 20px rgba(79, 70, 229, 0.3)',
        backgroundColor: '#4f46e5',
        duration: 300,
        easing: 'easeOutQuad'
      })
    }
  }

  const animateEmoji = (newEmoji) => {
    if (!emojiRef.current || !anime) return // Guard clause

    anime({
      targets: emojiRef.current,
      scale: [0, 1.3, 1],
      rotateY: [0, 360],
      duration: 800,
      easing: 'easeOutElastic(1, .8)',
      complete: () => {
        // Create floating particles
        createParticles()
      }
    })
  }

  const animateLoadingDots = () => {
    console.log('animateLoadingDots called')
    console.log('anime available:', !!anime)
    console.log('emojiRef.current:', !!emojiRef.current)
    
    if (!emojiRef.current || !anime) {
      console.log('Missing requirements - anime:', !!anime, 'emojiRef:', !!emojiRef.current)
      return
    }

    // Create loading dots container
    const loadingContainer = emojiRef.current.querySelector('.loading-dots')
    console.log('Loading container found:', !!loadingContainer)
    
    if (!loadingContainer) {
      console.log('Loading container not found')
      return
    }

    const dots = loadingContainer.children
    console.log('Found dots:', dots.length)
    console.log('Dots:', Array.from(dots))

    if (dots.length === 0) {
      console.log('No dots found')
      return
    }

    // First try a simple test animation
    try {
      anime({
        targets: dots,
        scale: [1, 2, 1],
        duration: 600,
        delay: anime.stagger(200),
        loop: true,
        easing: 'easeInOutQuad',
        begin: () => console.log('Animation started'),
        complete: () => console.log('Animation cycle completed')
      })
      console.log('Animation created successfully')
    } catch (error) {
      console.error('Animation error:', error)
    }
  }

  const stopLoadingAnimation = () => {
    if (!anime) return
    anime.remove('.loading-dots > *') // Remove all animations from loading dots
  }

  const animateDropdown = (isOpening) => {
    if (!anime || !dropdownRef.current) return

    const dropdownMenu = dropdownRef.current.querySelector('.dropdown-menu')
    if (!dropdownMenu) return

    if (isOpening) {
      // Opening animation
      anime({
        targets: dropdownMenu,
        scale: [0.95, 1],
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 300,
        easing: 'easeOutBack'
      })
    } else {
      // Closing animation
      anime({
        targets: dropdownMenu,
        scale: [1, 0.95],
        opacity: [1, 0],
        translateY: [0, -10],
        duration: 200,
        easing: 'easeOutQuad'
      })
    }
  }

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen)
    animateDropdown(!isDropdownOpen)
  }

  const handleLanguageSelect = (value) => {
    setSelectedLanguage(value)
    setIsDropdownOpen(false)
    
    // Animate selection
    if (anime && dropdownRef.current) {
      anime({
        targets: dropdownRef.current.querySelector('.dropdown-trigger'),
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 20px rgba(255, 255, 255, 0.1)',
          '0 0 30px rgba(255, 255, 255, 0.3)',
          '0 0 20px rgba(255, 255, 255, 0.1)'
        ],
        duration: 400,
        easing: 'easeOutElastic(1, .8)'
      })
    }
  }

  const createParticles = () => {
    if (!anime) return // Guard clause
    
    const particles = []
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div')
      particle.className = 'particle'
      particle.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background: ${backgroundColor};
        border-radius: 50%;
        pointer-events: none;
        z-index: 10;
      `
      emojiRef.current?.appendChild(particle)
      particles.push(particle)
    }

    anime({
      targets: particles,
      translateX: () => anime.random(-150, 150),
      translateY: () => anime.random(-150, 150),
      scale: [0, 1, 0],
      opacity: [1, 0],
      duration: 2000,
      delay: anime.stagger(100),
      easing: 'easeOutExpo',
      complete: () => {
        particles.forEach(p => p.remove())
      }
    })
  }

  const animateBackgroundTransition = (newColor) => {
    if (!anime) return // Guard clause for anime
    
    const current = backgroundColor
    let progress = 0

    anime({
      targets: { progress: 0 },
      progress: 1,
      duration: 1000,
      easing: 'easeOutQuad',
      update: (anim) => {
        const p = anim.progress / 100
        const r1 = parseInt(current.slice(1, 3), 16)
        const g1 = parseInt(current.slice(3, 5), 16)
        const b1 = parseInt(current.slice(5, 7), 16)
        const r2 = parseInt(newColor.slice(1, 3), 16)
        const g2 = parseInt(newColor.slice(3, 5), 16)
        const b2 = parseInt(newColor.slice(5, 7), 16)
        
        const r = Math.round(r1 + (r2 - r1) * p)
        const g = Math.round(g1 + (g2 - g1) * p)
        const b = Math.round(b1 + (b2 - b1) * p)
        
        const interpolated = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
        setBackgroundColor(interpolated)
      }
    })
  }

  const updateResultState = (text, emojiChar, color) => {
    setResultText(text)
    setEmoji(emojiChar)
    
    if (emojiChar === 'loading') {
      // Start loading animation for loading state only - with retry logic
      const tryAnimate = () => {
        console.log('Starting loading animation, anime available:', !!anime)
        if (anime) {
          animateLoadingDots()
        } else {
          console.log('Anime not ready, retrying in 100ms...')
          setTimeout(tryAnimate, 100)
        }
      }
      setTimeout(tryAnimate, 200)
    } else if (emojiChar && emojiChar !== 'loading') {
      // Stop loading animation and show the actual emoji
      stopLoadingAnimation()
      if (anime) {
        animateEmoji(emojiChar)
      }
    }
    
    animateBackgroundTransition(color)
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
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser')
      }

      // Request microphone access with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        throw new Error('MediaRecorder is not supported in this browser')
      }

      // Create MediaRecorder with supported mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 
                      MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : 
                      'audio/wav'

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType })

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        audioChunksRef.current = []
        setIsRecording(false)
        animateButton('stop')
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop())
        
        if (audioBlob.size > 0) {
          analyzeAudio(audioBlob)
        } else {
          updateResultState('No audio recorded. Please try again.', '⚠️', '#ef4444')
        }
      }

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event.error)
        updateResultState('Recording error occurred.', '⚠️', '#ef4444')
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      animateButton('recording')
      updateResultState('Recording... Say something!', '🔴', '#dc2626')

    } catch (err) {
      console.error('Error accessing microphone:', err)
      let errorMessage = 'Error: Microphone access denied.'
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Microphone access denied. Please allow microphone access and try again.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.'
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Audio recording not supported in this browser.'
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Microphone constraints not supported.'
      }
      
      updateResultState(errorMessage, '⚠️', '#ef4444')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  const analyzeAudio = async (audioBlob) => {
    setIsLoading(true)
    setTranscribedText('')
    setTranslatedText('')
    // setAudioUrl('') // Disabled speech generation
    updateResultState('Transcribing audio...', 'loading', '#3b82f6')

    try {
      const base64Audio = await blobToBase64(audioBlob)

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

      // Update to analysis phase
      updateResultState('Analyzing emotion and translating...', 'loading', '#8b5cf6')

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

      const { emotion, emoji } = emotionResult
      const color = emotionColors[emotion] || '#a78bfa'
      setEmotion(emotion)
      updateResultState(`Emotion: ${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`, emoji, color)
      
      setTranslatedText(translationResult.translatedText)
      // await generateTranslatedAudio(translationResult.translatedText, selectedLanguage) // Disabled speech generation

    } catch (error) {
      console.error('Error in audio analysis pipeline:', error)
      updateResultState('Sorry, an error occurred during processing.', '⚠️', '#ef4444')
    } finally {
      setIsLoading(false)
    }
  }

  // Speech generation disabled - function commented out
  /*
  const generateTranslatedAudio = async (text, language) => {
    try {
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language })
      })

      if (!ttsResponse.ok) {
        throw new Error(`TTS failed with status: ${ttsResponse.status}`)
      }

      const result = await ttsResponse.json()
      const { audioData, mimeType } = result

      if (audioData && mimeType && mimeType.startsWith("audio/")) {
        // Create blob from base64 audio data
        const audioBytes = base64ToArrayBuffer(audioData)
        const audioBlob = new Blob([audioBytes], { type: mimeType })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioUrl(audioUrl)
      } else {
        console.log('TTS response indicates client-side handling needed')
        // Use Web Speech API for client-side TTS as fallback
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.lang = language
          speechSynthesis.speak(utterance)
        }
      }
    } catch (error) {
      console.error('Error generating translated audio:', error)
      // Try Web Speech API as fallback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = language
        speechSynthesis.speak(utterance)
      } else {
        updateResultState('Audio generation not supported in this browser.', '⚠️', '#ef4444')
      }
    }
  }
  */

  return (
    <div 
      className="min-h-screen transition-all duration-1000 relative overflow-hidden"
      style={{ 
        background: `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}CC 50%, ${backgroundColor}99 100%)`
      }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
        <div className="absolute -bottom-8 left-40 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <header className="header bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">EA</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-white/90 hover:text-white transition-colors">Home</a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">About</a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">Features</a>
            </nav>
          </div>
          <div className="text-white/80 text-sm">
            AI-Powered Emotion Analysis
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="main-title text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-2xl">
              Emotion Analyzer
            </h1>
            <p className="subtitle text-xl md:text-2xl text-white/90 font-light drop-shadow-lg">
              Speak your mind, and let's discover the tone.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Column - Controls */}
            <div className="left-column space-y-8">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                <h2 className="text-2xl font-semibold text-white mb-6">Recording Controls</h2>
                
                {/* Language Selection */}
                <div className="mb-6">
                  <label htmlFor="language-select" className="block text-white/90 text-sm font-medium mb-3">
                    Translate to:
                  </label>
                  <div ref={dropdownRef} className="relative">
                    {/* Custom Dropdown Trigger */}
                    <button
                      className="dropdown-trigger w-full p-4 text-lg border-2 border-white/30 rounded-2xl focus:border-white/60 focus:ring-4 focus:ring-white/20 transition-all duration-300 outline-none bg-white/15 backdrop-blur-md text-white cursor-pointer hover:bg-white/20 hover:border-white/40 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-between"
                      onClick={handleDropdownToggle}
                      style={{
                        filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))'
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{languageOptions.find(opt => opt.value === selectedLanguage)?.flag}</span>
                        <span>{languageOptions.find(opt => opt.value === selectedLanguage)?.label}</span>
                      </div>
                      <svg 
                        className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Custom Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="dropdown-menu absolute top-full left-0 right-0 mt-2 bg-gray-900/90 backdrop-blur-lg border-2 border-white/30 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto">
                        {languageOptions.map((option, index) => (
                          <button
                            key={option.value}
                            className="w-full p-4 text-left hover:bg-white/15 transition-all duration-200 flex items-center space-x-3 text-white border-b border-white/10 last:border-b-0 focus:bg-white/20 focus:outline-none"
                            onClick={() => handleLanguageSelect(option.value)}
                            style={{
                              animationDelay: `${index * 50}ms`
                            }}
                          >
                            <span className="text-xl">{option.flag}</span>
                            <span className="text-sm font-medium">{option.label}</span>
                            {selectedLanguage === option.value && (
                              <svg className="w-4 h-4 ml-auto text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Glass reflection effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                  </div>
                </div>

                {/* Record Button */}
                <div className="relative">
                  {isRecording && (
                    <div className="recording-pulse absolute inset-0 bg-red-500 rounded-2xl opacity-30"></div>
                  )}
                  <button 
                    ref={buttonRef}
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white font-bold py-6 px-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-4 h-4 rounded-full bg-current"></div>
                      <span className="text-xl">
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Text Areas */}
                <div className="space-y-6 mt-8">
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-3">
                      Transcribed Text:
                    </label>
                    <textarea 
                      rows="4"
                      value={transcribedText}
                      readOnly
                      className="w-full p-4 text-lg border-2 border-white/20 rounded-2xl focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-200 resize-none outline-none bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
                      placeholder="Transcribed text will appear here..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-3">
                      Translated Text:
                    </label>
                    <textarea 
                      rows="4"
                      value={translatedText}
                      readOnly
                      className="w-full p-4 text-lg border-2 border-white/20 rounded-2xl focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-200 resize-none outline-none bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
                      placeholder="Translated text will appear here..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="right-column space-y-8">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                <h2 className="text-2xl font-semibold text-white mb-6">Emotion Analysis</h2>
                
                {/* Results Display */}
                <div className="text-center space-y-8">
                  <p className="text-2xl md:text-3xl font-semibold text-white drop-shadow-lg">
                    {resultText}
                  </p>
                  
                  <div ref={emojiRef} className="relative flex justify-center">
                    {emoji === 'loading' ? (
                      <div className="loading-dots flex space-x-4 items-center justify-center h-32 w-full">
                        <div className="dot w-6 h-6 bg-white rounded-full opacity-50 transform animate-pulse" style={{animationDelay: '0ms'}}></div>
                        <div className="dot w-6 h-6 bg-white rounded-full opacity-50 transform animate-pulse" style={{animationDelay: '150ms'}}></div>
                        <div className="dot w-6 h-6 bg-white rounded-full opacity-50 transform animate-pulse" style={{animationDelay: '300ms'}}></div>
                        <div className="dot w-6 h-6 bg-white rounded-full opacity-50 transform animate-pulse" style={{animationDelay: '450ms'}}></div>
                        <div className="dot w-6 h-6 bg-white rounded-full opacity-50 transform animate-pulse" style={{animationDelay: '600ms'}}></div>
                      </div>
                    ) : (
                      <div className="text-8xl md:text-9xl drop-shadow-2xl">
                        {emoji}
                      </div>
                    )}
                  </div>
                  
                  {/* Audio generation disabled */}
                  {/*
                  {audioUrl && (
                    <div className="mt-8">
                      <label className="block text-white/90 text-sm font-medium mb-3">
                        Generated Audio:
                      </label>
                      <audio 
                        controls 
                        className="w-full rounded-2xl bg-white/10 backdrop-blur-sm"
                        style={{
                          filter: 'invert(1) hue-rotate(180deg)',
                        }}
                      >
                        <source src={audioUrl} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}
                  */}
                </div>
              </div>

              {/* Stats/Info Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                <h3 className="text-xl font-semibold text-white mb-4">Session Info</h3>
                <div className="grid grid-cols-2 gap-4 text-white/80">
                  <div>
                    <div className="text-2xl font-bold text-white">{emotion ? '1' : '0'}</div>
                    <div className="text-sm">Analyses</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{selectedLanguage.split('-')[0].toUpperCase()}</div>
                    <div className="text-sm">Target Language</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer bg-white/10 backdrop-blur-md border-t border-white/20 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-3">Emotion Analyzer</h4>
              <p className="text-white/70 text-sm">
                AI-powered emotion detection and multi-language translation platform.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Team</h4>
              <div className="space-y-2 text-white/70 text-sm">
                <div>Lead Developer: [Kartik Patel]</div>
                <div>AI Specialist: [Samruddhi Amol Shah]</div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Technology</h4>
              <div className="space-y-2 text-white/70 text-sm">
                <div>Next.js & React</div>
                <div>Anime.js Animations</div>
                <div>Tailwind CSS</div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-6 text-center text-white/60 text-sm">
            © 2024 Emotion Analyzer. Built with AI and passion.
          </div>
        </div>
      </footer>
    </div>
  )
} 
import { useState, useEffect, useRef } from 'react';
import Button from './Button';

const AudioInterview = ({ 
  onTranscript,
  isListening,
  onStartListening,
  onStopListening,
  isSpeaking,
  currentQuestion
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (onTranscript) {
          onTranscript(finalTranscript || interimTranscript, !finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          // Auto-restart if no speech detected
          if (isListening) {
            setTimeout(() => {
              if (isListening && recognitionRef.current) {
                try {
                  recognitionRef.current.start();
                } catch (e) {
                  console.log('Recognition already started');
                }
              }
            }, 1000);
          }
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening) {
          // Auto-restart if still listening
          setTimeout(() => {
            if (isListening && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.log('Recognition ended');
              }
            }
          }, 100);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isListening, onTranscript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        if (onStartListening) onStartListening();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsRecording(false);
      if (onStopListening) onStopListening();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          Audio interview is not supported in this browser. Please use Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Audio Visualizer */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-lg p-6 border-2 border-purple-200">
        <div className="flex flex-col items-center">
          {/* Microphone Icon with Animation */}
          <div className={`relative mb-4 ${isListening ? 'animate-pulse' : ''}`}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
              isListening 
                ? 'bg-red-500 animate-pulse' 
                : isSpeaking
                ? 'bg-blue-500'
                : 'bg-gray-300'
            } transition-all duration-300`}>
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            
            {/* Sound Waves Animation */}
            {isListening && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-1">
                  <div className="w-1 h-8 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-6 bg-white rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-10 bg-white rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  <div className="w-1 h-7 bg-white rounded-full animate-pulse" style={{ animationDelay: '450ms' }}></div>
                  <div className="w-1 h-9 bg-white rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Status Text */}
          <div className="text-center">
            {isSpeaking && (
              <p className="text-lg font-semibold text-blue-700 mb-2">
                🔊 AI is speaking...
              </p>
            )}
            {isListening && !isSpeaking && (
              <p className="text-lg font-semibold text-red-700 mb-2">
                🎤 Listening... Speak your answer
              </p>
            )}
            {!isListening && !isSpeaking && (
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Click to start speaking
              </p>
            )}
          </div>

          {/* Current Question Display */}
          {currentQuestion && (
            <div className="mt-4 bg-white rounded-lg p-4 w-full max-w-md">
              <p className="text-sm text-gray-600 mb-1">Current Question:</p>
              <p className="text-gray-800 font-medium">{currentQuestion}</p>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={toggleListening}
          variant={isListening ? 'danger' : 'primary'}
          className="px-8"
        >
          <span className="flex items-center gap-2">
            {isListening ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                Stop Speaking
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Start Speaking
              </>
            )}
          </span>
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">How to use:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Click "Start Speaking" to begin your answer</li>
          <li>Speak clearly into your microphone</li>
          <li>Your speech will be converted to text automatically</li>
          <li>Click "Stop Speaking" when you're done</li>
          <li>AI will read the question and your answer back to you</li>
        </ul>
      </div>
    </div>
  );
};

export default AudioInterview;

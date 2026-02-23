import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import interviewService from '../services/interview.service';
import AudioInterview from '../components/AudioInterview';
import Card from '../components/Card';
import Button from '../components/Button';

const AudioInterviewPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [transcript, setTranscript] = useState('');

  const speechSynthesisRef = useRef(null);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (location.state?.interview) {
      setInterview(location.state.interview);
      setAnswers(new Array(location.state.interview.questions.length).fill(''));
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
    }

    return () => {
      // Cleanup
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
      stopListening();
    };
  }, [isAuthenticated, navigate, location]);

  // Speak question when it changes
  useEffect(() => {
    if (interview && interview.questions[currentQuestionIndex]) {
      const question = interview.questions[currentQuestionIndex];
      speakText(question.question, 'question');
    }
  }, [currentQuestionIndex, interview]);

  const speakText = (text, type = 'normal') => {
    if (!speechSynthesisRef.current || !('SpeechSynthesisUtterance' in window)) {
      return;
    }

    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = 'en-US';
    
    setIsSpeaking(true);
    
    utterance.onend = () => {
      setIsSpeaking(false);
      // If it was a question, wait a bit then prompt user to answer
      if (type === 'question') {
        setTimeout(() => {
          speakText('Please speak your answer now.', 'prompt');
        }, 500);
      }
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };
    
    utteranceRef.current = utterance;
    speechSynthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleTranscript = (text, isInterim) => {
    setTranscript(text);
    if (!isInterim) {
      setCurrentAnswer(text);
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = text;
      setAnswers(newAnswers);
    }
  };

  const startListening = () => {
    setIsListening(true);
    setError('');
  };

  const stopListening = () => {
    setIsListening(false);
    // When user stops speaking, read back their answer
    if (currentAnswer.trim()) {
      setTimeout(() => {
        speakText(`You said: ${currentAnswer}. Is this correct?`, 'confirmation');
      }, 500);
    }
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) {
      setError('Please provide an answer by speaking');
      return;
    }

    stopListening();
    stopSpeaking();

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = currentAnswer;
    setAnswers(newAnswers);

    // Move to next question or complete interview
    if (currentQuestionIndex < interview.questions.length - 1) {
      // Confirm answer before moving
      speakText(`Moving to next question.`, 'transition');
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setCurrentAnswer('');
        setTranscript('');
        setError('');
      }, 2000);
    } else {
      // All questions answered
      speakText('All questions answered. Submitting interview.', 'final');
      setTimeout(() => {
        handleCompleteInterview(newAnswers);
      }, 3000);
    }
  };

  const handleCompleteInterview = async (finalAnswers) => {
    setLoading(true);
    setError('');
    stopListening();
    stopSpeaking();

    try {
      const response = await interviewService.submitInterview(
        interview._id,
        finalAnswers
      );
      setResults(response.data);
      setInterviewCompleted(true);
      
      // Speak final score
      const score = response.data.totalScore;
      speakText(`Interview completed. Your total score is ${score.toFixed(1)} percent.`, 'results');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit interview');
      speakText('Sorry, there was an error submitting your interview.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentAnswer.trim()) {
      handleAnswerSubmit();
    } else {
      setError('Please provide an answer before moving to next question');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      stopListening();
      stopSpeaking();
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setCurrentAnswer(answers[currentQuestionIndex - 1] || '');
      setTranscript('');
      setError('');
    }
  };

  const handleReplayQuestion = () => {
    if (interview && interview.questions[currentQuestionIndex]) {
      speakText(interview.questions[currentQuestionIndex].question, 'question');
    }
  };

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No interview found. Please start a new interview.</p>
          <Button onClick={() => navigate('/interview')}>Go to Interview</Button>
        </div>
      </div>
    );
  }

  if (interviewCompleted && results) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card title="Interview Results">
            <div className="text-center mb-8">
              <div className={`text-5xl font-bold mb-2 ${
                results.totalScore >= 80
                  ? 'text-green-600'
                  : results.totalScore >= 60
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {results.totalScore.toFixed(1)}%
              </div>
              <p className="text-xl text-gray-700">Overall Score</p>
            </div>

            <div className="space-y-6">
              {results.questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Question {index + 1}: {question.question}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      question.score >= 80
                        ? 'bg-green-100 text-green-800'
                        : question.score >= 60
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {question.score}%
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Your Answer:</p>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded">{question.userAnswer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Feedback:</p>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded">{question.feedback}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Back to Dashboard
              </Button>
              <Button
                onClick={() => navigate('/interview')}
                className="flex-1"
              >
                Start New Interview
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = interview.questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              🎤 Audio Interview - {interview.techStack} ({interview.level})
            </h1>
            <p className="text-gray-600">Two-way audio conversation with AI</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Exit Interview
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestionIndex + 1} of {interview.questions.length}</span>
            <span>{Math.round(((currentQuestionIndex + 1) / interview.questions.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / interview.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Audio Interview Component */}
        <Card>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <AudioInterview
            onTranscript={handleTranscript}
            isListening={isListening}
            onStartListening={startListening}
            onStopListening={stopListening}
            isSpeaking={isSpeaking}
            currentQuestion={currentQuestion?.question}
          />

          {/* Transcript Display */}
          {transcript && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Your Answer (Live Transcript):</p>
              <p className="text-gray-800">{transcript}</p>
            </div>
          )}

          {/* Saved Answer Display */}
          {currentAnswer && !transcript && (
            <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-600 mb-2">Your Saved Answer:</p>
              <p className="text-blue-900">{currentAnswer}</p>
            </div>
          )}

          {/* Controls */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            {currentQuestionIndex > 0 && (
              <Button
                variant="secondary"
                onClick={handlePreviousQuestion}
                disabled={isSpeaking || isListening}
              >
                ← Previous
              </Button>
            )}
            
            <Button
              variant="secondary"
              onClick={handleReplayQuestion}
              disabled={isSpeaking || isListening}
            >
              🔄 Replay Question
            </Button>

            {isSpeaking && (
              <Button
                variant="danger"
                onClick={stopSpeaking}
              >
                ⏸ Stop AI
              </Button>
            )}

            {currentQuestionIndex < interview.questions.length - 1 ? (
              <Button
                onClick={handleNextQuestion}
                disabled={loading || !currentAnswer.trim() || isListening || isSpeaking}
                className="bg-green-600 hover:bg-green-700"
              >
                ✓ Submit & Next Question →
              </Button>
            ) : (
              <Button
                onClick={handleAnswerSubmit}
                disabled={loading || !currentAnswer.trim() || isListening || isSpeaking}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Submitting...' : '✓ Complete Interview'}
              </Button>
            )}
          </div>
        </Card>

        {/* Instructions */}
        <Card className="mt-4">
          <h3 className="font-semibold text-gray-800 mb-3">📋 Instructions:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• AI will read each question aloud automatically</li>
            <li>• Click "Start Speaking" when you're ready to answer</li>
            <li>• Speak clearly into your microphone</li>
            <li>• Your speech will be converted to text in real-time</li>
            <li>• Click "Stop Speaking" when finished</li>
            <li>• AI will confirm your answer</li>
            <li>• Use "Replay Question" to hear the question again</li>
            <li>• Click "Submit & Next Question" to proceed</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default AudioInterviewPage;

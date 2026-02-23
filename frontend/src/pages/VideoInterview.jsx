import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import interviewService from '../services/interview.service';
import VideoCall from '../components/VideoCall';
import AIInterviewer from '../components/AIInterviewer';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const VideoInterview = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [results, setResults] = useState(null);

  const speechSynthesis = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Initialize interview from location state or create new
    if (location.state?.interview) {
      setInterview(location.state.interview);
      setAnswers(new Array(location.state.interview.questions.length).fill(''));
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.current = window.speechSynthesis;
    }

    return () => {
      // Cancel any ongoing speech
      if (speechSynthesis.current) {
        speechSynthesis.current.cancel();
      }
    };
  }, []);

  // Speak question when it changes
  useEffect(() => {
    if (interview && interview.questions[currentQuestionIndex]) {
      speakQuestion(interview.questions[currentQuestionIndex].question);
    }
  }, [currentQuestionIndex, interview]);

  const speakQuestion = (text) => {
    if (speechSynthesis.current && 'SpeechSynthesisUtterance' in window) {
      speechSynthesis.current.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      setIsSpeaking(true);
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      speechSynthesis.current.speak(utterance);
    }
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) {
      setError('Please provide an answer');
      return;
    }

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = currentAnswer;
    setAnswers(newAnswers);

    // Move to next question or complete interview
    if (currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
      setError('');
    } else {
      // All questions answered
      handleCompleteInterview(newAnswers);
    }
  };

  const handleCompleteInterview = async (finalAnswers) => {
    setLoading(true);
    setError('');

    try {
      const response = await interviewService.submitInterview(
        interview._id,
        finalAnswers
      );
      setResults(response.data);
      setInterviewCompleted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit interview');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
      setError('');
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {interview.techStack} Interview - {interview.level}
            </h1>
            <p className="text-gray-600">Face-to-Face AI Interview</p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Exit Interview
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Video Call */}
          <div className="space-y-4">
            <Card title="Your Video">
              <VideoCall
                questions={interview.questions}
                currentQuestionIndex={currentQuestionIndex}
              />
            </Card>
          </div>

          {/* Right Column - AI Interviewer & Answer */}
          <div className="space-y-4">
            <AIInterviewer
              currentQuestion={currentQuestion}
              questionIndex={currentQuestionIndex}
              totalQuestions={interview.questions.length}
              isSpeaking={isSpeaking}
            />

            <Card title="Your Answer">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your answer here or speak your answer..."
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
              />

              <div className="flex gap-4">
                {currentQuestionIndex > 0 && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setCurrentQuestionIndex(currentQuestionIndex - 1);
                      setCurrentAnswer(answers[currentQuestionIndex - 1] || '');
                    }}
                    className="flex-1"
                  >
                    Previous
                  </Button>
                )}
                
                {currentQuestionIndex < interview.questions.length - 1 ? (
                  <>
                    <Button
                      variant="secondary"
                      onClick={handleSkipQuestion}
                      className="flex-1"
                    >
                      Skip
                    </Button>
                    <Button
                      onClick={handleAnswerSubmit}
                      disabled={loading || !currentAnswer.trim()}
                      className="flex-1"
                    >
                      Next Question
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleAnswerSubmit}
                    disabled={loading || !currentAnswer.trim()}
                    className="flex-1"
                  >
                    {loading ? 'Submitting...' : 'Complete Interview'}
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoInterview;

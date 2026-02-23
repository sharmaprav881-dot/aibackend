import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import interviewService from '../services/interview.service';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const Interview = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState('setup'); // 'setup', 'questions', 'results'
  const [formData, setFormData] = useState({
    techStack: '',
    level: '',
    interviewType: 'text', // 'text' or 'video'
  });
  const [interview, setInterview] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSetupChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateInterview = async (e) => {
    e.preventDefault();
    if (!formData.techStack || !formData.level) {
      setError('Please select both tech stack and experience level');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await interviewService.createInterview(
        formData.techStack,
        formData.level
      );
      setInterview(response.data);
      setAnswers(new Array(response.data.questions.length).fill(''));
      
      // Navigate based on interview type
      if (formData.interviewType === 'video') {
        navigate('/video-interview', { state: { interview: response.data } });
      } else if (formData.interviewType === 'audio') {
        navigate('/audio-interview', { state: { interview: response.data } });
      } else {
        setStep('questions');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create interview');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmitInterview = async () => {
    if (answers.some((ans) => !ans.trim())) {
      setError('Please answer all questions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await interviewService.submitInterview(
        interview._id,
        answers
      );
      setInterview(response.data);
      setStep('results');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit interview');
    } finally {
      setLoading(false);
    }
  };

  const handleNewInterview = () => {
    setStep('setup');
    setInterview(null);
    setAnswers([]);
    setFormData({ techStack: '', level: '' });
  };

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <Card title="Start New Interview" subtitle="Select your preferences">
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateInterview}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tech Stack <span className="text-red-500">*</span>
                </label>
                <select
                  name="techStack"
                  value={formData.techStack}
                  onChange={handleSetupChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Tech Stack</option>
                  <option value="React">React</option>
                  <option value="Node">Node.js</option>
                  <option value="MERN">MERN Stack</option>
                  <option value="DSA">Data Structures & Algorithms</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleSetupChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Experience Level</option>
                  <option value="Fresher">Fresher</option>
                  <option value="2-3 Years">2-3 Years</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, interviewType: 'text' })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.interviewType === 'text'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="font-medium">Text Interview</p>
                      <p className="text-xs text-gray-500 mt-1">Type your answers</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, interviewType: 'video' })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.interviewType === 'video'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="font-medium">Video Interview</p>
                      <p className="text-xs text-gray-500 mt-1">Face-to-face with AI</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, interviewType: 'audio' })}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      formData.interviewType === 'audio'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      <p className="font-medium">Audio Interview</p>
                      <p className="text-xs text-gray-500 mt-1">Two-way audio conversation</p>
                    </div>
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating Interview...' : 'Start Interview'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'questions') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card title={`${interview?.techStack} Interview - ${interview?.level}`}>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {interview?.questions.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Question {index + 1}: {question.question}
                  </h3>
                  <textarea
                    value={answers[index] || ''}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder="Type your answer here..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitInterview}
                disabled={loading || answers.some((ans) => !ans.trim())}
                className="flex-1"
              >
                {loading ? 'Submitting...' : 'Submit Answers'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card title="Interview Results">
            <div className="text-center mb-8">
              <div className={`text-5xl font-bold mb-2 ${
                interview?.totalScore >= 80
                  ? 'text-green-600'
                  : interview?.totalScore >= 60
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {interview?.totalScore.toFixed(1)}%
              </div>
              <p className="text-xl text-gray-700">Overall Score</p>
            </div>

            <div className="space-y-6">
              {interview?.questions.map((question, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Question {index + 1}: {question.question}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        question.score >= 80
                          ? 'bg-green-100 text-green-800'
                          : question.score >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
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
              <Button onClick={handleNewInterview} className="flex-1">
                Start New Interview
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default Interview;

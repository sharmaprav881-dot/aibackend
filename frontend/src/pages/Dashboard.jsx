import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import interviewService from '../services/interview.service';
import Card from '../components/Card';
import Button from '../components/Button';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviewHistory();
  }, []);

  const fetchInterviewHistory = async () => {
    try {
      setLoading(true);
      const response = await interviewService.getInterviewHistory();
      setInterviews(response.data || []);
    } catch (error) {
      console.error('Error fetching interview history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = () => {
    navigate('/interview');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AI Interview Platform</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {user?.name}</span>
            <Button variant="secondary" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Start Interview Section */}
        <div className="mb-8">
          <Card>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Ready for an Interview?
              </h2>
              <p className="text-gray-600 mb-6">
                Test your skills with AI-powered interview questions
              </p>
              <Button onClick={handleStartInterview} className="px-8">
                Start New Interview
              </Button>
            </div>
          </Card>
        </div>

        {/* Interview History */}
        <Card title="Interview History" subtitle="View your past interview results">
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading...</div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No interviews yet. Start your first interview!
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <div
                  key={interview._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {interview.techStack} - {interview.level}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(interview.createdAt)}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Status: <span className="font-medium capitalize">{interview.status}</span>
                      </p>
                    </div>
                    {interview.status === 'completed' && (
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(interview.totalScore)}`}>
                          {interview.totalScore.toFixed(1)}%
                        </div>
                        <p className="text-sm text-gray-500">Score</p>
                      </div>
                    )}
                  </div>
                  
                  {interview.status === 'completed' && interview.questions && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Question Scores:</h4>
                      <div className="flex flex-wrap gap-2">
                        {interview.questions.map((q, idx) => (
                          <div
                            key={idx}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              q.score >= 80
                                ? 'bg-green-100 text-green-800'
                                : q.score >= 60
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            Q{idx + 1}: {q.score}%
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;

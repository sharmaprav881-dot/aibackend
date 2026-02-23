import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const interviewService = {
  createInterview: async (techStack, level) => {
    const response = await api.post('/interview/create', {
      techStack,
      level,
    });
    return response.data;
  },

  submitInterview: async (interviewId, answers) => {
    const response = await api.post('/interview/submit', {
      interviewId,
      answers,
    });
    return response.data;
  },

  getInterviewHistory: async () => {
    const response = await api.get('/interview/history');
    return response.data;
  },
};

export default interviewService;

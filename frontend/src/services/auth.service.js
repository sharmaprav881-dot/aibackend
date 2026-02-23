import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const authService = {
  register: async (name, email, password) => {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      password,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  },
};

export default authService;

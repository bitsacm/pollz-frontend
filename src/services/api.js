import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:6969/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  googleLogin: (data) => api.post('/main/auth/google-login/', data),
  logout: (data) => api.post('/main/auth/logout/', data),
  getProfile: () => api.get('/main/auth/profile/'),
};

export const huelAPI = {
  getDepartments: () => api.get('/main/huels/departments/'),
  getHuels: (params) => api.get('/main/huels/', { params }),
  getHuelDetail: (id) => api.get(`/main/huels/${id}/`),
  rateHuel: (data) => api.post('/main/huels/rate/', data),
  voteHuel: (data) => api.post('/main/huels/vote/', data),
  commentHuel: (data) => api.post('/main/huels/comment/', data),
};

export const electionAPI = {
  getPositions: () => api.get('/main/elections/positions/'),
  getCandidates: (params) => api.get('/main/elections/candidates/', { params }),
  castVote: (data) => api.post('/main/elections/vote/', data),
  getMyVotes: () => api.get('/main/elections/my-votes/'),
};

export const departmentClubAPI = {
  getItems: (params) => api.get('/main/departments-clubs/', { params }),
  vote: (data) => api.post('/main/departments-clubs/vote/', data),
  comment: (data) => api.post('/main/departments-clubs/comment/', data),
};

export const statsAPI = {
  getStats: () => api.get('/main/stats/'),
  getDashboard: () => api.get('/main/stats/dashboard/'),
};

export default api;
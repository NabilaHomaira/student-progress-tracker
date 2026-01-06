import axios from 'axios';

// Normalize REACT_APP_API_URL so user can set either
// - REACT_APP_API_URL=http://localhost:5000
// or
// - REACT_APP_API_URL=http://localhost:5000/api
// and the client will still call the backend at <base>/api
const rawUrl = process.env.REACT_APP_API_URL || '';
const trimmed = rawUrl.replace(/\/$/, '');
const baseHost = trimmed ? (trimmed.endsWith('/api') ? trimmed.slice(0, -4) : trimmed) : 'http://localhost:5000';

const api = axios.create({
  baseURL: `${baseHost}/api`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Mock data for offline/demo mode
const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '{}');
const mockCourses = [
  { _id: '1', name: 'Mathematics 101', instructor: 'Dr. Smith' },
  { _id: '2', name: 'English Literature', instructor: 'Mrs. Johnson' },
  { _id: '3', name: 'Science 201', instructor: 'Dr. Williams' },
];
const mockAssignments = [
  { _id: '1', title: 'Algebra Basics', courseId: '1', maxScore: 100 },
  { _id: '2', title: 'Geometry Problems', courseId: '1', maxScore: 100 },
  { _id: '3', title: 'Essay Writing', courseId: '2', maxScore: 100 },
];

// Create an interceptor to handle errors and fallback to mock data
const originalRequest = api.request;
api.request = async function(config) {
  try {
    return await originalRequest.call(this, config);
  } catch (error) {
    console.warn('API request failed, checking if mock data available:', config.url);
    
    // Handle mock registration
    if (config.url === '/auth/register' && config.method === 'post') {
      const { name, email, password, role } = config.data;
      
      // Check if user already exists
      if (mockUsers[email]) {
        return Promise.reject({
          response: {
            status: 400,
            data: { message: 'Email already registered' }
          }
        });
      }
      
      // Create new mock user
      const newUser = {
        _id: Date.now().toString(),
        name,
        email,
        role: role || 'student',
      };
      
      const mockToken = 'mock_' + Math.random().toString(36).substr(2, 9);
      mockUsers[email] = { ...newUser, password };
      localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
      
      return Promise.resolve({
        data: {
          token: mockToken,
          user: newUser,
          message: 'Registration successful'
        }
      });
    }
    
    // Handle mock login
    if (config.url === '/auth/login' && config.method === 'post') {
      const { email, password } = config.data;
      
      if (mockUsers[email] && mockUsers[email].password === password) {
        const mockToken = 'mock_' + Math.random().toString(36).substr(2, 9);
        const { password: _, ...userWithoutPassword } = mockUsers[email];
        
        return Promise.resolve({
          data: {
            token: mockToken,
            user: userWithoutPassword,
            message: 'Login successful'
          }
        });
      } else {
        return Promise.reject({
          response: {
            status: 401,
            data: { message: 'Invalid email or password' }
          }
        });
      }
    }
    
    // Handle mock get current user
    if (config.url === '/auth/me' && config.method === 'get') {
      // Try to find user from token or return demo user
      const demoUser = {
        _id: 'demo_user_id',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'student'
      };
      
      return Promise.resolve({
        data: { user: demoUser }
      });
    }
    
    // Handle mock courses
    if (config.url === '/courses' && config.method === 'get') {
      return Promise.resolve({
        data: mockCourses
      });
    }
    
    // Handle mock assignments
    if (config.url.includes('/assignments') && config.method === 'get') {
      return Promise.resolve({
        data: mockAssignments
      });
    }
    
    // For other endpoints, return mock data or error
    console.warn('No mock data for:', config.url);
    
    // Re-throw the original error if no mock available
    throw error;
  }
};

export default api;

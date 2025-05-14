// API base URL configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API endpoints
export const API_ENDPOINTS = {
  PROBLEMS: '/problems',
  EXECUTE_CODE: '/execute',
  SUBMIT_SOLUTION: '/submit',
};

export default API_BASE_URL;

import API_BASE_URL, { API_ENDPOINTS } from '../config/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    if (data.errors && Array.isArray(data.errors)) {
      // Handle validation errors from express-validator
      const errorMessages = data.errors.map(err => err.msg).join('\n');
      throw new Error(errorMessages);
    }
    
    const errorMessage = data.message || {
      400: 'Invalid data provided. Please check your input.',
      401: 'You need to be logged in.',
      403: 'You don\'t have permission to perform this action.',
      404: 'The requested resource was not found.',
      500: 'Server error. Please try again later.'
    }[response.status] || 'Something went wrong';
    
    throw new Error(errorMessage);
  }
  return data;
};

export const problemService = {
  // Fetch all problems
  async getAllProblems() {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROBLEMS}`);
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching problems:', error.message);
      return { data: null, error };
    }
  },

  // Get problem by ID
  async getProblemById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROBLEMS}/${id}`);
      const result = await handleResponse(response);
      
      if (result.error) {
        return result;
      }

      // Ensure testcases is an array
      if (result.data && !Array.isArray(result.data.testcases)) {
        result.data.testcases = [];
      }

      return result;
    } catch (error) {
      console.error('Error fetching problem:', error);
      return { error };
    }
  },

  // Create a new problem
  async createProblem(problemData) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROBLEMS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(problemData),
      });
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating problem:', error.message);
      return { data: null, error };
    }
  },

  // Update an existing problem
  async updateProblem(id, problemData) {
    try {
      // Ensure testcases is an array
      const testcases = Array.isArray(problemData.testcases) ? problemData.testcases : [];
      
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROBLEMS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...problemData,
          total_points: Number(problemData.total_points),
          testcases: testcases.map(tc => ({
            ...tc,
            points: Number(tc.points || 0),
            difficulty: tc.difficulty || 'easy'
          }))
        }),
      });
      
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating problem:', error.message);
      return { data: null, error };
    }
  },

  // Delete a problem
  async deleteProblem(id) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROBLEMS}/${id}`, {
        method: 'DELETE',
      });
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error deleting problem:', error.message);
      return { data: null, error };
    }
  },

  // Create a new testcase
  async createTestcase(testcaseData) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TESTCASES}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testcaseData),
      });
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error creating testcase:', error.message);
      return { data: null, error };
    }
  },

  // Update an existing testcase
  async updateTestcase(id, testcaseData) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TESTCASES}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testcaseData),
      });
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating testcase:', error.message);
      return { data: null, error };
    }
  },

  // Delete a testcase
  async deleteTestcase(id) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.TESTCASES}/${id}`, {
        method: 'DELETE',
      });
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error deleting testcase:', error.message);
      return { data: null, error };
    }
  },

  // Fetch testcases by problem ID
  async getTestcasesByProblemId(problemId) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROBLEMS}/${problemId}/testcases`);
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching testcases:', error.message);
      return { data: null, error };
    }
  },

  // Execute code with sample input
  async executeCode(code, language, input) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EXECUTE_CODE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language, input }),
      });
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error executing code:', error.message);
      return { data: null, error };
    }
  },

  // Submit solution for evaluation
  async submitSolution(problemId, code, language) {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUBMIT_SOLUTION}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ problemId, code, language }),
      });
      const data = await handleResponse(response);
      return { data, error: null };
    } catch (error) {
      console.error('Error submitting solution:', error.message);
      return { data: null, error };
    }
  },
};

import API_BASE_URL, { API_ENDPOINTS } from '../config/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
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
      const data = await handleResponse(response);
      if (!data) {
        throw new Error('Problem not found');
      }
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching problem:', error.message);
      return { data: null, error };
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
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PROBLEMS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...problemData,
          total_points: Number(problemData.total_points),
          testcases: problemData.testcases.map(tc => ({
            ...tc,
            points: Number(tc.points)
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

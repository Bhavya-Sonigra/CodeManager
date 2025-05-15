import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { problemService } from '../services/problemService';
import './EditProblem.css';

const EditProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    testCases: []
  });

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        console.log('Fetching problem with ID:', id);
        const response = await problemService.getProblemById(id);
        console.log('Raw response from service:', response);
        
        const { data, error } = response;
        
        if (error) {
          console.error('Error in response:', error);
          setError(error.message || 'Failed to load problem');
          return;
        }
        
        if (!data) {
          console.error('No data received from API');
          setError('No data received from server');
          return;
        }
        
        console.log('Fetched problem data:', data);
        
        // Check if data.data exists (nested data structure)
        const problemData = data.data || data;
        console.log('Problem data to use:', problemData);
        
        if (!problemData.title) {
          console.error('Missing title in problem data');
          setError('Invalid problem data received');
          return;
        }
        
        // Map the testcases from backend format to frontend format
        const testcases = problemData.testcases || [];
        console.log('Raw testcases:', testcases);
        
        const mappedTestCases = testcases.map(testcase => ({
          input: testcase.input,
          expectedOutput: testcase.expected_output,
          id: testcase.id,
          difficulty: testcase.difficulty || 'easy',
          points: testcase.points || 10
        }));
        
        console.log('Mapped test cases:', mappedTestCases);
        
        setFormData({
          title: problemData.title,
          description: problemData.description,
          difficulty: problemData.difficulty || 'easy',
          total_points: problemData.total_points || 100,
          testCases: mappedTestCases
        });
      } catch (error) {
        console.error('Error fetching problem:', error);
        setError('Failed to load problem: ' + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for total_points to update test case points
    if (name === 'total_points' && formData.testCases.length > 0) {
      const newTotalPoints = Number(value);
      if (!isNaN(newTotalPoints) && newTotalPoints >= 0) {
        // Calculate points per test case
        const pointsPerTest = Math.round(newTotalPoints / formData.testCases.length);
        
        // Update all test cases with new points
        const updatedTestCases = formData.testCases.map(tc => ({
          ...tc,
          points: pointsPerTest
        }));
        
        setFormData(prev => ({
          ...prev,
          [name]: value,
          testCases: updatedTestCases
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    setFormData(prev => {
      const newTestCases = [...prev.testCases];
      newTestCases[index] = {
        ...newTestCases[index],
        [field]: value
      };
      return {
        ...prev,
        testCases: newTestCases
      };
    });
  };

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, { 
        input: '', 
        expectedOutput: '', 
        difficulty: 'easy', 
        points: 10 
      }]
    }));
  };

  const removeTestCase = (index) => {
    setFormData(prev => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      console.log('Form data before submission:', formData);
      
      // Validate test cases
      if (!formData.testCases || formData.testCases.length === 0) {
        setError('At least one test case is required');
        return;
      }

      // Check for empty inputs or outputs
      const invalidTestCase = formData.testCases.find(
        tc => !tc.input || !tc.input.trim() || !tc.expectedOutput || !tc.expectedOutput.trim()
      );
      if (invalidTestCase) {
        setError('All test cases must have input and expected output');
        return;
      }

      // Map testCases to the format expected by the backend
      // Preserve the original ID for existing test cases
      const updatedFormData = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty || 'easy',
        total_points: Number(formData.total_points) || 100,
        testcases: formData.testCases.map(testCase => ({
          // Preserve the original ID if it exists
          ...(testCase.id ? { id: testCase.id } : {}),
          problem_id: id, // Ensure problem_id is included
          input: testCase.input,
          expected_output: testCase.expectedOutput,
          // Include other required fields with proper validation
          difficulty: testCase.difficulty || 'easy',
          points: Number(testCase.points) || 10 // Ensure points is a number
        }))
      };

      console.log('Submitting updated problem data:', updatedFormData);
      const response = await problemService.updateProblem(id, updatedFormData);
      console.log('Update response:', response);
      
      if (response.error) {
        console.error('Error in update response:', response.error);
        setError(response.error.message || 'Failed to update problem');
        return;
      }
      
      console.log('Problem updated successfully');
      navigate('/problems');
    } catch (error) {
      console.error('Error updating problem:', error);
      setError('Failed to update problem: ' + (error.message || 'Unknown error'));
    }
  };

  if (loading) return <div className="loading">Loading problem...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="edit-problem-container">
      <h1>Edit Problem</h1>
      <form onSubmit={handleSubmit} className="edit-problem-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={5}
          />
        </div>

        <div className="form-group">
          <label htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleInputChange}
            required
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="total_points">Total Points</label>
          <input
            type="number"
            id="total_points"
            name="total_points"
            value={formData.total_points || 0}
            onChange={handleInputChange}
            min="0"
            required
          />
        </div>

        <div className="test-cases-section">
          <h3>Test Cases</h3>
          {formData.testCases.map((testCase, index) => (
            <div key={index} className="test-case">
              <div className="test-case-inputs">
                <div className="form-group">
                  <label>Input</label>
                  <textarea
                    value={testCase.input}
                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Expected Output</label>
                  <textarea
                    value={testCase.expectedOutput}
                    onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                    required
                  />
                </div>
                <div className="test-case-properties">
                  <div className="form-group">
                    <label>Difficulty</label>
                    <select
                      value={testCase.difficulty || 'easy'}
                      onChange={(e) => handleTestCaseChange(index, 'difficulty', e.target.value)}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Points</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={testCase.points || 0}
                      onChange={(e) => handleTestCaseChange(index, 'points', Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeTestCase(index)}
                className="remove-test-case-btn"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addTestCase}
            className="add-test-case-btn"
          >
            Add Test Case
          </button>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/problems')} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="save-btn">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProblem;

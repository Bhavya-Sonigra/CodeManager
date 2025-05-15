import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { problemService } from '../services/problemService';
import './EditProblem.css';

const validatePoints = (value) => {
  const points = Number(value);
  if (isNaN(points)) return 'Points must be a number';
  if (points < 0) return 'Points cannot be negative';
  if (points > 1000) return 'Points cannot exceed 1000';
  if (!Number.isInteger(points)) return 'Points must be whole numbers';
  return null;
};

const validateInput = (value, field) => {
  if (!value || !value.trim()) return `${field} cannot be empty`;
  if (value.length > 1000) return `${field} is too long (max 1000 characters)`;
  return null;
};

const EditProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    testCases: []
  });

  // Add beforeunload event listener for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

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
    setIsDirty(true);
    
    // Validate points
    if (name === 'total_points') {
      const error = validatePoints(value);
      setFieldErrors(prev => ({
        ...prev,
        total_points: error
      }));
      
      if (!error) {
        const newTotalPoints = Number(value);
        const pointsPerTest = Math.floor(newTotalPoints / formData.testCases.length);
        const remainder = newTotalPoints % formData.testCases.length;
        
        // Update all test cases with new points, distributing remainder
        const updatedTestCases = formData.testCases.map((tc, index) => ({
          ...tc,
          points: pointsPerTest + (index < remainder ? 1 : 0)
        }));
        
        setFormData(prev => ({
          ...prev,
          [name]: value,
          testCases: updatedTestCases
        }));
        return;
      }
    }

    // Validate title
    if (name === 'title') {
      const error = validateInput(value, 'Title');
      setFieldErrors(prev => ({
        ...prev,
        title: error
      }));
    }

    // Validate description
    if (name === 'description') {
      const error = validateInput(value, 'Description');
      setFieldErrors(prev => ({
        ...prev,
        description: error
      }));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    setIsDirty(true);
    
    // Validate test case points
    if (field === 'points') {
      const error = validatePoints(value);
      setFieldErrors(prev => ({
        ...prev,
        [`testcase_${index}_points`]: error
      }));
    }

    // Validate test case input/output
    if (field === 'input' || field === 'expectedOutput') {
      const error = validateInput(value, field === 'input' ? 'Input' : 'Expected Output');
      setFieldErrors(prev => ({
        ...prev,
        [`testcase_${index}_${field}`]: error
      }));
    }

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
    // Prevent deletion if it's the last test case
    if (formData.testCases.length <= 1) {
      alert('Cannot delete the last test case. At least one test case is required.');
      return;
    }

    setFormData(prev => {
      const newTestCases = prev.testCases.filter((_, i) => i !== index);
      // Recalculate points for remaining test cases
      const pointsPerTest = Math.round(Number(prev.total_points) / newTestCases.length);
      
      return {
        ...prev,
        testCases: newTestCases.map(tc => ({
          ...tc,
          points: pointsPerTest
        }))
      };
    });
  };

  const validateForm = () => {
    const errors = {};

    // Validate form fields
    errors.title = validateInput(formData.title, 'Title');
    errors.description = validateInput(formData.description, 'Description');
    errors.total_points = validatePoints(formData.total_points);

    // Validate test cases
    formData.testCases.forEach((tc, index) => {
      errors[`testcase_${index}_input`] = validateInput(tc.input, 'Input');
      errors[`testcase_${index}_expectedOutput`] = validateInput(tc.expectedOutput, 'Expected Output');
      errors[`testcase_${index}_points`] = validatePoints(tc.points);
    });

    // Validate total points match
    const totalPoints = Number(formData.total_points);
    const testcasePointsSum = formData.testCases.reduce((sum, tc) => sum + Number(tc.points), 0);
    if (totalPoints !== testcasePointsSum) {
      errors.points_mismatch = `Total points (${totalPoints}) must equal sum of test case points (${testcasePointsSum})`;
    }

    setFieldErrors(errors);
    return !Object.values(errors).some(error => error !== null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate form before submission
      if (!validateForm()) {
        setError('Please fix the validation errors before submitting');
        return;
      }

      console.log('Form data before submission:', formData);
      
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
      {Object.entries(fieldErrors).map(([field, error]) => 
        error && (
          <div key={field} className="field-error">
            {error}
          </div>
        )
      )}
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

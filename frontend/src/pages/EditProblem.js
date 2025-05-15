import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { problemService } from '../services/problemService';
import { FiAlertCircle, FiPlus, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import './EditProblem.css';

const EditProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    total_points: '0'
  });

  const [testcases, setTestcases] = useState([{
    input: '',
    expected_output: '',
    difficulty: 'easy',
    points: '0'
  }]);

  // Clear messages when form data changes
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [formData, testcases]);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const { data, error } = await problemService.getProblemById(id);
        if (error) {
          console.error('Error fetching problem:', error);
          setError(error.message || 'Failed to fetch problem');
          setLoading(false);
          return;
        }

        if (!data) {
          setError('Problem not found');
          setLoading(false);
          return;
        }

        console.log('Fetched problem data:', data); // Debug log

        // Safely set form data with fallbacks
        setFormData({
          title: data.title || '',
          description: data.description || '',
          difficulty: data.difficulty || 'easy',
          total_points: (data.total_points || 0).toString()
        });

        // Safely set testcases with fallbacks
        if (Array.isArray(data.testcases)) {
          console.log('Setting testcases:', data.testcases); // Debug log
          const existingTestcases = data.testcases.map(tc => ({
            id: tc.id,
            input: tc.input || '',
            expected_output: tc.expected_output || '',
            difficulty: tc.difficulty || 'easy',
            points: (tc.points || 0).toString()
          }));
          setTestcases(existingTestcases.length > 0 ? existingTestcases : [{
            input: '',
            expected_output: '',
            difficulty: 'easy',
            points: '0'
          }]);
        } else {
          // Initialize with one empty test case if none exist
          setTestcases([{
            input: '',
            expected_output: '',
            difficulty: 'easy',
            points: '0'
          }]);
        }

        setLoading(false);
        setSuccess('Problem loaded successfully');
      } catch (error) {
        console.error('Error fetching problem:', error);
        setError('Failed to fetch problem details');
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestcaseChange = (index, field, value) => {
    setTestcases(prevTestcases => {
      const updatedTestcases = [...prevTestcases];
      if (updatedTestcases[index]) {
        updatedTestcases[index] = {
          ...updatedTestcases[index],
          [field]: value
        };
      }
      return updatedTestcases;
    });
  };

  const handleAddTestcase = () => {
    setTestcases(prevTestcases => [...prevTestcases, {
      input: '',
      expected_output: '',
      difficulty: 'easy',
      points: '0'
    }]);
  };

  const handleRemoveTestcase = (index) => {
    if (testcases.length <= 1) {
      setError('At least one test case is required');
      return;
    }
    setTestcases(prevTestcases => prevTestcases.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate testcases
      if (!Array.isArray(testcases) || testcases.length === 0) {
        setError('At least one test case is required');
        setIsSubmitting(false);
        return;
      }

      // Prepare data for submission
      const problemData = {
        ...formData,
        testcases: testcases.map(tc => ({
          ...tc,
          points: parseFloat(tc.points)
        }))
      };

      const { error } = await problemService.updateProblem(id, problemData);
      if (error) {
        setError(error.message || 'Failed to update problem');
        setIsSubmitting(false);
        return;
      }

      setSuccess('Problem updated successfully');
      setTimeout(() => navigate('/problems'), 1500);
    } catch (error) {
      console.error('Error updating problem:', error);
      setError('Failed to update problem');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-problem-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="edit-problem-container">
      <div className="form-header">
        <h1>Edit Problem</h1>
        {error && (
          <div className="error-message">
            <FiAlertCircle /> {error}
          </div>
        )}
        {success && (
          <div className="success-message">
            <FiCheckCircle /> {success}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <fieldset disabled={isSubmitting}>
          <div className="form-section">
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
                rows="6"
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
                value={formData.total_points}
                onChange={handleInputChange}
                min="0"
                step="0.1"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Test Cases</h2>
            <div className="testcases-container">
              {Array.isArray(testcases) && testcases.map((testcase, index) => (
                <div key={testcase.id || index} className="testcase-form">
                  <h3>Test Case {index + 1}</h3>
                  
                  <div className="form-group">
                    <label htmlFor={`input-${index}`}>Input</label>
                    <textarea
                      id={`input-${index}`}
                      value={testcase?.input || ''}
                      onChange={(e) => handleTestcaseChange(index, 'input', e.target.value)}
                      required
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`output-${index}`}>Expected Output</label>
                    <textarea
                      id={`output-${index}`}
                      value={testcase?.expected_output || ''}
                      onChange={(e) => handleTestcaseChange(index, 'expected_output', e.target.value)}
                      required
                      rows="3"
                    />
                  </div>

                  <div className="testcase-meta">
                    <div className="form-group">
                      <label htmlFor={`tc-difficulty-${index}`}>Difficulty</label>
                      <select
                        id={`tc-difficulty-${index}`}
                        value={testcase?.difficulty || 'easy'}
                        onChange={(e) => handleTestcaseChange(index, 'difficulty', e.target.value)}
                        required
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor={`points-${index}`}>Points</label>
                      <input
                        type="number"
                        id={`points-${index}`}
                        value={testcase?.points || '0'}
                        onChange={(e) => handleTestcaseChange(index, 'points', e.target.value)}
                        min="0"
                        step="0.1"
                        required
                      />
                    </div>

                    <button
                      type="button"
                      className="remove-testcase-btn"
                      onClick={() => handleRemoveTestcase(index)}
                    >
                      <FiTrash2 /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="add-testcase-btn"
              onClick={handleAddTestcase}
            >
              <FiPlus /> Add Test Case
            </button>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Update Problem'}
            </button>
            <button type="button" className="cancel-button" onClick={() => navigate('/problems')}>
              Cancel
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default EditProblem;

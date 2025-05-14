import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { problemService } from '../services/problemService';
import { FiAlertCircle, FiPlus, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import './AddProblem.css';

const AddProblem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    total_points: '0'
  });

  const [testcases, setTestcases] = useState([
    { input: '', expected_output: '', difficulty: 'easy', points: '0' }
  ]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      if (id) {
        setIsEditMode(true);
        try {
          const { data, error } = await problemService.getProblemById(id);
          if (error) {
            setError(error.message || 'Failed to fetch problem');
            return;
          }
          if (data) {
            setFormData({
              title: data.title,
              description: data.description,
              difficulty: data.difficulty,
              total_points: data.total_points.toString()
            });
            if (data.testcases && data.testcases.length > 0) {
              setTestcases(data.testcases.map(tc => ({
                ...tc,
                points: tc.points.toString()
              })));
            }
          }
        } catch (error) {
          setError('Failed to fetch problem details');
          console.error('Error fetching problem:', error);
          navigate('/');
        }
      }
    };

    fetchProblem();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Calculate total testcase points
      const testcasePointsTotal = testcases.reduce((sum, tc) => sum + Number(tc.points), 0);
      
      // Validate total points match
      if (Math.abs(testcasePointsTotal - Number(formData.total_points)) > 0.01) {
        setError('Total points from testcases must equal problem total points');
        setIsSubmitting(false);
        return;
      }

      const problemData = {
        ...formData,
        testcases: testcases
      };

      const processedData = {
        ...problemData,
        total_points: Number(problemData.total_points),
        testcases: problemData.testcases.map(tc => ({
          ...tc,
          points: Number(tc.points)
        }))
      };

      let response;
      if (isEditMode) {
        response = await problemService.updateProblem(id, processedData);
      } else {
        response = await problemService.createProblem(processedData);
      }

      if (response.error) {
        setError(response.error.message || 'Failed to save problem');
        return;
      }

      setSuccess('Problem saved successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestcaseChange = (index, field, value) => {
    setTestcases(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const addTestcase = () => {
    setTestcases(prev => [
      ...prev,
      { input: '', expected_output: '', difficulty: 'easy', points: '0' }
    ]);
  };

  const removeTestcase = (index) => {
    setTestcases(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="add-problem-container">
      <h1>{isEditMode ? 'Edit Problem' : 'Create New Problem'}</h1>
      
      <form onSubmit={handleSubmit} className="problem-form">
        {error && (
          <div className="error-message">
            <FiAlertCircle size={20} />
            {error}
          </div>
        )}
        {success && (
          <div className="success-message">
            <FiCheckCircle size={20} />
            {success}
          </div>
        )}

        <fieldset disabled={isSubmitting}>
          <div className="form-section">
            <h2>Problem Details</h2>
            
            <div className="form-group">
              <label htmlFor="title">Problem Title</label>
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
            {testcases.map((testcase, index) => (
              <div key={index} className="testcase-form">
                <h3>Test Case {index + 1}</h3>
                
                <div className="form-group">
                  <label htmlFor={`input-${index}`}>Input</label>
                  <textarea
                    id={`input-${index}`}
                    value={testcase.input}
                    onChange={(e) => handleTestcaseChange(index, 'input', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`output-${index}`}>Expected Output</label>
                  <textarea
                    id={`output-${index}`}
                    value={testcase.expected_output}
                    onChange={(e) => handleTestcaseChange(index, 'expected_output', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`tc-difficulty-${index}`}>Difficulty</label>
                  <select
                    id={`tc-difficulty-${index}`}
                    value={testcase.difficulty}
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
                    value={testcase.points}
                    onChange={(e) => handleTestcaseChange(index, 'points', e.target.value)}
                    min="0"
                    step="0.1"
                    required
                  />
                </div>

                {testcases.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTestcase(index)}
                    className="remove-testcase-button"
                  >
                    <FiTrash2 size={18} />
                    Remove Test Case
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addTestcase}
            className="add-testcase-button"
          >
            <FiPlus size={18} />
            Add Test Case
          </button>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update Problem' : 'Create Problem'}
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default AddProblem;

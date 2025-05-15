import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { problemService } from '../services/problemService';
import { FiAlertCircle, FiPlus, FiTrash2, FiCheckCircle, FiDatabase } from 'react-icons/fi';
import './AddProblem.css';

const AddProblem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    total_points: 0  // Changed to number instead of string
  });

  const [testcases, setTestcases] = useState([{
    input: '',
    expected_output: '',
    difficulty: 'easy',
    points: 0
  }]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Clear messages when form data changes
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [formData, testcases]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      if (id) {
        setIsEditMode(true);
        try {
          const { data, error } = await problemService.getProblemById(id);
          if (error) {
            console.error('Error fetching problem:', error);
            setError(error.message || 'Failed to fetch problem');
            return;
          }
          if (!data) {
            setError('Problem not found');
            return;
          }

          // Safely set form data with fallbacks
          setFormData({
            title: data.title || '',
            description: data.description || '',
            difficulty: data.difficulty || 'easy',
            total_points: (data.total_points || 0).toString()
          });

          // Safely set testcases with fallbacks
          const testcases = Array.isArray(data.testcases) ? data.testcases : [];
          setTestcases(testcases.map(tc => ({
            input: tc.input || '',
            expected_output: tc.expected_output || '',
            difficulty: tc.difficulty || 'easy',
            points: (tc.points || 0).toString()
          })));

          setSuccess('Problem loaded successfully');
        } catch (error) {
          console.error('Error fetching problem:', error);
          setError('Failed to fetch problem details');
        }
      }
    };

    fetchProblem();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate at least one test case exists
      if (testcases.length === 0) {
        setError('At least one test case is required');
        setIsSubmitting(false);
        return;
      }

      // Calculate total testcase points
      const testcasePointsTotal = testcases.reduce((sum, tc) => sum + Number(tc.points), 0);
      
      // Validate total points match
      if (Math.abs(testcasePointsTotal - Number(formData.total_points)) > 0.01) {
        setError('Total points from testcases must equal problem total points');
        setIsSubmitting(false);
        return;
      }

      const processedData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        difficulty: formData.difficulty,
        total_points: Number(formData.total_points) || 0,
        testCases: testcases.map(tc => ({
          input: tc.input.trim(),
          expectedOutput: tc.expected_output.trim()
        }))
      };

      // Validate total_points
      if (isNaN(processedData.total_points)) {
        setError('Total points must be a valid number');
        setIsSubmitting(false);
        return;
      }

      // Log the data being sent for debugging
      console.log('Sending data to backend:', processedData);

      let response;
      if (isEditMode) {
        response = await problemService.updateProblem(id, processedData);
      } else {
        response = await problemService.createProblem(processedData);
      }

      if (response.error) {
        const errorMsg = response.error.message;
        if (errorMsg.includes('duplicate')) {
          setError('A problem with this title already exists. Please choose a different title.');
        } else if (errorMsg.includes('validation')) {
          setError('Please check your input. Make sure all required fields are filled correctly.');
        } else {
          setError(errorMsg || 'Failed to save problem');
        }
        return;
      }

      setSuccess('Problem saved successfully!');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
      // Scroll to error/success message if present
      if (error || success) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
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
    setTestcases([...testcases, { input: '', expected_output: '' }]);
  };

  const removeTestcase = (index) => {
    setTestcases(prev => prev.filter((_, i) => i !== index));
  };

  const fillSampleData = () => {
    const title = `Sample Problem ${Math.floor(Math.random() * 1000)}`;
    const description = 'Write a function that determines if a given number is a palindrome.';
    
    setFormData({
      title,
      description,
      difficulty: 'easy',
      total_points: 10
    });

    setTestcases([
      {
        input: '121',
        expected_output: 'true'
      },
      {
        input: '-121',
        expected_output: 'false'
      },
      {
        input: '10',
        expected_output: 'false'
      }
    ]);
  };

  return (
    <div className="add-problem-container">
      <div className="header-container">
        <h1>{isEditMode ? 'Edit Problem' : 'Create New Problem'}</h1>
        {!isEditMode && (
          <button
            type="button"
            onClick={fillSampleData}
            className="fill-sample-button"
            title="Fill with sample data"
          >
            <FiDatabase size={18} />
            <span>Fill Sample</span>
          </button>
        )}
      </div>
      
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

                <div style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => removeTestcase(index)}
                    className="remove-testcase-button"
                  >
                    <FiTrash2 size={18} />
                    <span>Remove Test Case</span>
                  </button>
                </div>
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

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
        const { data, error } = await problemService.getProblemById(id);
        if (error) {
          setError(error.message || 'Failed to load problem');
          return;
        }
        setFormData({
          title: data.data.title,
          description: data.data.description,
          difficulty: data.data.difficulty,
          testCases: data.data.testCases || []
        });
      } catch (error) {
        console.error('Error fetching problem:', error);
        setError('Failed to load problem');
      } finally {
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
      testCases: [...prev.testCases, { input: '', expectedOutput: '' }]
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
      const { error } = await problemService.updateProblem(id, formData);
      if (error) {
        setError(error.message || 'Failed to update problem');
        return;
      }
      navigate('/problems');
    } catch (error) {
      console.error('Error updating problem:', error);
      setError('Failed to update problem');
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { problemService } from '../services/problemService';
import './AddProblem.css';

const AddProblem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    total_points: 10,
  });

  const [testcases, setTestcases] = useState([
    { input: '', expected_output: '', difficulty: 'easy', points: 0 }
  ]);

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate total points match testcase points
      const totalTestcasePoints = testcases.reduce((sum, tc) => sum + Number(tc.points), 0);
      if (totalTestcasePoints !== Number(formData.total_points)) {
        setError(`Total points (${formData.total_points}) must match sum of testcase points (${totalTestcasePoints})`);
        return;
      }

      // Create problem and get its ID
      const problem = await problemService.createProblem(formData);
      
      // Create testcases for the problem
      const testcasePromises = testcases.map(testcase => {
        return problemService.createTestcase({
          ...testcase,
          problem_id: problem.id
        });
      });
      
      await Promise.all(testcasePromises);
      navigate('/');
    } catch (error) {
      setError(error.message);
      console.error('Error creating problem:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestcaseChange = (index, field, value) => {
    setTestcases(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addTestcase = () => {
    setTestcases(prev => [...prev, { input: '', expected_output: '', difficulty: 'easy', points: 0 }]);
  };

  const removeTestcase = (index) => {
    setTestcases(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="add-problem-container">
      <h1>Add New Problem</h1>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="problem-form">
        <div className="form-section">
          <h2>Problem Details</h2>
          <div className="form-group">
            <label htmlFor="title">Problem Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
              required
              min="1"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Testcases</h2>
          {testcases.map((testcase, index) => (
            <div key={index} className="testcase-form">
              <h3>Testcase {index + 1}</h3>
              <div className="form-group">
                <label>Input</label>
                <textarea
                  value={testcase.input}
                  onChange={(e) => handleTestcaseChange(index, 'input', e.target.value)}
                  required
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Expected Output</label>
                <textarea
                  value={testcase.expected_output}
                  onChange={(e) => handleTestcaseChange(index, 'expected_output', e.target.value)}
                  required
                  rows="3"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Difficulty</label>
                  <select
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
                  <label>Points</label>
                  <input
                    type="number"
                    value={testcase.points}
                    onChange={(e) => handleTestcaseChange(index, 'points', Number(e.target.value))}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              {testcases.length > 1 && (
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => removeTestcase(index)}
                >
                  Remove Testcase
                </button>
              )}
            </div>
          ))}
          
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={addTestcase}
          >
            Add Testcase
          </button>
        </div>

        <button type="submit" className="btn btn-primary submit-btn">
          Create Problem
        </button>
      </form>
    </div>
  );
};

export default AddProblem;

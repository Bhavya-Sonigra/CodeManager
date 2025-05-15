import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { problemService } from '../services/problemService';
import './ProblemList.css';

const ProblemList = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!Array.isArray(problems)) {
      setProblems([]);
    }
  }, [problems]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data, error } = await problemService.getAllProblems();
        if (error) {
          setError(error.message || 'Failed to load problems');
          return;
        }
        if (data?.data && Array.isArray(data.data)) {
          setProblems(data.data);
        } else {
          setError('Invalid data format received from server');
        }
      } catch (error) {
        console.error('Error fetching problems:', error);
        setError('Failed to load problems');
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  // Listen for search events from the Layout component
  useEffect(() => {
    const handleSearch = (event) => {
      setSearchQuery(event.detail.query);
    };

    window.addEventListener('problemSearch', handleSearch);
    return () => window.removeEventListener('problemSearch', handleSearch);
  }, []);

  const handleDelete = async (id) => {
    try {
      const { error } = await problemService.deleteProblem(id);
      if (error) {
        setError(error.message || 'Failed to delete problem');
        return;
      }
      setProblems(problems.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting problem:', error);
      setError('Failed to delete problem');
    }
  };

  const filteredProblems = () => {
    if (!Array.isArray(problems)) {
      return [];
    }

    let result = [...problems];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(problem => 
        problem.title.toLowerCase().includes(query) ||
        problem.description.toLowerCase().includes(query)
      );
    }

    // Sort by newest first (default sorting)
    result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    return result;
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return '🟢';
      case 'medium':
        return '🟡';
      case 'hard':
        return '🔴';
      default:
        return '⚪';
    }
  };

  if (loading) return <div className="loading">Loading problems...</div>;
  if (error) return <div className="error">{error}</div>;

  const problemsToDisplay = filteredProblems();

  return (
    <div className="problem-list-container">
      <div className="problems-grid">
        {problemsToDisplay.map(problem => (
          <div key={problem.id} className="problem-card">
            <div className="problem-content">
              <h3>
                {getDifficultyIcon(problem.difficulty)} {problem.title}
              </h3>
              <div className="problem-info">
                <span className={`difficulty ${problem.difficulty}`}>
                  {problem.difficulty}
                </span>
                <span className="points">
                  {problem.total_points} points
                </span>
              </div>
              <p className="description">{problem.description}</p>
            </div>
            <div className="card-actions">
              <div className="action-links">
                <button
                  type="button"
                  className="edit-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/edit/${problem.id}`);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="delete-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this problem?')) {
                      handleDelete(problem.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
              <Link
                to={`/solve/${problem.id}`}
                className="solve-btn"
                onClick={(e) => e.stopPropagation()}
              >
                Solve Problem
              </Link>
            </div>
          </div>
        ))}
      </div>

      {problemsToDisplay.length === 0 && (
        <div className="no-problems">
          {searchQuery
            ? 'No problems found matching your search.'
            : 'No problems available. Add your first problem!'}
        </div>
      )}
    </div>
  );
};

export default ProblemList;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemService } from '../services/problemService';
import './ProblemList.css';

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, easy, medium, hard
  const [sortBy, setSortBy] = useState('newest'); // newest, points
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data, error } = await problemService.getAllProblems();
        if (error) {
          setError(error.message || 'Failed to load problems');
          return;
        }
        setProblems(data);
      } catch (error) {
        console.error('Error fetching problems:', error);
        setError('Failed to load problems');
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
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
    }
  };

  const filteredAndSortedProblems = () => {
    let result = [...problems];

    // Apply filter
    if (filter !== 'all') {
      result = result.filter(problem => problem.difficulty === filter);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'points') {
        return b.total_points - a.total_points;
      }
      // Default sort by newest
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return result;
  };

  if (loading) return <div className="loading">Loading problems...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="problem-list-container">
      <div className="problem-list-header">
        <h1>Coding Problems</h1>
        <Link to="/add" className="add-problem-btn">
          Add New Problem
        </Link>
      </div>

      <div className="filters">
        <select value={filter} onChange={handleFilterChange} className="filter-select">
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select value={sortBy} onChange={handleSortChange} className="sort-select">
          <option value="newest">Newest First</option>
          <option value="points">Points (High to Low)</option>
        </select>
      </div>

      <div className="problems-grid">
        {filteredAndSortedProblems().map(problem => (
          <div key={problem.id} className="problem-card">
            <h3>{problem.title}</h3>
            <div className="problem-info">
              <span className={`difficulty ${problem.difficulty}`}>
                {problem.difficulty}
              </span>
              <span className="points">{problem.total_points} points</span>
            </div>
            <p className="description">{problem.description}</p>
            <div className="card-actions">
              <div className="action-links">
                <Link to={`/edit/${problem.id}`} className="edit-link">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(problem.id)}
                  className="delete-link"
                >
                  Delete
                </button>
              </div>
              <Link to={`/problem/${problem.id}`} className="solve-btn">
                Solve Problem
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedProblems().length === 0 && (
        <div className="no-problems">
          No problems found. {filter !== 'all' && 'Try changing the filter.'}
        </div>
      )}
    </div>
  );
};

export default ProblemList;
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
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const data = await problemService.getAllProblems();
      setProblems(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch problems');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
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
          <div key={problem.id} className={`problem-card ${problem.difficulty}`}>
            <h3>{problem.title}</h3>
            <div className="problem-info">
              <span className={`difficulty ${problem.difficulty}`}>
                {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
              </span>
              <span className="points">{problem.total_points} points</span>
            </div>
            <p className="problem-description">
              {problem.description.length > 100
                ? `${problem.description.substring(0, 100)}...`
                : problem.description}
            </p>
            <Link to={`/problem/${problem.id}`} className="solve-btn">
              Solve Problem
            </Link>
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
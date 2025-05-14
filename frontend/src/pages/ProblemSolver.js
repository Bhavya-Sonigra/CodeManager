import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import { problemService } from '../services/problemService';
import './ProblemSolver.css';

const getTemplateCode = (lang) => {
  const templates = {
    javascript: `function solve(input) {
  // Write your solution here
  
  return null;
}

// Example usage:
console.log(solve(input));`,
    python: `def solve(input):
    # Write your solution here
    
    return None

# Example usage:
print(solve(input))`,
    java: `public class Solution {
    public static void main(String[] args) {
        // Example usage
        System.out.println(solve(null));
    }

    public static Object solve(Object input) {
        // Write your solution here
        
        return null;
    }
}`
  };
  return templates[lang] || templates.javascript;
};

const ProblemSolver = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [codeByLanguage, setCodeByLanguage] = useState({
    javascript: getTemplateCode('javascript'),
    python: getTemplateCode('python'),
    java: getTemplateCode('java')
  });
  const [theme, setTheme] = useState('vs-dark');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [sampleInput, setSampleInput] = useState('');

  useEffect(() => {
    const loadProblem = async () => {
      try {
        const { data, error } = await problemService.getProblemById(id);
        if (error) throw error;
        if (!data) throw new Error('Problem not found');
        setProblem(data);
        // Set sample input if available
        setSampleInput(data.sample_input || '');
      } catch (error) {
        console.error('Error loading problem:', error);
        setOutput(`Error: ${error.message || 'Failed to load problem'}`);
      }
    };

    loadProblem();
  }, [id]);



  const handleCodeChange = (newCode) => {
    if (typeof newCode === 'string') {
      setCodeByLanguage(prev => ({
        ...prev,
        [language]: newCode
      }));
    }
  };

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
  };

  const handleThemeChange = () => {
    setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark');
  };

  if (!problem) {
    return <div className="loading-state">Loading problem details...</div>;
  }

  if (!codeByLanguage[language]) {
    return <div className="error-state">Error: Selected language is not supported</div>;
  }

  const handleExecuteCode = async () => {
    setIsExecuting(true);
    setOutput('');
    try {
      if (!codeByLanguage[language]?.trim()) {
        throw new Error('Please write some code before executing');
      }
      const { data, error } = await problemService.executeCode(codeByLanguage[language], language, sampleInput);
      if (error) throw error;
      setOutput(data?.output || 'No output generated');
    } catch (error) {
      setOutput(`Error: ${error.message || 'An unknown error occurred'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmitSolution = async () => {
    setIsExecuting(true);
    setTestResults(null);
    try {
      if (!codeByLanguage[language]?.trim()) {
        throw new Error('Please write some code before submitting');
      }
      const { data, error } = await problemService.submitSolution(id, codeByLanguage[language], language);
      if (error) throw error;
      setTestResults(data || { error: 'No test results received' });
    } catch (error) {
      setTestResults({ error: error.message || 'An unknown error occurred' });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="problem-solver">
      <div className="problem-details">
        <h1>{problem.title}</h1>
        <p className="problem-description">{problem.description}</p>
        
        <div className="editor-controls">
          <select value={language} onChange={handleLanguageChange}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          <button onClick={handleThemeChange}>
            {theme === 'vs-dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        <div className="input-section">
          <h3>Sample Input</h3>
          <textarea
            value={sampleInput}
            onChange={(e) => setSampleInput(e.target.value)}
            placeholder="Enter your test input here..."
          />
        </div>
      </div>

      <div className="editor-section">
        <CodeEditor
          initialValue={codeByLanguage[language]}
          language={language}
          theme={theme}
          onChange={handleCodeChange}
          height="400px"
        />

        <div className="action-buttons">
          <button 
            onClick={handleExecuteCode} 
            disabled={isExecuting || !codeByLanguage[language]?.trim()}
            className={`execute-button ${isExecuting ? 'executing' : ''}`}
            title={!codeByLanguage[language]?.trim() ? 'Please write some code first' : ''}
          >
            {isExecuting ? '⏳ Running...' : '▶️ Run Code'}
          </button>
          <button 
            onClick={handleSubmitSolution} 
            disabled={isExecuting || !codeByLanguage[language]?.trim()}
            className={`submit-button ${isExecuting ? 'executing' : ''}`}
            title={!codeByLanguage[language]?.trim() ? 'Please write some code first' : ''}
          >
            {isExecuting ? '⏳ Submitting...' : '✓ Submit Solution'}
          </button>
        </div>

        {output && (
          <div className="output-section">
            <h3>Output</h3>
            <pre>{output}</pre>
          </div>
        )}

        {testResults && (
          <div className={`test-results ${testResults.error ? 'error' : ''}`}>
            <h3>Test Results</h3>
            {testResults.error ? (
              <div className="error-message">{testResults.error}</div>
            ) : (
              <div>
                <div className="summary">
                  Passed: {testResults.passed}/{testResults.total} tests
                  {testResults.score && (
                    <span className="score">Score: {testResults.score}</span>
                  )}
                </div>
                {testResults.results?.map((result, index) => (
                  <div 
                    key={index} 
                    className={`test-case ${result.passed ? 'passed' : 'failed'}`}
                  >
                    <div className="test-header">
                      Test Case {index + 1}: {result.passed ? '✅' : '❌'}
                    </div>
                    {!result.passed && (
                      <div className="test-details">
                        <div>Expected: {result.expected}</div>
                        <div>Got: {result.actual}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemSolver;

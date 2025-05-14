const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const supabase = require('../config/db');

// Helper function to run code in a safe environment
const executeCode = async (code, language, input) => {
  // In a production environment, you would want to:
  // 1. Use a sandboxed environment (e.g., Docker container)
  // 2. Set resource limits (memory, CPU, execution time)
  // 3. Implement proper error handling and timeout
  
  try {
    // For now, we'll use Node's built-in eval for JavaScript
    // In production, use proper code execution service
    if (language === 'javascript') {
      // Create a safe context for evaluation
      const context = {
        input,
        console: {
          log: (...args) => context.output.push(...args),
        },
        output: [],
      };

      // Wrap the code in a try-catch block
      const wrappedCode = `
        try {
          ${code}
        } catch (error) {
          console.log('Error:', error.message);
        }
      `;

      // Execute the code
      new Function('input', 'console', wrappedCode)(context.input, context.console);
      return { success: true, output: context.output.join('\\n') };
    } else {
      return { 
        success: false, 
        error: 'Unsupported language. Currently only JavaScript is supported.' 
      };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Execute code with sample input
router.post('/execute', async (req, res) => {
  try {
    const { code, language, input } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const result = await executeCode(code, language, input);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ output: result.output });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit solution for evaluation
router.post('/submit', async (req, res) => {
  try {
    const { problemId, code, language } = req.body;
    
    if (!problemId || !code || !language) {
      return res.status(400).json({ 
        error: 'Problem ID, code, and language are required' 
      });
    }

    // Get problem and its test cases
    const { data: problem, error: problemError } = await supabase
      .from('problems')
      .select('*')
      .eq('id', problemId)
      .single();

    if (problemError) throw problemError;

    const { data: testcases, error: testcasesError } = await supabase
      .from('testcases')
      .select('*')
      .eq('problem_id', problemId);

    if (testcasesError) throw testcasesError;

    // Run test cases
    const results = [];
    let passedCount = 0;
    let totalPoints = 0;

    for (const testcase of testcases) {
      const result = await executeCode(code, language, testcase.input);
      
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      const passed = result.output.trim() === testcase.expected_output.trim();
      if (passed) {
        passedCount++;
        totalPoints += testcase.points;
      }

      results.push({
        passed,
        input: testcase.input,
        expected: testcase.expected_output,
        actual: result.output,
        points: passed ? testcase.points : 0
      });
    }

    // Save submission to database
    const { error: submissionError } = await supabase
      .from('submissions')
      .insert({
        id: uuidv4(),
        problem_id: problemId,
        code,
        language,
        passed_tests: passedCount,
        total_tests: testcases.length,
        score: totalPoints,
        submitted_at: new Date().toISOString()
      });

    if (submissionError) throw submissionError;

    res.json({
      passed: passedCount,
      total: testcases.length,
      score: totalPoints,
      maxScore: problem.total_points,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

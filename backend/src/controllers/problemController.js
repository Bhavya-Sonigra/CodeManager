const Problem = require('../models/Problem');
const Testcase = require('../models/Testcase');

exports.getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.getAllProblems();
    if (!problems || !Array.isArray(problems)) {
      throw new Error('Invalid problems data received');
    }
    res.json({
      success: true,
      data: problems,
      count: problems.length
    });
  } catch (error) {
    console.error('Error in getAllProblems:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

exports.getProblemById = async (req, res) => {
  try {
    const problem = await Problem.getProblemById(req.params.id);
    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    // Validate problem data structure
    if (!problem.title || !problem.description || !problem.difficulty) {
      throw new Error('Invalid problem data structure');
    }

    res.json({
      success: true,
      data: problem
    });
  } catch (error) {
    console.error('Error in getProblemById:', error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

exports.createProblem = async (req, res) => {
  try {
    const { title, description, difficulty, total_points, testCases } = req.body;

    // Validate total_points
    const points = Number(total_points);
    if (isNaN(points)) {
      return res.status(400).json({
        success: false,
        error: 'Total points must be a valid number'
      });
    }

    // Additional validation beyond middleware
    if (!Array.isArray(testCases) || testCases.some(test => {
      return typeof test.input === 'undefined' || 
             typeof test.expectedOutput === 'undefined';
    })) {
      return res.status(400).json({
        success: false,
        error: 'Invalid test case format'
      });
    }

    // Create problem with validated data
    const problem = await Problem.createProblem({
      title: title.trim(),
      description: description.trim(),
      difficulty,
      total_points: points // Use the validated points
    });

    if (!problem) {
      throw new Error('Failed to create problem');
    }

    // Create test cases
    // Calculate points per test case
    const pointsPerTest = points / testCases.length;

    await Promise.all(testCases.map(test => 
      Testcase.createTestcase({
        problem_id: problem.id,
        input: test.input,
        expected_output: test.expectedOutput,
        difficulty: 'easy',
        points: pointsPerTest
      })
    ));

    res.status(201).json({
      success: true,
      data: problem,
      message: 'Problem created successfully'
    });

  } catch (error) {
    console.error('Error in createProblem:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create problem'
    });
  }
};

exports.updateProblem = async (req, res) => {
  try {
    const { title, description, difficulty, total_points, testcases } = req.body;
    const problemId = req.params.id;

    // Validate problem exists
    const existingProblem = await Problem.getProblemById(problemId);
    if (!existingProblem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    // Validate test cases
    if (!Array.isArray(testcases) || testcases.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one test case is required'
      });
    }

    // Validate test case format
    const invalidTestcase = testcases.some(test => {
      return !test.input || 
             !test.expected_output || 
             typeof test.points !== 'number' || 
             !test.difficulty;
    });

    if (invalidTestcase) {
      return res.status(400).json({
        success: false,
        error: 'Invalid test case format. Each test case must have input, expected_output, points, and difficulty'
      });
    }

    // Validate total points
    const testcasePointsTotal = testcases.reduce((sum, tc) => sum + tc.points, 0);
    if (Math.abs(testcasePointsTotal - total_points) > 0.01) {
      return res.status(400).json({
        success: false,
        error: `Total points from testcases (${testcasePointsTotal}) must equal problem total points (${total_points})`
      });
    }

    // Update the problem
    const problem = await Problem.updateProblem(problemId, {
      title: title?.trim(),
      description: description?.trim(),
      difficulty,
      total_points
    });

    // Get existing test cases
    const existingTestcases = await Testcase.getTestCasesByProblemId(problemId);
    const existingIds = new Set(existingTestcases.map(tc => tc.id));

    // Separate test cases into updates and creates
    const updates = [];
    const creates = [];
    testcases.forEach(tc => {
      if (tc.id && existingIds.has(tc.id)) {
        updates.push({
          id: tc.id,
          problem_id: problemId,
          input: tc.input.trim(),
          expected_output: tc.expected_output.trim(),
          difficulty: tc.difficulty,
          points: tc.points
        });
      } else {
        creates.push({
          problem_id: problemId,
          input: tc.input.trim(),
          expected_output: tc.expected_output.trim(),
          difficulty: tc.difficulty,
          points: tc.points
        });
      }
    });

    // Delete test cases that are no longer needed
    const keepIds = new Set(updates.map(tc => tc.id));
    const deletions = existingTestcases
      .filter(tc => !keepIds.has(tc.id))
      .map(tc => Testcase.deleteTestcase(tc.id));

    // Update existing test cases
    const updatePromises = updates.map(tc => Testcase.updateTestcase(tc.id, tc));

    // Create new test cases
    const createPromises = creates.map(tc => Testcase.createTestcase(tc));

    // Execute all operations
    await Promise.all([...deletions, ...updatePromises, ...createPromises]);

    // Fetch updated problem with test cases
    const updatedProblem = await Problem.getProblemById(problemId);

    res.json({
      success: true,
      data: updatedProblem,
      message: 'Problem updated successfully'
    });
  } catch (error) {
    console.error('Error in updateProblem:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update problem'
    });
  }
};

exports.deleteProblem = async (req, res) => {
  try {
    // Check if problem exists
    const existingProblem = await Problem.getProblemById(req.params.id);
    if (!existingProblem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    // Delete the problem
    await Problem.deleteProblem(req.params.id);
    
    res.json({
      success: true,
      message: 'Problem deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteProblem:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete problem'
    });
  }
};

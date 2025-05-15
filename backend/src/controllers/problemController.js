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
    const { title, description, difficulty, testCases } = req.body;
    const problemId = req.params.id;

    // Validate problem exists
    const existingProblem = await Problem.getProblemById(problemId);
    if (!existingProblem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found'
      });
    }

    // Additional validation beyond middleware
    if (testCases && (!Array.isArray(testCases) || testCases.some(test => {
      return typeof test.input === 'undefined' || 
             typeof test.expectedOutput === 'undefined';
    }))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid test case format'
      });
    }

    // Update the problem
    const problem = await Problem.updateProblem(problemId, {
      title: title?.trim(),
      description: description?.trim(),
      difficulty
    });

    // Update test cases if provided
    if (testCases && testCases.length > 0) {
      // Delete existing test cases
      await Testcase.deleteTestCasesByProblemId(problemId);

      // Create new test cases
      await Promise.all(testCases.map(test => 
        Testcase.createTestCase({
          problemId,
          input: test.input,
          expectedOutput: test.expectedOutput
        })
      ));
    }

    res.json({
      success: true,
      data: problem,
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

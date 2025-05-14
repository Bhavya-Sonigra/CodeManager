const Problem = require('../models/Problem');
const Testcase = require('../models/Testcase');

exports.getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.getAllProblems();
    res.json(problems);
  } catch (error) {
    console.error('Error in getAllProblems:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getProblemById = async (req, res) => {
  try {
    const problem = await Problem.getProblemById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    console.error('Error in getProblemById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createProblem = async (req, res) => {
  try {
    const { title, description, difficulty, total_points, testcases } = req.body;

    // Create the problem first
    const problem = await Problem.createProblem({
      title,
      description,
      difficulty,
      total_points
    });

    // Create all testcases for the problem
    const testcasePromises = testcases.map(testcase => 
      Testcase.createTestcase({
        ...testcase,
        problem_id: problem.id
      })
    );

    const createdTestcases = await Promise.all(testcasePromises);

    // Validate total points
    const isValid = await Testcase.validateTestcasePoints(problem.id, total_points);
    if (!isValid) {
      throw new Error('Testcase points do not sum up to the total points');
    }

    res.status(201).json({
      ...problem,
      testcases: createdTestcases
    });
  } catch (error) {
    console.error('Error in createProblem:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateProblem = async (req, res) => {
  try {
    const { title, description, difficulty, total_points, testcases } = req.body;
    const problemId = req.params.id;

    // Update the problem
    const problem = await Problem.updateProblem(problemId, {
      title,
      description,
      difficulty,
      total_points
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Update testcases if provided
    if (testcases && testcases.length > 0) {
      // Delete existing testcases
      await Testcase.deleteTestcasesByProblemId(problemId);

      // Create new testcases
      const testcasePromises = testcases.map(testcase =>
        Testcase.createTestcase({
          ...testcase,
          problem_id: problemId
        })
      );

      const updatedTestcases = await Promise.all(testcasePromises);

      // Validate total points
      const isValid = await Testcase.validateTestcasePoints(problemId, total_points);
      if (!isValid) {
        throw new Error('Testcase points do not sum up to the total points');
      }

      res.json({
        ...problem,
        testcases: updatedTestcases
      });
    } else {
      res.json(problem);
    }
  } catch (error) {
    console.error('Error in updateProblem:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.deleteProblem(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    res.json({ message: 'Problem deleted successfully' });
  } catch (error) {
    console.error('Error in deleteProblem:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

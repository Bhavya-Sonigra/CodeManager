const { body, param, validationResult } = require('express-validator');

exports.validateProblemId = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Problem ID is required')
    .isUUID()
    .withMessage('Invalid problem ID format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateProblemSubmission = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Code is required'),
  body('language')
    .trim()
    .notEmpty()
    .withMessage('Language is required')
    .isIn(['javascript', 'python', 'java'])
    .withMessage('Invalid programming language'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateProblemCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('difficulty')
    .trim()
    .notEmpty()
    .withMessage('Difficulty is required')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level'),
  body('testCases')
    .isArray({ min: 1 })
    .withMessage('At least one test case is required'),
  body('testCases.*.input')
    .notEmpty()
    .withMessage('Test case input is required'),
  body('testCases.*.expectedOutput')
    .notEmpty()
    .withMessage('Test case expected output is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

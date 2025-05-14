const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const problemController = require('../controllers/problemController');

// Validation middleware
const validateProblem = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
  body('total_points').isFloat({ min: 0 }).withMessage('Total points must be a positive number'),
  body('testcases').isArray().withMessage('Testcases must be an array'),
  body('testcases.*.input').trim().notEmpty().withMessage('Testcase input is required'),
  body('testcases.*.expected_output').trim().notEmpty().withMessage('Testcase expected output is required'),
  body('testcases.*.difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid testcase difficulty level'),
  body('testcases.*.points').isFloat({ min: 0 }).withMessage('Testcase points must be a positive number')
];

// Routes
router.get('/', problemController.getAllProblems);
router.get('/:id', problemController.getProblemById);
router.post('/', validateProblem, problemController.createProblem);
router.put('/:id', validateProblem, problemController.updateProblem);
router.delete('/:id', problemController.deleteProblem);

module.exports = router;

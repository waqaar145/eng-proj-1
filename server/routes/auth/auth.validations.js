const { check, validationResult } = require('express-validator');
const signupValidation = [
  check('first_name').isLength({ min: 1, max: 20}).withMessage('First name is required & should be between 1 and 20 characters long.').trim().escape(),
  check('last_name').isLength({ min: 1, max: 20}).withMessage('Last name is required & should be between 1 and 20 characters long.').trim().escape(),
  check('username').isLength({ min: 1, max: 50}).withMessage('Username is required.').trim().escape(),
  check('email').isEmail().withMessage('Email must be a valid email.').trim().escape(),
  check('mobile').isNumeric({ min: 7, max: 15}).withMessage('Mobile no. must be valid').trim().escape(),
  check('password').isLength({ min: 6, max: 20 }).withMessage('Password must be at least 6 or maximum 20 long and must contain alphanumeric.').trim().escape()
];

const signinValidation = [
  check('email').isEmail().withMessage('Email must be a valid email.').trim().escape(),
  check('password').isLength({ min: 6, max: 20 }).withMessage('Password must be at least 6 or maximum 20 long and must contain alphanumeric.').trim().escape()
];

module.exports = { signupValidation, signinValidation };
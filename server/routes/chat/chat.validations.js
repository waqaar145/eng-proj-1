const { check, validationResult } = require('express-validator');
const createGroupValidation = [
  check('groupName').isLength({ min: 1, max: 20}).withMessage('Group name is required & should be between 1 and 20 characters long.').trim().escape(),
];

const addUserToGroupValidation = [
  check('userId').isNumeric().withMessage('Select a user to add in the group').escape(),
  check('groupId').isNumeric().withMessage('Please create a group').escape(),
];

const groupUserValidation = [
  check('groupId').isNumeric().withMessage('Group id is required').escape(),
];

const groupIDValidation = [
  check('groupId').isUUID().withMessage('Group id is required').escape(),
];

const usersListValidation = [
  check('type').isIn(['public', 'gp', 'dm']).withMessage('Type is required').escape(),
];

const chatValidation = [
  check('groupId').isUUID().withMessage('Group id is required').escape(),
  check('message').isLength({ min: 1, max: 5000}).withMessage('Message is required & should be between 1 and 5000 characters long.').trim().escape(),
  check('parentId').isInt().withMessage('Parent id is required and should be number').optional({nullable: true}),
]

const messageIDValidation = [
  check('messageId').isNumeric().withMessage('Message id is required').escape(),
];

const updateChatValidation = [
  check('messageId').isNumeric().withMessage('Message id is required').escape(),
  check('message').isLength({ min: 1, max: 5000}).withMessage('Message is required & should be between 1 and 5000 characters long.').trim().escape(),
];

const getRepliesChatValidation = [
  check('groupId').isUUID().withMessage('Group id is required').escape(),
  check('messageId').isNumeric().withMessage('Message id is required').escape(),
];

const addReactionValidation = [
  check('messageId').isNumeric().withMessage('Message id is required').escape(),
  check('value').isNumeric().withMessage('Value is required').escape(),
];

module.exports = { createGroupValidation, addUserToGroupValidation, groupIDValidation, groupUserValidation, usersListValidation, chatValidation, messageIDValidation, updateChatValidation, getRepliesChatValidation, addReactionValidation };
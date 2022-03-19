const { check, validationResult } = require('express-validator');
const createGroupValidation = [
  check('groupName').isLength({ min: 1, max: 80}).withMessage('Group name is required & must be less than 80 characters long.').trim().escape(),
  check('description').isLength({ min: 0, max: 500}).withMessage('Description must be less than 500 chracters long.').trim().escape(),
];

const addUserToGroupValidation = [
  check('userId').isNumeric().withMessage('Select a user to add in the group').escape(),
  check('groupId').isUUID().withMessage('Group id is required').escape(),
];

const makeAdminValidation = [
  check('groupId').isUUID().withMessage('Group id is required').escape(),
  check('userId').isNumeric().withMessage('Select a user to add in the group').escape(),
]

const groupUserValidation = [
  check('groupId').isNumeric().withMessage('Group id is required').escape(),
];

const groupIDValidation = [
  check('groupId').isUUID().withMessage('Group id is required').escape(),
];

const userIDValidation = [
  check('userId').isUUID().withMessage('User id is required').escape(),
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

const addEmojiReactionValidation = [
  check('messageId').isNumeric().withMessage('Message id is required').escape(),
  check('emojiId').isLength({ min: 1}).withMessage('Emoji is required').escape(),
  check('skin').custom(value => {
    let allowedVals = [null, 1, 2, 3, 4, 5, 6];
    if (!(allowedVals.indexOf(value) > -1)) {
      return Promise.reject('Skin code is not correct')
    }
    return true;
  })
];

module.exports = { createGroupValidation, addUserToGroupValidation, makeAdminValidation, groupIDValidation, userIDValidation, groupUserValidation, usersListValidation, chatValidation, messageIDValidation, updateChatValidation, getRepliesChatValidation, addEmojiReactionValidation };
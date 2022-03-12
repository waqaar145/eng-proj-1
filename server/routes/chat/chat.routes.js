const Router = require("express");
const routes = new Router();
const { authentication } = require('./../../helpers/auth')
const { createGroupValidation, addUserToGroupValidation, groupUserValidation, groupIDValidation, usersListValidation, chatValidation, messageIDValidation, updateChatValidation, getRepliesChatValidation, addEmojiReactionValidation } = require('./chat.validations')

const { createGroup, getGroup, deleteGroup, searchUsers, addUserToGroup, getGroupsOfLoggedinUser, getUsersOfGroup } = require("./chat.controllers");
const { getUsersToChat } = require("./chatSidebar.controllers");
const { getGroupChats, addChat, updateChat, deleteChat, getReplies, addEmojiReaction } = require("./chatContent.controllers");


routes.post("/chat/group", [authentication, createGroupValidation], createGroup);
routes.get("/chat/group/:groupId", [authentication, groupIDValidation], getGroup);
routes.delete("/chat/group/:groupId", [authentication, groupUserValidation], deleteGroup);

routes.get("/chat/group/users/:groupId", [authentication, groupIDValidation], searchUsers);
routes.put("/chat/group/users/:groupId/:userId", [authentication, addUserToGroupValidation], addUserToGroup);
routes.get("/chat/user-groups", [authentication], getGroupsOfLoggedinUser);
routes.get("/chat/users-of-group/:groupId", [authentication, groupUserValidation], getUsersOfGroup);


//chat page - fetching users to chat for current loggedin user
routes.get("/chat/users", [authentication, usersListValidation], getUsersToChat);

routes.post("/chat", [authentication], addChat);
routes.get("/chat/:groupId", [authentication, groupIDValidation], getGroupChats);
routes.put("/chat/:messageId", [authentication], updateChat);
routes.delete("/chat/:messageId", [authentication, messageIDValidation], deleteChat);
routes.get("/chat/replies/:groupId/:messageId", [authentication, messageIDValidation], getReplies);

// Emoji reactions
routes.put("/chat/message/reaction/:messageId", [authentication, addEmojiReactionValidation], addEmojiReaction);

module.exports = routes;

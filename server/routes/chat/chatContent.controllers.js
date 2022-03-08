const knex = require("./../../db/knex");
const { okResponse, errorResponse } = require("./../../helpers/message");
const { getPaginationValues } = require("./../../helpers/pagination");
const { validationResult } = require("express-validator");
const { expValidatorMsg } = require("./../../helpers/validation");


const getChats = async (userId, groupRes, parentId, offset, limit) => {
  try {
    const result = await knex("messages")
      .select(
        "messages.m_id as id",
        "messages.m_message as message",
        "messages.m_parent_id as parentId",

        "messages.m_reactions as reactions",
        "messages.m_total_replies as totalReplies",
        "messages.m_profile_replies as profileReplies",
        "messages.m_created_at as createdAt",
        "messages.m_updated_at as updatedAt",

        "users.u_id as userId",
        "users.u_first_name as firstName",
        "users.u_last_name as lastName",
        "users.u_username as username",
        "users.u_email as email",
        "users.u_dp as dp"
      )
      .innerJoin("users", "users.u_id", "messages.m_user_id")
      .where({ m_group_id: groupRes.id })
      .andWhere({ m_parent_id: parentId })
      .andWhere({ m_is_active: true })
      .orderBy("messages.m_id", "desc")
      .offset(offset)
      .limit(limit);

    let resultWithReactions = []
    for (let message of result) {
      if (message.reactions) {
        let reactionsArray = {}
        for (const [key, value] of Object.entries(message.reactions)) { 
          let reactionObj = {
            me: value[userId] ? true : false,
            count: value.count || 0
          }
          reactionsArray = {
            ...reactionsArray,
            [key]: reactionObj
          }
        }
        resultWithReactions.push({
          ...message,
          reactions: reactionsArray
        })
      } else {
        resultWithReactions.push({
          ...message,
          reactions: null
        })
      }
    }
    return resultWithReactions;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const getGroupChats = async (req, res) => {
  // Form Validation *******
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      message: "Error!",
      data: expValidatorMsg(errors.array()),
    });
  }

  const { groupId } = req.params;

  const { offset, limit, pageNo } = getPaginationValues(req.query);
  try {
    let totalEnteries = 0;
    let groupRes = await knex("groups")
      .select(
        "g_id as id",
        "g_uuid as uuid",
        "g_group_name as groupName",
        "g_group_type as groupType",
        "g_members as members",
        "g_created_at as createdAt"
      )
      .where({ g_uuid: groupId })
      .andWhere({ g_is_active: true })
      .first();

    if (!groupRes) {
      return res.status(422).send(errorResponse({}, "Group does not exists!"));
    }

    if (pageNo === 1) {
      totalEnteries = await knex("messages")
        .count("m_id as count")
        .where({ m_group_id: groupRes.id })
        .andWhere({ m_is_active: true })
        .andWhere({ m_parent_id: null });
    }

    groupRes = {
      ...groupRes,
      groupType:
        groupRes.groupType === null
          ? "public"
          : groupRes.groupType === false
          ? "group"
          : "private",
    };

    let chatRes = await getChats(req.user.id, groupRes, null, offset, limit);

    return res.status(200).send(
      okResponse(
        {
          group: groupRes,
          chats: chatRes,
          ...(pageNo === 1 && { totalEnteries: +totalEnteries[0]["count"] }),
        },
        "Results are fetched"
      )
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({}, "Something went wrong!"));
  }
};

const addToMessageReplies = async (parentMessage, user) => {
  try {
    const {
      m_id,
      m_profile_replies
    } = parentMessage;
    const {
      id,
      first_name,
      last_name,
      dp
    } = user;
    let obj = {
      id,
      name: first_name + ' ' + last_name,
      dp 
    }

    let dataInColumn = m_profile_replies;
    let profileRepliesArray = [];
    if (dataInColumn === null) {
      profileRepliesArray = [obj]
    } else {
      let userFound = false;
      for (let u of dataInColumn) {
        if (u.id === user.id) {
          userFound = true;
        }
      }
      if (userFound) {
        profileRepliesArray = [...dataInColumn.filter(u => u.id !== user.id), obj];
      } else {
        profileRepliesArray = [...dataInColumn, obj]
      }
    }

    let slicedArray = []
    if (profileRepliesArray.length > 3) {
      slicedArray = profileRepliesArray.slice(1);
    } else {
      slicedArray = profileRepliesArray;
    }
    
    await knex("messages")
      .where({ m_id: m_id })
      .update({m_profile_replies: JSON.stringify(slicedArray)})
      .returning("*");
  } catch (error) {
    console.log(error)
    return JSON.stringify([]);
  }
}

const addChat = async (req, res) => {

  // Form Validation *******
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(422).send({
  //     message: "Error!",
  //     data: expValidatorMsg(errors.array()),
  //   });
  // }

  try {
    const { groupId, message, parentId } = req.body;

    let group = await knex("groups").where({ g_uuid: groupId }).first();

    if (!group) {
      return res.status(422).send(errorResponse({}, "Group does not exists!"));
    }

    let messageObj = {
      m_user_id: req.user.id,
      m_group_id: group.g_id,
      m_message: message,
    };

    let parentMessage = null;
    if (parentId) {
      parentMessage = await knex("messages").where({ m_id: parentId }).first();
      if (parentMessage) {
        messageObj.m_parent_id = parentMessage.m_id;
      }
    }

    let messageRes = await knex("messages").insert(messageObj).returning("*");
    let messageResObj = messageRes[0];

    if (parentId) {
      addToMessageReplies(parentMessage, req.user)
    }

    if (messageResObj && parentId) {
      await knex("messages").where({ m_id: parentId }).increment({
        m_total_replies: 1,
      });
    }

    if (messageResObj) {
      const mResObj = {
        id: messageResObj.m_id,
        parentId: parentId,
        message: messageResObj.m_message,
        totalReplies: messageResObj.m_total_replies,
        createdAt: messageResObj.m_created_at,
        updatedAt: messageResObj.m_updated_at,

        userId: req.user.id,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        username: req.user.username,
        email: req.user.email,
        dp: req.user.dp,
      };
      return res.status(200).send(okResponse(mResObj, "OK"));
    } else {
      return res
        .status(422)
        .send(errorResponse({}, "Something went wrong while saving message!"));
    }
  } catch (error) {
    console.log(error);
    return res
      .status(422)
      .send(errorResponse({}, "Something went wrong while saving message!"));
  }
};

const updateChat = async (req, res) => {
  // Form Validation *******
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      message: "Error!",
      data: expValidatorMsg(errors.array()),
    });
  }

  const { message } = req.body;
  const { messageId } = req.params;

  try {
    let checkMessage = await knex("messages")
      .where({
        m_id: messageId,
        m_user_id: req.user.id,
        m_is_active: true,
      })
      .first();

    if (checkMessage) {
      let result = await knex("messages")
        .where({ m_id: messageId })
        .update({
          m_message: message,
          m_updated_at: new Date(),
        })
        .returning("*");

      let resultRes = result[0];

      const resObj = {
        messageId: resultRes.m_id,
        parentId: resultRes.m_parent_id,
        message: resultRes.m_message,
        updatedAt: resultRes.m_updated_at,
      };

      return res.status(200).send(okResponse(resObj, "OK"));
    }
    return res
      .status(422)
      .send(errorResponse({}, "Can't update this message!"));
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({}, "Something went wrong!"));
  }
};

const deleteChat = async (req, res) => {
  // Form Validation *******
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      message: "Error!",
      data: expValidatorMsg(errors.array()),
    });
  }

  const { messageId } = req.params;

  try {
    let checkMessage = await knex("messages")
      .where({
        m_id: messageId,
        m_user_id: req.user.id,
        m_is_active: true,
      })
      .first();

    if (checkMessage) {
      let result = await knex("messages")
        .where({ m_id: messageId })
        .update({ m_is_active: false })
        .returning("*");
      let resultRes = result[0];

      if (resultRes.m_parent_id !== null) {
        await knex("messages")
          .where({ m_id: resultRes.m_parent_id })
          .decrement({
            m_total_replies: 1,
          });
      }

      const resObj = {
        messageId: resultRes.m_id,
        parentId: resultRes.m_parent_id,
      };

      return res.status(200).send(okResponse(resObj, "OK"));
    }
    return res
      .status(422)
      .send(errorResponse({}, "Can't delete this message!"));
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({}, "Something went wrong!"));
  }
};

const getReplies = async (req, res) => {
  // Form Validation *******
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      message: "Error!",
      data: expValidatorMsg(errors.array()),
    });
  }

  const { groupId, messageId } = req.params;

  try {
    let groupRes = await knex("groups")
      .select("g_id as id")
      .where({ g_uuid: groupId })
      .andWhere({ g_is_active: true })
      .first();

    if (!groupRes) {
      return res.status(422).send(errorResponse({}, "Group does not exists!"));
    }

    let totalEnteries = 0;
    const { offset, limit, pageNo } = getPaginationValues(req.query);

    if (pageNo === 1) {
      totalEnteries = await knex("messages")
        .count("m_id as count")
        .where({ m_parent_id: messageId })
        .andWhere({ m_is_active: true });
    }

    let chatRes = await getChats(
      req.user.id,
      groupRes,
      messageId,
      offset,
      limit
    );
    return res.status(200).send(
      okResponse(
        {
          chats: chatRes,
          ...(pageNo === 1 && { totalEnteries: +totalEnteries[0]["count"] }),
        },
        "Results are fetched"
      )
    );
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({}, "Something went wrong!"));
  }
};

const addEmojiReaction = async (req, res) => {
  // Form Validation *******
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      message: "Error!",
      data: expValidatorMsg(errors.array()),
    });
  }

  const { messageId } = req.params;
  const { emojiId, skin } = req.body;

  try {
    let result = await knex("messages")
      .select(
        "m_reactions as reactions", 
        "m_parent_id as parentId"
      )
      .where({ m_id: messageId })
      .returning("*");

    let { reactions, parentId } = result[0];

    let skinTone = skin ? String(skin) : "0"; 
    let emojiIdToneString = emojiId + "-" + skinTone;
    let parsedReactions = reactions;
    let added = false;
    let count = 0;
    if (reactions) {
      if (parsedReactions[emojiIdToneString]) {
        if (parsedReactions[emojiIdToneString][req.user.id]) {
          parsedReactions[emojiIdToneString].count = parsedReactions[emojiIdToneString].count - 1;
          added = false;
          count = parsedReactions[emojiIdToneString].count;
          if (parsedReactions[emojiIdToneString].count === 0) {
            delete parsedReactions[emojiIdToneString]
          } else {
            delete parsedReactions[emojiIdToneString][req.user.id];  
          }
        } else {
          parsedReactions[emojiIdToneString].count = parsedReactions[emojiIdToneString].count + 1;
          added = true;
          count = parsedReactions[emojiIdToneString].count;
          parsedReactions[emojiIdToneString][req.user.id] = new Date();
        }
      } else {
        parsedReactions = {
          ...parsedReactions,
          [emojiIdToneString]: {
            count: 1,
            [req.user.id]: new Date(),
          },
        };
        added = true;
        count = 1;
      }
    } else {
      parsedReactions = {
        [emojiIdToneString]: {
          count: 1,
          [req.user.id]: new Date(),
        },
      };
      added = true;
      count = 1
    }

    let stringifiedParsedReactions =
      Object.keys(parsedReactions).length === 0
        ? null
        : JSON.stringify(parsedReactions);

    await knex("messages")
      .where({ m_id: messageId })
      .update({
        m_reactions: stringifiedParsedReactions,
      })
      .returning("*");

    let reactionResObj = {
      messageId: +messageId,
      emoji: {
        id: emojiId,
        skin: skin
      },
      me: added,
      count: count,
      parentId: parentId || null
    }

    return res.status(200).send(okResponse(reactionResObj, "OK"));
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({}, "Something went wrong!"));
  }
};

module.exports = {
  getGroupChats,
  addChat,
  updateChat,
  deleteChat,
  getReplies,
  addEmojiReaction,
};

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
        
        "messages.m_total_replies as totalReplies",
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
    return result;
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

const addChat = async (req, res) => {
  // Form Validation *******
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      message: "Error!",
      data: expValidatorMsg(errors.array()),
    });
  }

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

    if (parentId) {
      let message = await knex("messages").where({ m_id: parentId }).first();
      if (message) {
        messageObj.m_parent_id = message.m_id;
      }
    }

    let messageRes = await knex("messages").insert(messageObj).returning("*");
    let messageResObj = messageRes[0];

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
    console.log(error)
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

    let chatRes = await getChats(req.user.id, groupRes, messageId, offset, limit);
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

const addReaction = async (req, res) => {
  // Form Validation *******
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      message: "Error!",
      data: expValidatorMsg(errors.array()),
    });
  }

  const { messageId, value } = req.body;

  try {
    let checkMessage = await knex("messages")
      .where({
        m_id: messageId,
        m_is_active: true,
      })
      .first();

    const checkEntry = await knex("messages_likes")
      .where({
        ml_message_id: +messageId,
        ml_user_id: req.user.id,
      })
      .returning("*");

    let totalLikes = checkMessage.m_total_likes
    if (checkEntry.length > 0) {
      const checkEntryObj = checkEntry[0];
      let deleted = false;
      let updated = false;
      let deleteEntry;
      let updateEntry;
      
      if (checkEntryObj.ml_value === +value) {
        deleteEntry = await knex("messages_likes")
          .where({
            ml_id: checkEntryObj.ml_id,
          })
          .del();
        deleted = true;
        await knex("messages").where({ m_id: messageId }).decrement({
          m_total_likes: 1,
        });
        totalLikes = totalLikes - 1
      } else {
        updateEntry = await knex("messages_likes")
          .where({
            ml_id: checkEntryObj.ml_id,
          })
          .update({
            ml_value: value,
          })
          .returning("*");
        updated = true;
      }

      const resEntryObject = {
        id: checkEntryObj.ml_id,
        messageId: checkEntryObj.ml_message_id,
        liked: deleted ? null : updated ? updateEntry[0].ml_value : null,
        parentId: checkMessage.m_parent_id,
        totalLikes
      };

      return res.status(200).send(okResponse(resEntryObject, "OK"));
    }
    const reactionObj = {
      ml_user_id: req.user.id,
      ml_message_id: +messageId,
      ml_value: 1,
    };

    const result = await knex("messages_likes")
      .insert(reactionObj)
      .returning("*");
    const resultObj = result[0];

    await knex("messages").where({ m_id: messageId }).increment({
      m_total_likes: 1,
    }).returning('*');

    totalLikes = totalLikes + 1

    const resObj = {
      id: resultObj.ml_id,
      messageId: resultObj.ml_message_id,
      liked: resultObj.ml_value,
      parentId: checkMessage.m_parent_id,
      totalLikes
    };
    return res.status(200).send(okResponse(resObj, "OK"));
  } catch (error) {
    console.log("ERROR - ADDING REACTION", error);
    return res.status(500).send(errorResponse({}, "Something went wrong!"));
  }
};

module.exports = {
  getGroupChats,
  addChat,
  updateChat,
  deleteChat,
  getReplies,
  addReaction,
};

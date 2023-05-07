const knex = require("./../../db/knex");
const { okResponse, errorResponse } = require("./../../helpers/message");
const { getPaginationValues } = require("./../../helpers/pagination");
const { validationResult } = require("express-validator");
const { expValidatorMsg } = require("./../../helpers/validation");

const getPublicGroups = async (query, loggedInUserId) => {
  const { offset, limit, sort, q } = getPaginationValues(query);
  try {
    let publicGroups = await knex("groups")
      .select(
        "g_id as id",
        "g_uuid as uuid",
        "g_group_name as name",
        "g_members as members",
        "g_created_at as createdAt"
      )
      .andWhere({ g_group_type: null })
      .andWhere({ g_is_active: true })
      .offset(offset)
      .limit(limit);

    let totalEnteries = await knex("groups")
      .count("g_id as count")
      .where({ g_created_by: loggedInUserId })
      .andWhere({ g_group_type: null })
      .andWhere({ g_is_active: true });

    return {
      data: publicGroups,
      totalEnteries: +totalEnteries[0]["count"],
    };
  } catch (error) {
    return {
      data: [],
      totalEnteries: 0,
    };
  }
};

const getGroups = async (query, loggedInUserId) => {
  const { offset, limit, sort, q } = getPaginationValues(query);
  try {
    let groupIds = await knex("participants")
      .select("p_group_id as groupId", "p_admin as admin")
      .where("p_user_id", loggedInUserId)
      .returning("*");
    let clubbedGroupIds = [];
    for (let group of groupIds) {
      clubbedGroupIds.push(group.groupId);
    }

    let groups = await knex("groups")
      .select(
        "g_id as id",
        "g_uuid as uuid",
        "g_group_name as name",
        "g_members as members",
        "g_created_at as createdAt"
      )
      .whereIn("g_id", clubbedGroupIds)
      .andWhere({ g_group_type: false })
      .andWhere({ g_is_active: true });

    let totalEnteries = await knex("groups")
      .count("g_id as count")
      .whereIn("g_id", clubbedGroupIds)
      .andWhere({ g_group_type: false })
      .andWhere({ g_is_active: true });

    return {
      data: groups,
      totalEnteries: +totalEnteries[0]["count"],
    };
  } catch (error) {
    return {
      data: [],
      totalEnteries: 0,
    };
  }
};

const getPrivateGroups = async (query, loggedInUserId) => {
  const { offset, limit, sort, q } = getPaginationValues(query);

  try {
    let allPrivateChatUsers = await knex
      .table("participants as p1")
      .select("p1.p_user_id", "groups.g_id as id", "groups.g_uuid as groupId", "groups.g_members as members", "groups.g_created_at as createdAt")
      .innerJoin("participants as p2", "p2.p_group_id", "p1.p_group_id")
      .innerJoin("groups", "groups.g_id", "p1.p_group_id")
      .where("p2.p_user_id", loggedInUserId)
      .whereNot("p1.p_user_id", loggedInUserId)
      .where("groups.g_group_type", true);

    let userIds = [];
    let userAndGroupObj = {};
    for (let user of allPrivateChatUsers) {
      userIds.push(user.p_user_id)
      userAndGroupObj[user.p_user_id] = {
        ['groupIntID']: user.id,
        ['groupUUID']: user.groupId,
        ['members']: user.members,
        ['createdAt']: user.createdAt,
      }
    }

    let users = await knex("users")
      .select(
        "u_id as id",
        "u_uuid as uuid",
        "u_first_name as firstName",
        "u_last_name as lastName",
        "u_dp as dp",
        "u_designation as designation",
      )
      .whereIn("u_id", userIds)
      .orderBy('u_first_name', 'asc')
      .orderBy('u_last_name', 'asc')
      .offset(offset)
      .limit(limit);
    
    groups = users.map(user => {
      let userGroupObj = {
        id: userAndGroupObj[user.id]['groupIntID'],
        uuid: userAndGroupObj[user.id]['groupUUID'],
        name: `${user.firstName} ${user.lastName}`,
        dp: user.dp,
        members: userAndGroupObj[user.id]['members'],
        createdAt: userAndGroupObj[user.id]['createdAt']
      }
      return userGroupObj;
    });

    let totalEnteries = await knex("users")
      .count("u_id as count")
      .whereIn("u_id", userIds)

    return {
      data: groups,
      totalEnteries: +totalEnteries[0]["count"],
    };
  } catch (error) {
    console.log(error)
    return {
      data: [],
      totalEnteries: 0,
    };
  }
};

const getUsersToChat = async (req, res) => {
  // Form Validation *******
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      message: "Error!",
      data: expValidatorMsg(errors.array()),
    });
  }

  try {
    const { type } = req.query;

    let result = {};
    let name = "";

    if (type === "public") {
      name = "General";
      result = await getPublicGroups(req.query, req.user.id);
    }
    if (type === "gp") {
      name = "Group Messages";
      result = await getGroups(req.query, req.user.id);
    }
    if (type === "dm") {
      name = "Direct Messages";
      result = await getPrivateGroups(req.query, req.user.id);
    }

    const groupResponse = {
      name,
      chatList: result,
    };

    return res
      .status(200)
      .send(okResponse(groupResponse, "Results are fetched"));
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({}, "Something went wrong!"));
  }
};

module.exports = {
  getUsersToChat,
};

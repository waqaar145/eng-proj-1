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
    let groups = await knex("groups")
      .select(
        "g_id as id",
        "g_uuid as uuid",
        "g_group_name as name",
        "g_members as members",
        "g_created_at as createdAt"
      )
      .where({ g_created_by: loggedInUserId })
      .andWhere({ g_group_type: false })
      .andWhere({ g_is_active: true })
      .offset(offset)
      .limit(limit);
    let totalEnteries = await knex("groups")
      .count("g_id as count")
      .where({ g_created_by: loggedInUserId })
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
    let groups = await knex("groups")
      .select(
        "g_id as id",
        "g_uuid as uuid",
        "g_group_name as name",
        "g_members as members",
        "g_created_at as createdAt"
      )
      .where({ g_created_by: loggedInUserId })
      .andWhere({ g_group_type: true })
      .andWhere({ g_is_active: true })
      .offset(offset)
      .limit(limit);

    let totalEnteries = await knex("groups")
      .count("g_id as count")
      .where({ g_created_by: loggedInUserId })
      .andWhere({ g_group_type: true })
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

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult, check } = require("express-validator");
const knex = require("./../../db/knex");
const config = require("./../../config/config");
const { okResponse, errorResponse } = require("./../../helpers/message");
const { expValidatorMsg } = require("./../../helpers/validation");
const { getPaginationValues } = require("./../../helpers/pagination");

const checkIfUserIsAdmin = async (groupUUID, loggedInUserId) => {
  try {
    let groupRes = await knex("groups")
      .select(
        "g_id as id",
        "g_uuid as uuid",
        "g_group_name as groupName",
        "g_group_type as groupType",
        "g_members as members",
        "g_created_at as createdAt",
        "participants.p_admin as admin"
      )
      .where({ g_uuid: groupUUID })
      .andWhere({ g_is_active: true })
      .leftJoin("participants", function (builder) {
        builder
          .on("participants.p_group_id", "groups.g_id")
          .on("participants.p_user_id", loggedInUserId);
      })
      .first();

    if (groupRes && groupRes.admin === 1) {
      return {
        admin: true,
        groupIntID: groupRes.id,
        groupType: groupRes.groupType,
      };
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

const createGroup = async (req, res) => {
  // Form Validation *******
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      message: "Got error while submitting",
      data: expValidatorMsg(errors.array()),
    });
  }
  try {
    const { groupName, description } = req.body;
    const groupObj = {
      g_group_name: groupName,
      g_description: description,
      g_group_type: false,
      g_created_by: req.user.id,
      g_members: 1,
    };

    const groupResult = await knex("groups").insert(groupObj).returning("*");
    const group = groupResult[0];

    let participantObj = {
      p_user_id: req.user.id,
      p_group_id: group.g_id,
      p_admin: 1,
    };
    await knex("participants").insert(participantObj);

    const groupResponse = {
      id: group.g_id,
      uuid: group.g_uuid,
      name: group.g_group_name,
      members: group.g_members,
      createdAt: group.g_created_at,
    };
    return res.status(200).send(okResponse(groupResponse, "Gorup is created"));
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({}, "Something went wrong!"));
  }
};

const searchUsers = async (req, res) => {
  const { offset, limit, sort, q } = getPaginationValues(req.query);

  if (!q || q === "") {
    return res.status(200).send(okResponse([], "Search result is fetched."));
  }

  const { groupId } = req.params;

  try {
    let group = await knex("groups")
      .select("g_id as id")
      .where("g_uuid", groupId)
      .first();
    if (!group) {
      return res.status(422).send(errorResponse({}, "Group does not exists!"));
    }

    let participants = await knex("participants")
      .select("p_user_id as user_id")
      .where("p_group_id", group.id);

    let participantsIds = [];
    for (let participant of participants) {
      participantsIds.push(participant.user_id);
    }

    let duplicateIds = [...participantsIds, req.user.id];

    let query = q.toLowerCase() + "%";
    let result = await knex("users")
      .select(
        "u_id as id",
        "u_uuid as uuid",
        "u_first_name as firstName",
        "u_last_name as lastName",
        "u_username as username",
        "u_username as username",
        "u_dp as dp",
        "u_designation as designation"
      )
      .where("u_username", "like", query)
      .whereNotIn("u_id", duplicateIds)
      .orderBy("u_username", sort)
      .offset(offset)
      .limit(limit);

    let totalEnteries = await knex("users")
      .count("u_id as count")
      .where("u_username", "like", query)
      .whereNotIn("u_id", duplicateIds);

    let userResponse = {
      data: result,
      totalEnteries: +totalEnteries[0].count,
    };

    return res
      .status(200)
      .send(okResponse(userResponse, "Search result is fetched."));
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({}, "Something went wrong!"));
  }
};

const getExistingUsers = async (req, res) => {
  // Form Validation *******
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      message: "Got error while submitting",
      data: expValidatorMsg(errors.array()),
    });
  }

  const { groupId } = req.params;

  try {
    let group = await knex("groups")
      .select("g_id as id")
      .where("g_uuid", groupId)
      .first();
    if (!group) {
      return res.status(422).send(errorResponse({}, "Group does not exists!"));
    }

    let participants = await knex("participants")
      .select("p_user_id as user_id", "p_admin as admin")
      .where("p_group_id", group.id);

    let userAdminObj = {};
    let participantsIds = [];
    for (let participant of participants) {
      participantsIds.push(participant.user_id);
      userAdminObj[participant.user_id] = participant.admin;
    }

    let result = await knex("users")
      .select(
        "u_id as id",
        "u_uuid as uuid",
        "u_first_name as firstName",
        "u_last_name as lastName",
        "u_username as username",
        "u_username as username",
        "u_dp as dp",
        "u_designation as designation"
      )
      .whereIn("u_id", participantsIds)
      .orderBy("u_username", "desc");

    let updatedResult = result.map((user) => {
      return {
        ...user,
        admin: userAdminObj[user.id],
      };
    });

    let totalEnteries = await knex("users")
      .count("u_id as count")
      .whereIn("u_id", participantsIds);

    let userResponse = {
      data: updatedResult,
      totalEnteries: +totalEnteries[0].count,
    };

    return res
      .status(200)
      .send(okResponse(userResponse, "Existing users have been fetched."));
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({}, "Something went wrong!"));
  }
};

const addUserToGroup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      message: "Got error while submitting",
      data: expValidatorMsg(errors.array()),
    });
  }

  const { userId, groupId } = req.params;

  let checkAccess = await checkIfUserIsAdmin(groupId, req.user.id);

  if (checkAccess === false || checkAccess.groupType !== false) {
    return res
      .status(422)
      .send(errorResponse({}, "you don't have right to this action."));
  }

  let groupIntID = checkAccess.groupIntID;

  try {
    let check = await knex("participants")
      .where({ p_user_id: userId })
      .andWhere({ p_group_id: groupIntID })
      .first();
    if (check) {
      let deleteData = await knex("participants")
        .where({ p_user_id: userId })
        .andWhere({ p_group_id: groupIntID })
        .del();
      if (deleteData) {
        await knex("groups").where("g_id", "=", groupIntID).decrement({
          g_members: 1,
        });
        const checkParticipantsResponse = {
          id: check.p_id,
          userId: check.p_user_id,
          groupId: check.p_group_id,
          new: false,
        };
        return res
          .status(200)
          .send(
            okResponse(
              checkParticipantsResponse,
              "User is already added in the group"
            )
          );
      } else {
        return res.status(500).send(errorResponse({}, "Something went wrong!"));
      }
    }

    const participantsObj = {
      p_user_id: userId,
      p_group_id: groupIntID,
    };
    const participantsResult = await knex("participants")
      .insert(participantsObj)
      .returning("*");
    await knex("groups").where("g_id", "=", groupIntID).increment({
      g_members: 1,
    });
    const participant = participantsResult[0];
    const participantsResponse = {
      id: participant.p_id,
      userId: participant.p_user_id,
      groupId: participant.p_group_id,
      new: true,
    };

    return res
      .status(200)
      .send(okResponse(participantsResponse, "User is added in the group"));
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({}, "Something went wrong!"));
  }
};

const makeAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      message: "Got error while submitting",
      data: expValidatorMsg(errors.array()),
    });
  }

  try {
    const { userId, groupId } = req.params;

    let checkAccess = await checkIfUserIsAdmin(groupId, req.user.id);

    if (checkAccess === false || checkAccess.groupType !== false) {
      return res
        .status(422)
        .send(errorResponse({}, "you don't have right to this action."));
    }

    let participantCheck = await knex("participants")
      .where({ p_group_id: checkAccess.groupIntID, p_user_id: userId })
      .first();

    if (participantCheck.p_admin === 0) {
      await knex("participants")
        .update("p_admin", 1)
        .where({ p_group_id: checkAccess.groupIntID, p_user_id: userId })
        .returning("*");
    } else {
      await knex("participants")
        .update("p_admin", 0)
        .where({ p_group_id: checkAccess.groupIntID, p_user_id: userId })
        .returning("*");
    }

    let groupResponse = {
      userId: participantCheck.p_user_id,
      admin: participantCheck.p_admin === 0 ? 1 : 0,
    };

    return res
      .status(200)
      .send(
        okResponse(
          groupResponse,
          `${
            participantCheck.p_admin === 0
              ? "Added to Admin"
              : "Removed from Admin"
          }`
        )
      );
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({}, "Something went wrong!"));
  }
};

const leaveGroup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      message: "Got error while submitting",
      data: expValidatorMsg(errors.array()),
    });
  }

  const { groupId } = req.params;

  try {
    let group = await knex("groups")
      .select("g_id as id")
      .where("g_uuid", groupId)
      .first();
    if (!group) {
      return res.status(422).send(errorResponse({}, "Group does not exists!"));
    }

    let intGroupId = group.id;
    let loggedInUserId = req.user.id;

    let check = await knex("participants")
      .where({ p_user_id: loggedInUserId })
      .andWhere({ p_group_id: intGroupId })
      .first();

    if (check) {
      let deleteData = await knex("participants")
        .where({ p_user_id: loggedInUserId })
        .andWhere({ p_group_id: intGroupId })
        .del();

      let groupResponse = {
        groupId: groupId,
      };

      return res
        .status(200)
        .send(okResponse(groupResponse, "You have left the group."));
    } else {
      return res.status(422).send(errorResponse({}, "Group does not exists!"));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({}, "Something went wrong!"));
  }
};

const getGroupsOfLoggedinUser = async (req, res) => {
  const { offset, limit, sort, q } = getPaginationValues(req.query);

  try {
    let groups = await knex("groups")
      .select(
        "g_id as id",
        "g_uuid as uuid",
        "g_group_name as groupName",
        "g_members as members",
        "g_created_at as createdAt"
      )
      .where({ g_created_by: req.user.id })
      .andWhere({ g_group_type: false })
      .andWhere({ g_is_active: true })
      .offset(offset)
      .limit(limit);

    let totalEnteries = await knex("groups")
      .count("g_id as count")
      .where({ g_created_by: req.user.id })
      .andWhere({ g_group_type: false })
      .andWhere({ g_is_active: true });

    let groupResponse = {
      data: groups,
      totalEnteries: +totalEnteries[0].count,
    };
    return res
      .status(200)
      .send(okResponse(groupResponse, "Groups are fetched"));
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({}, "Something went wrong!"));
  }
};

const getUsersOfGroup = async (req, res) => {
  // Form Validation *******
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      message: "Got error while submitting",
      data: expValidatorMsg(errors.array()),
    });
  }

  const { groupId } = req.params;
  try {
    let group = await knex("groups").where({ g_id: groupId }).first();

    if (!group) {
      return res.status(422).send(errorResponse({}, "Group does not exists!"));
    }

    let users = await knex("participants")
      .select(
        "participants.p_id as participantId",
        "users.u_id as id",
        "users.u_uuid as uuid",
        "users.u_first_name as firstName",
        "users.u_last_name as lastName",
        "users.u_username as username",
        "users.u_username as username",
        "users.u_dp as dp",
        "users.u_designation as designation"
      )
      .andWhere({ p_group_id: groupId })
      .innerJoin("users", "users.u_id", "participants.p_user_id");

    let groupResponse = {
      data: users,
    };
    return res
      .status(200)
      .send(okResponse(groupResponse, "Groups are fetched"));
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({}, "Something went wrong!"));
  }
};

const deleteGroup = async (req, res) => {
  // Form Validation *******
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      message: "Got error while submitting",
      data: expValidatorMsg(errors.array()),
    });
  }

  const { groupId } = req.params;
  try {
    let group = await knex("groups")
      .where({ g_id: groupId })
      .where({ g_created_by: req.user.id })
      .first();

    if (!group) {
      return res.status(422).send(errorResponse({}, "Group does not exists!"));
    }

    let result = await knex("groups")
      .update("g_is_active", false)
      .where({ g_id: groupId })
      .returning("*");
    groupResponse = {
      id: result[0].g_id,
    };
    if (result) {
      return res
        .status(200)
        .send(okResponse(groupResponse, "Group has been deleted"));
    } else {
      return res
        .status(422)
        .send(
          errorResponse({}, "Something went wrong, please try after sometimes")
        );
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(errorResponse({}, "Something went wrong!"));
  }
};

module.exports = {
  createGroup,
  deleteGroup,
  searchUsers,
  getExistingUsers,
  addUserToGroup,
  makeAdmin,
  leaveGroup,
  getGroupsOfLoggedinUser,
  getUsersOfGroup,
};

const knex = require("./../db/knex");

const getUserIDBasedOnUUID = async (uuid) => {
  try {
    let result = await knex('users')
                        .select('u_id as id')
                        .where('u_uuid', uuid)
                        .first();
    return result.id || null;
  } catch (error) {
    return null
  }
}

module.exports = {
  getUserIDBasedOnUUID
}
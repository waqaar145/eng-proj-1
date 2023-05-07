const knex = require("./../db/knex");

const getUserIDBasedOnUUID = async (uuid) => {
  try {
    let result = await knex('users')
                        .select(
                          'u_id as id',
                          'u_first_name as firstName',
                          'u_last_name as lastName',
                          'u_dp as dp'
                        )
                        .where('u_uuid', uuid)
                        .first();
    return result || null;
  } catch (error) {
    return null
  }
}

module.exports = {
  getUserIDBasedOnUUID
}
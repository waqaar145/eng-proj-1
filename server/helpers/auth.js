const passport = require("passport");
const knex = require("./../db/knex");

const loggedinUserObject = async (id) => {
  try {
    if (!id) return false;
    let user = await knex("users").where({ u_uuid: id }).first(); // set redis cache here to improve response time coz this is gonna be too often
    if (!user) return false;
    let userObj = {
      id: user.u_id,
      uuid: user.u_uuid,
      first_name: user.u_first_name,
      last_name: user.u_last_name,
      username: user.u_username,
      email: user.u_email,
      mobile: user.u_mobile,
      dp: user.u_dp,
      designation: user.u_designation
    };
    return userObj;
  } catch (err) {
    return false;
  }
};

const authentication = passport.authenticate("jwt", { session: false });

const optionalAuthentication = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      req.user = undefined;
      next();
      return;
    }
    if (!user) {
      req.user = undefined;
    } else {
      req.user = user;
    }
    next();
  })(req, res, next);
};

module.exports = {
  loggedinUserObject,
  authentication,
  optionalAuthentication,
};

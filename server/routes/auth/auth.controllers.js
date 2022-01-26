const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require('express-validator');
const knex = require("./../../db/knex");
const config = require("./../../config/config");
const { okResponse, errorResponse } = require("./../../helpers/message");
const { expValidatorMsg } = require("./../../helpers/validation");

const getToken = (payload) => {
  return jwt.sign(payload, config.SECRET_KEY);
}

const signup = async (req, res) => {

  // Form Validation *******
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      message: 'Got error while submitting',
      data: expValidatorMsg(errors.array())
    });
  }

  const { first_name, last_name, username, email, mobile, password } = req.body;

  const saltRounds = 10;
  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  const userObj = {
    u_first_name: first_name,
    u_last_name: last_name,
    u_username: username,
    u_email: email,
    u_mobile: mobile,
    u_password: hashedPassword,
  };

  try {
    const checkUser = await knex("users").where({ u_email: email }).first();
    if (checkUser) {
      return res.status(422).send(errorResponse({data: {email: 'Email is already registered, please reset the password'}}, "User already exists, please reset your password"));
    }

    const checkUsername = await knex("users").where({ u_username: username }).first();
    if (checkUsername) {
      return res.status(422).send(errorResponse({data: {username: 'Username has already been taken, please choose another username'}}, "Username taken, please choose other"));
    }

    const checkMobile = await knex("users").where({ u_mobile: mobile }).first();
    if (checkMobile) {
      return res.status(422).send(errorResponse({data: {mobile: 'Mobile no has already been registered, please reset the password'}}, "Mobile no. already taken"));
    }

    const userResult = await knex("users").insert(userObj).returning("*");
    const user = userResult[0];
    
    let payload = {
      id: user.u_id,
      email: user.u_email,
    };
  
    let token = getToken(payload)

    const userResponse = {
      user: {
        id: user.u_id,
        uuid: user.u_uuid,
        first_name: user.u_first_name,
        last_name: user.u_last_name,
        username: user.u_username,
        email: user.u_email,
        mobile: user.u_mobile,
        dp: user.u_dp,
        designation: user.u_designation
      },
      token: token,
    };

    return res
      .status(200)
      .send(okResponse(userResponse, "User is signed up successfully"));
  } catch (error) {
    console.log(error)
    return res.status(500).send(errorResponse({}, "Something went wrong!"));
  }
};

const signin = async (req, res) => {

  // Form Validation *******
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).send({
      message: 'Got error while submitting',
      data: expValidatorMsg(errors.array())
    });
  }

  const { email, password } = req.body;

  try {
    const user = await knex("users").where({ u_email: email }).first();
    if (!user) return res.status(404).send(errorResponse({data: {email: 'Email is not registered, Please create and account'}}, "Email does not exist"));
    
    if (!bcrypt.compareSync(password, user.u_password)) {
      return res.status(404).send(errorResponse({data: {password: 'Passwoord did not match'}}, "Password did not match"));
    }
  
    let payload = {
      id: user.u_id,
      email: user.u_email,
    };
  
    let token = getToken(payload)

    const userResponse = {
      user: {
        id: user.u_id,
        uuid: user.u_uuid,
        first_name: user.u_first_name,
        last_name: user.u_last_name,
        username: user.u_username,
        email: user.u_email,
        mobile: user.u_mobile,
        dp: user.u_dp,
        designation: user.u_designation
      },
      token: token,
    };
    return res
      .status(200)
      .send(okResponse(userResponse, "User is loggedin successfully"));
  } catch (error) {
    console.log(error)
    return res.status(500).send(errorResponse({}, "Something went wrong!"));
  }
};

const loggedin = async (req, res) => {
  const userResponse = {
    user: req.user,
    // token: token
  };

  return res
    .status(200)
    .send(okResponse(userResponse, "User's loggedin details fetched"));
};

const testRoute = (req, res) => {
  return res.status(200).send({
    message: 'Result succes', 
    data: [
      {
        id: 1,
        name: 'Waqaar1',
        email: 'waqaar1451@gmail.com'
      },
      {
        id: 2,
        name: 'Waqaar2',
        email: 'waqaar1452@gmail.com'
      },
      {
        id: 3,
        name: 'Waqaar3',
        email: 'waqaar1453@gmail.com'
      },
      {
        id: 4,
        name: 'Waqaar4',
        email: 'waqaar1454@gmail.com'
      },
      {
        id: 5,
        name: 'Waqaar5',
        email: 'waqaar1455@gmail.com'
      }
    ]
  })
}

module.exports = {
  signup,
  signin,
  loggedin,
  testRoute
};

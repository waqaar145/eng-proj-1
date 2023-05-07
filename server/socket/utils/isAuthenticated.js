const cookieParser = require("cookie-parser");
const cookie = require("cookie");
const config = require("./../../config/config");
const jwt = require("jsonwebtoken");
const { loggedinUserObject } = require('./../../helpers/auth')


module.exports.isAuthenticated = async (socket) => {
  let cookieString = socket.handshake.headers.cookie;
  if (cookieString) {
    let parsedCookie = cookie.parse(cookieString);
    const sidParsed = cookieParser.signedCookie(
      parsedCookie[config.COOKIE_NAME],
      config.SECRET_KEY
    );
    try {
      const token = jwt.verify(sidParsed, config.SECRET_KEY);
      const connectedUser = await loggedinUserObject(token.id)
      // this is database query, 
      // we can change this to redis session or cache so the database call can be reduced or may be use jwt
      // becasue this is going to be too frequent calls
      if (!connectedUser) {
        return false;
      }
      socket.currentConnectedUser = connectedUser;
      return connectedUser;
    } catch (error) {
      console.log(error)
    }
  }
  return false;
};
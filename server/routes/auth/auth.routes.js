const Router = require("express");
const routes = new Router();
const passport = require("passport");
const { authentication, optionalAuthentication } = require('./../../helpers/auth')
const { signupValidation, signinValidation } = require('./auth.validations')

const { signup, signin, loggedin, testRoute } = require("./auth.controllers");

routes.post("/auth/signup", signupValidation, signup);
routes.post("/auth/signin", signinValidation, signin);
routes.get("/auth/logged-in", authentication, loggedin);
routes.get("/auth/test", authentication, testRoute);

module.exports = routes;

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const knex = require('./../db/knex')
const config = require('./config')
const { loggedinUserObject } = require('./../helpers/auth')

module.exports = function(passport) {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = config.SECRET_KEY;
  passport.use(new JwtStrategy(opts, async function(token, done) {
    const user = await loggedinUserObject(token.id)
    if (!user) done(null, false)
    done(null, user)
  }));
};
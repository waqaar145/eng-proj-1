var authRoutes = require("./auth/auth.routes");
var chatRoutes = require("./chat/chat.routes");

module.exports = (app) => {
  app.use("/api/v1", authRoutes);
  app.use("/api/v1", chatRoutes);
};

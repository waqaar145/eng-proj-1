const express = require("express");
const next = require("next");

const PORT = process.env.PORT || 4000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();

    // ******************** PAGES ROUTES START
    server.get("/", (req, res) => {
      return app.render(req, res, "/index", req.query);
    });

    server.get("/signup", (req, res) => {
      return app.render(req, res, "/auth/signup", req.query);
    });

    server.get("/signin", (req, res) => {
      return app.render(req, res, "/auth/login", req.query);
    });

    server.get("/about", (req, res) => {
      return app.render(req, res, "/about", req.query);
    });

    server.get("/chat", (req, res) => {
      return app.render(req, res, "/chat/chat", {
        groupId: null
      });
    });

    server.get("/chat/CLIENT/:groupId", (req, res) => {
      return app.render(req, res, "/chat/chat", {
        groupId: req.params.groupId
      });
    });

    server.get("/conversation/:meetingId", (req, res) => {
      return app.render(req, res, "/conversation/main", {
        meetingId: req.params.meetingId
      });
    });

    server.get("/group/:meetingId", (req, res) => {
      return app.render(req, res, "/group1/main", {
        meetingId: req.params.meetingId
      });
    });

    server.get("/event/:eventId", (req, res) => {
      return app.render(req, res, "/room/main", {
        eventId: req.params.eventId
      });
    });

    server.get("/proto/:callId", (req, res) => {
      return app.render(req, res, "/proto/main", {
        callId: req.params.callId
      });
    });

    server.get("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(PORT, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${PORT}`);
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });

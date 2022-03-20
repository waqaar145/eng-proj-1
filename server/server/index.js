
const http = require("http");
const redisAdapter = require("socket.io-redis");

const app = require("./server");
const config = require("./../config/config");

// Server
const server = http.createServer(app);

app.io.attach(server);

app.io.adapter(
  redisAdapter({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  })
);

server.listen(config.PORT, () => {
  console.log(`Server Listening on port ${config.PORT}`);
});
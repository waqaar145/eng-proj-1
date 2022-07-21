
const https = require("https");
const redisAdapter = require("socket.io-redis");
const fs = require('fs')

const app = require("./server");
const config = require("./../config/config");

// Server
const httpsOptions = {
  key: fs.readFileSync(__dirname + '/server.key'),
  cert: fs.readFileSync(__dirname + '/server.cert'),
}

const server = https.createServer(httpsOptions, app);

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
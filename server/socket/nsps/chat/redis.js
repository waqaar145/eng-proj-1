const redis = require("redis");
const bluebird = require("bluebird");
const config = require("./../../../config/config");

bluebird.promisifyAll(redis);

class ChatRedis {
  constructor() {
    this.client = redis.createClient({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
    });
  }

  async addUserToRoom(socketId, roomName, userObj) {
    try {
      let result =  await this.client.hsetAsync(roomName, socketId, JSON.stringify(userObj));
      return result;
    } catch (error) {
      console.log("Error while adding new user to the room");
    }
  }

  async getAllUsersInRoom(roomName) {
    try {
      let users = await this.client.hgetallAsync(roomName);
      let result = [];
      if (users) {
        for (const [key, value] of Object.entries(users)) {
          result.push(JSON.parse(value));
        }
        return result;
      }
      return [];
    } catch (error) {
      console.log("Error while getting all users in a room", error);
    }
  }

  async removeUserFromRoom(roomName, socketId) {
    try {
      let result = await this.client.hdelAsync(roomName, socketId);
      return result;
    } catch (error) {
      console.log("Error while removing user from a room", error);
    }
  }
}

module.exports = new ChatRedis();
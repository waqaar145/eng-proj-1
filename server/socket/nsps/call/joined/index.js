const { isAuthenticated } = require("../../../utils/isAuthenticated");
const { callJoinedNsps } = require("./constants");
const UserRedis = require("../../../redis/Users");
const events = require("./events");
const { getRoomName } = require("../../../room/index");
const { mediasoupOptions } = require("./mediasoupConfig");
const mediasoup = require("mediasoup");

let nsp;
let worker = null;
let rooms = new Map();
let peers = new Map();

// let peers = {
//   [socket-id]: {
//     roomId: 'room-id',
//     producerTransports: [],
//     consumerTransports: [],
//     producers: [],
//     consumers: [],
//     user: 'user-object'
//   }
// }

// let room = {
//   [roomId]: {
//     router: 'router object',
//     peers: ['peer-ids(socket-ids) array']
//   }
// }

const onConnection = async (socket) => {
  const { callId } = socket.handshake.query;

  let roomId = getRoomName(callId, callJoinedNsps); // getting room name with prefix
  if (!roomId) return;

  socket.on(callJoinedNsps["wsEvents"]["JOIN_ROOM"], async (callback) => {
    try {
      await socket.join(roomId);
      await addPeer(socket, roomId);
      callback({ joined: true });
    } catch (error) {
      console.log(
        `Socket.on Error - ${callJoinedNsps["wsEvents"]["JOIN_ROOM"]} namespace `,
        error
      );
    }
  });

  socket.on(
    callJoinedNsps["wsEvents"]["GET_RTP_CAPABILITIES"],
    async (callback) => {
      let router = await createRoom(socket);
      callback({ rtpCapabilities: router.rtpCapabilities });
    }
  );

  socket.on(
    callJoinedNsps["wsEvents"]["CREATE_WEB_RTC_TRANSPORT"],
    async ({ producer }, callback) => {
      let router = await getRouter(socket);
      const transport = await router.createWebRtcTransport(
        mediasoupOptions.webRtcTransport
      );
      addProducerTransport(socket, transport, producer);
      transport.on("dtlsstatechange", (dtlsState) => {
        if (dtlsState === "closed") {
          transport.close();
        }
      });

      transport.on("close", () => {
        console.log("transport closed");
      });
      callback({
        params: {
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        },
      });
    }
  );

  socket.on(
    callJoinedNsps["wsEvents"]["PRODUCER_TRANSPORT_CONNECT"],
    async (data) => {
      const transport = getProducerTransport(socket);
      await transport.connect({ dtlsParameters: data.dtlsParameters });
    }
  );

  socket.on(
    callJoinedNsps["wsEvents"]["PRODUCER_TRANSPORT_PRODUCE"],
    async ({ kind, rtpParameters }, callback) => {
      const transport = getProducerTransport(socket);
      const producer = await transport.produce({ kind, rtpParameters });
      addProducer(socket, producer);
      sendToConsumers(socket, producer);
      producer.on("transportclose", () => {
        console.log("Transport for this producer closed");
        producer.close();
      });
      callback({ id: producer.id });
    }
  );

  socket.on(
    callJoinedNsps["wsEvents"]["TRANSPORT_RECV_CONNECT"],
    async ({ dtlsParameters, serverConsumerTransportId }) => {
      let consumerTransport = getConsumerTransport(socket, serverConsumerTransportId);
      await consumerTransport.connect({ dtlsParameters });
    }
  );

  socket.on(
    callJoinedNsps["wsEvents"]["CONSUME"],
    async (
      { rtpCapabilities, remoteProducerId, serverConsumerTransportId },
      callback
    ) => {
      let consumerTransport = getConsumerTransport(socket, serverConsumerTransportId);
      let router = await getRouter(socket);
      if (
        router.canConsume({
          producerId: remoteProducerId,
          rtpCapabilities,
        })
      ) {
        const consumer = await consumerTransport.consume({
          producerId: remoteProducerId,
          rtpCapabilities,
          paused: true,
        });

        consumer.on("transportclose", () => {
          console.log("transport close from consumer");
        });

        consumer.on("producerclose", () => {
          // socket.emit('producer-closed', { remoteProducerId }) // todo
          consumerTransport.close([]);
          transports = transports.filter(
            (transportData) =>
              transportData.transport.id !== consumerTransport.id
          );
          consumer.close();
        });

        addConsumer(socket, consumer);
        const params = {
          id: consumer.id,
          producerId: remoteProducerId,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters,
          serverConsumerId: consumer.id,
        };
        callback({ params });
      }
    }
  );

  socket.on('consumer-resume', async ({serverConsumerId}) => {
    console.log('consumer resume')
    const consumer = getConsumer(socket, serverConsumerId);
    console.log('------', consumer)
    await consumer.resume()
  });

  socket.on("disconnect", async () => {
    try {
      removePeer(socket);
    } catch (error) {
      console.log(`Socket.on Disconnect - callJoinedNsps namespace `, error);
    }
  });
};

// Create router if not already created for room
async function createRoom(socket) {
  let router;
  let room = getRoomBasedOnPeer(socket);

  if (room.router) {
    router = room.router;
  } else {
    const mediaCodecs = mediasoupOptions.router.mediaCodecs;
    try {
      router = await worker.createRouter({ mediaCodecs });
      room.router = router;
    } catch (err) {
      console.log(err);
    }
  }
  return router;
}

function addProducerTransport(socket, transport, producer) {
  const peer = getPeerBasedOnSocket(socket);
  if (producer) {
    peer.producerTransports = [...peer.producerTransports, transport];
  } else {
    peer.consumerTransports = [...peer.consumerTransports, transport];
  }
}

function getProducerTransport(socket) {
  const peer = getPeerBasedOnSocket(socket);
  let [transport] = peer.producerTransports;
  return transport;
}

function getConsumerTransport(socket, transportId) {
  const peer = getPeerBasedOnSocket(socket);
  let transports = peer.consumerTransports;
  let consumerTransport = transports.find(
    (transport) => transport.id === transportId
  );
  return consumerTransport;
}

function addProducer(socket, producer) {
  const peer = getPeerBasedOnSocket(socket);
  peer.producers = [...peer.producers, producer];
}

function addConsumer(socket, consumer) {
  const peer = getPeerBasedOnSocket(socket);
  peer.consumers = [...peer.consumers, consumer];
}

function getConsumer(socket, consumerId) {
  const peer = getPeerBasedOnSocket(socket);
  const [consumer] = peer.consumers.filter(consumer => consumer.id === consumerId);
  return consumer;
}

function sendToConsumers(socket, producer) {
  // sending new producer to everyone in the room to consume
  let peer = getPeerBasedOnSocket(socket);
  socket.broadcast
    .to(peer.roomId)
    .emit(callJoinedNsps["wsEvents"]["NEW_PRODUCER"], {
      producerId: producer.id,
    });
}

// Helper methods
async function getRouter(socket) {
  let room = getRoomBasedOnPeer(socket);
  return room.router;
}

function addPeer(socket, roomId) {
  let peerObj = {
    roomId,
    producerTransports: [],
    consumerTransports: [],
    producers: [],
    consumers: [],
    user: socket.currentConnectedUser,
  };
  peers.set(socket.id, peerObj);

  let room = getRoomBasedOnRoomId(roomId);
  let roomObj = null;
  if (!room) {
    roomObj = {
      router: null,
      peerIds: [socket.id],
    };
  } else {
    roomObj = {
      router: room.router,
      peerIds: [...room.peerIds, socket.id],
    };
  }
  rooms.set(roomId, roomObj);
  return;
}

function removePeer(socket) {
  peers.delete(socket.id);
  return;
}

function getPeerBasedOnSocket(socket) {
  return peers.get(socket.id);
}

function getRoomBasedOnPeer(socket) {
  let peerObj = peers.get(socket.id);
  let room = rooms.get(peerObj.roomId);
  return room;
}

function getRoomBasedOnRoomId(roomId) {
  let room = rooms.get(roomId);
  return room;
}

const startWorker = async () => {
  worker = await mediasoup.createWorker();
};

startWorker();

exports.callJoinedNamespace = (io) => {
  exports.io = io;
  nsp = io
    .of("/call-joined")
    .use(async (socket, next) => {
      let checkUser = await isAuthenticated(socket);
      if (checkUser) {
        next();
      } else {
        next(new Error("Authentication error"));
      }
    })
    .on("connection", onConnection);
};

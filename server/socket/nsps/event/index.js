const mediasoup = require("mediasoup");
const { rtpPorts, mediaCodecs, webRtcTransport_options } = require("./config");

let worker;
let rooms = {};
let peers = {};
let transports = [];
let producers = [];
let consumers = [];

const createWorker = async () => {
  try {
    worker = await mediasoup.createWorker(rtpPorts);

    console.log(`worker pid ${worker.pid}`);

    worker.on("died", (error) => {
      console.error("mediasoup worker died", error);
      setTimeout(() => process.exit(1), 2000);
    });

    return worker;
  } catch (error) {
    console.log("Worker failed");
    return undefined;
  }
};

worker = createWorker();

const createRoom = async (roomName, socket) => {
  let currentRouter;
  let peersInRoom = [];

  // rooms = {
  //   roomName: {
  //     router: routerInstance,
  //     peers: [socket.ids of all the peers]
  //   },
  //   ...
  // }

  if (rooms[roomName]) {
    currentRouter = rooms[roomName].router;
    peersInRoom = rooms[roomName].peersInRoom || [];
  } else {
    currentRouter = await worker.createRouter({ mediaCodecs });
  }

  rooms[roomName] = {
    router: currentRouter,
    peers: [...peersInRoom, socket.id],
  };

  return currentRouter;
};

const addTransport = (transport, roomName, consumer, socket) => {
  transports = [
    ...transports,
    {
      socketId: socket.id,
      transport,
      roomName,
      consumer,
    },
  ];

  peers[socket.id] = {
    ...peers[socket.id],
    transports: [...peers[socket.id].transports, transport.id],
  };
};

const addProducer = (producer, roomName, socket) => {
  producers = [
    ...producers,
    {
      socketId: socket.id,
      producer,
      roomName,
    },
  ];

  peers[socket.id] = {
    ...peers[socket.id],
    producers: [...peers[socket.id].producers, producer.id],
  };
};

const addConsumer = (consumer, roomName, socket) => {
  // add the consumer to the consumers list
  consumers = [...consumers, { socketId: socket.id, consumer, roomName }];

  // add the consumer id to the peers list
  peers[socket.id] = {
    ...peers[socket.id],
    consumers: [...peers[socket.id].consumers, consumer.id],
  };
};

const onConnection = async (socket) => {
  socket.emit("connection-success", {
    socketId: socket.id,
  });

  const removeItems = (items, socketId, type) => {
    items.forEach(item => {
      if (item.socketId === socket.id) {
        item[type].close()
      }
    })
    items = items.filter(item => item.socketId !== socket.id)

    return items
  }

  socket.on("disconnect", () => {
    // do some cleanup
    console.log("peer disconnected");
    consumers = removeItems(consumers, socket.id, "consumer");
    producers = removeItems(producers, socket.id, "producer");
    transports = removeItems(transports, socket.id, "transport");

    if (!peers[socket.id]) return;

    const { roomName } = peers[socket.id];
    delete peers[socket.id];

    // remove socket from room
    rooms[roomName] = {
      router: rooms[roomName].router,
      peers: rooms[roomName].peers.filter((socketId) => socketId !== socket.id),
    };
  });

  socket.on("get-rtp-capabilities", async ({ roomName }, callback) => {
    const router = await createRoom(roomName, socket);

    peers[socket.id] = {
      socket,
      roomName,
      transports: [],
      producers: [],
      consumers: [],
      peerDetails: {
        name: "",
        isAdmin: false,
      },
    };

    const rtpCapabilities = router.rtpCapabilities;
    callback({ rtpCapabilities });
  });

  socket.on("createWebRtcTransport", async ({ consumer }, callback) => {
    try {
      const roomName = peers[socket.id].roomName;
      const router = rooms[roomName].router;

      let transport = await router.createWebRtcTransport(
        webRtcTransport_options
      );
      console.log(`transport id: ${transport.id}`);
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
      addTransport(transport, roomName, consumer, socket);
    } catch (error) {
      callback({
        params: {
          error: true,
        },
      });
    }
  });

  const getTransport = (socketId) => {
    const [producerTransport] = transports.filter(
      (transport) => transport.socketId === socketId && !transport.consumer
    );
    return producerTransport.transport;
  };

  socket.on("transport-connect", ({ dtlsParameters }) => {
    console.log(`DTLS Parameters: ${dtlsParameters}`);

    getTransport(socket.id).connect({ dtlsParameters });
  });

  socket.on(
    "transport-produce",
    async ({ kind, rtpParameters, appData }, callback) => {
      const producer = await getTransport(socket.id).produce({
        kind,
        rtpParameters,
      });

      console.log(`Producer ID: ${producer}`);

      const { roomName } = peers[socket.id];

      addProducer(producer, roomName, socket);

      informConsumers(roomName, socket.id, producer.id);

      console.log(`Producer ID: ${producer.id}, ${producer.kind}`);

      producer.on("transportclose", () => {
        console.log("Transport for this producer closed");
        producer.close();
      });

      callback({
        id: producer.id,
        producersExist: producers.length > 1 ? true : false,
      });
    }
  );

  socket.on("getProducers", (callback) => {
    // return all producer transports
    const { roomName } = peers[socket.id];
    let producerList = [];
    producers.forEach((producerData) => {
      if (
        producerData.socketId !== socket.id &&
        producerData.roomName === roomName
      ) {
        producerList = [...producerList, producerData.producer.id];
      }
    });

    // return the producer list back to the client
    callback(producerList);
  });

  socket.on(
    "transport-recv-connect",
    async ({ dtlsParameters, serverConsumerTransportId }) => {
      console.log(`DTLS PARAMS: ${dtlsParameters}`);
      const consumerTransport = transports.find(
        (transportData) =>
          transportData.consumer &&
          transportData.transport.id == serverConsumerTransportId
      ).transport;
      await consumerTransport.connect({ dtlsParameters });
    }
  );

  socket.on(
    "consume",
    async (
      { rtpCapabilities, remoteProducerId, serverConsumerTransportId },
      callback
    ) => {
      try {
        const { roomName } = peers[socket.id];
        const router = rooms[roomName].router;
        let consumerTransport = transports.find(
          (transportData) =>
            transportData.consumer &&
            transportData.transport.id == serverConsumerTransportId
        ).transport;

        // check if the router can consume the specified producer
        if (
          router.canConsume({
            producerId: remoteProducerId,
            rtpCapabilities,
          })
        ) {
          // transport can now consume and return a consumer
          const consumer = await consumerTransport.consume({
            producerId: remoteProducerId,
            rtpCapabilities,
            paused: true,
          });

          console.log("consumer - ", consumer.id);

          consumer.on("transportclose", () => {
            console.log("transport close from consumer");
          });

          consumer.on("producerclose", () => {
            console.log("producer of consumer closed");
            socket.emit("producer-closed", { remoteProducerId });

            consumerTransport.close([]);
            transports = transports.filter(
              (transportData) =>
                transportData.transport.id !== consumerTransport.id
            );
            consumer.close();
            consumers = consumers.filter(
              (consumerData) => consumerData.consumer.id !== consumer.id
            );
          });

          addConsumer(consumer, roomName, socket);

          // from the consumer extract the following params
          // to send back to the Client
          const params = {
            id: consumer.id,
            producerId: remoteProducerId,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
            serverConsumerId: consumer.id,
          };

          // send the parameters to the client
          callback({ params });
        }
      } catch (error) {
        console.log(error);
        callback({
          params: {
            error: error,
          },
        });
      }
    }
  );

  socket.on("consumer-resume", async ({ serverConsumerId }) => {
    console.log("consumer resume");
    const { consumer } = consumers.find(
      (consumerData) => consumerData.consumer.id === serverConsumerId
    );
    await consumer.resume();
  });

  const informConsumers = (roomName, socketId, id) => {
    console.log(`just joined, id ${id} ${roomName}, ${socketId}`);
    // A new producer just joined
    // let all consumers to consume this producer
    producers.forEach((producerData) => {
      if (
        producerData.socketId !== socketId &&
        producerData.roomName === roomName
      ) {
        const producerSocket = peers[producerData.socketId].socket;
        // use socket to send producer id to producer
        producerSocket.emit("new-producer", { producerId: id });
      }
    });
  };
};

exports.eventNamespace = (io) => {
  exports.io = io;
  nsp = io
    .of("/event")
    .use(async (socket, next) => {
      next();
    })
    .on("connection", onConnection);
};

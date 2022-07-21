const mediasoup = require("mediasoup")

let nsp;

/**
 * Worker
 * |-> Router(s)
 *     |-> Producer Transport(s)
 *         |-> Producer
 *     |-> Consumer Transport(s)
 *         |-> Consumer 
 **/

let worker;
let router;
let producerTransport;
let consumerTransport;
let producer;
let consumer;

const createWorker = async () => {
  worker = await mediasoup.createWorker({
    rtcMinPort: 2000,
    rtcMaxPort: 2020,
  })

  console.log(`worker pid ${worker.pid}`);

  worker.on("died", error => {
    console.error('mediasoup worker died', error);
    setTimeout(() => process.exit(1), 2000);
  })

  return worker;
}


worker = createWorker();

const mediaCodecs = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate:48000,
    channels: 2
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate:90000,
    parameters: {
      'x-google-start-bitrate': 1000
    }
  },
]

const onConnection = async (socket) => {
  const socketId = socket.id;
  console.log('socketId', socketId);

  socket.emit("connection-success", {
    socketId,
    existsProducer: producer ? true : false
  });

  socket.on("disconnect", () => {
    console.log('socket disconnected');
  })


  socket.on('createRoom', async (callback) => { 
    if (router === undefined) {
      router = await worker.createRouter({mediaCodecs}); 
      console.log(`Router ID: ${router.id}`);
    }

    getRtpCapabilities(callback);
  })

  const getRtpCapabilities = async (callback) => {
    const rtpCapabilities = router.rtpCapabilities;
    callback({rtpCapabilities});
  }


  socket.on('createWebRtcTransport', async ({sender}, callback) => {
    console.log(`Is this a sender reqeust? ${sender}`)
    if (sender) 
      producerTransport = await createWebRtcTransport(callback)
    else
      consumerTransport = await createWebRtcTransport(callback)
  })

  socket.on('transport-connect', async ({dtlsParameters}) => {
    console.log(`DTLS Parameters: ${dtlsParameters}`);

    await producerTransport.connect({dtlsParameters})
  })

  socket.on('transport-produce', async ({kind, rtpParameters, appData}, callback) => {
    producer = await producerTransport.produce({
      kind,
      rtpParameters
    })

    console.log(`Producer ID: ${producer.id}, ${producer.kind}`)

    producer.on('transportclose', () => {
      console.log('Transport for this producer closed')
      producer.close()
    })

    callback({
      id: producer.id
    })
  })

  socket.on('transport-recv-connect', async ({dtlsParameters}) => {
    console.log(`Recv DTLS Params : ${dtlsParameters}`)
    await consumerTransport.connect({dtlsParameters});
  })

  socket.on('consume', async ({rtpCapabilities}, callback) => {
    try {
      if (router.canConsume({
        producerId: producer.id,
        rtpCapabilities
      })) {
        consumer = await consumerTransport.consume({
          producerId: producer.id,
          rtpCapabilities,
          paused: true
        })

        consumer.on('transportclose', () => {
          console.log('transport closed from consumer')
        })

        consumer.on('producerclose', () => {
          console.log('producer of consumer closed')
        })

        const params = {
          id: consumer.id,
          producerId: producer.id,
          kind: consumer.kind,
          rtpParameters: consumer.rtpParameters
        }

        callback({params});
      }
    } catch (error) {
      console.log(error.message);
      callback({
        params: {
          error: error
        }
      })
    }
  })

  socket.on('consumer-resume', async () => {
    console.log('consumer resumed');
    await consumer.resume();
  });
};

const createWebRtcTransport = async (callback) => {
  try {
    const webRtcTransport_options = {
      listenIps: [
        {
          ip: '0.0.0.0',
          announcedIp: '127.0.0.1',
        }
      ],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true
    }

    let transport = await router.createWebRtcTransport(webRtcTransport_options)
    console.log(`transport id: ${transport.id}`);
    transport.on('dtlsstatechange', dtlsState => {
      if (dtlsState === 'closed') {
        transport.close()
      }
    })

    transport.on('close', () => {
      console.log('transport closed');
    })

    callback({
      params: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      }
    })

    return transport;
  } catch (error) {
    console.log(error);
    callback({
      params: {
        error: error
      }
    })
  }
}

exports.groupNamespace = (io) => {
  exports.io = io;
  nsp = io
    .of("/mediasoup")
    .use(async (socket, next) => {
      next();
    })
    .on("connection", onConnection);
};
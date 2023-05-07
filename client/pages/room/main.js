import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";
import { Device } from "mediasoup-client";
import styles from "../../src/assets/styles/Room/Room.module.scss";
import { params, media } from "./config";

let socket = null;
const ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/event`;

let audioParams = {};
let videoParams = { params };
let consumingTransports = [];

let device;
let rtpCapabilities;
let producerTransport;
let consumerTransports = [];
let audioProducer;
let videoProducer;

const Room = () => {
  const localVideoRef = useRef(null);
  const router = useRouter();
  const {
    query: { eventId },
  } = router;

  useEffect(() => {
    socket = socketIOClient(ENDPOINT, {
      transports: ["websocket"],
      query: `eventId=${eventId}`,
    });

    socket.on("connection-success", (data) => {
      console.log("CONNECTION STABLISHED - ", data);
    });

    socket.on('new-producer', ({producerId}) => signalNewConsumerTransport(producerId))

    socket.on('producer-closed', ({ remoteProducerId }) => {
      // server notification is received when a producer is closed
      // we need to close the client-side consumer and associated transport
      const producerToClose = consumerTransports.find(transportData => transportData.producerId === remoteProducerId)
      producerToClose.consumerTransport.close()
      producerToClose.consumer.close()
    
      // remove the consumer transport from the list
      consumerTransports = consumerTransports.filter(transportData => transportData.producerId !== remoteProducerId)
    
      // remove the video div element
      videoContainer.removeChild(document.getElementById(`td-${remoteProducerId}`))
    })
  }, [socket]);

  const joinCall = () => {
    getLoacalStream();
  };

  const getLoacalStream = () => {
    navigator.mediaDevices
      .getUserMedia(media)
      .then((stream) => {
        localVideoRef.current.srcObject = stream;
        audioParams = { track: stream.getAudioTracks()[0], ...audioParams };
        videoParams = { track: stream.getVideoTracks()[0], ...videoParams };

        getRtpCapabilities();
      })
      .catch((error) => {
        console.log("Error in navigator - ", error);
      });
  };

  const getRtpCapabilities = () => {
    socket.emit("get-rtp-capabilities", { roomName: eventId }, (data) => {
      console.log("RtpCapabilities", data.rtpCapabilities);
      rtpCapabilities = data.rtpCapabilities;
      createDevice();
    });
  };

  const createDevice = async () => {
    try {
      device = new Device();
      await device.load({
        routerRtpCapabilities: rtpCapabilities,
      });
      console.log("Device RTP Capabilities: ", device.rtpCapabilities);
      createSendTransport();
    } catch (error) {
      console.log("Create Device failed: ", error);
      if (error.name === "UnsupportedError") {
        console.warn("This browser is not supported");
      }
    }
  };

  const createSendTransport = () => {
    console.log('------------')
    socket.emit("createWebRtcTransport", { consumer: false }, ({ params }) => {
      producerTransport = device.createSendTransport(params);
      producerTransport.on(
        "connect",
        async ({ dtlsParameters }, callback, errback) => {
          console.log("connect");
          try {
            await socket.emit("transport-connect", {
              transportId: producerTransport.id,
              dtlsParameters: dtlsParameters,
            });
            // making sure the parameters were transmitted to the server side transport
            callback();
          } catch (err) {
            console.log(err);
            errback(err);
          }
        }
      );

      producerTransport.on("produce", async (parameters, callback, errback) => {
        console.log(parameters)
        try {
          await socket.emit(
            "transport-produce",
            {
              transportId: producerTransport.id,
              kind: parameters.kind,
              rtpParameters: parameters.rtpParameters,
              appData: parameters.appData,
            },
            ({ id, producersExist }) => {
              // Tell the transport that parameters were transmitted and provide it with the
              // server side producer's id.
              callback({ id });
              console.log("producersExist - ", producersExist);
              if (producersExist) getProducers();
            }
          );
        } catch (error) {
          errback(error);
        }
      });

      connectSendTransport();
    });
  };

  const connectRecvTransport = async (
    consumerTransport,
    remoteProducerId,
    serverConsumerTransportId
  ) => {
    await socket.emit(
      "consume",
      {
        rtpCapabilities: device.rtpCapabilities,
        remoteProducerId,
        serverConsumerTransportId,
      },
      async ({ params }) => {
        if (params.error) {
          console.log("Cannot consume");
          return;
        }

        console.log(params);
        const consumer = await consumerTransport.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters,
        });

        consumerTransports = [
          ...consumerTransports,
          {
            consumerTransport,
            serverConsumerTransportId: params.id,
            producerId: remoteProducerId,
            consumer,
          },
        ];
        // create a new div element for the new consumer media

        console.log("what am I?");

        let videoContainer = document.getElementById("videoContainer");

        const newElem = document.createElement("div");
        newElem.setAttribute("id", `td-${remoteProducerId}`);

        console.log('Params - ', params);
        if (params.kind == "audio") {
          //append to the audio container
          newElem.innerHTML =
            '<audio id="' + remoteProducerId + '" autoplay></audio>';
        } else {
          //append to the video container
          newElem.setAttribute("class", "remoteVideo");
          newElem.innerHTML =
            '<video id="' +
            remoteProducerId +
            '" autoplay class="video" ></video>';
        }

        videoContainer.appendChild(newElem);

        // destructure and retrieve the video track from the producer
        const { track } = consumer;

        document.getElementById(remoteProducerId).srcObject = new MediaStream([
          track,
        ]);

        socket.emit("consumer-resume", {
          serverConsumerId: params.serverConsumerId,
        });
      }
    );
  };

  const getProducers = () => {
    socket.emit("getProducers", (producerIds) => {
      console.log(`Producers: ${producerIds}`);
      // producerIds.forEach(id => signalNewConsumerTransport(id))
      producerIds.forEach(signalNewConsumerTransport);
    });
  };

  const connectSendTransport = async () => {
    audioProducer = await producerTransport.produce(audioParams);
    videoProducer = await producerTransport.produce(videoParams);

    audioProducer.on("trackended", () => {
      console.log("audio track ended");
      // close audio track
    });

    audioProducer.on("transportclose", () => {
      console.log("audio transport ended");
      // close audio track
    });

    videoProducer.on("trackended", () => {
      console.log("video track ended");
      // close video track
    });

    videoProducer.on("transportclose", () => {
      console.log("video transport ended");
      // close video track
    });
  };

  const signalNewConsumerTransport = async (remoteProducerId) => {
    //check if we are already consuming the remoteProducerId
    if (consumingTransports.includes(remoteProducerId)) return;
    consumingTransports.push(remoteProducerId);

    socket.emit("createWebRtcTransport", { consumer: true }, ({ params }) => {
      if (params.error) {
        console.log(params.error);
        return;
      }
      console.log(params);
      let consumerTransport;
      consumerTransport = device.createRecvTransport(params);
      consumerTransport.on(
        "connect",
        async ({ dtlsParameters }, callback, errback) => {
          try {
            // Signal local dtls parameters to server side transport
            await socket.emit("transport-recv-connect", {
              serverConsumerTransportId: params.id,
              dtlsParameters,
            });
            // Tell the transport that parameters were transmitted
            callback();
          } catch (err) {
            // Tell the transport that something went wrong
            errback(err);
          }
        }
      );

      connectRecvTransport(consumerTransport, remoteProducerId, params.id);
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}></div>
      <div className={styles.container}>
        <div className={styles.videoContainer}>
          <video
            ref={localVideoRef}
            style={{
              width: "100%",
              height: "500",
              backgroundColor: "black",
            }}
            autoPlay
          ></video>
        </div>
        <div className={styles.contentContainer}>
          <button onClick={joinCall}>Join call</button>
        </div>
      </div>
      <div id="videoContainer"></div>
    </div>
  );
};

export default Room;

import { Device } from "mediasoup-client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { callJoinedNsps } from "./../../constants/socketCallJoinedConstatns";
import socketIOClient from "socket.io-client";
import { mediasoupConfig } from "./../../constants/mediasoupConfig";

const ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/call-joined`;
let audioParams = {};
let videoParams = {
  params: mediasoupConfig.params,
};

const useVideoCall = () => {
  const router = useRouter();

  const localVideoRef = useRef(null);
  const device = useRef(null);
  const socketRef = useRef(null);
  const rtpCapabilitiesRef = useRef(null);
  const producerTransportRef = useRef(null);
  const audioProducerRef = useRef(null);
  const videoProducerRef = useRef(null);
  const consumersRef = useRef([]);

  const consumerTransportsRef = useRef([]);
  const [remoteVideos, setRemoteVideos] = useState({});
  const [remoteAudios, setRemoteAudios] = useState({});

  useEffect(() => {
    socketRef.current = socketIOClient(ENDPOINT, {
      transports: ["websocket"],
      query: `callId=${router.query.callId}`,
    });

    getUserMedia();

    socketRef.current.emit(callJoinedNsps.wsEvents.JOIN_ROOM, (data) => {});

    socketRef.current.on(
      callJoinedNsps.wsEvents.NEW_PRODUCER,
      ({ producerId }) => {
        consumeNewProducer(producerId);
      }
    );
    return () => socketRef.current.disconnect();
  }, []);

  const getRtpCapabilities = () => {
    socketRef.current.emit(
      callJoinedNsps.wsEvents.GET_RTP_CAPABILITIES,
      (data) => {
        rtpCapabilitiesRef.current = data.rtpCapabilities;
        loadDevice(data.rtpCapabilities);
      }
    );
  };

  const getUserMedia = async () => {
    try {
      let stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;
      audioParams = { track: stream.getAudioTracks()[0] };
      videoParams = { track: stream.getVideoTracks()[0], ...videoParams };
      getRtpCapabilities();
      return "ok";
    } catch (err) {
      console.log("Error in - (navigator.mediaDevices.getUserMedia)", err);
    }
  };

  const loadDevice = async (routerRtpCapabilities) => {
    try {
      device.current = await new Device();
      await device.current.load({ routerRtpCapabilities });
      createProducerTransport();
    } catch (error) {
      if (error.name === "UnsupportedError") {
        console.error("Browser not supported!");
      }
    }
  };

  const createProducerTransport = () => {
    socketRef.current.emit(
      callJoinedNsps.wsEvents.CREATE_WEB_RTC_TRANSPORT,
      { producer: true },
      async ({ params }) => {
        if (!params) {
          console.log("Error - ");
          return false;
        }
        producerTransportRef.current = await device.current.createSendTransport(
          {
            id: params.id,
            iceParameters: params.iceParameters,
            iceCandidates: params.iceCandidates,
            dtlsParameters: params.dtlsParameters,
            sctpParameters: params.sctpParameters,
          }
        );

        producerTransportRef.current.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            try {
              await socketRef.current.emit(
                callJoinedNsps.wsEvents.PRODUCER_TRANSPORT_CONNECT,
                {
                  dtlsParameters: dtlsParameters,
                }
              );
              callback();
            } catch (err) {
              console.log(err);
              errback(err);
            }
          }
        );
        producerTransportRef.current.on(
          "produce",
          async (parameters, callback, errback) => {
            try {
              await socketRef.current.emit(
                callJoinedNsps.wsEvents.PRODUCER_TRANSPORT_PRODUCE,
                {
                  transportId: producerTransportRef.current.id,
                  kind: parameters.kind,
                  rtpParameters: parameters.rtpParameters,
                  appData: parameters.appData,
                },
                ({ id }) => {
                  callback({ id });
                }
              );
            } catch (error) {
              errback(error);
            }
          }
        );
        connectSendTransport();
      }
    );
  };

  const connectSendTransport = async () => {
    audioProducerRef.current = await producerTransportRef.current.produce(
      audioParams
    );
    videoProducerRef.current = await producerTransportRef.current.produce(
      videoParams
    );

    audioProducerRef.current.on("trackended", () => {
      console.log("audio track ended");
      // close audio track
    });

    audioProducerRef.current.on("transportclose", () => {
      console.log("audio transport ended");
      // close audio track
    });

    videoProducerRef.current.on("trackended", () => {
      console.log("video track ended");
      // close video track
    });

    videoProducerRef.current.on("transportclose", () => {
      console.log("video transport ended");
      // close video track
    });
  };

  const consumeNewProducer = (remoteProducerId) => {
    if (consumersRef.current.includes(remoteProducerId)) {
      return;
    } else {
      consumersRef.current = [...consumersRef.current, remoteProducerId];
    }

    socketRef.current.emit(
      callJoinedNsps.wsEvents.CREATE_WEB_RTC_TRANSPORT,
      { producer: false },
      async ({ params }) => {
        let consumerTransport = await device.current.createRecvTransport(
          params
        );
        consumerTransport.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            try {
              await socketRef.current.emit(
                callJoinedNsps.wsEvents.TRANSPORT_RECV_CONNECT,
                {
                  serverConsumerTransportId: params.id,
                  dtlsParameters,
                }
              );
              callback();
            } catch (err) {
              errback(err);
            }
          }
        );
        connectRecvTransport(consumerTransport, remoteProducerId, params.id);
      }
    );
  };

  const connectRecvTransport = (
    consumerTransport,
    remoteProducerId,
    serverConsumerTransportId
  ) => {
    socketRef.current.emit(
      callJoinedNsps.wsEvents.CONSUME,
      {
        rtpCapabilities: device.current.rtpCapabilities,
        remoteProducerId,
        serverConsumerTransportId,
      },
      async ({ params }) => {
        console.log("Consume - ", params);
        if (params.error) {
          console.log("Cannot consume");
          return;
        }

        const consumer = await consumerTransport.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters,
        });

        consumerTransportsRef.current = [
          ...consumerTransportsRef.current,
          {
            consumerTransport,
            serverConsumerTransportId: params.id,
            producerId: remoteProducerId,
            consumer
          },
        ];

        if (params.kind === "video") {
          setRemoteVideos((prevValue) => {
            return {
              ...prevValue,
              [params.serverConsumerId]: {
                track: consumer.track,
              },
            };
          });
        }

        if (params.kind === "audio") {
          setRemoteAudios((prevValue) => {
            return {
              ...prevValue,
              [params.serverConsumerId]: {
                track: consumer.track,
              },
            };
          });
        }
      }
    );
  };

  return {
    socketRef,
    localVideoRef,
    remoteVideos,
    remoteAudios
  };
};

export default useVideoCall;

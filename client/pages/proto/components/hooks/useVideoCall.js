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
let audioProducer;
let videoProducer;

const useVideoCall = () => {
  const router = useRouter();

  const localVideoRef = useRef(null);
  const device = useRef(null);
  const socketRef = useRef(null);
  const rtpCapabilitiesRef = useRef(null);
  const transportRef = useRef(null);
  const [usersInRoom, setUsersInRoom] = useState([]);

  useEffect(() => {
    socketRef.current = socketIOClient(ENDPOINT, {
      transports: ["websocket"],
      query: `callId=${router.query.callId}`,
    });

    getUserMedia();

    socketRef.current.emit(callJoinedNsps.wsEvents.JOIN_ROOM, (data) => {
      console.log('ROOM_JOINED')
      // getRtpCapabilities()
    });

    socketRef.current.on(
      callJoinedNsps.wsEvents.NEW_PRODUCER,
      ({producerId}) => {
        console.log({producerId})
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
  }

  const getUserMedia = async () => {
    try {
      let stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;
      console.log(stream.getAudioTracks())
      audioParams = { track: stream.getAudioTracks()[0] };
      videoParams = { track: stream.getVideoTracks()[0], ...videoParams };
      console.log(audioParams)
      console.log(videoParams)
      getRtpCapabilities();
      return 'ok'
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
      async ({ params }) => {
        if (!params) {
          console.log("Error - ");
          return false;
        }
        console.log("PARAMS - ", params);
        transportRef.current = await device.current.createSendTransport(
          {
            id: params.id,
            iceParameters: params.iceParameters,
            iceCandidates: params.iceCandidates,
            dtlsParameters: params.dtlsParameters,
            sctpParameters: params.sctpParameters,
          }
        );

        transportRef.current.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            console.log("dtlsParameters", dtlsParameters);
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
        transportRef.current.on(
          "produce",
          async (parameters, callback, errback) => {
            try {
              await socketRef.current.emit(
                callJoinedNsps.wsEvents.PRODUCER_TRANSPORT_PRODUCE,
                {
                  transportId: transportRef.current.id,
                  kind: parameters.kind,
                  rtpParameters: parameters.rtpParameters,
                  appData: parameters.appData,
                },
                ({id}) => {
                  console.log({id})
                  callback({id});
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
    console.log(audioParams);
    console.log(videoParams);
    audioProducer = await transportRef.current.produce(audioParams);
    videoProducer = await transportRef.current.produce(videoParams);

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

  return {
    localVideoRef,
  };
};

export default useVideoCall;

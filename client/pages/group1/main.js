import React, { useEffect, useRef } from "react";
import socketIOClient, { connect } from "socket.io-client";
import { Device} from "mediasoup-client";
import { Row, Col, Container, Button } from "react-bootstrap";


let socket = null;
const ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/mediasoup`;
let params = {
  encoding: [
    {
      rid: 'r0',
      maxBirate: 100000,
      scalabilityMode: 'S1T3'
    },
    {
      rid: 'r1',
      maxBirate: 300000,
      scalabilityMode: 'S1T3'
    },
    {
      rid: 'r2',
      maxBirate: 900000,
      scalabilityMode: 'S1T3'
    }
  ],
  codecOptions: {
    videoGoogleStartBitrate: 1000
  }
} // mediasoup parameters

let device;
let rtpCapabilities;
let producerTransport;
let consumerTransport;
let producer;
let consumer;
let isProducer = false;

const GroupCall = () => {

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    socket = socketIOClient(ENDPOINT, {
      transports: ["websocket"],
      query: `uuid=123123123`,
    });

    socket.on('connection-success', ({socketId, existsProducer}) => {
      console.log(socketId, existsProducer)
    })

  }, [])

  const getLocalVideo = () => {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: {
          min: 640,
          max: 1920
        },
        height: {
          min: 400,
          max: 1080
        }
      },
    })
    .then(stream => {
      localVideoRef.current.srcObject = stream;
      const track = stream.getVideoTracks()[0]
      params = {
        track,
        ...params
      }
      goConnect(true)
    })
    .catch(error => {
      console.log('Error - ', error)
    })
  }

  const goConsume = () => {
    goConnect(false);
  }

  const goConnect = (producerOrConsumer) => {
    isProducer = producerOrConsumer;
    device === undefined ? getRtpCapabilities() : goCreateTransport();
  }

  const goCreateTransport = () => {
    isProducer ? createSendTransport() : createRecvTransport() 
  }

  const createDevice = async () => { 
    try {
      device = new Device()
      await device.load({
        routerRtpCapabilities: rtpCapabilities
      })

      console.log('Device RTP Capabilities: ', device.rtpCapabilities)

      goCreateTransport()

    } catch (error) {
      console.log('Error - ', error)
      if (error.name === 'UnsupportedError') {
        console.warn('browser not supported');
      }
    }
  }

  const getRtpCapabilities = () => {
    socket.emit('createRoom', (data) => {
      console.log(`Router RTP Capabilities... ${data.rtpCapabilities}`);
      rtpCapabilities = data.rtpCapabilities

      createDevice()
    })
  }

  const createSendTransport = () => {
    socket.emit('createWebRtcTransport', {sender: true}, ({params}) => {
      if (params.error) {
        console.log(params.error)
        return;
      }

      console.log(params);
      producerTransport = device.createSendTransport(params);
      producerTransport.on('connect', async ({dtlsParameters}, callback, errback) => {
        try {
          // Signal local dtls parameters to the server side transpor
          await socket.emit('transport-connect', {
            transportId: producerTransport.id,
            dtlsParameters: dtlsParameters
          })

          // making sure the parameters were transmitted to the server side transport
          callback();
        } catch (err) {
          errback(err);
        }
      })

      producerTransport.on('produce', async (parameters, callback, errback) => {
        console.log(parameters);
        try {
          await socket.emit('transport-produce', {
            transportId: producerTransport.id,
            kind: parameters.kind,
            rtpParameters: parameters.rtpParameters,
            appData: parameters.appData
          }, ({id}) => {
            // Tell the transport that parameters were transmitted and provide it with the
            // server side producer's id.
            callback({id})
          })
        } catch (error) {
          errback(error)
        }
      })

      connectSendTransport()

    })
  }

  const connectSendTransport = async () => {
    producer = await producerTransport.produce(params);
    
    producer.on('trackended', () => {
      console.log('track ended');

      // close video tack
    })

    producer.on('transportclose', () => {
      console.log('track ended');

      // close video tack
    })
  }

  const connectRecvTransport = async () => {
    await socket.emit('consume', {
      rtpCapabilities: device.rtpCapabilities
    }, async ({params}) => {
      if (params.error) {
        console.log('Cannot consume');
        return;
      }

      console.log(params)
      consumer = await consumerTransport.consume({
        id: params.id,
        producerId: params.producerId,
        kind: params.kind,
        rtpParameters: params.rtpParameters,
      })

      const { track } = consumer;
      remoteVideoRef.current.srcObject = new MediaStream([track])
      socket.emit('consumer-resume')
    })
  }

  const createRecvTransport = async () => {
    socket.emit('createWebRtcTransport', {sender: false}, ({params}) => {
      if (params.error) {
        console.log(params.error);
        return;
      }
      console.log(params);

      consumerTransport = device.createRecvTransport(params);
      consumerTransport.on('connect', async ({dtlsParameters}, callback, errback) => {
        try {
          // Signal local dtls parameters to server side transport
          await socket.emit('transport-recv-connect', {
            // transportId: consumerTransport.id,
            dtlsParameters
          })
          // Tell the transport that parameters were transmitted
          callback()
        } catch (err) {
          // Tell the transport that something went wrong
          errback(err);
        }
      })

      connectRecvTransport()
    })
  }

  return (
    <Container className="SFU">
      <br />
      <Row >
        <Col>
          <center><h3>Local Video</h3></center>
          <div>
          <video
            ref={localVideoRef}
            style={{
              width: '100%', height: '300',
              margin: 5, backgroundColor: 'black'
            }}
            autoPlay
          >
          </video> 
          </div>
        </Col>
        <Col>
          <center><h3>Remote Video</h3></center>
          <div>
          <video
            ref={remoteVideoRef}
            style={{
              width: '100%', height: '300',
              margin: 5, backgroundColor: 'black'
            }}
            autoPlay
          >
          </video> 
          </div>
        </Col>
      </Row>
      <Row>
        <Col>
          <center><Button variant="primary" onClick={getLocalVideo}>Publish</Button></center>
        </Col>
        <Col>
          <center><Button variant="primary" onClick={goConsume}>Consume</Button></center>
        </Col>
      </Row>
    </Container>
  );
};

export default GroupCall;

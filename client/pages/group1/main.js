import React, { useEffect, useRef, useState } from "react";
import socketIOClient, { connect } from "socket.io-client";
import { Device} from "mediasoup-client";
import { Row, Col, Container, Button } from "react-bootstrap";
import { useRouter } from 'next/router'


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

let audioParams;
let videoParams = {params};
let consumingTransports = [];

let device
let rtpCapabilities
let producerTransport
let consumerTransports = []
let audioProducer
let videoProducer
let consumer
let isProducer = false

const GroupCall = () => {

  const router = useRouter();
  const roomName = router.query.meetingId;

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    socket = socketIOClient(ENDPOINT, {
      transports: ["websocket"],
      query: `uuid=123123123`,
    });

    socket.on('connection-success', ({socketId}) => {
      console.log(socketId)
      getLocalStream()
    })

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

  }, [])

  const getLocalStream = () => {
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

      audioParams = { track: stream.getAudioTracks()[0], ...audioParams };
      videoParams = { track: stream.getVideoTracks()[0], ...videoParams };

      joinRoom()
    })
    .catch(error => {
      console.log('Error - ', error)
    })
  }

  const joinRoom = () => {
    socket.emit('joinRoom', {roomName}, (data) => {
      console.log(`Router RTP Capabilities...${data.rtpCapabilities}`)
      rtpCapabilities = data.rtpCapabilities;

      createDevice()
    })
  }

  const createDevice = async () => { 
    try {
      device = new Device()
      await device.load({
        routerRtpCapabilities: rtpCapabilities
      })

      console.log('Device RTP Capabilities: ', device.rtpCapabilities)

      createSendTransport()

    } catch (error) {
      console.log('Error - ', error)
      if (error.name === 'UnsupportedError') {
        console.warn('browser not supported');
      }
    }
  }

  const getProducers = () => {
    socket.emit('getProducers', (producerIds) => {
      console.log(`Producers: ${producerIds}`);
      // producerIds.forEach(id => signalNewConsumerTransport(id))
      producerIds.forEach(signalNewConsumerTransport)
    })
  }

  const createSendTransport = () => {
    socket.emit('createWebRtcTransport', {consumer: false}, ({params}) => {
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
          }, ({id, producersExist}) => {
            // Tell the transport that parameters were transmitted and provide it with the
            // server side producer's id.
            callback({id})
            console.log('producersExist - ', producersExist)
            if (producersExist) getProducers()
          })
        } catch (error) {
          errback(error)
        }
      })

      connectSendTransport()

    })
  }

  const connectSendTransport = async () => {
    audioProducer = await producerTransport.produce(audioParams);
    videoProducer = await producerTransport.produce(videoParams);
    
    audioProducer.on('trackended', () => {
      console.log('audio track ended')
  
      // close audio track
    })
  
    audioProducer.on('transportclose', () => {
      console.log('audio transport ended')
  
      // close audio track
    })
    
    videoProducer.on('trackended', () => {
      console.log('video track ended')
  
      // close video track
    })
  
    videoProducer.on('transportclose', () => {
      console.log('video transport ended')
  
      // close video track
    })
  }

  const connectRecvTransport = async (consumerTransport, remoteProducerId, serverConsumerTransportId) => {
    await socket.emit('consume', {
      rtpCapabilities: device.rtpCapabilities,
      remoteProducerId,
      serverConsumerTransportId
    }, async ({params}) => {
      if (params.error) {
        console.log('Cannot consume');
        return;
      }

      console.log(params)
      const consumer = await consumerTransport.consume({
        id: params.id,
        producerId: params.producerId,
        kind: params.kind,
        rtpParameters: params.rtpParameters,
      })

      consumerTransports = [
        ...consumerTransports,
        {
          consumerTransport,
          serverConsumerTransportId: params.id,
          producerId: remoteProducerId,
          consumer,
        },
      ]
      // create a new div element for the new consumer media

      console.log('what am I?')

      let videoContainer = document.getElementById('videoContainer') 

      const newElem = document.createElement('div')
      newElem.setAttribute('id', `td-${remoteProducerId}`)
  
      if (params.kind == 'audio') {
        //append to the audio container
        newElem.innerHTML = '<audio id="' + remoteProducerId + '" autoplay></audio>'
      } else {
        //append to the video container
        newElem.setAttribute('class', 'remoteVideo')
        newElem.innerHTML = '<video id="' + remoteProducerId + '" autoplay class="video" ></video>'
      }
  
      videoContainer.appendChild(newElem)
  
      // destructure and retrieve the video track from the producer
      const { track } = consumer
  
      document.getElementById(remoteProducerId).srcObject = new MediaStream([track])


        socket.emit('consumer-resume', {serverConsumerId: params.serverConsumerId})
    })
  }

  const signalNewConsumerTransport = async (remoteProducerId) => {
    
    //check if we are already consuming the remoteProducerId
    if (consumingTransports.includes(remoteProducerId)) return;
    consumingTransports.push(remoteProducerId);
    
    socket.emit('createWebRtcTransport', {consumer: true}, ({params}) => {
      if (params.error) {
        console.log(params.error);
        return;
      }
      console.log(params);
      let consumerTransport;
      consumerTransport = device.createRecvTransport(params);
      consumerTransport.on('connect', async ({dtlsParameters}, callback, errback) => {
        try {
          // Signal local dtls parameters to server side transport
          await socket.emit('transport-recv-connect', {
            serverConsumerTransportId: params.id,
            dtlsParameters
          })
          // Tell the transport that parameters were transmitted
          callback()
        } catch (err) {
          // Tell the transport that something went wrong
          errback(err);
        }
      })

      connectRecvTransport(consumerTransport, remoteProducerId, params.id)
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
          <div id="videoContainer"></div>
        </Col>
      </Row>
    </Container>
  );
};

export default GroupCall;

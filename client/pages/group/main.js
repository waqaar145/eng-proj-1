import React, { useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";
import { Row, Col, Container, Button } from "react-bootstrap";


let socket = null;
const ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/mediasoup`;
let params = {}

const GroupCall = () => {

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    socket = socketIOClient(ENDPOINT, {
      transports: ["websocket"],
      query: `uuid=123123123`,
    });

    socket.on('connection-success', data => {
      console.log(data)
    })

  }, [])

  const streamSuccess = async (stream) => {
    console.log(stream)
    localVideoRef.current.srcObject = stream;
    const track = stream.getVideoTracks()[0]
    params = {
      track,
      ...params
    }
  }

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
    })
    .catch(error => {
      console.log('Error - ', error)
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
          <center><Button variant="primary" onClick={getLocalVideo}>(1) Get Local Video</Button></center>
        </Col>
        <Col></Col>
      </Row>
      <br />
      <Row>
        <Col>
          <center><Button variant="primary">(2) Get RTP Capabilities</Button></center>
        </Col>
        <Col>
          <center><Button variant="primary">(3) Create Device</Button></center>
        </Col>
      </Row>
      <br />
      <Row>
        <Col>
          <center>
            <Button variant="primary">(4) Create send transport</Button>
            <Button variant="primary">(5) Connect send transport & Produce</Button>
          </center>
        </Col>
        <Col>
          <center>
            <Button variant="primary">(6) Create Recv transport</Button>
            <Button variant="primary">(7) Connect Recv transport & Consume</Button>
          </center>
        </Col>
      </Row>
    </Container>
  );
};

export default GroupCall;

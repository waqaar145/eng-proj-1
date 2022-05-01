import { useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";
import UserBlockImages from "../../src/components/Extra/UserBlockImages";
import SimpleButton from "../../src/components/Form/SimpleButton";
import { conferenceNsps } from "../../src/socket/nsps/conference/constants";
import styles from "./../../src/assets/styles/conference/main.module.scss";
import {
  MdAdd,
  MdOutlineMicNone,
  MdOutlineMicOff,
  MdOutlineVideocam,
  MdOutlineVideocamOff,
} from "react-icons/md";
import { useRouter } from "next/router";
import useMeeting from "./hooks/useMeeting";

let socket = null;
const ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/${conferenceNsps.prefix}`;

const Conversation = () => {
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pc = useRef();
  const textRef = useRef(null);
  // const candidates = useRef([]);

  const getUserMedia = () => {

    socket = socketIOClient(ENDPOINT, {
      transports: ["websocket"],
      query: `uuid=123123123`,
    });

    socket.on('connection-success', success => {
      console.log(success);
    })

    socket.on('sdp', ({sdp}) =>{
      console.log(sdp)
      pc.current.setRemoteDescription(new RTCSessionDescription(sdp))
      textRef.current.value = JSON.stringify(sdp)
    })

    socket.on('candidate', candidate => {
      pc.current.addIceCandidate(new RTCIceCandidate(candidate))
    })
    
    const constraints = {
      audio: false,
      video: true
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach(track => {
          _pc.addTrack(track, stream);
        })
      })
      .catch(error => {
        console.log('Error - ', error)
      })

    const _pc = new RTCPeerConnection(null);

    _pc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log(JSON.stringify(e.candidate));
        socket.emit('candidate', e.candidate);
        

      }
    }

    _pc.oniceconnectionstatechange = (e) => {
      console.log(e); // Possible values are connected, disconnected, failed, closed
    }

    _pc.ontrack = (e) => {
      console.log('Remote track')
      remoteVideoRef.current.srcObject = e.streams[0];
    }

    pc.current = _pc;
  }

  useEffect(() => {
    getUserMedia()
  }, []);

  const sendToPeer = (eventType, payload) => {
    socket.emit(eventType, payload);
  }

  const processSDP = (sdp) => {
    console.log(JSON.stringify(sdp))
    pc.current.setLocalDescription(sdp)

    sendToPeer('sdp', {
      sdp
    })
  }

  const createOffer = () => {
    pc.current.createOffer({
      offerToReceiveAudo: 1,
      offerToReceiveVideo: 1,
    }).then(sdp => {

      // send sdp to server
      processSDP(sdp)
    
    }).catch(error => {
      console.log('Error in create offer - ', error);
    })
  }

  const createAnswer = () => {
    pc.current.createAnswer({
      offerToReceiveAudo: 1,
      offerToReceiveVideo: 1,
    }).then(sdp => {
      
      // answer sdp to server
      processSDP(sdp)
    }).catch(error => {
      console.log('Error in create offer - ', error);
    })
  }


  return (
    <div style={{
        margin: 5
      }}>
      <video 
        style={{
          width: 240, height: 240,
          margin: 5, backgroundColor: 'black'
        }}
        ref={localVideoRef} 
        autoPlay
      >
      </video>
      <video 
        style={{
          width: 240, height: 240,
          margin: 5, backgroundColor: 'black'
        }}
        ref={remoteVideoRef} 
        autoPlay
      >
      </video>
      <br />
      <button onClick={createOffer}>Create Offer</button>
      <button onClick={createAnswer}>Create Answer</button>
      <br />
      <textarea ref={textRef}></textarea>
      <br />
    </div>
  );
};

export default Conversation;

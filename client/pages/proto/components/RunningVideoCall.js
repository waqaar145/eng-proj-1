import { memo, useEffect, useRef } from "react";
import styles from "./../../../src/assets/styles/proto/Event.module.scss";
import debounce from "lodash.debounce";
import {
  BsMicMuteFill,
  BsFillXCircleFill,
  BsCameraVideoOffFill,
  BsFillTelephoneFill,
  BsFillGearFill,
} from "react-icons/bs";
import { CgScreen } from "react-icons/cg";
import Sidebar from "./Sidebar";
import useVideoCall from "./hooks/useVideoCall"
import { callJoinedNsps} from "../constants/socketCallJoinedConstants";


const VideoCall = ({ handleStartCall, initialConfig }) => {
  const videoContainerRef = useRef(null);

  // Height and width adjustments starts
  const calculateVideoHeight = ({ elHeight, elWidth }) => {
    let elmts = document.querySelectorAll(".user-video-container");
    const perRow = elmts.length / 3; // always 3 videos per row on desktop
    let divNumberOnPage = 1;
    if (perRow > 1 && perRow <= 2) divNumberOnPage = 2;
    else if (perRow > 2 && perRow <= 3) divNumberOnPage = 3;
    else divNumberOnPage = 1;
    const divHeight = elHeight / divNumberOnPage;
    const divWidth = elWidth / divNumberOnPage;

    elmts.forEach((elmt) => {
      elmt.style.height = divHeight + "px";
      elmt.style.width = divWidth + "px";
    });
  };

  const handleResize = () => {
    const elHeight = videoContainerRef?.current?.clientHeight;
    const elWidth = videoContainerRef?.current?.clientWidth;
    calculateVideoHeight({
      elHeight,
      elWidth,
    });
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", debounce(handleResize, 100));
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Height and width adjustments ends

  const {
    socketRef,
    localVideoRef,
    remoteAudios,
    remoteVideos
  } = useVideoCall();

  useEffect(() => {
    setTimeout(() => {
      handleStartCall();
    }, 2000);
  }, []);

  const MemoizedRemoteVideo = memo((props) => {
    const remoteVideoRef = useRef(null);
    const {
      track,
      serverConsumerId
    } = props;
  
  
    useEffect(() => {
      if (remoteVideoRef.current.srcObject) {
        console.warn('element ALREADY playing');
        return;
      }
      remoteVideoRef.current.srcObject = new MediaStream([track]);
      remoteVideoRef.current.play();
      socketRef.current.emit(callJoinedNsps.wsEvents.CONSUMER_RESUME, {serverConsumerId: serverConsumerId})
    }, []);
  
    return (
      <div
        className={`user-video-container ${styles.userVideoContainer}`}
      >
        <video className={styles.videoEl} ref={remoteVideoRef}></video>
        <div className={styles.userActions}>
          <div className={styles.actions}>
            <div className={styles.actionsButton}>
              <div className={styles.icon}>
                <BsMicMuteFill />
              </div>
              <div className={styles.icon}>
                <BsFillXCircleFill />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.userInfo}>Waqaar Aslam</div>
      </div>
    )
  })

  return (
    <>
      <div className={styles.videoArea}>
        <div className={`${styles.header} ${styles.headerHeight}`}>
          <div className={styles.callTitle}>Video Conference Meeting</div>
          <div className={styles.callTimer}>
            <div className={styles.dot}></div>
            <div className={styles.timer}>12:38</div>
          </div>
        </div>
        <div
          className={`${styles.main} ${styles.mainHeight}`}
          ref={videoContainerRef}
        >
          <div className={styles.videos}>
            <div
              className={`user-video-container ${styles.userVideoContainer}`}
            >
              <video
                ref={localVideoRef}
                autoPlay
                className={styles.videoEl}
                muted="muted"
              ></video>
              <div className={styles.userActions}>
                <div className={styles.actions}>
                  <div className={styles.actionsButton}>
                    <div className={styles.icon}>
                      <BsMicMuteFill />
                    </div>
                    <div className={styles.icon}>
                      <BsFillXCircleFill />
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.userInfo}>Waqaar Aslam</div>
            </div>
            {
              Object.keys(remoteVideos).map((remoteVideo) => {
                return (
                  <MemoizedRemoteVideo 
                    key={remoteVideo}
                    serverConsumerId={remoteVideo}
                    track={remoteVideos[remoteVideo].track}
                    />
                )
              })
            }
          </div>
        </div>
        <div className={`${styles.footer} ${styles.footerHeight}`}>
          <div></div>
          <div className={styles.currentUserActions}>
            <div className={styles.icon}>
              <BsMicMuteFill />
            </div>
            <div className={styles.icon}>
              <BsCameraVideoOffFill />
            </div>
            <div className={styles.icon}>
              <BsFillTelephoneFill />
            </div>
            <div className={styles.icon}>
              <CgScreen />
            </div>
            <div className={styles.icon}>
              <BsFillGearFill />
            </div>
          </div>
          <div></div>
        </div>
      </div>
      <div className={styles.chatArea}>
        <Sidebar parentStyles={styles} />
      </div>
    </>
  );
};

export default VideoCall;

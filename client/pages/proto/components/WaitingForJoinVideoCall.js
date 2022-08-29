import { useEffect, useRef, useState } from "react";
import styles from "./../../../src/assets/styles/proto/Event.module.scss";
import {
  BsFillMicFill,
  BsFillMicMuteFill,
  BsFillCameraVideoFill,
  BsFillCameraVideoOffFill,
  BsFillTelephoneFill,
  BsFillGearFill,
} from "react-icons/bs";
import Button from "../../../src/components/Form/Button";

let stream = null;
const WaitingForJoinCall = ({
  handleJoinCall,
  joining,
  usersInRoom,
  preCallSocket
}) => {
  const [config, setConfig] = useState({ audio: true, video: true });
  const localVideoRef = useRef(null);
  const getUserMedia = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
      });
      if (config.video) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.log("Error in - (navigator.mediaDevices.getUserMedia)", err);
    }
  };

  useEffect(() => {
    if (!config.video) {
      stream?.getVideoTracks()[0].stop();
      localVideoRef.current.srcObject = null;
    } else {
      getUserMedia();
    }
  }, [config]);

  const handleConfig = (type) => {
    setConfig(() => {
      return {
        ...config,
        [type]: !config[type],
      };
    });
  };

  return (
    <div className={styles.joinRoom}>
      <div className={styles.video}>
        <div className={styles.header}>Join The Call To Start Practicing</div>
        <div className={styles.body}>
          <div className={styles.videoContainer}>
            <video ref={localVideoRef} autoPlay></video>
            <div className={styles.actions}>
              <div
                className={`${styles.icon} ${
                  !config.audio ? styles.active : ""
                }`}
                onClick={() => handleConfig("audio")}
              >
                {config.audio ? <BsFillMicFill /> : <BsFillMicMuteFill />}
              </div>
              <div
                className={`${styles.icon} ${
                  !config.video ? styles.active : ""
                }`}
                onClick={() => handleConfig("video")}
              >
                {config.video ? (
                  <BsFillCameraVideoFill />
                ) : (
                  <BsFillCameraVideoOffFill />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <div className={styles.actions}>
            <div className={styles.noOfLearners}>
              There are {usersInRoom} learners on this call
            </div>
            <div className={styles.joinCall}>
              <Button
                text="Join Call"
                onClick={() => {
                  handleJoinCall(config)
                }}
                disabled={false}
                size="lg"
                buttonStyle="primeButton"
                icon={<BsFillTelephoneFill />}
                round={true}
                loading={joining}
                // loaderSize="sm"
              />
              <Button
                text="Settings"
                onClick={() => {}}
                disabled={false}
                size="lg"
                buttonStyle="transparentButton"
                icon={<BsFillGearFill />}
                round={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingForJoinCall;

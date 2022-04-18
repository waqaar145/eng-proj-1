import { useEffect } from "react";
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

let socketObj = null;
const ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/${conferenceNsps.prefix}`;

const profileRepliesArray = [
  {
    id: 1,
    name: "Waqaar Aslam",
    dp: "https://images.hindustantimes.com/rf/image_size_960x540/HT/p2/2020/04/27/Pictures/_1640c7f6-8830-11ea-8e78-f1b6d2f5bc87.jpg",
  },
  {
    id: 2,
    name: "John",
    dp: "https://cdn.dnaindia.com/sites/default/files/styles/full/public/2021/09/14/996079-916523-889617-99c54cdf-b06a-4689-8651-e02b05fd330d.jpg",
  },
  {
    id: 3,
    name: "Mark",
    dp: "https://images.hindustantimes.com/img/2021/10/28/1600x900/Mohammed_Shami_1635417533797_1635417533915.jpg",
  },
];

const Conversation = () => {
  const router = useRouter();
  const { meetingId } = router.query;

  const { handleConnectClient, handleDisconnectClient, usersInRoom, joined, setJoined } = useMeeting(meetingId);

  useEffect(() => {
    handleConnectClient();
    return () => handleDisconnectClient();
  }, []);

  useEffect(() => {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;

    if (navigator.getUserMedia) {
      navigator.getUserMedia(
        { audio: true, video: true },
        (stream) => {
          var video = document.querySelector("video");
          video.srcObject = stream;
          video.onloadedmetadata = function (e) {
            video.play();
          };
        },
        function (err) {
          console.log("The following error occurred: " + err.name);
        }
      );
    } else {
      console.log("getUserMedia not supported");
    }
  }, []);


  console.log(usersInRoom);
  return (
    <div className={styles.wrapper}>
      <div className={styles.videoContainer}>
        {
          joined
          &&
          usersInRoom.length > 0 
          &&
          usersInRoom.map((user => {
            return (
              <div className={styles.videoLiveContainer}>
                <video key={user.socketId} muted className={styles.videoLive}></video>
              </div>
            )
          }))
        }
        {
          !joined
          &&
          <div className={styles.innerContainer}>
            <video muted className={styles.video}></video>
            <div className={styles.controls}>
              <div className={styles.controlStyle}>
                <MdOutlineMicNone />
              </div>
              <div className={styles.controlStyle}>
                <MdOutlineVideocam />
              </div>
            </div>
          </div>
        }
        <div className={styles.users}>
          <div className={styles.header}>Ready to Join?</div>
          <div className={styles.usersInRoom}>
            <div>
              <UserBlockImages profileReplies={profileRepliesArray} />
            </div>
            <div>+ 3 others</div>
          </div>
          <div className={styles.action}>
            <SimpleButton
              text="Join"
              onClick={() => {
                setJoined(true)
              }}
              disabled={false}
              size="lg"
              buttonStyle="primeButton"
              icon={<MdAdd />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conversation;

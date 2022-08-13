import { useEffect, useRef } from "react";
import styles from "./../../src/assets/styles/proto/Event.module.scss";
import debounce from "lodash.debounce";

const Conversation = () => {
  const videoContainerRef = useRef(null);
  const calculateVideoHeight = ({ elHeight, elWidth }) => {
    let elmts = document.querySelectorAll(".user-video-container");

    const perRow = elmts.length / 3;
    let divNumberOnPage = 0;
    if (perRow > 1 && perRow <= 2) divNumberOnPage = 2;
    else if (perRow >= 2 && perRow <= 3) divNumberOnPage = 3;
    else divNumberOnPage = 1;
    const divHeight = elHeight / divNumberOnPage;
    const divWidth = elWidth / divNumberOnPage;

    elmts.forEach((elmt) => {
      elmt.style.height = divHeight + "px"; // 8px -> for adjusting the padding between video container div
      elmt.style.width = divWidth + "px";
    });
  };
  const handleResize = () => {
    const elHeight = videoContainerRef.current.clientHeight;
    const elWidth = videoContainerRef.current.clientWidth;
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

  return (
    <div className={styles.eventWrapper}>
      <div className={styles.videoArea}>
        <div className={`${styles.header} ${styles.headerHeight}`}>
          <div className={styles.callTitle}>Video Conference Meeting</div>
          <div className={styles.callTimer}>12:38</div>
        </div>
        <div
          className={`${styles.main} ${styles.mainHeight}`}
          ref={videoContainerRef}
        >
          <div className={styles.videos}>
            {Array.from(Array(9), (e, i) => {
              return (
                <div
                  key={i}
                  className={`user-video-container ${styles.userVideoContainer}`}
                >
                  <video
                    style={{
                      height: "100%",
                      width: "100%",
                      backgroundColor: "black",
                    }}
                  ></video>
                  <div className={styles.userInfo}>
                    <div className={styles.actions}>
                      waqaar
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={`${styles.footer} ${styles.footerHeight}`}>Footer</div>
      </div>
      <div className={styles.chatArea}>
        <div className={`${styles.header} ${styles.headerHeight}`}>
          <div className={styles.callTitle}>Video Conference Meeting</div>
          <div className={styles.callTimer}>12:38</div>
        </div>
        <div className={`${styles.main} ${styles.mainHeight}`}>Body</div>
        <div className={`${styles.footer} ${styles.footerHeight}`}>Footer</div>
      </div>
    </div>
  );
};

export default Conversation;

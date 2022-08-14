import { useState } from "react";
import styles from "./../../../src/assets/styles/proto/Sidebar.module.scss";
import Chat from "./Chat";
import ActiveUsers from "./ActiveUsers";
import Management from "./Management";

const tabs = {
  CHAT: "CHAT",
  ACTIVE_USERS: "ACTIVE_USERS",
  MANAGEMENT: "MANAGEMENT",
};

function formateWord(string) {
  let str = string.split("_").join(" ").toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const Sidebar = ({ parentStyles }) => {
  const [activeTab, setActiveTab] = useState(tabs.CHAT);
  return (
    <div>
      <div className={`${parentStyles.header} ${parentStyles.headerHeight}`}>
        <div className={styles.tabs}>
          {Object.keys(tabs).map((key) => {
            return (
              <div
                key={key}
                className={`${styles.tab} ${
                  activeTab === tabs[key] ? styles.activeTab : ""
                }`}
                onClick={() => {
                  setActiveTab(tabs[key]);
                }}
              >
                {formateWord(tabs[key])}
              </div>
            );
          })}
        </div>
      </div>
      <div className={`${parentStyles.main} ${parentStyles.mainHeight}`}>
        <div className={styles.container}>
          {activeTab === tabs.CHAT && <Chat />}
          {activeTab === tabs.ACTIVE_USERS && <ActiveUsers />}
          {activeTab === tabs.MANAGEMENT && <Management />}
        </div>
      </div>
      <div className={`${parentStyles.footer} ${parentStyles.footerHeight}`}>
        <div className={styles.footerContainer}>Footer</div>
      </div>
    </div>
  );
};

export default Sidebar;

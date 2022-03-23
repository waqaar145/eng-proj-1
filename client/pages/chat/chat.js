import Header from "./components/header";
import dynamic from "next/dynamic";
import LoggedinUserProfile from "./components/loggedInUserProfile";
import UsersList from "./components/usersList";
import styles from "./../../src/assets/styles/chat/Chat.module.scss";
import useModal from "../../src/hooks/useModal";
import useNav from "../../src/hooks/useNav";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import SideNavStyles from "./../../src/assets/styles/chat/SideNav.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { chatService } from "../../src/services";
import usePagination from "../../src/hooks/usePagination";
import { chatActionTypes } from "../../src/store/chat/chat.actiontype";
import ChatArea from "./chatArea";
import { useRouter } from "next/router";
import useChat from "./hooks/useChat";

const SideNavbar = dynamic(() => import("./components/SideNavbar"), {
  ssr: false,
});

const ActiveThread = dynamic(
  () => import("./components/Thread/ActiveThread.js"),
  {
    ssr: false,
  }
);

const CreateGroup = dynamic(() => import("./components/CreateGroup"), {
  ssr: false,
});

const CreateDM = dynamic(() => import("./components/CreateDM"), {
  ssr: false,
});

const AddUsersToGroup = dynamic(() => import("./components/AddUsersToGroup"), {
  ssr: false,
});

const SidenavUsers = ({
  styles,
  generalChatObject,
  groupChatObject,
  dmChatObject,
  handleAddUserOrGroupModal,
  loadingChatUsers,
  handlePagination,
  groupId,
  extraChatCount,
}) => {
  return (
    <>
      <UsersList
        styles={styles}
        list={generalChatObject}
        general={true}
        loading={loadingChatUsers}
        handlePagination={handlePagination}
        groupId={groupId}
        extraChatCount={extraChatCount}
      />
      <UsersList
        styles={styles}
        list={groupChatObject}
        group={true}
        handleAddUserOrGroupModal={handleAddUserOrGroupModal}
        loading={loadingChatUsers}
        handlePagination={handlePagination}
        groupId={groupId}
        extraChatCount={extraChatCount}
      />
      <UsersList
        styles={styles}
        list={dmChatObject}
        dm={true}
        handleAddUserOrGroupModal={handleAddUserOrGroupModal}
        loading={loadingChatUsers}
        handlePagination={handlePagination}
        groupId={groupId}
        extraChatCount={extraChatCount}
      />
    </>
  );
};

const Chat = () => {
  const router = useRouter();

  const { groupId, addUsers } = router.query;

  const dispatch = useDispatch();

  const loggedInUser = useSelector((state) => state.Auth.loggedInUser);
  const currentActiveThread = useSelector(
    (state) => state.Chat.currenThreadMessageId
  );

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const { toggle: handleNavToggle, show: showSideNav } = useNav();

  const { currentState } = usePagination();
  const { publicData, groupData, privateData } = useSelector(
    (state) => state.Chat
  );

  // Socket io
  const {
    handleConnectClients,
    addNewMessageSocketEmitter,
    onNewMessageReceive,
    handleDisconnectClients,
    extraChatCount,
  } = useChat(groupId);

  const getPubGroups = async (pageNoObj) => {
    let type = "public";
    let params = { ...currentState, ...pageNoObj };
    try {
      let {
        data: { data },
      } = await chatService.getChatUsers({ ...params, type: type });
      dispatch({
        type: chatActionTypes.ADD_PUBLIC_GROUPS,
        data: { ...data, currentPage: pageNoObj.pageNo },
      });
      return data.chatList.data;
    } catch (error) {
      console.log(error);
    }
  };

  const getGroups = async (pageNoObj) => {
    let type = "gp";
    let params = { ...currentState, ...pageNoObj };
    try {
      let {
        data: { data },
      } = await chatService.getChatUsers({ ...params, type: type });
      dispatch({
        type: chatActionTypes.ADD_GROUPS,
        data: { ...data, currentPage: pageNoObj.pageNo },
      });
      return data.chatList.data;
    } catch (error) {
      console.log(error);
    }
  };

  const getDMs = async (pageNoObj) => {
    let type = "dm";
    let params = { ...currentState, ...pageNoObj };
    try {
      let {
        data: { data },
      } = await chatService.getChatUsers({ ...params, type: type });
      dispatch({
        type: chatActionTypes.ADD_PRIVATES,
        data: { ...data, currentPage: pageNoObj.pageNo },
      });
      return data.chatList.data;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    (async function () {
      const pb = await getPubGroups({ pageNo: 1, pageSize: 1000 });
      const gp = await getGroups({ pageNo: 1, pageSize: 1000 });
      const pv = await getDMs({ pageNo: 1, pageSize: 1000 });
      const allGroups = [...pb, ...gp, ...pv];
      handleConnectClients(allGroups);
      onNewMessageReceive(groupId);
      return () => handleDisconnectClients();
    })();
  }, []);

  const handleNav = () => {
    handleNavToggle();
  };

  const handlePagination = ({ dm, group, currentPage }) => {
    if (group) {
      getGroups({ pageNo: currentPage + 1 });
    }
    if (dm) {
      getDMs({ pageNo: currentPage + 1 });
    }
    if (!group && !dm) {
      getPubGroups({ pageNo: currentPage + 1 });
    }
  };

  // Create Group Modal
  const { toggle: toggleCreateGroup, show: showCreateGroup } = useModal();
  // Create DM Modal
  const { toggle: toggleAddDM, show: showAddDm } = useModal();

  // adding users to group
  // 1 -> Chat Area, 2 -> adding and removing users, 3 -> join opened immediate groups to start talking
  const [chatArea, setChatArea] = useState(1);

  const handleAddUserOrGroupModal = ({ group, dm }) => {
    if (group) toggleCreateGroup();
    if (dm) toggleAddDM();
  };

  const addGroupNameToList = (obj) => {
    let data = {
      name: "Group Messages",
      chatList: {
        data: [obj],
      },
    };
    toggleCreateGroup();
    // setChatArea(1);
    dispatch({
      type: chatActionTypes.ADD_GROUPS,
      data: { ...data, currentPage: 1 },
    });
    router.push(
      `/chat/chat?groupId=${obj.uuid}&addUsers=yes`,
      `/chat/CLIENT/${obj.uuid}`
    );
  };

  useEffect(() => {
    setChatArea(1);
  }, [groupId]);

  const showMembers = () => {
    setChatArea(2);
  };

  return (
    <div className={styles.chatWrapper} style={{ overflow: "hidden" }}>
      <Header styles={styles} handleNav={handleNav} />
      <div
        className={`${
          currentActiveThread
            ? styles.chatContainerWithThread
            : styles.chatContainer
        }`}
      >
        <div className={styles.chatSidebar}>
          <div className={styles.loggedinUser}>
            {loggedInUser && (
              <LoggedinUserProfile styles={styles} user={loggedInUser} />
            )}
          </div>
          <div className={styles.groupuserContainer}>
            <SidenavUsers
              styles={styles}
              generalChatObject={publicData}
              groupChatObject={groupData}
              dmChatObject={privateData}
              handleAddUserOrGroupModal={handleAddUserOrGroupModal}
              handlePagination={handlePagination}
              groupId={groupId}
              extraChatCount={extraChatCount}
            />
          </div>
        </div>
        <div className={styles.chatContent}>
          {chatArea === 1 && (
            <ChatArea
              groupId={groupId}
              isTabletOrMobile={isTabletOrMobile}
              styles={styles}
              showMembers={showMembers}
              addNewMessageSocketEmitter={addNewMessageSocketEmitter}
            />
          )}
          {chatArea === 2 && (
            <AddUsersToGroup
              groupId={groupId}
              showChatList={() => setChatArea(1)}
            />
          )}
        </div>
        {currentActiveThread && (
          <div>
            <ActiveThread currentActiveThread={currentActiveThread} />
          </div>
        )}
      </div>
      {showSideNav && (
        <SideNavbar show={showSideNav} toggle={handleNav}>
          <div className={SideNavStyles.chatSidebar}>
            <div className={SideNavStyles.loggedinUser}>
              {loggedInUser && (
                <LoggedinUserProfile
                  styles={SideNavStyles}
                  user={loggedInUser}
                />
              )}
            </div>
            <div className={styles.groupuserContainer}>
              <SidenavUsers
                styles={SideNavStyles}
                generalChatObject={publicData}
                groupChatObject={groupData}
                dmChatObject={privateData}
                handleAddUserOrGroupModal={handleAddUserOrGroupModal}
                handlePagination={handlePagination}
                groupId={groupId}
              />
            </div>
          </div>
        </SideNavbar>
      )}
      {/* Add Group Modal */}
      {showCreateGroup && (
        <CreateGroup
          toggle={toggleCreateGroup}
          show={showCreateGroup}
          addGroupNameToList={addGroupNameToList}
        />
      )}
      {showAddDm && (
        <CreateDM toggle={toggleAddDM} show={showAddDm} groupId={groupId} />
      )}
    </div>
  );
};

export default Chat;

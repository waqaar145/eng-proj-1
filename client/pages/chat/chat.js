import Header from "./components/header";
import dynamic from "next/dynamic";
import LoggedinUserProfile from "./components/loggedInUserProfile";
import UsersList from "./components/usersList";
import styles from "./../../src/assets/styles/chat/Chat.module.scss";
import useModal from "../../src/hooks/useModal";
import useNav from "../../src/hooks/useNav";
import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";
import SideNavStyles from "./../../src/assets/styles/chat/SideNav.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { chatService } from "../../src/services";
import usePagination from "../../src/hooks/usePagination";
import { chatActionTypes } from "../../src/store/chat/chat.actiontype";
import ChatArea from "./chatArea";
import { useRouter } from "next/router";
import ActiveThread from './components/Thread/ActiveThread.js'

const SideNavbar = dynamic(() => import("./components/SideNavbar"), {
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
  groupId
}) => {

  return (
    <>
      <UsersList styles={styles} list={generalChatObject} general={true} loading={loadingChatUsers} handlePagination={handlePagination} groupId={groupId}/>
      <UsersList
        styles={styles}
        list={groupChatObject}
        group={true}
        handleAddUserOrGroupModal={handleAddUserOrGroupModal}
        loading={loadingChatUsers}
        handlePagination={handlePagination}
        groupId={groupId}
      />
      <UsersList
        styles={styles}
        list={dmChatObject}
        dm={true}
        handleAddUserOrGroupModal={handleAddUserOrGroupModal}
        loading={loadingChatUsers}
        handlePagination={handlePagination}
        groupId={groupId}
      />
    </>
  );
};

const Chat = () => {

  const router = useRouter();
  const {
    groupId
  } = router.query;

  const dispatch = useDispatch();

  const loggedInUser = useSelector((state) => state.Auth.loggedInUser);
  const currentActiveThread = useSelector(state => state.Chat.currenThreadMessageId);

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 768px)" });

  const { toggle: handleNavToggle, show: showSideNav } = useNav();

  const { currentState } = usePagination();
  const {
    publicData, groupData, privateData
  } = useSelector((state) => state.Chat);

  const getPubGroups = async (pageNoObj) => {
    let type = "public"
    let params = {...currentState, ...pageNoObj}
    try {
      if (pageNoObj.pageNo === 1) dispatch({type: chatActionTypes.REQUEST_PUBLIC_DATA, data: true})
      let {data: {data}} = await chatService.getChatUsers({...params, type: type});
      dispatch({type: chatActionTypes.ADD_PUBLIC_GROUPS, data: {...data, currentPage: pageNoObj.pageNo}})
    } catch (error) {
      console.log(error)
    }
  }

  const getGroups = async (pageNoObj) => {
    let type = "gp"
    let params = {...currentState, ...pageNoObj}
    try {
      if (pageNoObj.pageNo === 1) dispatch({type: chatActionTypes.REQUEST_GROUP_DATA, data: true})
      let {data: {data}} = await chatService.getChatUsers({...params, type: type});
      dispatch({type: chatActionTypes.ADD_GROUPS, data: {...data, currentPage: pageNoObj.pageNo}})
    } catch (error) {
      console.log(error)
    }
  }

  const getDMs = async (pageNoObj) => {
    let type = "dm"
    let params = {...currentState, ...pageNoObj}
    try {
      if (pageNoObj.pageNo === 1) dispatch({type: chatActionTypes.REQUEST_PRIVATE_DATA, data: true})
      let {data: {data}} = await chatService.getChatUsers({...params, type: type});
      dispatch({type: chatActionTypes.ADD_PRIVATES, data: {...data, currentPage: pageNoObj.pageNo}})
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getPubGroups({pageNo: 1})
    getGroups({pageNo: 1})
    getDMs({pageNo: 1})
  }, []);

  const handleNav = () => {
    handleNavToggle();
  };

  const handlePagination = ({dm, group, currentPage}) => {
    if (group) {
      getGroups({pageNo: currentPage + 1})
    }
    if (dm) {
      getDMs({pageNo: currentPage + 1})
    }
    if (!group && !dm) {
      getPubGroups({pageNo: currentPage + 1})
    }
  }

  const handleAddUserOrGroupModal = () => {}

  return (
    <div className={styles.chatWrapper}>
      <Header styles={styles} handleNav={handleNav} />
      <div className={`${currentActiveThread ? styles.chatContainerWithThread : styles.chatContainer}`}>
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
            />
          </div>
        </div>
        <div className={styles.chatContent}>
          <ChatArea 
            isTabletOrMobile={isTabletOrMobile}
            styles={styles}
          />
        </div>
        {
          currentActiveThread
          &&
          <div>
            <ActiveThread
              currentActiveThread={currentActiveThread}
             />
          </div>
        }
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
    </div>
  );
};

export default Chat;

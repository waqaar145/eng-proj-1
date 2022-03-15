import { useCallback, useEffect, useRef, useState } from "react";
import { chatService } from "../../../src/services";
import { chatActionTypes } from "../../../src/store/chat/chat.actiontype";
import { useDispatch, useSelector } from "react-redux";
import styles from "./../../../src/assets/styles/chat/AddUsersToGroup.module.scss";
import CloseIcon from "./../../../src/components/Extra/CloseIcon";
import SimpleInput from "../../../src/components/Form/SimpleInput";
import debounce from "lodash.debounce";
import usePagination from "../../../src/hooks/usePagination";
import Spinner from "../../../src/components/Extra/Spinner";
import SimpleButton from "../../../src/components/Form/SimpleButton";
import { MdAdd, MdDone, MdDelete, MdOutlinePersonRemove } from 'react-icons/md';
import ConfirmModal from './ConfirmModal';
import useModal from "../../../src/hooks/useModal";

const AddUsersTopGroup = ({ groupId, showChatList}) => {
  const { currentState, handlePageChange } = usePagination();

  const dispatch = useDispatch();

  const loggedInUser = useSelector((state) => state.Auth.loggedInUser);
  const currentSelectedGroup = useSelector(state => state.Chat.currentSelectedGroup);

  const mainRef = useRef(null);
  const userListRef = useRef(null);
  const [values, setValues] = useState({ name: "" });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(1)

  useEffect(() => {
    if (userListRef && userListRef.current) {
      userListRef.current.style.height =
        window.innerHeight - (mainRef?.current?.clientHeight + 70) + "px";
    }
  }, [groupId]);

  const handleChange = (target) => {
    const { name, value } = target;
    setValues({ ...values, [name]: value });
    setLoading(true);
    if (activeTab === 1) {
      handleDebounce(value);
    } else {
      setFilteredUsers(filterList(users, value))
      setLoading(false);
    }
  };

  const filterList = (list, searchValue) => {
    return list.filter(item => {
      const fullName = `${item.firstName}${item.lastName}`.toLowerCase();
      const reversedFullName = `${item.lastName}${item.firstName}`.toLowerCase();
      const trimmedSearchValue = searchValue.replace(/\s+/g, '').toLowerCase();
      return fullName.includes(trimmedSearchValue) || reversedFullName.includes(trimmedSearchValue);
    });
  }

  const handleSearchUsers = async (value) => {
    if (!value || value === "") {
      setLoading(false);
      setTotalResults(0);
      setUsers([]);
      return;
    }
    try {
      let params = { ...currentState, q: value, tab: activeTab };
      let {
        data: {
          data: { data, totalEnteries },
        },
      } = await chatService.searchUsers(groupId, params);
      let dataWithBoolean = data.map(user => {
        return {
          ...user,
          added: false
        }
      })
      setUsers([...users, ...dataWithBoolean]);
      setTotalResults(totalEnteries);
      handlePageChange(currentState.pageNo + 1);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const getExistingUsers = async () => {
    try {
      setLoading(true)
      let {
        data: {
          data: { data, totalEnteries },
        },
      } = await chatService.getExistingUsers(groupId);
      let dataWithBoolean = data.map(user => {
        return {
          ...user,
          added: true
        }
      });
      setUsers(dataWithBoolean);
      setFilteredUsers(dataWithBoolean)
      setTotalResults(totalEnteries);
      handlePageChange(currentState.pageNo + 1);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  const handleDebounce = useCallback(
    debounce((nextValue) => handleSearchUsers(nextValue), 1000),
    []
  );

  const handleShowMore = () => {
    handleSearchUsers(values.name);
  };

  const handleAdd = async (userObj, callback) => {
    let addUserToGroupObj = {
      groupId: currentSelectedGroup.id,
      userId: userObj.id
    }
    try {
      let {data: {data}} = await chatService.addUserToGroup(addUserToGroupObj);
      let updatedUsersList = users.map((user) => {
        if (user.id === data.userId) {
          return {
            ...user,
            added: data.new
          }
        }
        return user;
      });
      setUsers(updatedUsersList);
      let updatedFilteredUsersList = filteredUsers.map((user) => {
        if (user.id === data.userId) {
          return {
            ...user,
            added: data.new
          }
        }
        return user;
      });
      if (callback) {
        callback()
      }
      setFilteredUsers(updatedFilteredUsersList);
      dispatch({type: chatActionTypes.UPDATE_MEMBERS_COUNT_OF_CURRENT_GROUP, data: data.new ? 1 : -1})
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    setValues({...values, name: ""})
    handlePageChange(1)
    setTotalResults(0)
    if (activeTab === 1) {
      setUsers([])
    } else {
      getExistingUsers()
    }
  }, [activeTab]);


  useEffect(() => { 
    if (currentSelectedGroup.admin === 1) {
      setActiveTab(1);
    } else {
      setActiveTab(2);
    }
  }, [currentSelectedGroup.admin]);

  const userListArray = activeTab === 1 ? users : filteredUsers;

  // Leave Group
  const [leaveGroupLoading, setLeaveGroupLoading] = useState(false);
  const { toggle: handleLeaveGroupToggle, show: showLeaveGroupModal } = useModal();

  const leaveGroup = async () => {
    try {
      setLeaveGroupLoading(true)
      let {data: {data}} = await chatService.leaveGroup(groupId);
      dispatch({type: chatActionTypes.REMOVE_GROUP, data});
      setLeaveGroupLoading(true)
      handleLeaveGroupToggle()
    } catch (error) {
      setLeaveGroupLoading(true)
      console.log(error);
    }
  }

  // Remove user from gorup
  const [currentUserToRemoveObj, setCurrentUserToRemoveObj] = useState({});
  const { toggle: handleRemoveUserToggle, show: showRemoveUserModal } = useModal();

  const handleRemoveUserFromGroup = (user) => {
    setCurrentUserToRemoveObj({id: user.id, name: `${user.firstName} ${user.lastName}`})
    handleRemoveUserToggle()
  }

  const hideRemoveUserModal = () => {
    handleRemoveUserToggle()
  }

  return (
    <>
      <div className={styles.wrapper} ref={mainRef}>
        <div className={styles.header}>
          <div className={styles.title}>{`#${currentSelectedGroup.groupName}`}</div>
          <div className={styles.action}>
            <CloseIcon onClick={() => showChatList()} />
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.inputBox}>
            <SimpleInput
              type="text"
              name="name"
              label={`Search usernames ${activeTab === 1 && currentSelectedGroup.admin === 1 ? 'to add' : ""}`}
              placeholder="Type here..."
              handleChange={handleChange}
              value={values.name}
            />
          </div>
        </div>
        {
          currentSelectedGroup.admin === 1
          &&
          <div className={styles.tabWrapper}>
            <div className={styles.tab}>
              <ul>
                <li className={activeTab === 1 ? styles.active : ''} onClick={() => setActiveTab(1)}>
                  <a>Add New Users</a>
                </li>
                <li className={`${activeTab === 2 ? styles.active : ''} ${currentSelectedGroup.members === 0 ? styles.disabled : ''}`} onClick={() => setActiveTab(2)}>
                  <a>Existing Users ({currentSelectedGroup.members})</a>
                </li>
              </ul>
            </div>
            <div className={styles.leaveGroupAction}>
            </div>
          </div>
        }
      </div>
      <div className={styles.userList} ref={userListRef}>
        {values.name === "" && !loading && totalResults === 0 && (
          <div className={styles.resultAppearText}>
            Your results will appear here
          </div>
        )}
        {loading && (
          <>
            <div className={styles.separator}>
              <Spinner />
            </div>
          </>
        )}
        {users.length > 0 && !loading && (
          <>
            <div className={styles.separator}>Results ({activeTab === 1 ? totalResults : filteredUsers.length})</div>
          </>
        )}
        {!loading && (
          <div className={styles.userContainer}>
            {userListArray.map((user) => {
              return (
                <div className={styles.userWrapper} key={user.id}>
                  <div className={styles.userInfo}>
                    <div className={styles.dp}>
                      <img
                        src={user.dp}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                    </div>
                    <div className={styles.nameAndDesination}>
                      <span className={styles.name}>
                        {user.firstName} {user.lastName} {loggedInUser.id === user.id ? ' (You) ' : ''} {user.admin === 1 && <span className={styles.adminLabel}>Admin</span>}
                      </span>{" "}
                      <span className={styles.designation}>
                        ({user.designation})
                      </span>
                    </div>
                  </div>
                  <div className={styles.action}>
                    {
                      loggedInUser.id !== user.id
                      &&
                      currentSelectedGroup.admin === 1
                      &&
                      <>
                        {
                          !user.added
                          &&
                          <SimpleButton
                            text={`${activeTab === 1 ? 'Add' : 'Removed'}`}
                            onClick={() => {handleAdd(user)}}
                            disabled={activeTab === 2 ? true : false}
                            size="sm"
                            buttonStyle="primeButton"
                            icon={activeTab === 1 ? <MdAdd /> : <MdDone />}
                          />
                        }
                        {
                          user.added
                          &&
                          <SimpleButton
                            text={`${activeTab === 1 ? 'Added' : 'Remove'}`}
                            onClick={() => {handleRemoveUserFromGroup(user)}}
                            disabled={activeTab === 1 ? true : false}
                            size="sm"
                            buttonStyle={`${activeTab === 1 ? 'primeButton' : 'dangerButton'}`}
                            icon={activeTab === 1 ? <MdDone /> : <MdDelete />}
                          />
                        }
                      </>
                    }
                  </div>
                </div>
              );
            })}
            {
              activeTab === 2
              &&
              <div className={styles.leaveGroup}>
                <SimpleButton
                  text="Leave Group"
                  onClick={() => handleLeaveGroupToggle()}
                  disabled={false}
                  size="lg"
                  buttonStyle="dangerButton"
                  icon={<MdOutlinePersonRemove/>}
                />
              </div>
            }
          </div>
        )}
        {activeTab === 1 && totalResults > 0 && totalResults > users.length && !loading && (
          <div className={styles.showMore}>
            <SimpleButton
              text={`Show more (${totalResults - users.length})`}
              onClick={handleShowMore}
              disabled={loading}
              size="lg"
              buttonStyle="primeButton"
            />
          </div>
        )}
        {values.name !== "" && !loading && totalResults === 0 && (
          <div className={styles.noResultFound}>
            No users found, please search other users
          </div>
        )}
      </div>

      {/* Remove user from group */}
      <ConfirmModal 
        id={groupId}
        titleText={`Remove ${currentUserToRemoveObj.name} from #${currentSelectedGroup.groupName} group?`}
        bodyText="Are you sure? This can't be undone"
        handleDelete={() => handleAdd(currentUserToRemoveObj, hideRemoveUserModal)}
        toggle={handleRemoveUserToggle}
        show={showRemoveUserModal}
        loading={false}
        handleToggle={() => handleRemoveUserToggle()}
        />
      {/* Leave group */}
      <ConfirmModal 
        id={groupId}
        titleText={`Leave #${currentSelectedGroup.groupName} group?`}
        bodyText="Are you sure? This can't be undone"
        handleDelete={leaveGroup}
        toggle={handleLeaveGroupToggle}
        show={showLeaveGroupModal}
        loading={leaveGroupLoading}
        handleToggle={() => handleLeaveGroupToggle()}
        />
    </>
  );
};

export default AddUsersTopGroup;

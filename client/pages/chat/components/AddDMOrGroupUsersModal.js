import Modal from "./../../../src/components/Modal/main";
import ConfirmModal from "./ConfirmModal";
import useModal from "./../../../src/hooks/useModal";
import {
  ModalHeader,
  ModalBody,
} from "./../../../src/components/Modal/ModalElements";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { MdSettings } from "@react-icons/all-files/md/MdSettings";
import styles from "./../../../src/assets/styles/chat/AddDMOrGroupUsersModal.module.scss";
import SimpleInput from "./../../../src/components/Form/SimpleInput";
import Button from "./../../../src/components/Form/Button";
import { useEffect, useRef, useState } from "react";
import { chatService } from "./../../../src/services";
import { showToast } from "./../../../src/utils/Toast";
import usePagination from "./../../../src/hooks/usePagination";
import { FaPlus } from "@react-icons/all-files/fa/FaPlus";
import { ImUsers } from "@react-icons/all-files/im/ImUsers";
import { MdDelete } from "@react-icons/all-files/md/MdDelete";
import EngTooltip from "../../../src/components/Tooltip";
import Loader from './Loader'



const NoData = ({ text, buttonText, button, action }) => {
  return (
    <div className={styles.loadingMore}>
      <div>{text}</div>
      {button && (
        <div>
          <Button
            text={buttonText}
            onClick={action}
            size="sm"
            buttonStyle="primeButton"
          />
        </div>
      )}
    </div>
  );
};

const ShowGroupResults = ({
  currentUsersGroups,
  totalGroups,
  handleManageGroup,
  handleDeleteManageGroup,
  handleLoadMoreGroups,
}) => {
  const loadMoreGroupsRef = useRef(null);

  const handleGroupObserver = (entities) => {
    const target = entities[0];
    if (target.isIntersecting) {
      if (totalGroups > currentUsersGroups.length) {
        handleLoadMoreGroups();
      }
    }
  };

  useEffect(() => {
    var options = {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    };
    const observerGroup = new IntersectionObserver(
      handleGroupObserver,
      options
    );
    if (loadMoreGroupsRef.current) {
      observerGroup.observe(loadMoreGroupsRef.current);
    }
  }, []);

  return (
    <div className={styles.searchUserResult}>
      <div className={styles.text}></div>
      {currentUsersGroups.map((group) => {
        return (
          <div className={styles.searchResultWrapper} key={group.id}>
            <div className={styles.profileWrapper}>
              <div className={styles.loggedinUserDetails}>
                <div className={styles.loggedinUserName}>
                  {group.groupName}{" "}
                  <span className={styles.name}>({group.members})</span>
                </div>
              </div>
            </div>
            <div className={styles.actions}>
              <div>
                <Button
                  text="Manage"
                  size="xs"
                  onClick={() => handleManageGroup(group)}
                  icon={<ImUsers />}
                  buttonStyle="primeButton"
                />
              </div>
              <div>
                <Button
                  text="Delete"
                  size="xs"
                  onClick={() => handleDeleteManageGroup(group)}
                  icon={<MdDelete />}
                  buttonStyle="dangerButton"
                />
              </div>
            </div>
          </div>
        );
      })}
      {totalGroups > currentUsersGroups.length && (
        <div className={styles.loadingMore} ref={loadMoreGroupsRef}>
          <div
            className="spinner-border spinner-main-color"
            role="status"
          ></div>
        </div>
      )}
    </div>
  );
};

const ShowSearchResults = ({
  searchedUsers,
  totalSearchedUsers,
  handleAddUserToGroup,
  handleLoadMoreUsers,
  addUsertoGroupLoadingId,
}) => {
  const loadMoreRef = useRef(null);

  const handleObserver = (entities) => {
    const target = entities[0];
    if (target.isIntersecting) {
      if (totalSearchedUsers > searchedUsers.length) {
        handleLoadMoreUsers();
      }
    }
  };

  useEffect(() => {
    var options = {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    };
    const observer = new IntersectionObserver(handleObserver, options);
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
  }, []);

  return (
    <div className={styles.searchUserResult}>
      <div className={styles.text}>Search Results</div>
      {searchedUsers.map((user) => {
        return (
          <div className={styles.searchResultWrapper} key={user.id}>
            <div className={styles.profileWrapper}>
              <div className={styles.profilePicture}>
                <img src={user.dp} />
              </div>
              <div className={styles.loggedinUserDetails}>
                <div className={styles.loggedinUserName}>
                  {user.username}{" "}
                  <span className={styles.name}>
                    ({`${user.firstName} ${user.lastName}`})
                  </span>
                </div>
                <div className={styles.loggedinUserDesig}>
                  {user.designation || ""}
                </div>
              </div>
            </div>
            <div className={styles.actions}>
              <Button
                text={`${!user.added ? "Add" : "Remove"}`}
                size="xs"
                onClick={() => handleAddUserToGroup(user)}
                disabled={
                  addUsertoGroupLoadingId !== null &&
                  addUsertoGroupLoadingId === user.id
                    ? true
                    : false
                }
                icon={!user.added ? <FaPlus /> : <MdDelete />}
                buttonStyle={!user.added ? "primeButton" : "dangerButton"}
              />
            </div>
          </div>
        );
      })}
      {totalSearchedUsers > searchedUsers.length && (
        <div className={styles.loadingMore} ref={loadMoreRef}>
          <div
            className="spinner-border spinner-main-color"
            role="status"
          ></div>
        </div>
      )}
    </div>
  );
};

const ManageGroup = ({
  users,
  handleUserOfMangeGroup,
  addUsertoGroupLoadingId,
}) => {
  return (
    <div className={styles.searchUserResult}>
      <div className={styles.text}></div>
      {users.map((user) => {
        return (
          <div className={styles.searchResultWrapper} key={user.id}>
            <div className={styles.profileWrapper}>
              <div className={styles.profilePicture}>
                <img src={user.dp} />
              </div>
              <div className={styles.loggedinUserDetails}>
                <div className={styles.loggedinUserName}>
                  {user.username}{" "}
                  <span className={styles.name}>
                    ({`${user.firstName} ${user.lastName}`})
                  </span>
                </div>
                <div className={styles.loggedinUserDesig}>
                  {user.designation || ""}
                </div>
              </div>
            </div>
            <div className={styles.actions}>
              <Button
                text={`${user.removed ? "Add" : "Remove"}`}
                size="xs"
                disabled={
                  addUsertoGroupLoadingId !== null &&
                  addUsertoGroupLoadingId === user.id
                    ? true
                    : false
                }
                onClick={() => handleUserOfMangeGroup(user)}
                buttonStyle={user.removed ? "primeButton" : "dangerButton"}
                icon={user.removed ? <FaPlus /> : <MdDelete />}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AddDMOrGroupUsersModal = ({ activeModal, show, toggle }) => {
  const { toggle: handleConfirmToggle, show: showConfirmModal } = useModal();
  const { currentState, setCurrentState, handleSearch } = usePagination();

  const [modalTitle, setModalTitle] = useState("");
  const [inputPlaceholder, setInputPlaceholder] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [showButton, setShowButton] = useState(false);
  const [showSettingActionButton, setShowSettingAction] = useState(false);

  const handleGroupModal = () => {
    setModalTitle("Create group");
    setInputPlaceholder("Enter the group name");
    setButtonText("Create group");
    setShowButton(true);
    setShowSettingAction(true);
  };

  const handleDMModal = () => {
    setModalTitle("Add DM");
    setInputPlaceholder("Search for users");
    setButtonText("Add user");
    setShowButton(false);
    setShowSettingAction(false);
  };

  const handleDefaultModal = () => {
    setModalTitle("");
    setInputPlaceholder("");
    setButtonText("");
    setShowButton(false);
    setShowSettingAction(false);
  };

  useEffect(() => {
    if (activeModal === "group") {
      handleGroupModal();
    } else if (activeModal === "dm") {
      handleDMModal();
    } else {
      handleDefaultModal();
    }
  }, [activeModal]);

  useEffect(() => {
    if (currentState.q !== "") {
      if (!showGroupsCreatedByCurrentUser) {
        searchForUsersToAddInGroup({ ...currentState, sort: "asc" });
      }
    }
    if (showGroupsCreatedByCurrentUser) {
      getGroupsCreatedByCurrentUser({ ...currentState, sort: "asc" });
    }
  }, [currentState]);

  const inputRef = useRef(null);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [groupCreated, setGroupCreated] = useState(false);
  const [currentGroup, setCurrentGroup] = useState({});
  const [loadingSearchResult, setLoadingSearchResult] = useState(false);

  const [searched, setSearched] = useState(false);
  const [searchedUsers, setSearchUsers] = useState([]);
  const [totalSearchedUsers, setTotalSearchedUsers] = useState(0);

  const [addUsertoGroupLoadingId, setAddUsertoGroupLoadingId] = useState(null);

  const handleChange = ({ value }) => {
    setValue(value);
    if (groupCreated) {
      setSearchUsers([]);
      if (value === "") {
        setSearched(false);
      } else {
        setSearched(true);
      }
      setLoadingSearchResult(true);
      handleSearch(value);
    }
  };

  const handleSubmit = () => {
    if (value.trim()) {
      createAGroup(value);
    }
  };

  const createAGroup = async (data) => {
    let groupObj = {
      groupName: data,
    };
    try {
      setLoading(true);
      let result = await chatService.createGroup(groupObj);
      setCurrentGroup(result.data.data);
      setLoading(false);
      setGroupCreated(true);
      setValue("");
      setInputPlaceholder("Please search for usernames to add in the group");
      inputRef.current.focus();
      setModalTitle(data);
      showToast("Group is created, please add users");
    } catch (error) {
      setLoading(false);
      if (error.status === 422) {
        setErrors(error.data.data);
      } else {
        setErrors({ error: "Something went wrong" });
      }
    }
  };

  const searchForUsersToAddInGroup = async (params) => {
    try {
      let {
        data: {
          data: { data, totalEnteries },
        },
      } = await chatService.searchUsers(params);
      setTotalSearchedUsers(totalEnteries);
      setSearchUsers([
        ...searchedUsers,
        ...data.map((user) => {
          return {
            ...user,
            added: false,
          };
        }),
      ]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingSearchResult(false);
    }
  };

  const handleLoadMoreUsers = (page) => {
    page++;
    setCurrentState({ ...currentState, pageNo: page });
  };

  const handleAddUserToGroup = async (userObj) => {
    const addUserToGroupObj = {
      groupId: currentGroup.id,
      userId: userObj.id,
    };
    try {
      setAddUsertoGroupLoadingId(userObj.id);
      let {
        data: { data },
      } = await chatService.addUserToGroup(addUserToGroupObj);
      setSearchUsers(
        searchedUsers.map((user) => {
          if (user.id === data.userId) {
            return {
              ...user,
              added: data.new,
            };
          }
          return user;
        })
      );
      setAddUsertoGroupLoadingId(null);
    } catch (error) {
      console.log(error);
      setAddUsertoGroupLoadingId(null);
    }
  };

  const [loadingGroupsOfCurrentUser, setLoadingGroupsOfCurrentUser] =
    useState(false);
  const [showGroupsCreatedByCurrentUser, setShowGroupsCreatedByCurrentUser] =
    useState(false);
  const [currentUsersGroups, setCurrentUsersGroups] = useState([]);
  let [totalGroups, setTotalGroups] = useState(0);

  const handleLoadMoreGroups = (page) => {
    page++;
    setCurrentState({ ...currentState, pageNo: page });
  };

  const getGroupsCreatedByCurrentUser = async (params) => {
    try {
      let {
        data: {
          data: { data, totalEnteries },
        },
      } = await chatService.getGroupsCreatedByCurrentUser(params);
      setTotalGroups(totalEnteries);
      setCurrentUsersGroups([...currentUsersGroups, ...data]);
    } catch (error) {
      console.log(error);
      showToast(
        "There is a problem, please try again after sometimes",
        "error"
      );
    } finally {
      setLoadingGroupsOfCurrentUser(false);
    }
  };

  const handleGroupsCreatedByCurrentUser = () => {
    setSearchUsers([]);
    setTotalSearchedUsers(0);
    setCurrentUsersGroups([]);
    setTotalGroups(0);
    setCurrentState({ ...currentState, pageNo: 1 });
    setCurrentGroupBeingManged({});
    setGroupCreated(false);
    setValue("");

    if (!showGroupsCreatedByCurrentUser) {
      setLoadingGroupsOfCurrentUser(true);
      setShowGroupsCreatedByCurrentUser(true);
      setModalTitle("Groups created by you");
    } else {
      setShowGroupsCreatedByCurrentUser(false);
      setModalTitle("Create a group");
    }
  };

  const [loadingCurrentUsersOfGroup, setLoadingCurrentUsersOfGroup] =
    useState(false);
  const [currentGroupBeingManged, setCurrentGroupBeingManged] = useState({});
  const [managedGroupUsers, setManagedGroupUsers] = useState([]);

  const getUsersOfAGroup = async (id) => {
    try {
      setLoadingCurrentUsersOfGroup(true);
      let {
        data: {
          data: { data },
        },
      } = await chatService.getUsersOfGroup(id);
      setManagedGroupUsers(
        data.map((user) => {
          return {
            ...user,
            removed: false,
          };
        })
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingCurrentUsersOfGroup(false);
    }
  };

  const handleManageGroup = (group) => {
    getUsersOfAGroup(group.id);
    setModalTitle(group.groupName);
    setCurrentGroupBeingManged(group);
  };

  const handleUserOfMangeGroup = async (userObj) => {
    const addUserToGroupObj = {
      groupId: currentGroupBeingManged.id,
      userId: userObj.id,
    };
    try {
      setAddUsertoGroupLoadingId(userObj.id);
      let {
        data: { data },
      } = await chatService.addUserToGroup(addUserToGroupObj);
      setManagedGroupUsers(
        managedGroupUsers.map((user) => {
          if (user.id === data.userId) {
            return {
              ...user,
              removed: data.new ? false : true,
            };
          }
          return user;
        })
      );
      setAddUsertoGroupLoadingId(null);
    } catch (error) {
      console.log(error);
      setAddUsertoGroupLoadingId(null);
    }
  };

  const [deleteGroupLoader, setDeleteGroupLoader] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(false);

  const handleDeleteManageGroup = (group) => {
    setGroupToDelete(group);
    handleConfirmToggle();
  };

  const handleDelete = async (id) => {
    try {
      setDeleteGroupLoader(true);
      let {
        data: { data },
      } = await chatService.deleteGroup(id);
      setCurrentUsersGroups(
        currentUsersGroups.filter((group) => {
          return group.id !== data.id;
        })
      );
      let groupCount = totalGroups - 1;
      setTotalGroups(groupCount);
      handleConfirmToggle();
      showToast("Group has been deleted");
    } catch (error) {
      console.log(error);
    } finally {
      setDeleteGroupLoader(false);
    }
  };

  return (
    <Modal visible={show} toggle={toggle}>
      <ModalHeader>
        <div className={styles.modalHeaderWrapper}>
          <div className={styles.modelTitle}>{modalTitle}</div>
          <div className={styles.actionWrapper}>
            {showSettingActionButton && (
              <div
                className={styles.icon}
                onClick={handleGroupsCreatedByCurrentUser}
              >
                <EngTooltip text="Group Settings">
                  <MdSettings />
                </EngTooltip>
              </div>
            )}
            <div className={styles.icon} onClick={toggle}>
              <EngTooltip text="Close">
              <MdClose />
              </EngTooltip>
            </div>
          </div>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className={styles.modalBodyWrapper}>
          {!showGroupsCreatedByCurrentUser && (
            <div>
              <div className={styles.inputField}>
                <SimpleInput
                  name="name"
                  type="text"
                  placeholder={inputPlaceholder}
                  handleChange={handleChange}
                  value={value}
                  autoFocus
                  inputRef={inputRef}
                  autoComplete="off"
                />
              </div>
              {showButton && !groupCreated && (
                <div className={styles.buttonWrapper}>
                  <Button
                    text={buttonText}
                    onClick={handleSubmit}
                    disabled={value === "" || loading}
                    size="sm"
                    icon={<FaPlus />}
                    buttonStyle="primeButton"
                  />
                </div>
              )}
              {loadingSearchResult && groupCreated && searched && <Loader />}
              {!loadingSearchResult &&
                groupCreated &&
                searched &&
                searchedUsers.length > 0 && (
                  <div className={styles.searchUserResult}>
                    <ShowSearchResults
                      searchedUsers={searchedUsers}
                      totalSearchedUsers={totalSearchedUsers}
                      handleAddUserToGroup={handleAddUserToGroup}
                      addUsertoGroupLoadingId={addUsertoGroupLoadingId}
                      handleLoadMoreUsers={() =>
                        handleLoadMoreUsers(currentState.pageNo++)
                      }
                    />
                  </div>
                )}
              {!loadingSearchResult &&
                groupCreated &&
                searched &&
                searchedUsers.length === 0 && (
                  <div className={styles.padddingLoader}>
                    <NoData
                      text="There is no such username, Please search for other username."
                      buttonText="Create group"
                      button={false}
                      action={handleGroupsCreatedByCurrentUser}
                    />
                  </div>
                )}
            </div>
          )}

          {Object.keys(currentGroupBeingManged).length === 0 &&
            showGroupsCreatedByCurrentUser &&
            loadingGroupsOfCurrentUser && <Loader/>}
          {Object.keys(currentGroupBeingManged).length === 0 &&
            showGroupsCreatedByCurrentUser &&
            !loadingGroupsOfCurrentUser &&
            currentUsersGroups.length > 0 && (
              <div className={styles.searchUserResult}>
                <ShowGroupResults
                  currentUsersGroups={currentUsersGroups}
                  totalGroups={totalGroups}
                  handleManageGroup={handleManageGroup}
                  handleDeleteManageGroup={handleDeleteManageGroup}
                  handleLoadMoreGroups={() =>
                    handleLoadMoreGroups(currentState.pageNo++)
                  }
                />
              </div>
            )}
          {showGroupsCreatedByCurrentUser &&
            currentUsersGroups.length === 0 &&
            !loadingGroupsOfCurrentUser && (
              <div className={styles.padddingLoader}>
                <NoData
                  text="No groups added."
                  buttonText="Create group"
                  button={true}
                  action={handleGroupsCreatedByCurrentUser}
                />
              </div>
            )}

          {Object.keys(currentGroupBeingManged).length > 0 &&
            showGroupsCreatedByCurrentUser &&
            loadingCurrentUsersOfGroup && <Loader />}
          {Object.keys(currentGroupBeingManged).length > 0 &&
            showGroupsCreatedByCurrentUser &&
            managedGroupUsers.length > 0 &&
            !loadingCurrentUsersOfGroup && (
              <div className={styles.searchUserResult}>
                <ManageGroup
                  addUsertoGroupLoadingId={addUsertoGroupLoadingId}
                  users={managedGroupUsers}
                  handleUserOfMangeGroup={handleUserOfMangeGroup}
                />
              </div>
            )}
          {Object.keys(currentGroupBeingManged).length > 0 &&
            showGroupsCreatedByCurrentUser &&
            managedGroupUsers.length === 0 &&
            !loadingCurrentUsersOfGroup && (
              <div className={styles.padddingLoader}>
                <NoData text="No users added." />
              </div>
            )}
        </div>
      </ModalBody>
      {showConfirmModal && (
        <ConfirmModal
          id={groupToDelete.id}
          titleText={`Delete ${groupToDelete.groupName}`}
          bodyText="Are you sure? This can't be undone"
          handleDelete={handleDelete}
          toggle={handleConfirmToggle}
          show={showConfirmModal}
          loading={deleteGroupLoader}
          handleToggle={() => handleConfirmToggle()}
        />
      )}
    </Modal>
  );
};

export default AddDMOrGroupUsersModal;

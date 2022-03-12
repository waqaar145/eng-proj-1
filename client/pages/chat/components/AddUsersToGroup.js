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
import { MdAdd, MdDone } from 'react-icons/md'

const AddUsersTopGroup = ({ groupId }) => {
  const { currentState, handlePageChange } = usePagination();

  const dispatch = useDispatch();

  const currentSelectedGroup = useSelector(state => state.Chat.currentSelectedGroup);

  const getGroupInfo = async (groupId) => {
    try {
      let {
        data: { data },
      } = await chatService.getGroupInfo(groupId);
      let obj = {
        group: data,
      };
      dispatch({ type: chatActionTypes.CURRENT_SELECTED_GROUP, data: obj });
    } catch (error) {
      console.log(error);
    }
  };

  const mainRef = useRef(null);
  const userListRef = useRef(null);
  const [values, setValues] = useState({ name: "" });
  const [users, setUsers] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getGroupInfo(groupId);
    if (userListRef && userListRef.current) {
      userListRef.current.style.height =
        window.innerHeight - (mainRef?.current?.clientHeight + 70) + "px";
    }
  }, [groupId]);

  const handleChange = (target) => {
    const { name, value } = target;
    setValues({ ...values, [name]: value });
    setLoading(true);
    handleDebounce(value);
  };

  const handleSearchUsers = async (value) => {
    if (!value || value === "") {
      setLoading(false);
      setTotalResults(0);
      setUsers([]);
      return;
    }
    try {
      let params = { ...currentState, q: value };
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

  const handleDebounce = useCallback(
    debounce((nextValue) => handleSearchUsers(nextValue), 1000),
    []
  );

  const handleShowMore = () => {
    handleSearchUsers(values.name);
  };

  const handleAdd = async (userObj) => {
    let addUserToGroupObj = {
      groupId: currentSelectedGroup.id,
      userId: userObj.id
    }
    try {
      let {data: {data}} = await chatService.addUserToGroup(addUserToGroupObj)
      let updatedUsersList = users.map((user) => {
        if (user.id === data.userId) {
          return {
            ...user,
            added: data.new
          }
        }
        return user;
      })
      setUsers(updatedUsersList)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <div className={styles.wrapper} ref={mainRef}>
        <div className={styles.header}>
          <div className={styles.title}>Add Members to Group</div>
          <div className={styles.action}>
            <CloseIcon onClick={() => {}} />
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.inputBox}>
            <SimpleInput
              type="text"
              name="name"
              label="Search emails/usernames to add"
              placeholder="Type here..."
              handleChange={handleChange}
              value={values.name}
            />
          </div>
          {loading && (
            <>
              <div className={styles.separator}>
                <Spinner />
              </div>
            </>
          )}
          {users.length > 0 && !loading && (
            <>
              <div className={styles.separator}>Results ({totalResults})</div>
            </>
          )}
        </div>
      </div>
      <div className={styles.userList} ref={userListRef}>
        {values.name === "" && !loading && totalResults === 0 && (
          <div className={styles.resultAppearText}>
            Your results will appear here
          </div>
        )}
        {!loading && (
          <div className={styles.userContainer}>
            {users.map((user) => {
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
                        {user.firstName} {user.lastName}
                      </span>{" "}
                      <span className={styles.designation}>
                        ({user.designation})
                      </span>
                    </div>
                  </div>
                  <div className={styles.action}>
                    {
                      !user.added
                      &&
                      <SimpleButton
                        text="Add"
                        onClick={() => {handleAdd(user)}}
                        size="sm"
                        buttonStyle="primeButton"
                        icon={<MdAdd />}
                      />
                    }
                    {
                      user.added
                      &&
                      <SimpleButton
                        text="Added"
                        onClick={() => {}}
                        disabled={true}
                        size="sm"
                        buttonStyle="primeButton"
                        icon={<MdDone />}
                      />
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {totalResults > 0 && totalResults > users.length && !loading && (
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
            No users found
          </div>
        )}
      </div>
    </>
  );
};

export default AddUsersTopGroup;

import Modal from "./../../../src/components/Modal/main";
import {
  ModalHeader,
  ModalBody,
} from "./../../../src/components/Modal/ModalElements";
import styles from "./../../../src/assets/styles/chat/CreateGroup.module.scss";
import CloseIcon from "./../../../src/components/Extra/CloseIcon";
import SimpleInput from "../../../src/components/Form/SimpleInput";
import { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash.debounce";
import usePagination from "../../../src/hooks/usePagination";
import { chatService } from "../../../src/services";
import stylesSearch from "./../../../src/assets/styles/chat/AddUsersToGroup.module.scss";
import Spinner from "../../../src/components/Extra/Spinner";
import SimpleButton from "../../../src/components/Form/SimpleButton";
import { MdAdd } from 'react-icons/md';

const CreateDM = ({ show, toggle, groupId }) => {

  const userListRef = useRef(null)

  const { currentState, handlePageChange } = usePagination();

  const [values, setValues] = useState({ name: "" });
  const [users, setUsers] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userListRef && userListRef.current) {
      userListRef.current.style.height = "300px";
    }
  }, [groupId]);

  const handleChange = (target) => {
    const { name, value } = target;
    setValues({ ...values, [name]: value });
    setLoading(true);
    handleDebounce(value);
  };

  const handleDebounce = useCallback(
    debounce((nextValue) => handleSearchUsers(nextValue), 1000),
    []
  );

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

  const handleShowMore = () => {
    handleSearchUsers(values.name);
  };

  console.log(users)

  return (
    <Modal visible={show} toggle={toggle}>
      <ModalHeader>
        <div className={styles.headerContainer}>
          <div className={styles.title}>Add DM</div>
          <div className={styles.title}>
            <CloseIcon onClick={() => toggle()} />
          </div>
        </div>
      </ModalHeader>
      <ModalBody>
        <div className={styles.bodyContainer}>
          <div className={styles.formContainer}>
            <SimpleInput
              type="text"
              name="name"
              label={`Search usernames to add to your DMs`}
              placeholder="Type here..."
              handleChange={handleChange}
              value={values.name}
            />
          </div>
          <div className={stylesSearch.userList} ref={userListRef}>
            {values.name === "" && !loading && totalResults === 0 && (
              <div className={stylesSearch.resultAppearText}>
                Your results will appear here
              </div>
            )}
            {loading && (
              <>
                <div className={stylesSearch.separator}>
                  <Spinner />
                </div>
              </>
            )}
            {users.length > 0 && !loading && (
              <>
                <div className={stylesSearch.separator}>Results ({totalResults})</div>
              </>
            )}
            {!loading && (
              <div className={stylesSearch.userContainer}>
                {users.map((user) => {
                  return (
                    <div className={stylesSearch.userWrapper} key={user.id}>
                      <div className={stylesSearch.userInfo}>
                        <div className={stylesSearch.dp}>
                          <img
                            src={user.dp}
                            alt={`${user.firstName} ${user.lastName}`}
                          />
                        </div>
                        <div className={stylesSearch.nameAndDesination}>
                          <span className={stylesSearch.name}>
                            {user.firstName} {user.lastName}
                          </span>{" "}
                          <span className={stylesSearch.designation}>
                            ({user.designation})
                          </span>
                        </div>
                      </div>
                      <div className={stylesSearch.action}>
                        <SimpleButton
                          text="Message"
                          onClick={() => {}}
                          disabled={false}
                          size="sm"
                          buttonStyle="primeButton"
                          icon={<MdAdd />}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {totalResults > 0 && totalResults > users.length && !loading && (
              <div className={stylesSearch.showMore}>
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
              <div className={stylesSearch.noResultFound}>
                No users found, please search other users
              </div>
            )}
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default CreateDM;

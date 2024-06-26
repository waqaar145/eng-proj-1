import { useState } from "react";
import Link from "next/link";
import { FaCaretRight } from "@react-icons/all-files/fa/FaCaretRight";
import { FaPlus } from "@react-icons/all-files/fa/FaPlus";
import Loader from "./Loader";
import Button from "./../../../src/components/Form/Button";
import EngTooltip from "../../../src/components/Tooltip";
import { useDispatch } from "react-redux";
import { chatActionTypes } from "../../../src/store/chat/chat.actiontype";

const UsersList = ({
  styles,
  list,
  general,
  group,
  dm,
  handleAddUserOrGroupModal,
  handlePagination,
  groupId,
  extraChatCount,
}) => {
  if (list.loading) return <Loader color="spinner-secondary-color" />;

  const { name, chatList, totalEnteries, currentPage } = list;

  const [toggle, setToggle] = useState(false);

  const dispatch = useDispatch();

  const handleButtonClick = () => {
    dispatch({ type: chatActionTypes.THREAD_MESSAGE_ID, data: null });
  };

  return (
    <>
      <div className={styles.usersWrapper}>
        <div className={styles.groupHeader}>
          <div
            className={styles.groupHeaderName}
            onClick={() => setToggle(!toggle)}
          >
            <div className={`${styles.icon} ${toggle ? styles.active : ""}`}>
              <FaCaretRight />
            </div>
            <div>{name}</div>
          </div>
          {!general && (
            <EngTooltip text={dm ? "Add DMs" : group ? "Create Group" : ""}>
              <div
                className={styles.groupHeaderIcon}
                onClick={() => handleAddUserOrGroupModal({ group, dm })}
              >
                <FaPlus />
              </div>
            </EngTooltip>
          )}
        </div>
        {!toggle && (
          <div className={styles.groupBody}>
            {chatList.length > 0 ? (
              <ul>
                {chatList.map((l, i) => {
                  return (
                    <li key={name + String(i)}>
                      <Link
                        href={`/chat/chat?groupId=${l.uuid}`}
                        as={`/chat/CLIENT/${l.uuid}`}
                        passHref={true}
                      >
                        <a
                          className={`${styles.text} ${
                            l.uuid === groupId ? styles.dmActive : ""
                          }`}
                          onClick={() => handleButtonClick()}
                        >
                          <span className={`${dm ? "" : styles.name}`}>
                            {dm ? <img src={l.dp} alt={l.name} /> : "#"}{" "}
                            {l.name}
                          </span>
                          <span>
                            {l.uuid !== groupId && extraChatCount && extraChatCount[l.uuid] && (
                              <span
                                className={
                                  general
                                    ? styles.extraChatCountPublic
                                    : styles.extraChatCountPrivate
                                }
                              >
                                {extraChatCount[l.uuid]
                                  ? extraChatCount[l.uuid]
                                  : ""}
                              </span>
                            )}
                          </span>
                        </a>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className={styles.noData}>
                <div className={styles.message}>
                  {`You haven't ${dm ? "added" : "created/part of"} any ${
                    dm ? "DMs" : "group"
                  }`}
                </div>
                <div className={styles.action}>
                  <Button
                    text={`${dm ? "Add" : "Create"} ${dm ? "DM" : "group"}`}
                    onClick={() => handleAddUserOrGroupModal({ group, dm })}
                    size="sm"
                    buttonStyle="primeLigthButton"
                  />
                </div>
              </div>
            )}
          </div>
        )}
        {totalEnteries > chatList.length && chatList.length > 0 && (
          <div className={styles.loadMoreText}>
            <center>
              <Button
                text={`Load More ${dm ? "DMs" : group ? "Groups" : ""} +`}
                onClick={() => handlePagination({ group, dm, currentPage })}
                size="xs"
                buttonStyle="primeLigthButton"
              />
            </center>
          </div>
        )}
      </div>
    </>
  );
};

export default UsersList;

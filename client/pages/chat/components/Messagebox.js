import { MdMoreVert } from "@react-icons/all-files/md/MdMoreVert";
import { MdModeEdit } from "@react-icons/all-files/md/MdModeEdit";
import { MdDelete } from "@react-icons/all-files/md/MdDelete";
import { AiFillPushpin } from "@react-icons/all-files/ai/AiFillPushpin";
import { MdReportProblem } from "@react-icons/all-files/md/MdReportProblem";
import { BsChat } from "@react-icons/all-files/bs/BsChat";
import { BsArrowRightShort } from "@react-icons/all-files/bs/BsArrowRightShort";
import { MdReply } from "@react-icons/all-files/md/MdReply";
import { BsHandThumbsUp, BsHandThumbsUpFill } from "react-icons/bs";
import EngTooltip from "../../../src/components/Tooltip";

import Editor from "./../../../src/components/Form/InputEditor";
import Moment from "react-moment";

let MessageInputIdPrefix = "Message";

import { useEffect, useState } from "react";

const MessageBox = ({
  styles,
  handleProfileDetailModal,
  message,
  handleReply,
  child,
  isTabletOrMobile,
  viewReplies,
  replyModal,
  handleDeleteMessage,
  loggedInUser,
  editingAMessage,
  replyingToAMessage,
  getReplies,
  handleReaction
}) => {
  const [editingMessage, setEditingMessage] = useState(false);
  const [showMoreActionIcons, setShowMoreActionIcons] = useState(false);
  const [showReplyingEditor, setShowReplyingEditor] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const [value, setValue] = useState("");
  const [replyValue, setReplyValue] = useState("");

  const handleReplyAction = (message) => {
    setShowReplyingEditor(!showReplyingEditor)
    if (isTabletOrMobile) {
      handleReply(message);
    } else {
      setShowReplies(!showReplies);
    }
    if (message.totalReplies > 0) {
      getReplies(message, { pageNo: 1 });
    }
  };

  const handleReactionAction = (message) => {
    handleReaction(message)
  }

  useEffect(() => {
    setValue(message.message);
  }, []);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setValue(value);
  };

  const handleReplyOnChange = (e) => {
    const { name, value } = e.target;
    setReplyValue(value);
  };

  const editSuccessful = () => {
    setValue("");
    setEditingMessage(false);
  };

  const handleEditMessageKeypress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (value.trim()) {
        e.preventDefault();
        const messageEditObj = {
          id: message.id,
          message: value,
        };

        editingAMessage(messageEditObj, editSuccessful);
      }
    }
  };

  const replySuccessfull = () => {
    setReplyValue("");
    // setShowReplyingEditor(false);
    setShowReplies(true);
  };

  const handleReplyMessageKeypress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (value.trim()) {
        e.preventDefault();
        const messageReplyObj = {
          id: message.id,
          message: replyValue,
        };

        replyingToAMessage(messageReplyObj, replySuccessfull);
      }
    }
  };

  const handleEditingMessage = () => {
    if (showReplyingEditor) {
      setShowReplyingEditor(false);
    }
    setEditingMessage(!editingMessage);
    if (editingMessage) {
      setValue(message.message);
    }
    if (showMoreActionIcons) {
      setShowMoreActionIcons(!showMoreActionIcons);
    }
  };

  return (
    <div
      className={`${styles.messageWrapper} ${
        child ? styles.childMessages : ""
      }`}
    >
      <div className={`${styles.profilePicture}`}>
        <img
          className={`${styles.hoverClass}`}
          onClick={() => handleProfileDetailModal(message.userId)}
          src={message.dp}
        />
      </div>
      <div className={styles.profileNameAndMsg}>
        <div className={styles.profileName}>
          <span
            onClick={() => handleProfileDetailModal(message.userId)}
            className={styles.hoverClass}
          >
            {message.firstName} {message.lastName}{" "}
          </span>
          <span className={styles.messagedOn}>
            <EngTooltip
              text={
                <Moment format="MMMM Do YYYY, h:mm A">
                  {message.createdAt}
                </Moment>
              }
            >
              <Moment fromNow>{message.createdAt}</Moment>
            </EngTooltip>
          </span>
        </div>
        <div className={styles.msg}>
          {!editingMessage && <>{message.message}</>}
          {message.createdAt !== message.updatedAt && !editingMessage && (
            <span className={styles.messageEdited}>
              <EngTooltip text={<Moment format="MMMM Do YYYY, h:mm A">{message.updatedAt}</Moment>}>
                (Edited)
              </EngTooltip>
            </span>
          )}
          {editingMessage && (
            <div className={styles.replyEditorContainer}>
              <Editor
                name="editMessage"
                id={`edit-${MessageInputIdPrefix}${message.id}`}
                value={value}
                onChange={handleOnChange}
                onKeyPress={handleEditMessageKeypress}
              />
            </div>
          )}
        </div>
        <div className={styles.actionWrapper}>
          <div className={styles.like}>
            <div className={`${styles.icon} ${message.liked ? styles.liked : ''}`}>
              <EngTooltip text="Like">
                {
                  !message.liked
                  ?
                  <BsHandThumbsUp className={styles.iconHovAnimation} onClick={() => handleReactionAction(message)}/>
                  :
                  <BsHandThumbsUpFill className={styles.iconHovAnimation} onClick={() => handleReactionAction(message)}/>
                }
              </EngTooltip>
            </div>
            <div className={styles.count}>{message.totalLikes}</div>
          </div>
          {!child && !viewReplies && (
            <div
              className={styles.like}
              onClick={() => handleReplyAction(message)}
            >
              <div className={styles.icon}>
                <EngTooltip text="Replies">
                  <BsChat className={styles.iconHovAnimation}/>
                </EngTooltip>
              </div>
              {message.totalReplies > 0 && <div className={styles.count}>{message.totalReplies}</div>}
            </div>
          )}
          <div className={styles.action}>
            <div
              className={showMoreActionIcons ? styles.primary : styles.default}
            >
              <EngTooltip text="More Actions">
                <MdMoreVert
                  className={styles.iconHovAnimation}
                  onClick={() => setShowMoreActionIcons(!showMoreActionIcons)}
                />
              </EngTooltip>
            </div>
            {showMoreActionIcons && (
              <div className={styles.actionsIcons}>
                {loggedInUser.id === message.userId && (
                  <span
                    className={styles.primary}
                    onClick={() => handleEditingMessage()}
                  >
                    <EngTooltip text="Edit Message">
                      <MdModeEdit className={styles.iconHovAnimation}/>
                    </EngTooltip>
                  </span>
                )}
                {loggedInUser.id === message.userId && (
                  <span
                    className={styles.danger}
                    onClick={() => {
                      handleDeleteMessage(message);
                      setShowMoreActionIcons(!showMoreActionIcons);
                    }}
                  >
                    <EngTooltip text="Delete">
                      <MdDelete className={styles.iconHovAnimation}/>
                    </EngTooltip>
                  </span>
                )}
                <span className={styles.default}>
                  <EngTooltip text="Pin this Message">
                    <AiFillPushpin className={styles.iconHovAnimation}/>
                  </EngTooltip>
                </span>
                <span className={styles.default}>
                  <EngTooltip text="Report">
                    <MdReportProblem className={styles.iconHovAnimation}/>
                  </EngTooltip>
                </span>
              </div>
            )}
          </div>
        </div>
        {!child && showReplyingEditor && (
          <div className={styles.replyEditorContainer}>
            <Editor
              name="replyMessage"
              id={`reply-${MessageInputIdPrefix}${message.id}`}
              value={replyValue}
              onChange={handleReplyOnChange}
              onKeyPress={handleReplyMessageKeypress}
            />
          </div>
        )}
        {!isTabletOrMobile &&
          showReplies &&
          message.replies &&
          Object.keys(message.replies).length > 0 && (
            <div>
              <>
                {Object.keys(message.replies)
                  .reverse()
                  .map((messageId) => {
                    return (
                      <MessageBox
                        styles={styles}
                        handleProfileDetailModal={handleProfileDetailModal}
                        key={messageId}
                        message={message.replies[messageId]}
                        handleReply={handleReply}
                        isTabletOrMobile={isTabletOrMobile}
                        handleDeleteMessage={handleDeleteMessage}
                        loggedInUser={loggedInUser}
                        editingAMessage={editingAMessage}
                        child={true}
                        handleReaction={handleReaction}
                      />
                    );
                  })}
              </>
              {message.totalEnteries > Object.keys(message.replies).length && (
                <div
                  className={styles.viewMoreReplies}
                  onClick={() =>
                    getReplies(message, { pageNo: message.currentPage + 1 })
                  }
                >
                  <div className={styles.text}>
                    Show more replies (
                    {message.totalEnteries -
                      Object.keys(message.replies).length}
                    )
                  </div>
                  <div className={styles.icon}>
                    <BsArrowRightShort />
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default MessageBox;

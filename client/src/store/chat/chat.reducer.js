import { chatActionTypes } from "./chat.actiontype";

const initalState = {
  publicData: {
    loading: true,
    name: "",
    chatList: [],
    currentPage: 1,
    totalEnteries: 0
  },
  groupData: {
    loading: true,
    name: "",
    chatList: [],
    currentPage: 1,
    totalEnteries: 0
  },
  privateData: {
    loading: true,
    name: "",
    chatList: [],
    currentPage: 1,
    totalEnteries: 0
  },
  currentSelectedGroup: {},
  currenThreadMessageId: null,
  messageIdForRepliesActive: null,
  chats: {},
  extraChatCount: {},
  currentPage: 1,
  totalEnteries: 0
};

const convertArrayIntoObject = (array, key="id") => {
  let finalObj = {};
  for (let item of array) {
    finalObj = {...finalObj, [item[key].toString()]: item}
  }
  return finalObj;
}

const addToMessageReplies = (parentMessage, user) => {
  try {
    const {
      profileReplies
    } = parentMessage;
    const {
      userId: id,
      firstName,
      lastName,
      dp
    } = user;
    let obj = {
      id,
      name: firstName + ' ' + lastName,
      dp 
    }

    let dataInColumn = profileReplies;
    let profileRepliesArray = [];
    if (!dataInColumn || dataInColumn === null) {
      profileRepliesArray = [obj]
    } else {
      let userFound = false;
      for (let u of dataInColumn) {
        if (u.id === id) {
          userFound = true;
        }
      }
      if (userFound) {
        profileRepliesArray = [...dataInColumn.filter(u => u.id !== id), obj];
      } else {
        profileRepliesArray = [...dataInColumn, obj]
      }
    }

    let slicedArray = []
    if (profileRepliesArray.length > 3) {
      slicedArray = profileRepliesArray.slice(1);
    } else {
      slicedArray = profileRepliesArray;
    }
    return slicedArray;
  } catch (error) {
    console.log(error)
    return []
  }
}

export const Chat = (state = initalState, action = {}) => {

  switch (action.type) {

    case chatActionTypes.ADD_PUBLIC_GROUPS:

      const {
        chatList: chatListPublic, name: publicName, currentPage: publicPage
      } = action.data;

      return {
        ...state,
        publicData: {
          ...state.publicData,
          name: publicName,
          chatList: [...state.publicData.chatList, ...chatListPublic.data],
          // currentPage: publicPage,
          // totalEnteries: chatListPublic.totalEnteries,
          loading: false
        },
      };

    case chatActionTypes.ADD_GROUPS:

      const {
        chatList: chatListGroup, name: groupName, currentPage: groupPage
      } = action.data;

      return {
        ...state,
        groupData: {
          ...state.groupData,
          name: groupName,
          chatList: [...state.groupData.chatList, ...chatListGroup.data],
          // currentPage: groupPage,
          // totalEnteries: chatListGroup.totalEnteries,
          loading: false
        },
      };

    case chatActionTypes.REMOVE_GROUP:
      return {
        ...state,
        groupData: {
          ...state.groupData,
          chatList: state.groupData.chatList.filter(group => group.uuid !== action.data.groupId)
        }
      }

    case chatActionTypes.ADD_PRIVATES:

      const {
        chatList: chatListPrivate, name: privateName, currentPage: privatePage
      } = action.data;

      const sortedArray = [...state.privateData.chatList, ...chatListPrivate.data].sort(function(a, b) {
        if(a.name.toLowerCase() < b.name.toLowerCase()) return -1;
        if(a.name.toLowerCase() > b.name.toLowerCase()) return 1;
        return 0;
       })

      return {
        ...state,
        privateData: {
          ...state.privateData,
          name: privateName,
          chatList: sortedArray,
          // currentPage: privatePage,
          // totalEnteries: chatListPrivate.totalEnteries,
          loading: false
        },
      };

    case chatActionTypes.CURRENT_SELECTED_GROUP:
      return {
        ...state,
        currentSelectedGroup: {
          ...state.currentSelectedGroup,
          ...action.data.group
        }
      }

    case chatActionTypes.UPDATE_MEMBERS_COUNT_OF_CURRENT_GROUP:
      return {
        ...state,
        currentSelectedGroup: {
          ...state.currentSelectedGroup,
          members: state.currentSelectedGroup.members + action.data
        }
      }

    case chatActionTypes.THREAD_MESSAGE_ID:
      return {
        ...state,
        currenThreadMessageId: action.data
      }

    case chatActionTypes.CURRENT_CHAT_DATA:
      let chatsObjs = convertArrayIntoObject(action.data.chats);
      return {
        ...state,
        chats: action.data.currentPage === 1 ? chatsObjs : {...state.chats, ...chatsObjs},
        currentPage: action.data.currentPage,
        ...action.data.currentPage === 1 && {totalEnteries: action.data.totalEnteries}
      }

    case chatActionTypes.ADD_NEW_MESSAGE:
      const {
        currentSocketKey,
        message: messageObj
      } = action.data;
      let messageObjKeyValue = {
        [messageObj.id]: messageObj
      }
      if (state.currentSelectedGroup.uuid === currentSocketKey || currentSocketKey === null) {
        return {
          ...state,
          chats:  {
            ...state.chats, 
            ...messageObjKeyValue
          },
          totalEnteries: state.totalEnteries + 1
        }
      } else {
        if (!state.extraChatCount[currentSocketKey]) {
          return {
            ...state,
            extraChatCount: {
              ...state.extraChatCount,
              [currentSocketKey]: 1
            }
          }
        } else {
          return {
            ...state,
            extraChatCount: {
              ...state.extraChatCount,
              extraChatCount: state.extraChatCount[currentSocketKey] + 1
            }
          }
        }
      }

    case chatActionTypes.DELETE_MESSAGE:
      let chatsObj = state.chats
      if (action.data.parentId === null) {
        delete chatsObj[action.data.messageId]
        return {
          ...state,
          chats: {
            ...chatsObj
          },
          totalEnteries: state.totalEnteries - 1
        }
      } else {
        delete chatsObj[action.data.parentId].replies[action.data.messageId];
        return {
          ...state,
          chats: {
            ...chatsObj,
            [action.data.parentId]: {
              ...state.chats[action.data.parentId],
              totalEnteries: state.chats[action.data.parentId].totalEnteries - 1
            }
          }
        }
      }

    case chatActionTypes.UPDATE_MESSAGE:
      const { messageId, message, parentId, updatedAt } = action.data;
      if (parentId) {
        state.chats[parentId].replies[messageId].message = message;
        state.chats[parentId].replies[messageId].updatedAt = updatedAt;
      } else {
        state.chats[messageId].message = message;
        state.chats[messageId].updatedAt = updatedAt;
      }
      return {
        ...state,
        chats: state.chats
      }

    case chatActionTypes.THREAD_REPLIES:
      let repliesObjs = convertArrayIntoObject(action.data.chats);
      return {
        ...state,
        chats: {
          ...state.chats,
          [action.data.messageId]: {
            ...state.chats[action.data.messageId],
            replies: action.data.currentPage === 1 ? repliesObjs : {...state.chats[action.data.messageId].replies, ...repliesObjs},
            currentPage: action.data.currentPage,
            ...action.data.currentPage === 1 && {totalEnteries: action.data.totalEnteries}
          }
        }
      }

    case chatActionTypes.REPLY_MESSAGE:
      let repliesObjs1 = {
        [action.data.id]: action.data
      }
      let updatedProfileReplies = addToMessageReplies(state.chats[action.data.parentId], { 
        userId: action.data.userId, 
        firstName: action.data.firstName, 
        lastName: action.data.lastName, 
        dp:action.data.dp
      });

      return {
        ...state,
        chats: {
          ...state.chats,
          [action.data.parentId]: {
            ...state.chats[action.data.parentId],
            replies: 'replies' in state.chats[action.data.parentId] ? {...state.chats[action.data.parentId].replies, ...repliesObjs1} : {[action.data.id]: action.data},
            currentPage: 'replies' in state.chats[action.data.parentId] ? state.chats[action.data.parentId].currentPage + 1 : 1,
            totalEnteries: state.chats[action.data.parentId].totalEnteries + 1,
            totalReplies: state.chats[action.data.parentId].totalReplies + 1,
            profileReplies: updatedProfileReplies
          }
        }
      }

    case chatActionTypes.UPDATE_EMOJI_IN_MESSAGES:
      let skinTone = action.data.emoji.skin ? String(action.data.emoji.skin) : "0"; 
      let emojiIdToneString = action.data.emoji.id + "-" + skinTone;

      if (!action.data.parentId) {
        let messageReactionsObject = state.chats[action.data.messageId].reactions
        if (!messageReactionsObject) {
          messageReactionsObject = {
            [emojiIdToneString]: {
              count: action.data.count,
              me: action.data.me
            }
          }
        } else {
          if (action.data.count === 0 && !action.data.me && messageReactionsObject[emojiIdToneString]) {
            delete messageReactionsObject[emojiIdToneString]; // removing selected emoji object from reactions object
          } else {
            if (messageReactionsObject[emojiIdToneString]) {
              if (action.data.count > 0 && !action.data.me) {
                messageReactionsObject[emojiIdToneString].count = action.data.count;
                messageReactionsObject[emojiIdToneString].me = false
              } else {
                messageReactionsObject[emojiIdToneString].count = action.data.count;
                messageReactionsObject[emojiIdToneString].me = true
              }
            } else {
              messageReactionsObject = {
                ...messageReactionsObject,
                [emojiIdToneString]: {
                  count: action.data.count,
                  me: action.data.me
                }
              }
            }
          }
        }
        

        return {
          ...state,
          chats: {
            ...state.chats,
            [action.data.messageId]: {
              ...state.chats[action.data.messageId],
              reactions: messageReactionsObject
            }
          }
        }
      } else {
        let messageReactionsObject = state.chats[action.data.parentId].replies[action.data.messageId].reactions
        if (!messageReactionsObject) {
          messageReactionsObject = {
            [emojiIdToneString]: {
              count: action.data.count,
              me: action.data.me
            }
          }
        } else {
          if (action.data.count === 0 && !action.data.me && messageReactionsObject[emojiIdToneString]) {
            delete messageReactionsObject[emojiIdToneString]; // removing selected emoji object from reactions object
          } else {
            if (messageReactionsObject[emojiIdToneString]) {
              if (action.data.count > 0 && !action.data.me) {
                messageReactionsObject[emojiIdToneString].count = action.data.count;
                messageReactionsObject[emojiIdToneString].me = false
              } else {
                messageReactionsObject[emojiIdToneString].count = action.data.count;
                messageReactionsObject[emojiIdToneString].me = true
              }
            } else {
              messageReactionsObject = {
                ...messageReactionsObject,
                [emojiIdToneString]: {
                  count: action.data.count,
                  me: action.data.me
                }
              }
            }
          }
        }
        

        return {
          ...state,
          chats: {
            ...state.chats,
            [action.data.parentId]: {
              ...state.chats[action.data.parentId],
              replies: {
                ...state.chats[action.data.parentId].replies,
                [action.data.messageId]: {
                  ...state.chats[action.data.parentId].replies[action.data.messageId],
                  reactions: messageReactionsObject
                }
              }
            }
          }
        }
      }

    default:
      return state;
  }
};

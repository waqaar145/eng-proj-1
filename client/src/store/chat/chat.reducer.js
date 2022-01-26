import { chatActionTypes } from "./chat.actiontype";

const initalState = {
  publicData: {
    loading: false,
    name: "",
    chatList: [],
    currentPage: 1,
    totalEnteries: 0
  },
  groupData: {
    loading: false,
    name: "",
    chatList: [],
    currentPage: 1,
    totalEnteries: 0
  },
  privateData: {
    loading: false,
    name: "",
    chatList: [],
    currentPage: 1,
    totalEnteries: 0
  },
  currentSelectedGroup: {},
  messageIdForRepliesActive: null,
  chats: {},
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

export const Chat = (state = initalState, action = {}) => {

  switch (action.type) {

    case chatActionTypes.REQUEST_PUBLIC_DATA:
      return {
        ...state,
        publicData: {
          ...state.publicData,
          loading: true
        }
      }
  
    case chatActionTypes.REQUEST_GROUP_DATA:
      return {
        ...state,
        groupData: {
          ...state.groupData,
          loading: true
        }
      }

    case chatActionTypes.REQUEST_PRIVATE_DATA:
      return {
        ...state,
        privateData: {
          ...state.privateData,
          loading: true
        }
      }

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
          currentPage: publicPage,
          totalEnteries: chatListPublic.totalEnteries,
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
          currentPage: groupPage,
          totalEnteries: chatListGroup.totalEnteries,
          loading: false
        },
      };

    case chatActionTypes.ADD_PRIVATES:

      const {
        chatList: chatListPrivate, name: privateName, currentPage: privatePage
      } = action.data;

      return {
        ...state,
        privateData: {
          ...state.privateData,
          name: privateName,
          chatList: [...state.privateData.chatList, ...chatListPrivate.data],
          currentPage: privatePage,
          totalEnteries: chatListPrivate.totalEnteries,
          loading: false
        },
      };

    case chatActionTypes.CURRENT_SELECTED_GROUP:
      return {
        ...state,
        currentSelectedGroup: action.data.group
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
      return {
        ...state,
        chats:  {
          ...state.chats, 
          ...action.data
        },
        totalEnteries: state.totalEnteries + 1
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

    case chatActionTypes.CURRENT_MESSAGE_ID_ACTIVE_FOR_REPLIES_IN_MOBILE:
      return {
        ...state,
        messageIdForRepliesActive: action.data
      }

    case chatActionTypes.GET_REPLIES:
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
      return {
        ...state,
        chats: {
          ...state.chats,
          [action.data.parentId]: {
            ...state.chats[action.data.parentId],
            replies: 'replies' in state.chats[action.data.parentId] ? {...state.chats[action.data.parentId].replies, ...repliesObjs1} : {[action.data.id]: action.data},
            currentPage: 'replies' in state.chats[action.data.parentId] ? state.chats[action.data.parentId].currentPage + 1 : 1,
            totalEnteries: state.chats[action.data.parentId].totalEnteries + 1
          }
        }
      }

    case chatActionTypes.UPDATE_REACTION:
      const { messageId: mId, id, parentId: pId, liked, totalLikes } = action.data;
      if (pId) {
        state.chats[pId].replies[mId].liked = liked;
        state.chats[pId].replies[mId].totalLikes = totalLikes
      } else {
        state.chats[mId].liked = liked;
        state.chats[mId].totalLikes = totalLikes;
      }
      return {
        ...state,
        chats: state.chats
      }

    default:
      return state;
  }
};

import {HTTPClient} from './http.service';
const queryString = require('query-string');

export const chatService = {
  async createGroup(data) {
    try {
      const result = await HTTPClient.post('/api/v1/chat/group', data);
      return result;
    } catch(error) {
      throw error
    }
  },
  async searchUsers(groupId, params) {
    try {
      const result = await HTTPClient.get(`/api/v1/chat/group/users/${groupId}?${queryString.stringify(params)}`);
      return result;
    } catch(error) {
      throw error
    }
  },
  async getExistingUsers (groupId) {
    try {
      const result = await HTTPClient.get(`/api/v1/chat/group/existing/users/${groupId}`);
      return result;
    } catch(error) {
      throw error
    }
  },
  async addUserToGroup ({groupId, userId}) {
    try {
      const result = await HTTPClient.put(`/api/v1/chat/group/users/${groupId}/${userId}`);
      return result;
    } catch(error) {
      throw error
    }
  },
  async makeAdmin ({groupId, userId}) {
    try {
      const result = await HTTPClient.put(`/api/v1/chat/group/admin/${groupId}/${userId}`);
      return result;
    } catch(error) {
      throw error
    }
  },
  async leaveGroup (groupId) {
    try {
      const result = await HTTPClient.put(`/api/v1/chat/leave-group/users/${groupId}`);
      return result;
    } catch(error) {
      throw error
    }
  },
  async getGroupsCreatedByCurrentUser (data) {
    try {
      const result = await HTTPClient.get('/api/v1/chat/user-groups?' + queryString.stringify(data));
      return result;
    } catch(error) {
      throw error
    }
  },
  async getUsersOfGroup (id) {
    try {
      const result = await HTTPClient.get('/api/v1/chat/users-of-group/' + id);
      return result;
    } catch(error) {
      throw error
    }
  },
  async deleteGroup(id) {
    try {
      const result = await HTTPClient.delete('/api/v1/chat/group/' + id);
      return result;
    } catch(error) {
      throw error
    }
  },
  // Chat page - Fetching users for chatting
  async searchUsersForDM (params) {
    try {
      const result = await HTTPClient.get(`/api/v1/chat/search-users?${queryString.stringify(params)}`);
      return result;
    } catch(error) {
      throw error
    }
  },
  async addUserToDM (obj) {
    try {
      const result = await HTTPClient.post('/api/v1/chat/users', obj);
      return result;
    } catch(error) {
      throw error
    }
  },
  async getChatUsers (params) {
    try {
      const result = await HTTPClient.get('/api/v1/chat/users?' + queryString.stringify(params));
      return result;
    } catch(error) {
      throw error
    }
  },
  async getChats (id, params) {
    try {
      const result = await HTTPClient.get('/api/v1/chat/' + id + '?' + queryString.stringify(params));
      return result;
    } catch(error) {
      throw error
    }
  },
  async addChat (payload) {
    try {
      const result = await HTTPClient.post('/api/v1/chat', payload);
      return result;
    } catch(error) {
      throw error
    }
  },
  async updateChat (obj, id) {
    try {
      const result = await HTTPClient.put('/api/v1/chat/' + id, obj);
      return result;
    } catch(error) {
      throw error
    }
  },
  async deleteChat (id) {
    try {
      const result = await HTTPClient.delete('/api/v1/chat/' + id);
      return result;
    } catch(error) {
      throw error
    }
  },
  async getThreadReplies ({groupId, messageId}, params) {
    try {
      const result = await HTTPClient.get(`/api/v1/chat/replies/${groupId}/${messageId}?${queryString.stringify(params)}`);
      return result;
    } catch(error) {
      throw error
    }
  },
  // Reacting with Emoji
  async addEmojiReaction (messageId, obj) {
    try {
      const result = await HTTPClient.put(`/api/v1/chat/message/reaction/${messageId}`, obj);
      return result;
    } catch(error) {
      throw error
    }
  },
}
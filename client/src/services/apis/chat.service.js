import {HTTPClient} from './http.service';
const queryString = require('query-string');

export const chatService = {
  async createGroup(data) {
    try {
      const result = await HTTPClient.post('/api/v1/chat/create-group', data);
      return result;
    } catch(error) {
      throw error
    }
  },
  async searchUsers(data) {
    try {
      const result = await HTTPClient.get('/api/v1/chat/search-users?' + queryString.stringify(data));
      return result;
    } catch(error) {
      throw error
    }
  },
  async addUserToGroup (data) {
    try {
      const result = await HTTPClient.post('/api/v1/chat/add-user-to-group', data);
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
  async addChat (data) {
    try {
      const result = await HTTPClient.post('/api/v1/chat', data);
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
import { create } from "zustand";

export const useChatStore = create((set) => ({
  users: [],
  messages: [],
  selectedUser: null,
  onlineUsers: [],

  setUsers: (users) => set({ users }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setSelectedUser: (user) =>
    set({
      selectedUser: user,
      messages: [],
    }),

  setOnlineUsers: (userIds) =>
    set({
      onlineUsers: userIds,
    }),

  updateMessageSeen: (messageId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === messageId ? { ...msg, seen: true } : msg
      ),
    })),

  updateUserUnseenCount: (userId, count) =>
    set((state) => ({
      users: state.users.map((user) =>
        user._id === userId ? { ...user, unseenCount: count } : user
      ),
    })),
}));
import { useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { connectSocket, disconnectSocket } from '../lib/socket';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import toast from 'react-hot-toast';

export default function Chat() {
  const user = useAuthStore((state) => state.user);
  const setUsers = useChatStore((state) => state.setUsers);
  const addMessage = useChatStore((state) => state.addMessage);
  const setOnlineUsers = useChatStore((state) => state.setOnlineUsers);
  const socketSetup = useRef(false);

  useEffect(() => {
    if (user) {
      fetchUsers();

      // Socket sirf ek baar setup karo
      if (!socketSetup.current) {
        socketSetup.current = true;
        setupSocket();
      }
    }

    return () => {
      disconnectSocket();
      socketSetup.current = false;
    };
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/messages/sidebar');
      // Server returns { success, users, unseenMessages }
      const usersData = response.data.users || response.data;
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error('Failed to fetch users');
    }
  };

  const setupSocket = () => {
    if (!user) return;

    const socket = connectSocket(user._id);

    socket.on('getOnlineUsers', (userIds) => {
      setOnlineUsers(userIds);
    });

    socket.on('newMessage', (message) => {
      addMessage(message);
    });
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}
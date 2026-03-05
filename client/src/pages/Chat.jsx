import { useEffect } from 'react';
import { api } from '../lib/api';
import { connectSocket } from '../lib/socket';
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

  useEffect(() => {
    if (user) {
      fetchUsers();
      setupSocket();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/messages/sidebar');
      setUsers(response.data);
    } catch (error) {
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
      toast.success('New message received');
    });

    return () => {
      socket.off('getOnlineUsers');
      socket.off('newMessage');
    };
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}
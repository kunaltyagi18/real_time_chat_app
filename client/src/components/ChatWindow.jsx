import { useState, useEffect, useRef } from 'react';
import { Send, Image as ImageIcon, User, Check, CheckCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function ChatWindow() {
  const selectedUser = useChatStore((state) => state.selectedUser);
  const messages = useChatStore((state) => state.messages);
  const setMessages = useChatStore((state) => state.setMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const currentUser = useAuthStore((state) => state.user);
  const onlineUsers = useChatStore((state) => state.onlineUsers);

  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/${selectedUser?._id}`);
      // Server returns { success, messages }
      const msgs = response.data.messages || response.data;
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch (error) {
      toast.error('Failed to fetch messages');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) return;

    setIsLoading(true);
    try {
      let response;

      if (imageFile) {
        // Image hai → multipart/form-data
        const formData = new FormData();
        if (text.trim()) formData.append('text', text.trim());
        formData.append('image', imageFile);

        response = await api.post(
          `/messages/send/${selectedUser?._id}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        // Sirf text → JSON
        response = await api.post(
          `/messages/send/${selectedUser?._id}`,
          { text: text.trim() }
        );
      }

      // Server returns { success, newMessage }
      const newMsg = response.data.newMessage || response.data;
      addMessage(newMsg);
      setText('');
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Send message error:', error.response?.data);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">Welcome to Chat</h3>
          <p className="text-gray-400">Select a user to start messaging</p>
        </div>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="flex-1 flex flex-col bg-gray-900 h-full">
      {/* Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
            {selectedUser.profilePic ? (
              <img src={selectedUser.profilePic} alt={selectedUser.fullName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-gray-400" />
            )}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
          )}
        </div>
        <div>
          <h3 className="text-white font-semibold">{selectedUser.fullName}</h3>
          <p className="text-gray-400 text-sm">{isOnline ? 'Online' : 'Offline'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === currentUser?._id;
          return (
            <div key={message._id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isOwnMessage ? 'bg-green-600' : 'bg-gray-800'} rounded-lg p-3`}>
                {message.image && (
                  <img src={message.image} alt="Message attachment" className="rounded-lg mb-2 max-w-full" />
                )}
                {message.text && (
                  <p className="text-white break-words">{message.text}</p>
                )}
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-xs text-gray-300">{formatTime(message.createdAt)}</span>
                  {isOwnMessage && (
                    <span className="text-gray-300">
                      {message.seen ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
            <button
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <ImageIcon className="w-5 h-5 text-gray-400" />
          </button>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={isLoading || (!text.trim() && !imageFile)}
            className="p-2 bg-green-500 hover:bg-green-600 rounded-full transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
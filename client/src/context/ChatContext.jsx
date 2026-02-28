import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const ChatContext = createContext(null)

export const useChat = () => useContext(ChatContext)

export const ChatProvider = ({ children }) => {
  const { user, token, API } = useAuth()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [unseenMessages, setUnseenMessages] = useState({})
  const [onlineUsers, setOnlineUsers] = useState([])
  const socketRef = useRef(null)

  // Connect socket when user logs in
  useEffect(() => {
    if (!user) return

    const socket = io('http://localhost:5000', {
      query: { userId: user._id }
    })
    socketRef.current = socket

    socket.on('getOnlineUsers', (users) => setOnlineUsers(users))

    socket.on('newMessage', (message) => {
      setMessages((prev) => {
        if (prev.some(m => m._id === message._id)) return prev
        return [...prev, message]
      })
      setUnseenMessages((prev) => ({
        ...prev,
        [message.senderId]: (prev[message.senderId] || 0) + 1
      }))
    })

    return () => socket.disconnect()
  }, [user])

  // Fetch sidebar users
  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/messages/sidebar')
      if (data.success) {
        setUsers(data.users)
        setUnseenMessages(data.unseenMessages || {})
      }
    } catch (err) {
      toast.error('Failed to load users')
    }
  }

  useEffect(() => {
    if (token) fetchUsers()
  }, [token])

  // Fetch messages with selected user
  const fetchMessages = async (userId) => {
    try {
      const { data } = await API.get(`/messages/${userId}`)
      if (data.success) {
        setMessages(data.messages)
        setUnseenMessages((prev) => ({ ...prev, [userId]: 0 }))
      }
    } catch (err) {
      toast.error('Failed to load messages')
    }
  }

  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser._id)
    else setMessages([])
  }, [selectedUser])

  const sendMessage = async (formData) => {
    if (!selectedUser) return
    try {
      const { data } = await API.post(`/messages/send/${selectedUser._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (data.success) {
        setMessages((prev) => {
          if (prev.some(m => m._id === data.newMessage._id)) return prev
          return [...prev, data.newMessage]
        })
      }
    } catch (err) {
      toast.error('Failed to send message')
    }
  }

  return (
    <ChatContext.Provider value={{
      users, selectedUser, setSelectedUser,
      messages, unseenMessages,
      onlineUsers, sendMessage, fetchUsers
    }}>
      {children}
    </ChatContext.Provider>
  )
}
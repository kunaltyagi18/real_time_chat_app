import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth, API } from './AuthContext'
import toast from 'react-hot-toast'

const ChatContext = createContext(null)

export const useChat = () => useContext(ChatContext)

export const ChatProvider = ({ children }) => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [onlineUsers, setOnlineUsers] = useState([])
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      return
    }

    const socket = io('http://localhost:5000', {
      query: { userId: user._id }
    })
    socketRef.current = socket

    socket.on('getOnlineUsers', (userIds) => setOnlineUsers(userIds))

    socket.on('newMessage', (message) => {
      setMessages((prev) => {
        if (prev.some(m => m._id === message._id)) return prev
        return [...prev, message]
      })
      setUsers((prev) =>
        prev.map((u) =>
          u._id === message.senderId
            ? { ...u, unseenCount: (u.unseenCount || 0) + 1 }
            : u
        )
      )
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/messages/sidebar')
      if (data.success) {
        const usersWithUnseen = data.users.map((u) => ({
          ...u,
          unseenCount: data.unseenMessages?.[u._id] || 0
        }))
        setUsers(usersWithUnseen)
      }
    } catch {
      toast.error('Failed to load users')
    }
  }

  useEffect(() => {
    if (user) fetchUsers()
    else setUsers([])
  }, [user])

  const fetchMessages = async (userId) => {
    try {
      const { data } = await API.get(`/messages/${userId}`)
      if (data.success) {
        setMessages(data.messages)
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, unseenCount: 0 } : u))
        )
      }
    } catch {
      toast.error('Failed to load messages')
    }
  }

  useEffect(() => {
    if (selectedUser) fetchMessages(selectedUser._id)
    else setMessages([])
  }, [selectedUser])

  const sendMessage = async ({ text, imageFile }) => {
    if (!selectedUser) return
    try {
      let response

      if (imageFile) {
        // Has image → multipart/form-data
        const formData = new FormData()
        if (text) formData.append('text', text)
        formData.append('image', imageFile)
        const { data } = await API.post(
          `/messages/send/${selectedUser._id}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        response = data
      } else {
        // Text only → JSON
        const { data } = await API.post(
          `/messages/send/${selectedUser._id}`,
          { text }
        )
        response = data
      }

      if (response.success) {
        setMessages((prev) => {
          if (prev.some(m => m._id === response.newMessage._id)) return prev
          return [...prev, response.newMessage]
        })
      }
    } catch {
      toast.error('Failed to send message')
    }
  }

  const selectUser = (user) => {
    setSelectedUser(user)
    setMessages([])
  }

  return (
    <ChatContext.Provider value={{
      users,
      selectedUser,
      setSelectedUser: selectUser,
      messages,
      onlineUsers,
      sendMessage,
      fetchUsers
    }}>
      {children}
    </ChatContext.Provider>
  )
}
import { User, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const navigate = useNavigate()
  const { users, selectedUser, setSelectedUser, onlineUsers } = useChat()
  const { user: currentUser } = useAuth()

  return (
    <div className="w-full md:w-80 bg-gray-800 border-r border-gray-700 flex flex-col h-full">
      <div className="p-4 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
            {currentUser?.profilePic ? (
              <img
                src={currentUser.profilePic}
                alt={currentUser.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <h2 className="text-white font-semibold">{currentUser?.fullName}</h2>
          </div>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {users.length === 0 ? (
          <div className="p-4 text-center text-gray-400">No users available</div>
        ) : (
          <div className="divide-y divide-gray-700">
            {users.map((user) => (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-700 transition-colors ${
                  selectedUser?._id === user._id ? 'bg-gray-700' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                    {user.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  {onlineUsers.includes(user._id) && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium">{user.fullName}</h3>
                    {user.unseenCount > 0 && (
                      <span className="bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {user.unseenCount}
                      </span>
                    )}
                  </div>
                  {user.bio && (
                    <p className="text-gray-400 text-sm truncate">{user.bio}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
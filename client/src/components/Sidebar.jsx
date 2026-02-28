import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import styles from './Sidebar.module.css'

const Avatar = ({ src, name, size = 40, online }) => {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'
  const colors = ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a']
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0]

  return (
    <div className={styles.avatarWrapper} style={{ width: size, height: size }}>
      {src ? (
        <img src={src} alt={name} className={styles.avatarImg} />
      ) : (
        <div className={styles.avatarFallback} style={{ background: color, fontSize: size * 0.35 }}>
          {initials}
        </div>
      )}
      {online && <span className={styles.onlineDot} />}
    </div>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { users, selectedUser, setSelectedUser, unseenMessages, onlineUsers } = useChat()
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const filtered = users.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.brandMark}>
            <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
              <path d="M4 8C4 6.9 4.9 6 6 6H18C19.1 6 20 6.9 20 8V16C20 17.1 19.1 18 18 18H14L10 21V18H6C4.9 18 4 17.1 4 16V8Z" fill="var(--blue-500)"/>
            </svg>
            <span>ChatFlow</span>
          </div>
          <div className={styles.headerActions}>
            <button onClick={() => navigate('/profile')} className={styles.iconBtn} title="Profile">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </button>
            <button onClick={logout} className={styles.iconBtn} title="Logout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Current User */}
        <div className={styles.me}>
          <Avatar src={user?.profilePic} name={user?.fullName} size={36} />
          <div className={styles.meInfo}>
            <span className={styles.meName}>{user?.fullName}</span>
            <span className={styles.meStatus}>
              <span className={styles.statusDot} />
              Online
            </span>
          </div>
        </div>

        {/* Search */}
        <div className={styles.search}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" className={styles.searchIcon}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Users List */}
      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" style={{color: 'var(--gray-300)'}}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            <p>No users found</p>
          </div>
        ) : (
          filtered.map(u => {
            const isOnline = onlineUsers.includes(u._id)
            const unseen = unseenMessages[u._id] || 0
            const isActive = selectedUser?._id === u._id

            return (
              <button
                key={u._id}
                className={`${styles.userItem} ${isActive ? styles.active : ''}`}
                onClick={() => setSelectedUser(u)}
              >
                <Avatar src={u.profilePic} name={u.fullName} size={44} online={isOnline} />
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{u.fullName}</span>
                  <span className={styles.userBio}>{u.bio || 'Hey there!'}</span>
                </div>
                <div className={styles.userMeta}>
                  {unseen > 0 && (
                    <span className={styles.badge}>{unseen > 9 ? '9+' : unseen}</span>
                  )}
                  {isOnline && !unseen && (
                    <span className={styles.onlineTag}>active</span>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span>{onlineUsers.length} online</span>
        <span>•</span>
        <span>{users.length} contacts</span>
      </div>
    </div>
  )
}
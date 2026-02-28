import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import styles from './ChatWindow.module.css'

const Avatar = ({ src, name, size = 36 }) => {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'
  const colors = ['#3b82f6', '#2563eb', '#1d4ed8']
  const color = colors[name?.charCodeAt(0) % colors.length] || colors[0]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: size * 0.35, fontWeight: 700 }}>
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </div>
  )
}

const formatTime = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'long', day: 'numeric' })
}

export default function ChatWindow() {
  const { user } = useAuth()
  const { selectedUser, messages, sendMessage, onlineUsers } = useChat()
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [sending, setSending] = useState(false)
  const endRef = useRef(null)
  const fileRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim() && !image) return
    setSending(true)
    const fd = new FormData()
    if (text.trim()) fd.append('text', text.trim())
    if (image) fd.append('image', image)
    setText('')
    setImage(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
    await sendMessage(fd)
    setSending(false)
    textRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  if (!selectedUser) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyContent}>
          <div className={styles.emptyIcon}>
            <svg viewBox="0 0 64 64" fill="none" width="64" height="64">
              <circle cx="32" cy="32" r="32" fill="var(--blue-50)"/>
              <path d="M14 24C14 21.8 15.8 20 18 20H46C48.2 20 50 21.8 50 24V40C50 42.2 48.2 44 46 44H36L28 50V44H18C15.8 44 14 42.2 14 40V24Z" fill="var(--blue-200)"/>
              <circle cx="24" cy="32" r="2" fill="var(--blue-400)"/>
              <circle cx="32" cy="32" r="2" fill="var(--blue-400)"/>
              <circle cx="40" cy="32" r="2" fill="var(--blue-400)"/>
            </svg>
          </div>
          <h3>Select a conversation</h3>
          <p>Choose someone from the sidebar to start chatting</p>
        </div>
      </div>
    )
  }

  const isOnline = onlineUsers.includes(selectedUser._id)

  // Group messages by date
  const groups = []
  let currentDate = null
  messages.forEach(msg => {
    const d = formatDate(msg.createdAt)
    if (d !== currentDate) {
      groups.push({ type: 'date', label: d })
      currentDate = d
    }
    groups.push({ type: 'msg', msg })
  })

  return (
    <div className={styles.window}>
      {/* Top bar */}
      <div className={styles.topbar}>
        <div className={styles.topbarUser}>
          <Avatar src={selectedUser.profilePic} name={selectedUser.fullName} size={40} />
          <div>
            <div className={styles.topbarName}>{selectedUser.fullName}</div>
            <div className={styles.topbarStatus}>
              {isOnline
                ? <><span className={styles.dot} style={{background:'#22c55e'}}/>Online</>
                : <><span className={styles.dot} style={{background:'var(--gray-300)'}}/>Offline</>
              }
            </div>
          </div>
        </div>
        <div className={styles.topbarBio}>{selectedUser.bio}</div>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {groups.length === 0 && (
          <div className={styles.noMessages}>
            <p>No messages yet. Say hello! 👋</p>
          </div>
        )}
        {groups.map((item, i) => {
          if (item.type === 'date') {
            return (
              <div key={`date-${i}`} className={styles.dateDivider}>
                <span>{item.label}</span>
              </div>
            )
          }
          const { msg } = item
          const isMine = msg.senderId === user._id
          return (
            <div key={msg._id} className={`${styles.msgRow} ${isMine ? styles.mine : styles.theirs}`}>
              {!isMine && <Avatar src={selectedUser.profilePic} name={selectedUser.fullName} size={28} />}
              <div className={styles.msgContent}>
                {msg.image && (
                  <div className={styles.msgImg}>
                    <img src={msg.image} alt="attachment" onClick={() => window.open(msg.image, '_blank')} />
                  </div>
                )}
                {msg.text && (
                  <div className={`${styles.bubble} ${isMine ? styles.bubbleMine : styles.bubbleTheirs}`}>
                    {msg.text}
                  </div>
                )}
                <div className={`${styles.msgMeta} ${isMine ? styles.metaMine : ''}`}>
                  <span>{formatTime(msg.createdAt)}</span>
                  {isMine && (
                    <span className={styles.seen}>
                      {msg.seen
                        ? <svg viewBox="0 0 16 10" fill="none" width="16" height="10"><path d="M1 5l4 4 9-8" stroke="var(--blue-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 5l4 4 5-5" stroke="var(--blue-500)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        : <svg viewBox="0 0 12 10" fill="none" width="12" height="10"><path d="M1 5l4 4 6-8" stroke="var(--gray-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      }
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {/* Input area */}
      <div className={styles.inputArea}>
        {preview && (
          <div className={styles.previewArea}>
            <img src={preview} alt="preview" className={styles.previewImg} />
            <button
              className={styles.removePreview}
              onClick={() => { setPreview(null); setImage(null); if (fileRef.current) fileRef.current.value = '' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className={styles.form}>
          <input type="file" ref={fileRef} accept="image/*" onChange={handleImage} hidden />
          <button type="button" className={styles.attachBtn} onClick={() => fileRef.current?.click()} title="Attach image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <path d="M21 15l-5-5L5 21"/>
            </svg>
          </button>
          <textarea
            ref={textRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${selectedUser.fullName}...`}
            className={styles.textarea}
            rows={1}
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={sending || (!text.trim() && !image)}
          >
            {sending ? (
              <span className={styles.spinner} />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
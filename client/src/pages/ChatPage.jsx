import Sidebar from '../components/Sidebar.jsx'
import ChatWindow from '../components/ChatWindow.jsx'

export default function ChatPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <ChatWindow />
    </div>
  )
}
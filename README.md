# 💬 ChatFlow — Full-Stack Real-Time Chat App

A modern real-time chat application built with **React** (frontend) and **Express + Socket.io + MongoDB** (backend).

---

## 📁 Project Structure

```
ChatFlow/
├── client/                     # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx         # User list, search, online status
│   │   │   ├── Sidebar.module.css
│   │   │   ├── ChatWindow.jsx      # Message area + input
│   │   │   └── ChatWindow.module.css
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Auth state + API calls
│   │   │   └── ChatContext.jsx     # Chat state + Socket.io
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── Auth.module.css
│   │   │   └── ChatPage.module.css
│   │   │   └── ProfilePage.module.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── server/                     # Express Backend (existing)
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── server.js
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

---

### 1. Setup Server

```bash
cd server
npm install
```

Create a `.env` file in `/server`:

```env
MONGO_URI=mongodb://localhost:27017/chatflow
JWT_SECRET=your_super_secret_key_here
PORT=5000
```

Start the server:

```bash
npm run dev
# Server runs on http://localhost:5000
```

---

### 2. Setup Client

```bash
cd client
npm install
npm run dev
# Client runs on http://localhost:3000
```

> The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000` automatically — no CORS issues!

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Auth | JWT-based login & signup |
| 💬 Real-time chat | Socket.io bidirectional messaging |
| 🟢 Online status | Live presence indicator |
| 🖼️ Image sharing | Upload and send images in chat |
| 👤 Profile editing | Update name, bio, profile photo |
| 🔔 Unseen count | Badge showing unread messages |
| 📱 Responsive | Works on mobile and desktop |
| 🔍 Search | Filter users by name |
| ✅ Read receipts | Single/double tick indicators |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with hooks
- **React Router v6** — client-side routing
- **Socket.io-client** — real-time events
- **Axios** — HTTP requests
- **React Hot Toast** — notifications
- **Vite** — dev server & bundler
- **CSS Modules** — scoped styling

### Backend (existing)
- **Express 5** — REST API
- **Socket.io** — WebSocket server
- **MongoDB + Mongoose** — database
- **JWT** — authentication
- **Multer** — file uploads
- **bcryptjs** — password hashing

---

## 🔌 API Endpoints Used

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/check` | Verify token |
| PUT | `/api/auth/update-profile` | Update profile |
| GET | `/api/messages/sidebar` | Get all users + unseen counts |
| GET | `/api/messages/:id` | Get messages with user |
| POST | `/api/messages/send/:id` | Send a message |

---

## 🔧 Environment Variables

### Server (`server/.env`)

```env
MONGO_URI=mongodb://localhost:27017/chatflow
JWT_SECRET=your_jwt_secret
PORT=5000
```

---

## 🐛 Common Issues

**Port conflict**
- Server must run on port `5000` (Vite proxy is configured for this)
- Client runs on port `3000`

**Images not loading**
- Make sure `uploads/` folder exists in server directory (auto-created on first upload)
- Vite proxy handles `/uploads` routing

**MongoDB connection error**
- Check your `MONGO_URI` in `.env`
- Make sure MongoDB is running locally or your Atlas cluster is accessible

---

## 📦 Build for Production

```bash
# Build client
cd client
npm run build

# Serve built files from Express (add to server.js):
# app.use(express.static('../client/dist'))
```

---

## 🎨 Design

- **Blue & white** color palette with gradient accents
- **Plus Jakarta Sans** typography
- Smooth animations & micro-interactions
- CSS custom properties for consistent theming
- Mobile-responsive layout

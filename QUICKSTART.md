# 🚀 Virtual City - Quick Start Guide

## What is Virtual City?

A **full-stack social platform** combining Discord chat, Roblox-style groups, and life simulator mechanics. Features include real-time chat, apartments, marketplace, economy system, clans, and mini-games.

**Perfect for:** Portfolio showcase, learning full-stack development, or building a gaming community platform.

---

## ⚡ 60-Second Startup

### 1. Terminal 1 - Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Terminal 2 - Frontend
```bash
cd frontend
npm install
npm start
```

✅ **That's it!** Frontend opens at `http://localhost:3000`

---

## 🎮 Features to Try

| Feature | How to Access | What It Does |
|---------|---------------|-------------|
| **Chat** | Dashboard → Chat tab | Real-time WebSocket messaging |
| **Marketplace** | Dashboard → Marketplace | Buy/sell items with filters |
| **Apartment** | Dashboard → Apartment | Drag furniture to customize room |
| **Clans** | Dashboard → Clans | Create/join player groups |
| **Inventory** | Dashboard → Inventory | View owned items |
| **Games** | Dashboard → Games | Mini-games (chess, blackjack, etc) |
| **Admin** | (Admin users only) | Manage users, ban, stats |

---

## 📋 Project Contents

### Backend (`./backend`)
- ✅ Express REST API
- ✅ MongoDB database setup
- ✅ JWT authentication
- ✅ WebSocket real-time chat
- ✅ Marketplace system
- ✅ Economy & coins
- ✅ Clans/groups
- ✅ Admin panel API
- ✅ User profiles & inventory

**Models:**
- User (profiles, stats, inventory)
- Item (furniture, decorations)
- Message (chat history)
- Clan (groups)
- MarketplaceListing (items for sale)

### Frontend (`./frontend`)
- ✅ React 18 with Hooks
- ✅ Tailwind CSS styling
- ✅ Framer Motion animations
- ✅ Socket.IO integration
- ✅ React Router navigation
- ✅ Context API (Auth, Chat)

**Pages:**
- Landing page
- Login/Register
- Dashboard (hub)
- Chat interface
- Marketplace browser
- Apartment customizer
- Clan manager

---

## 🔧 Environment Setup

### Backend `.env`
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/virtual-city
JWT_SECRET=your-random-secret-key-here
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:5000
```

---

## 📚 File Structure

```
virtual-city/
│
├── backend/
│   ├── models/              ← Database schemas
│   │   ├── User.js
│   │   ├── Item.js
│   │   ├── Message.js
│   │   ├── Clan.js
│   │   └── MarketplaceListing.js
│   │
│   ├── routes/              ← API endpoints
│   │   ├── auth.js          (login, register)
│   │   ├── users.js         (profiles, leaderboard)
│   │   ├── chat.js          (messaging)
│   │   ├── inventory.js     (items)
│   │   ├── marketplace.js   (buying/selling)
│   │   ├── apartments.js    (decoration)
│   │   ├── clans.js         (groups)
│   │   └── admin.js         (moderation)
│   │
│   ├── middleware/
│   │   └── auth.js          ← JWT verification
│   │
│   ├── server.js            ← Main app + WebSocket
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   └── Dashboard.js
│   │   │
│   │   ├── components/
│   │   │   ├── Chat.js
│   │   │   ├── Marketplace.js
│   │   │   ├── Apartment.js
│   │   │   ├── Clans.js
│   │   │   ├── Inventory.js
│   │   │   ├── GameArea.js
│   │   │   └── AdminPanel.js
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.js   ← Login state
│   │   │   └── ChatContext.js   ← WebSocket
│   │   │
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   │
│   ├── public/
│   │   └── index.html
│   │
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example
│
├── docker-compose.yml
├── README.md
├── SETUP.md
└── .gitignore
```

---

## 🌐 API Endpoints Reference

### Auth
```
POST /api/auth/register       Register new user
POST /api/auth/login          Login user
GET  /api/auth/verify         Check token validity
```

### Users
```
GET  /api/users/me            Get your profile
GET  /api/users/profile/:id   Get user profile
PUT  /api/users/update        Update your info
POST /api/users/friend/add    Add friend
GET  /api/users/leaderboard   Get top 100 players
```

### Chat (WebSocket + REST)
```
GET  /api/chat/global         Get 50 recent messages
POST /api/chat/send           Send message
```

### Marketplace
```
GET  /api/marketplace         Get all listings
POST /api/marketplace/create  Create listing
POST /api/marketplace/buy     Buy item
```

### Inventory
```
GET  /api/inventory           Get your items
POST /api/inventory/add       Add item
```

### Clans
```
GET  /api/clans               List all clans
POST /api/clans/create        Create clan
POST /api/clans/join/:id      Join clan
POST /api/clans/leave         Leave clan
```

### Admin
```
POST /api/admin/ban/:userId   Ban user
GET  /api/admin/stats         Get site stats
```

---

## 🧪 Test the System

### 1. Create Account
- Go to http://localhost:3000
- Click "Sign Up"
- Enter: username, email, password
- Account created with 1000 starting coins

### 2. Test Chat
- Go to "Chat" tab
- See yourself online
- Type message and send
- Real-time sync across connected users

### 3. Test Marketplace
- Click "Marketplace"
- Filter by rarity or price
- Click "Buy Now"
- Coins deducted, item added to inventory

### 4. Test Apartment
- Go to "Apartment"
- Drag furniture from right to room
- Position on canvas
- Delete with X button
- Changes saved

### 5. Test Clans
- Go to "Clans"
- Click "Create Clan"
- Enter clan name
- Join other clans
- Leave and rejoin

---

## 🔐 Authentication Flow

```
1. User enters credentials
2. Backend validates & hashes password
3. JWT token generated (30-day expiry)
4. Token stored in localStorage
5. All API calls include Authorization header
6. Token verified on backend for protected routes
```

**JWT Structure:**
```json
{
  "userId": "123456789",
  "username": "player",
  "isAdmin": false,
  "iat": 1234567890,
  "exp": 1237159690
}
```

---

## 💬 WebSocket (Real-time Chat)

### Client → Server Events
```javascript
socket.emit('join-chat', { userId, username })
socket.emit('send-message', { message })
socket.emit('typing')
```

### Server → Client Events
```javascript
socket.on('receive-message', (data) => { ... })
socket.on('user-joined', (data) => { ... })
socket.on('user-left', (data) => { ... })
socket.on('user-typing', (data) => { ... })
```

---

## 🎨 UI/UX Tech Stack

- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Glassmorphism** - Semi-transparent cards
- **Gradient Text** - Purple to pink gradients
- **Dark Mode** - Built-in dark theme
- **Lucide Icons** - React icon library

---

## 📦 Dependencies

### Backend
```
express          - REST framework
mongoose         - MongoDB ODM
socket.io        - WebSocket
jsonwebtoken     - JWT auth
bcryptjs         - Password hashing
dotenv           - Config management
cors             - Cross-origin requests
```

### Frontend
```
react            - UI framework
react-router-dom - Routing
axios            - HTTP client
socket.io-client - WebSocket client
framer-motion    - Animations
tailwindcss      - Styling
lucide-react     - Icons
```

---

## 🚀 Next Steps to Enhance

### Easy Additions
- [ ] Add XP/leveling system
- [ ] Create daily quests
- [ ] Add friend system
- [ ] Implement achievements
- [ ] Add user bios

### Medium Difficulty
- [ ] Create mini-games (chess, blackjack)
- [ ] Add trading between users
- [ ] Implement notifications
- [ ] Add private messages
- [ ] Create item rarity tiers

### Advanced Features
- [ ] Voice channels (WebRTC)
- [ ] AI NPC chatbot
- [ ] Dynamic economy
- [ ] Guilds with treasury
- [ ] Leaderboards & rankings
- [ ] Mobile app (React Native)

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| MongoDB won't connect | Ensure MongoDB running: `sudo systemctl start mongodb` |
| Port 5000 in use | Change PORT in .env or kill process: `lsof -i :5000` |
| CORS errors | Check FRONTEND_URL in backend .env |
| Can't send messages | Verify Socket.IO is connected in DevTools |
| Frontend won't load | Clear browser cache (Ctrl+Shift+Delete) |
| Package install errors | Try: `npm install --legacy-peer-deps` |

---

## 📊 Database Schema Highlights

### User
```javascript
{
  username: string,
  email: string,
  password: string (hashed),
  coins: number,
  level: number,
  avatar: string (URL),
  inventory: [Item IDs],
  clan: Clan ID,
  achievements: [strings],
  isAdmin: boolean,
  isBanned: boolean
}
```

### Item
```javascript
{
  name: string,
  type: 'furniture' | 'avatar' | 'decoration',
  rarity: 'common' | 'rare' | 'epic' | 'legendary',
  price: number,
  owner: User ID
}
```

### Message
```javascript
{
  sender: User ID,
  content: string,
  channel: 'global' | 'clan' | 'dm',
  createdAt: date (auto-deletes after 7 days)
}
```

---

## 🔐 Security Best Practices

✅ Passwords hashed with bcryptjs  
✅ JWT tokens with expiry  
✅ CORS protection  
✅ Protected routes with middleware  
✅ Input validation  
⚠️ TODO: Rate limiting, Email verification

---

## 📞 Getting Help

- Check `README.md` for full documentation
- See `SETUP.md` for detailed setup guide
- Review code comments in each file
- Check browser DevTools Console for errors
- MongoDB Compass for database inspection

---

## 🎓 What You'll Learn

✅ Full-stack web development  
✅ Real-time systems (WebSocket)  
✅ REST API design  
✅ Database modeling  
✅ Authentication & security  
✅ React hooks & context  
✅ Modern CSS (Tailwind)  
✅ Deployment & DevOps basics  

---

**Ready to explore? Open http://localhost:3000 and start building! 🏙️**

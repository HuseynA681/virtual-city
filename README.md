# 🏙️ Virtual City - Social Platform

A comprehensive full-stack social platform combining Discord, Roblox groups, and life simulator mechanics. Built with React, Node.js, MongoDB, and WebSocket real-time chat.

## 🎮 Features

### Core Features
- ✅ **User Authentication** - JWT-based login/register with secure password hashing
- ✅ **Real-time Chat** - WebSocket chat with typing indicators and online status
- ✅ **Marketplace** - Buy/sell items with filters, ratings, and price controls
- ✅ **Apartment System** - Drag-and-drop furniture customization
- ✅ **Economy System** - Coin-based economy with jobs and rewards
- ✅ **Clans/Gangs** - Create and join player groups with treasuries
- ✅ **User Profiles** - Customizable avatars, bio, level, achievements
- ✅ **Leaderboards** - Ranked by level and experience
- ✅ **Admin Panel** - User management, moderation, analytics

### Advanced Features (Ready to implement)
- 🎮 Mini-games (Chess, Blackjack, Clicker)
- 🤖 AI NPCs with chat
- 🌦️ Dynamic weather system
- 🎵 Background music player
- 📱 Mobile-responsive design
- 🔐 Dark web section
- 🎙️ Voice commands (Jarvis-style)

## 📦 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - REST API framework
- **MongoDB** - NoSQL database
- **Socket.IO** - Real-time WebSocket
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Socket.IO Client** - WebSocket

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- npm or yarn

### Setup Backend

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URI and JWT secret
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/virtual-city
# JWT_SECRET=your-secret-key-here

# Start development server
npm run dev
```

Server runs on `http://localhost:5000`

### Setup Frontend

```bash
cd frontend
npm install

# Start development server
npm start
```

App opens at `http://localhost:3000`

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/register      - Create account
POST   /api/auth/login         - Login
GET    /api/auth/verify        - Verify token
```

### Users
```
GET    /api/users/me           - Get current user
GET    /api/users/profile/:id  - Get user profile
PUT    /api/users/update       - Update profile
POST   /api/users/friend/add   - Add friend
GET    /api/users/leaderboard  - Get rankings
```

### Chat
```
GET    /api/chat/global        - Get global messages
POST   /api/chat/send          - Send message
```

### Marketplace
```
GET    /api/marketplace        - Get listings
POST   /api/marketplace/create - Create listing
POST   /api/marketplace/buy    - Buy item
```

### Inventory
```
GET    /api/inventory          - Get user items
POST   /api/inventory/add      - Add item
```

### Clans
```
GET    /api/clans              - List all clans
POST   /api/clans/create       - Create clan
POST   /api/clans/join/:id     - Join clan
POST   /api/clans/leave        - Leave clan
```

### Admin
```
POST   /api/admin/ban/:userId  - Ban user
GET    /api/admin/stats        - Site statistics
```

## 🎯 Project Structure

```
virtual-city/
├── backend/
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API endpoints
│   ├── middleware/          # Auth, validation
│   ├── controllers/         # Business logic
│   ├── server.js            # Express app
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # Auth, Chat contexts
│   │   ├── App.js           # Main app
│   │   └── index.css        # Tailwind styles
│   ├── public/              # Static files
│   └── package.json
└── README.md
```

## 🛠️ Development Guide

### Adding a New Feature

1. **Backend**
   - Create schema in `models/`
   - Create route in `routes/`
   - Add middleware if needed
   - Test with Postman

2. **Frontend**
   - Create component in `components/`
   - Add state/context if needed
   - Connect to API
   - Style with Tailwind

### Database Collections

- **users** - Player profiles, inventory, stats
- **items** - Furniture, decorations, avatars
- **messages** - Chat messages (auto-delete after 7 days)
- **clans** - Groups and teams
- **marketplace_listings** - Item sales
- **achievements** - Player accomplishments

## 🔐 Security

- ✅ JWT authentication (30-day expiry)
- ✅ Password hashing with bcryptjs
- ✅ CORS protection
- ✅ Input validation
- ✅ Admin-only routes protected
- ⚠️ TODO: Rate limiting, Email verification

## 📈 Scalability

For production:
- Use Redis for caching and sessions
- Implement message queues (Bull, RabbitMQ)
- Add CDN for static assets
- Use load balancer (nginx)
- Deploy with Docker + Kubernetes
- Set up monitoring (PM2, New Relic)

## 🐳 Docker Deployment

```bash
# Build images
docker-compose build

# Start containers
docker-compose up -d

# Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# MongoDB: mongodb://localhost:27017
```

## 📝 Future Enhancements

- [ ] Voice channels (WebRTC)
- [ ] Trading system with escrow
- [ ] Ranking tournaments
- [ ] Item crafting system
- [ ] Pet adoption
- [ ] Dating sim mini-game
- [ ] Stock market simulator
- [ ] Guild wars/PvP
- [ ] Streaming integration (Twitch)
- [ ] Mobile app (React Native)
- [ ] AI chatbot moderator
- [ ] Anti-cheat system

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under MIT License - see LICENSE file for details.

## 👨‍💻 Author

Built as a comprehensive full-stack portfolio project.

## 🎓 Learning Outcomes

This project teaches:
- ✅ Full-stack development (React + Node.js)
- ✅ Real-time systems (WebSocket)
- ✅ Database design (MongoDB)
- ✅ REST API design
- ✅ Authentication & Security
- ✅ UI/UX with animations
- ✅ DevOps basics (Docker)
- ✅ Project management

---

**Ready to join the Virtual City? Start building your empire! 🚀**

# 🗺️ Virtual City - File Navigation Guide

## Quick File Finder

### 📖 Documentation Files
- **README.md** - Main project documentation
- **QUICKSTART.md** - 60-second setup and feature overview
- **SETUP.md** - Detailed installation and troubleshooting
- **PROJECT_MANIFEST.md** - Complete project breakdown

---

## 🔙 BACKEND (`/backend`)

### Start Here
```
backend/
├── server.js          ← Entry point (run: npm run dev)
└── package.json       ← Dependencies
```

### API Routes (What endpoints exist)
```
routes/
├── auth.js            ← /api/auth/register, /api/auth/login
├── users.js           ← /api/users/me, /api/users/profile/:id
├── chat.js            ← /api/chat/global (WebSocket handles realtime)
├── inventory.js       ← /api/inventory (GET/POST items)
├── marketplace.js     ← /api/marketplace (Buy/sell items)
├── apartments.js      ← /api/apartments/update (Furniture layout)
├── clans.js           ← /api/clans (Create/join groups)
└── admin.js           ← /api/admin (Ban users, stats)
```

### Database Models (What data gets stored)
```
models/
├── User.js            ← Player profiles, coins, inventory
├── Item.js            ← Furniture, decorations, avatars
├── Message.js         ← Chat history (auto-deletes after 7 days)
├── Clan.js            ← Groups, treasuries, members
└── MarketplaceListing.js ← Items for sale
```

### Security
```
middleware/
└── auth.js            ← JWT token verification, admin checking
```

### Configuration
```
.env.example           ← Copy to .env and fill in values
```

---

## ⚛️ FRONTEND (`/frontend`)

### Start Here
```
frontend/
├── src/App.js         ← Main router, protects routes
├── src/index.js       ← Entry point (run: npm start)
└── package.json       ← Dependencies
```

### Pages (Full screen views)
```
src/pages/
├── LandingPage.js     ← First page users see (/)
├── LoginPage.js       ← Login form (/login)
├── RegisterPage.js    ← Signup form (/register)
└── Dashboard.js       ← Main app hub (/dashboard)
```

### Components (Reusable UI pieces)
```
src/components/
├── Chat.js            ← Real-time messaging interface
├── Marketplace.js     ← Browse and buy items
├── Apartment.js       ← Drag furniture customizer
├── Clans.js           ← View/create groups
├── Inventory.js       ← View owned items
├── GameArea.js        ← Mini-games hub
└── AdminPanel.js      ← User management
```

### State Management
```
src/context/
├── AuthContext.js     ← User login state, JWT token
└── ChatContext.js     ← WebSocket connection, messages
```

### Styling
```
src/
├── index.css          ← Tailwind + global styles
└── public/
    └── index.html     ← HTML template
```

### Configuration
```
tailwind.config.js     ← Tailwind customization
postcss.config.js      ← PostCSS setup
.env.example           ← Copy to .env and set API URL
```

---

## 🔌 WebSocket Connection

**Flow:**
1. User logs in → Frontend creates Socket.IO connection
2. User joins chat room → Backend tracks in `connectedUsers` Map
3. User types message → Emits event to server
4. Server broadcasts → All connected clients receive message
5. Messages display in real-time

**Key Files:**
- `backend/server.js` - WebSocket setup (lines 30-70)
- `frontend/src/context/ChatContext.js` - Socket connection and events

---

## 🗄️ Database Connection

**Flow:**
1. Backend starts → `server.js` calls `mongoose.connect()`
2. Connects to MongoDB on port 27017 or MongoDB Atlas
3. Models load when imported in routes
4. API calls query database
5. Frontend receives data via axios

**Key Files:**
- `backend/server.js` - MongoDB connection (line 15)
- `backend/models/*.js` - Schema definitions
- `backend/.env` - MongoDB URI

---

## 🔐 Authentication Flow

**Registration:**
```
Frontend (RegisterPage.js)
  ↓ axios.post('/api/auth/register')
Backend (routes/auth.js)
  ↓ Hash password with bcryptjs
  ↓ Save user to MongoDB
  ↓ Generate JWT token
  ↓ Return token to frontend
Frontend stores token in localStorage
```

**Login:**
```
Frontend (LoginPage.js)
  ↓ axios.post('/api/auth/login')
Backend (routes/auth.js)
  ↓ Find user in database
  ↓ Compare passwords with bcrypt
  ↓ Generate JWT token
  ↓ Return user data + token
Frontend stores token
Every future request includes: Authorization: Bearer TOKEN
```

**Protected Routes:**
```
Frontend (App.js)
  ↓ <ProtectedRoute> wraps /dashboard
  ↓ Checks if user exists
  ↓ If not, redirects to /login

Backend (middleware/auth.js)
  ↓ Verifies JWT token on protected endpoints
  ↓ If invalid, returns 401 Unauthorized
```

---

## 💰 Marketplace Transaction

**Steps:**
1. User browses marketplace.js → calls GET /api/marketplace
2. Backend returns list of listings from database
3. User clicks "Buy Now" → calls POST /api/marketplace/buy/:listingId
4. Backend validates:
   - Listing exists and is active
   - Buyer has enough coins
5. Backend performs transaction:
   - Subtract coins from buyer
   - Add coins to seller
   - Add item to buyer's inventory
   - Mark listing as sold
6. Frontend refreshes, item appears in inventory

**Key Files:**
- `frontend/src/components/Marketplace.js` - Buy UI
- `backend/routes/marketplace.js` - Transaction logic
- `backend/models/User.js` - Coin system
- `backend/models/MarketplaceListing.js` - Listing data

---

## 🏠 Apartment Customization

**How It Works:**
1. User opens Apartment tab
2. Frontend shows room canvas (empty div)
3. User drags furniture from sidebar to canvas
4. Frontend stores position: `{ x: 100, y: 50 }`
5. User saves changes
6. Frontend sends PUT /api/apartments/update with layout
7. Backend saves to `user.apartment.furnitureLayout`
8. Next time user opens apartment, furniture is positioned same way

**Key Files:**
- `frontend/src/components/Apartment.js` - Drag logic
- `backend/routes/apartments.js` - Save/update
- `backend/models/User.js` - Apartment schema

---

## 👥 Clans System

**Creating a Clan:**
```
User clicks "Create Clan"
  ↓ Frontend shows form
  ↓ Submit to POST /api/clans/create
  ↓ Backend creates Clan document
  ↓ Sets user as leader
  ↓ Adds user to members array
  ↓ Frontend redirects to /dashboard/clans
  ↓ Clan appears in list
```

**Joining a Clan:**
```
User clicks "Join Clan"
  ↓ POST /api/clans/join/:clanId
  ↓ Backend validates space available
  ↓ Adds user to members array
  ↓ Updates user.clan field
  ↓ Returns success
```

**Key Files:**
- `frontend/src/components/Clans.js` - Create/join UI
- `backend/routes/clans.js` - Clan logic
- `backend/models/Clan.js` - Clan schema

---

## 🎮 Mini-Games (Ready to Implement)

**Location:** `frontend/src/components/GameArea.js`

**To Add a Game:**
1. Create new component: `src/components/Games/Chess.js`
2. Import in GameArea.js
3. Add route in Dashboard.js
4. Connect to backend for scoring

---

## 🛡️ Admin Panel

**Accessible by:** Users with `isAdmin: true`

**Features:**
- View site statistics
- Ban/unban users
- Delete messages
- See analytics

**Key Files:**
- `frontend/src/components/AdminPanel.js` - UI
- `backend/routes/admin.js` - Admin APIs
- `backend/middleware/auth.js` - Admin verification

---

## 🚀 Docker Setup

**Files:**
```
docker-compose.yml    ← Orchestrates containers
backend/Dockerfile    ← Backend image
frontend/Dockerfile   ← Frontend image
```

**Services Spun Up:**
1. MongoDB (port 27017)
2. Backend (port 5000)
3. Frontend (port 3000)

---

## 📊 API Data Flow Example

**Example: User buys marketplace item**

```
FRONTEND (Marketplace.js)
│
├─→ Click "Buy Now" button
│   └─→ axios.post('/api/marketplace/buy/listing123', {}, {
│       headers: { Authorization: `Bearer TOKEN` }
│   })
│
BACKEND
│
├─→ POST /api/marketplace/buy/:listingId (marketplace.js)
│   ├─→ Check JWT token (auth.js middleware)
│   ├─→ Find listing in database (MarketplaceListing model)
│   ├─→ Verify listing status is 'active'
│   ├─→ Find buyer user (User model)
│   ├─→ Check buyer.coins >= listing.price
│   ├─→ Find seller user
│   ├─→ UPDATE buyer.coins -= price
│   ├─→ UPDATE seller.coins += price
│   ├─→ PUSH item to buyer.inventory
│   ├─→ UPDATE listing.status = 'sold'
│   ├─→ UPDATE listing.buyer = userId
│   └─→ res.json({ success: true })
│
FRONTEND
│
└─→ Response received
    ├─→ Show success notification
    ├─→ Refresh marketplace
    ├─→ User sees item gone (sold)
    └─→ Item appears in /dashboard/inventory
```

---

## 🔍 File Size Reference

| File | Size | Purpose |
|------|------|---------|
| backend/server.js | ~100 lines | Main server |
| backend/models/*.js | ~150 lines each | Data schemas |
| backend/routes/*.js | ~100-200 lines each | API endpoints |
| frontend/pages/*.js | ~200-300 lines | Page components |
| frontend/components/*.js | ~150-250 lines | UI components |
| frontend/context/*.js | ~100-150 lines | State management |

---

## 🔗 Dependencies Network

```
Frontend (React)
├─→ axios (HTTP requests to backend)
├─→ socket.io-client (WebSocket)
├─→ framer-motion (Animations)
├─→ tailwindcss (Styling)
└─→ react-router-dom (Navigation)

Backend (Express)
├─→ mongoose (MongoDB)
├─→ socket.io (WebSocket server)
├─→ jsonwebtoken (JWT)
├─→ bcryptjs (Password hashing)
└─→ cors (Cross-origin)

Database
└─→ MongoDB (NoSQL)
```

---

## 💡 Code Organization Principles

1. **Models** - Data structure (what gets stored)
2. **Routes** - API endpoints (what happens)
3. **Components** - UI pieces (how it looks)
4. **Context** - Shared state (global data)
5. **Middleware** - Request processing (security, validation)

---

## 🧪 Testing Key Paths

### Authentication
- `/login` - Frontend login page
- `POST /api/auth/login` - Backend authentication
- `middleware/auth.js` - Token verification

### Real-time Chat
- `ChatContext.js` - Socket setup
- `backend/server.js` lines 30-70 - Socket events
- `components/Chat.js` - UI

### Database Persistence
- `models/User.js` - User data
- `routes/users.js` - Save updates
- Frontend state → Backend → MongoDB

---

## 🎯 Quick Reference

### To Add New API Endpoint:
1. Create route in `/backend/routes/newroute.js`
2. Mount in `backend/server.js`
3. Call from frontend with `axios`

### To Add New Page:
1. Create component in `/frontend/src/pages/NewPage.js`
2. Import in `frontend/src/App.js`
3. Add route to Routes

### To Add New Component:
1. Create file in `/frontend/src/components/NewComponent.js`
2. Import in Dashboard or another page
3. Add tab in navigation if needed

### To Add Database Field:
1. Edit schema in `/backend/models/ModelName.js`
2. Update API routes that use it
3. Update frontend to display/submit new field

---

## ✅ Verification Checklist

- [ ] Backend runs without errors (npm run dev)
- [ ] Frontend loads at localhost:3000
- [ ] MongoDB is connected
- [ ] Can create account
- [ ] Can login
- [ ] Chat shows online users
- [ ] Marketplace displays items
- [ ] Can buy items (coins decrease)
- [ ] Apartment furniture persists
- [ ] Clans creation works

---

**This guide helps you navigate the 5000+ lines of code efficiently! 🗺️**

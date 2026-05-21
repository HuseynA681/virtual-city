# Virtual City - Setup & Installation Guide

## 🎯 Prerequisites

Before starting, ensure you have:
- Node.js 16+ (download from nodejs.org)
- MongoDB 5+ (local installation or MongoDB Atlas cloud)
- Git (optional)
- A code editor (VS Code recommended)

## 📦 Installation Steps

### Step 1: Clone or Download Project

```bash
# Via Git
git clone <repository-url>
cd virtual-city

# Or extract the ZIP file to your desired location
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your settings:
# - MONGODB_URI: Your MongoDB connection string
# - JWT_SECRET: Change this to a random secret string
# - PORT: 5000 (default)
# - FRONTEND_URL: http://localhost:3000

# Start backend server
npm run dev
```

**Expected output:**
```
✅ MongoDB connected
🚀 Server running on port 5000
📡 WebSocket connected
```

### Step 3: Frontend Setup

In a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

**Expected output:**
```
Compiled successfully!
Listening on port 3000
```

Your browser should automatically open http://localhost:3000

## 🗄️ Database Setup

### Option 1: Local MongoDB

```bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Windows (using installer)
# Download from https://www.mongodb.com/try/download/community
# Run installer and follow setup wizard

# Linux (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

### Option 2: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Create a database user and password
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/database-name`
6. Add to `.env` file as `MONGODB_URI`

## 🧪 Testing the App

### Create Test Account

1. Open http://localhost:3000
2. Click "Sign Up"
3. Enter credentials:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Create Account"

### Test Features

**Chat**
- Open dashboard
- Go to "Chat" tab
- See online users (should show yourself)
- Type and send messages
- Messages appear in real-time

**Marketplace**
- Click "Marketplace" tab
- View available items (prepopulated)
- Click "Buy Now" to purchase

**Apartment**
- Click "Apartment" tab
- Drag furniture from right panel to room
- Position furniture on canvas
- Delete items with X button

**Clans**
- Click "Clans" tab
- Create a new clan
- Join other clans
- View clan members and treasury

## 🔧 Common Issues & Fixes

### Issue: MongoDB connection fails
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Ensure MongoDB is running: `sudo systemctl status mongodb`
- Check MongoDB URI in .env file
- Try using MongoDB Atlas cloud version

### Issue: Port 5000 already in use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change PORT in .env to 5001
```

### Issue: Frontend won't connect to backend
```
Error: CORS error or connection refused
```
**Solution:**
- Check backend is running on port 5000
- Verify `FRONTEND_URL` in backend .env matches your frontend URL
- Check firewall isn't blocking ports
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: React dependencies won't install
```
npm ERR! code ERESOLVE
```
**Solution:**
```bash
npm install --legacy-peer-deps
# Or use npm 7+
npm config set legacy-peer-deps true
npm install
```

## 📚 Project Structure

```
virtual-city/
├── backend/                 # Node.js/Express API
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth middleware
│   ├── controllers/        # Business logic
│   ├── server.js           # Main server file
│   └── package.json
│
├── frontend/               # React application
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context (auth, chat)
│   │   ├── App.js         # Main app component
│   │   ├── index.js       # Entry point
│   │   └── index.css      # Global styles
│   ├── package.json
│   └── tailwind.config.js
│
├── docker-compose.yml     # Docker setup
└── README.md             # Main documentation
```

## 🚀 Deployment

### Deploy Backend to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set MONGODB_URI=your-mongodb-uri

# Deploy
git push heroku main
```

### Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

### Deploy with Docker

```bash
# Build and run locally
docker-compose up -d

# Push to Docker Hub
docker build -t yourusername/virtual-city-backend ./backend
docker push yourusername/virtual-city-backend
```

## 📖 API Documentation

### Quick API Test with curl

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Get user profile (replace TOKEN with your JWT)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/users/me
```

## 🎮 Advanced Setup

### Enable SSL/HTTPS

Create `cert.js` in backend:
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/key.pem'),
  cert: fs.readFileSync('path/to/cert.pem')
};

https.createServer(options, app).listen(5000);
```

### Add Redis for Caching

```bash
# Install Redis
brew install redis  # macOS
sudo apt-get install redis-server  # Linux

# Backend package
npm install redis

# Update chat context to use Redis
```

### Enable Email Notifications

```bash
npm install nodemailer

# Add in routes/users.js for password reset
```

## 🐛 Debugging Tips

### Enable Debug Logging

In `backend/server.js`:
```javascript
process.env.DEBUG = 'app:*';
```

In `frontend/src/App.js`:
```javascript
if (process.env.NODE_ENV === 'development') {
  console.log('Dev mode enabled');
}
```

### Check Network Requests

Open browser DevTools → Network tab:
- Monitor API requests to `/api/*`
- Check WebSocket connections to Socket.IO
- Verify request/response headers

## 📞 Support & Resources

- **MongoDB Docs**: https://docs.mongodb.com
- **Express Docs**: https://expressjs.com
- **React Docs**: https://react.dev
- **Socket.IO Docs**: https://socket.io
- **Tailwind CSS**: https://tailwindcss.com

## ✅ Checklist for Local Development

- [ ] Node.js installed (v16+)
- [ ] MongoDB installed and running
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment files created (.env)
- [ ] Backend server running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can create user account
- [ ] Can login
- [ ] Chat working in real-time
- [ ] Marketplace loads items
- [ ] Apartment customization works

---

**You're all set! Start exploring Virtual City! 🏙️**

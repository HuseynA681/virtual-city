# 🗄️ MongoDB Atlas Setup Guide

## Quick Fix for MongoDB Connection Error

Your backend is running but MongoDB isn't connected. Here's how to fix it in 5 minutes:

---

## Option 1: MongoDB Atlas (Cloud - Recommended) ✅

### Step 1: Create Free Account
1. Visit **https://www.mongodb.com/cloud/atlas**
2. Click **Sign Up** (free tier)
3. Create account with email/password
4. Verify your email

### Step 2: Create Database Cluster
1. After login, click **Create a Deployment**
2. Select **M0 Free Tier**
3. Choose **AWS** cloud provider
4. Pick your nearest region
5. Click **Create Deployment** (wait 1-2 minutes)

### Step 3: Get Connection String
1. Click **Connect** button on your cluster
2. Select **Drivers** tab
3. Choose **Node.js** (v4.1+)
4. Copy the connection string (step 3)
   - Format: `mongodb+srv://username:password@cluster0.xxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

### Step 4: Update .env File
Edit `backend/.env` and replace:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/virtual-city?retryWrites=true&w=majority
```

**Where to find these in MongoDB Atlas:**
- `YOUR_USERNAME` - User you created (in Database Access)
- `YOUR_PASSWORD` - Password you set (URL-encode if contains special chars)
- `YOUR_CLUSTER` - Cluster name shown in overview (e.g., cluster0.abc123)

### Step 5: URL Encode Password (if needed)
If your password has special characters:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `:` → `%3A`

**Example:**
```
Password: mypass@123#
Encoded: mypass%40123%23

MONGODB_URI=mongodb+srv://user:mypass%40123%23@cluster0.abc.mongodb.net/virtual-city?retryWrites=true&w=majority
```

### Step 6: Restart Server
In your backend terminal, press `rs` to restart nodemon with the new connection string.

**You should see:**
```
✅ MongoDB connected
🚀 Server running on port 5000
📡 WebSocket connected
```

---

## Option 2: Local MongoDB

If you want MongoDB running locally:

### Windows
1. Download: **https://www.mongodb.com/try/download/community**
2. Run installer, follow setup
3. MongoDB runs at `localhost:27017` by default
4. Your `.env` is already configured for this

### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

---

## Verify Connection

After updating `.env`:

1. **Backend terminal**: Press `rs` to restart
2. **Check for**: `✅ MongoDB connected` message
3. **Frontend**: `npm start` (should load without errors)
4. **Test**: Create account in app

---

## Troubleshooting

### Connection Refused (127.0.0.1:27017)
→ MongoDB not running. Use MongoDB Atlas instead.

### Authentication Failed
→ Wrong username/password. Check in MongoDB Atlas Dashboard.

### Cluster Not Accessible
→ IP address not whitelisted. In MongoDB Atlas → Security → Network Access → Add 0.0.0.0/0 (allows all)

### Password Has Special Characters
→ URL-encode them: Use online tool or manually convert.

---

## .env File Location

**Backend folder:**
```
virtual-city/
└── backend/
    └── .env          ← Put your connection string here
```

---

## Quick Reference

| Task | Link |
|------|------|
| MongoDB Atlas | https://www.mongodb.com/cloud/atlas |
| URL Encoder | https://www.urlencoder.org/ |
| MongoDB Docs | https://docs.mongodb.com |

---

**After setup, your backend will connect automatically! ✅**

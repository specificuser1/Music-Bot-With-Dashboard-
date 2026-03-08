# 🚂 Railway Deploy - COMPLETE SOLUTION

## ⚠️ Error Fix kiya gaya hai!

### Previous Issues:
- ❌ `better-sqlite3` - Python dependency
- ❌ Complex voice packages
- ❌ Peer dependency conflicts

### ✅ Solution Applied:
- ✅ Pure JavaScript database (lowdb)
- ✅ Simplified dependencies
- ✅ Added `.npmrc` for Railway
- ✅ Fixed nixpacks configuration
- ✅ Stable package versions

---

## 🚀 Railway Deployment Steps

### Method 1: GitHub (RECOMMENDED)

#### Step 1: GitHub Repository Banao

```bash
# Terminal mein ye commands run karo
cd discord-music-bot
git init
git add .
git commit -m "Initial commit - Music Bot"
git branch -M main

# Apna GitHub repo URL yaha dalo
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

#### Step 2: Railway Par Deploy

1. **Railway.app par jao**: https://railway.app
2. **Sign up karo** (GitHub se - free!)
3. **"New Project"** click karo
4. **"Deploy from GitHub repo"** select karo
5. **Apna repository select karo**
6. Railway automatically detect karega

#### Step 3: Environment Variables Set Karo

Railway dashboard mein **"Variables"** tab par jao:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id
CLIENT_SECRET=your_client_secret
SESSION_SECRET=any_random_32_char_string_here
PREFIX=!
OWNER_ID=your_discord_user_id
```

**Important**: `SESSION_SECRET` ke liye random string generate karo:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Step 4: Deploy Hone Ka Wait Karo

- Build time: ~3-5 minutes
- Logs dekho Railway dashboard mein
- Success message aane tak wait karo

#### Step 5: Discord OAuth Update Karo

1. Railway se URL copy karo (jaise: `https://your-app.up.railway.app`)
2. Discord Developer Portal par jao
3. **OAuth2 → General → Redirects**
4. Add karo: `https://your-app.up.railway.app/callback`
5. Save karo

---

### Method 2: Railway CLI

```bash
# Railway CLI install
npm install -g @railway/cli

# Login
railway login

# Project initialize
railway init

# Deploy
railway up

# Variables set
railway variables set DISCORD_TOKEN=your_token
railway variables set CLIENT_ID=your_id
# ... baaki variables
```

---

## 📋 Discord Bot Setup (Pehle Karo!)

### 1. Discord Developer Portal

1. Jao: https://discord.com/developers/applications
2. **"New Application"** click karo
3. Bot ka naam do

### 2. Bot Token

1. **"Bot"** section par jao
2. **"Reset Token"** click karo
3. Token copy karo → Ye `DISCORD_TOKEN` hai
4. **Privileged Gateway Intents** enable karo:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent (IMPORTANT!)

### 3. OAuth2 Credentials

1. **"OAuth2"** → **"General"** par jao
2. **Application ID** copy karo → Ye `CLIENT_ID` hai
3. **"Reset Secret"** click karo
4. Secret copy karo → Ye `CLIENT_SECRET` hai

### 4. Bot Invite

1. **"OAuth2"** → **"URL Generator"**
2. **Scopes**: `bot`, `applications.commands`
3. **Bot Permissions**:
   - Send Messages
   - Embed Links
   - Read Message History
   - Connect
   - Speak
   - Use Voice Activity
4. URL copy karke browser mein kholo
5. Server select karo

---

## 🔍 Troubleshooting

### Error: "npm install failed"

**Solution**:
```bash
# Local test karo
npm install --legacy-peer-deps

# Agar local work kare to Railway mein redeploy karo
```

### Error: "Module not found: discord-player"

Railway logs check karo. Agar ye error hai to:
1. `package.json` verify karo
2. `.npmrc` file hai?
3. Redeploy karo

### Error: "Bot not responding"

1. **Message Content Intent** enabled hai Discord mein?
2. Bot ko proper permissions diye?
3. `DISCORD_TOKEN` sahi hai?
4. Railway logs check karo

### Error: "Cannot find module 'lowdb'"

Railway build cache clear karo:
1. Railway Settings → Clear Build Cache
2. Redeploy

### Error: "OAuth redirect mismatch"

Discord OAuth redirect **exactly match** hona chahiye:
```
Railway URL: https://your-app.up.railway.app/callback
Discord URL: https://your-app.up.railway.app/callback
```
(No trailing slash, exact same)

---

## ✅ Verification Steps

### 1. Check Railway Logs

```
Railway Dashboard → Deployments → Latest → View Logs
```

Success messages:
- ✅ Database initialized
- ✅ Loaded X commands
- ✅ Player extractors loaded
- ✅ [BOT_NAME] is online!
- ✅ Dashboard running on port XXXX

### 2. Check Bot Status

Discord server mein:
- Bot online hai (green dot)?
- `!ping` command try karo
- `!help` se commands dekho

### 3. Check Dashboard

Browser mein:
```
https://your-app.up.railway.app
```
- Homepage load ho raha hai?
- Login button kaam kar raha hai?

---

## 📦 Files Checklist

Railway deploy se pehle verify karo:

- ✅ `package.json` (simplified versions)
- ✅ `.npmrc` (legacy-peer-deps)
- ✅ `nixpacks.toml` (Railway config)
- ✅ `.gitignore` (node_modules excluded)
- ✅ `.env.example` (template)
- ✅ All command files
- ✅ Database handler (lowdb)

---

## 🎯 Post-Deployment

### Bot Commands Test Karo

```
!play never gonna give you up
!queue
!skip
!help
```

### Dashboard Test Karo

1. `https://your-app.up.railway.app`
2. Login with Discord
3. Server select karo
4. Settings change karo
5. Save karo

---

## 💡 Pro Tips

1. **Free Tier**: Railway free $5/month credit deta hai
2. **Logs**: Railway dashboard mein real-time logs dekho
3. **Redeploy**: GitHub par push karo, auto-deploy hoga
4. **Backup**: Railway automatically backups leta hai
5. **Scale**: Agar traffic badhe to Railway mein scale kar sakte ho

---

## 🆘 Still Having Issues?

### Check These:

1. **Node Version**: Railway Node 18.x use kar raha hai?
2. **Build Logs**: Kaha fail ho raha hai?
3. **Environment Variables**: Sab set hain?
4. **Discord Permissions**: Bot ko sahi permissions di?

### Common Fixes:

```bash
# Local mein test pehle
npm install --legacy-peer-deps
npm start

# Agar local work kare:
# - .npmrc file hai?
# - package.json simplified hai?
# - Git commit properly kiya?
```

---

## ✨ Success!

Agar sab kuch work kar raha hai:

- ✅ Railway logs mein "Bot is online!"
- ✅ Discord mein bot green hai
- ✅ Commands respond kar rahe hain
- ✅ Dashboard accessible hai

**Congratulations! Your bot is live 24/7!** 🎉

---

## 📞 Need Help?

Railway logs copy karo aur error message check karo. Most common issues is guide mein covered hain.

**Happy Hosting!** 🚂🎵

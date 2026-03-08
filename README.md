# 🎵 Discord Music Bot with Advanced Dashboard

A professional Discord music bot with a modern web dashboard, built with Discord.js and Express. Features high-quality audio streaming, queue management, and a sleek dark-themed control panel.

## ✨ Features

### 🎶 Music Playback
- **Multi-source support**: YouTube, Spotify, SoundCloud, direct links
- **High-quality audio**: Crystal clear sound with customizable volume
- **Smart queue system**: Loop modes, shuffle, and playlist support
- **24/7 uptime**: Reliable performance with auto-reconnect

### 🎛️ Advanced Dashboard
- **OAuth2 authentication**: Secure Discord login
- **Real-time controls**: View queue and manage settings live
- **Server statistics**: Track listening history and top contributors
- **Modern UI**: Sleek dark theme with smooth animations
- **Responsive design**: Works perfectly on mobile and desktop

### ⚙️ Customization
- **Custom prefix**: Set your own command prefix per server
- **DJ roles**: Restrict commands to specific roles (optional)
- **Announcement toggles**: Control song announcements
- **Volume control**: Default volume settings per server

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- Discord Bot Token ([Get one here](https://discord.com/developers/applications))
- Discord OAuth2 credentials (same application)

### Installation

1. **Clone or download this repository**

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Discord Bot Token
DISCORD_TOKEN=your_bot_token_here

# Discord OAuth2 (from same application)
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here

# Dashboard settings
DASHBOARD_PORT=3000
CALLBACK_URL=http://localhost:3000/callback
SESSION_SECRET=generate_a_random_string_here

# Bot settings
PREFIX=!
OWNER_ID=your_discord_id_here
```

4. **Start the bot**
```bash
npm start
```

The bot and dashboard will both start automatically!

## 📋 Getting Discord Credentials

### Step 1: Create Application
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name your bot and create

### Step 2: Get Bot Token
1. Go to "Bot" section
2. Click "Reset Token" and copy it
3. This is your `DISCORD_TOKEN`
4. Enable these Privileged Gateway Intents:
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### Step 3: Get OAuth2 Credentials
1. In the same application, note your `Application ID` - this is your `CLIENT_ID`
2. Go to "OAuth2" → "General"
3. Click "Reset Secret" and copy it - this is your `CLIENT_SECRET`
4. Add Redirects:
   - `http://localhost:3000/callback` (for local testing)
   - `https://your-railway-url.up.railway.app/callback` (for Railway)

### Step 4: Invite Bot
1. Go to "OAuth2" → "URL Generator"
2. Select scopes: `bot`, `applications.commands`
3. Select permissions:
   - Connect
   - Speak
   - Send Messages
   - Embed Links
   - Read Message History
4. Copy the generated URL and open in browser
5. Select your server and authorize

## 🎯 Bot Commands

### 🎶 Music Commands
| Command | Description | Usage |
|---------|-------------|-------|
| `!play <song>` | Play a song | `!play never gonna give you up` |
| `!skip` | Skip current song | `!skip` |
| `!stop` | Stop and disconnect | `!stop` |
| `!pause` | Pause playback | `!pause` |
| `!resume` | Resume playback | `!resume` |
| `!queue` | Show queue | `!queue` |
| `!nowplaying` | Current track info | `!nowplaying` |
| `!volume <0-100>` | Set volume | `!volume 75` |
| `!loop [off\|track\|queue]` | Toggle loop mode | `!loop track` |
| `!shuffle` | Shuffle queue | `!shuffle` |
| `!clear` | Clear queue | `!clear` |

### 📊 Info Commands
| Command | Description |
|---------|-------------|
| `!stats` | Server statistics |
| `!history` | Recently played songs |
| `!ping` | Bot latency |
| `!help` | Show all commands |

### ⚙️ Settings (Admin Only)
| Command | Description | Usage |
|---------|-------------|-------|
| `!prefix <new>` | Change prefix | `!prefix ?` |
| `!settings` | View settings | `!settings` |
| `!announce <on\|off>` | Toggle announcements | `!announce on` |

## 🌐 Dashboard Access

1. Start the bot: `npm start`
2. Open browser: `http://localhost:3000`
3. Click "Login with Discord"
4. Authorize the application
5. Select a server to manage

### Dashboard Features
- ✅ View current playing track
- ✅ See full queue
- ✅ Check listening history
- ✅ View statistics
- ✅ Change bot settings
- ✅ Manage prefix and volume
- ✅ Toggle announcements

## 🚂 Railway Deployment

### Deploy to Railway

1. **Create Railway account**: Go to [Railway.app](https://railway.app)

2. **Create new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Set environment variables** in Railway dashboard:
```
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
SESSION_SECRET=your_random_secret
PREFIX=!
OWNER_ID=your_discord_id
```

4. **Important**: Railway auto-sets these:
   - `PORT` - Automatically assigned
   - `RAILWAY_STATIC_URL` - Your app's URL

5. **Update Discord OAuth2**:
   - Go to Discord Developer Portal
   - OAuth2 → General → Redirects
   - Add: `https://your-app.up.railway.app/callback`

6. **Deploy**: Railway will auto-deploy on push

### Railway Configuration
- ✅ Automatic HTTPS
- ✅ Auto-scaling
- ✅ Environment variables management
- ✅ GitHub integration
- ✅ Logs and monitoring

## 📁 Project Structure

```
discord-music-bot/
├── bot/
│   ├── index.js              # Bot main file
│   └── commands/             # Command files
│       ├── play.js
│       ├── queue.js
│       ├── skip.js
│       └── ...
├── dashboard/
│   ├── server.js             # Express server
│   ├── views/                # EJS templates
│   │   ├── index.ejs         # Homepage
│   │   ├── dashboard.ejs     # Server selection
│   │   └── guild.ejs         # Guild controls
│   └── public/               # Static files
├── config/
│   └── database.js           # SQLite database
├── index.js                  # Main entry point
├── package.json
├── .env.example
└── README.md
```

## 🔧 Development

### Run in development mode
```bash
npm run dev
```

### Run bot only
```bash
npm run bot
```

### Run dashboard only
```bash
npm run dashboard
```

## 🐛 Troubleshooting

### Bot not responding to commands
- ✅ Check `DISCORD_TOKEN` is correct
- ✅ Ensure "Message Content Intent" is enabled
- ✅ Verify bot has proper permissions in server
- ✅ Check prefix matches (default: `!`)

### Dashboard login fails
- ✅ Verify `CLIENT_ID` and `CLIENT_SECRET`
- ✅ Check OAuth2 redirect URL matches exactly
- ✅ Ensure `CALLBACK_URL` is set correctly

### Music not playing
- ✅ Bot needs "Connect" and "Speak" permissions
- ✅ Check voice channel permissions
- ✅ Try different search query or direct URL
- ✅ Ensure FFmpeg is installed (auto-installed with ffmpeg-static)

### Railway deployment issues
- ✅ All environment variables must be set
- ✅ OAuth callback URL must use Railway URL
- ✅ Check Railway logs for errors
- ✅ Ensure Node.js version is 18+

## 📦 Database

Uses SQLite for zero-configuration data storage:
- Guild settings (prefix, volume, DJ role)
- Queue history
- User playlists
- Statistics

Database file: `data.db` (auto-created)

## 🔒 Security

- ✅ Session-based authentication
- ✅ OAuth2 with Discord
- ✅ Environment variable protection
- ✅ No sensitive data in code
- ✅ Server-side validation

## 📝 License

MIT License - Feel free to use for personal or commercial projects

## 🤝 Support

Need help? Common issues:

1. **"Cannot find module"**: Run `npm install`
2. **"Invalid token"**: Check your Discord bot token
3. **"Unauthorized OAuth"**: Verify CLIENT_ID and CLIENT_SECRET
4. **"Bot offline"**: Ensure bot is invited and has permissions

## 🎉 Features Coming Soon

- [ ] Spotify playlist import
- [ ] User playlists in dashboard
- [ ] Audio effects and filters
- [ ] Multi-language support
- [ ] Advanced statistics charts

---

Made with 💚 for Discord communities

**Enjoy your music bot!** 🎵

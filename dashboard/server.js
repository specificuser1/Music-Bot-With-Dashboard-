const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-discord');
const path = require('path');
const db = require('../config/database');

const app = express();
const PORT = process.env.PORT || process.env.DASHBOARD_PORT || 3000;

// Determine callback URL (Railway or local)
const CALLBACK_URL = process.env.RAILWAY_STATIC_URL 
    ? `https://${process.env.RAILWAY_STATIC_URL}/callback`
    : process.env.CALLBACK_URL || 'http://localhost:3000/callback';

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Passport configuration
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new Strategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
    scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
    profile.accessToken = accessToken;
    return done(null, profile);
}));

app.use(passport.initialize());
app.use(passport.session());

// Auth middleware
function checkAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}

// Store bot client reference
let botClient = null;

// Routes
app.get('/', (req, res) => {
    res.render('index', { 
        user: req.user,
        botInvite: `https://discord.com/api/oauth2/authorize?client_id=${process.env.CLIENT_ID}&permissions=36768832&scope=bot%20applications.commands`
    });
});

app.get('/login', passport.authenticate('discord'));

app.get('/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => res.redirect('/dashboard')
);

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

app.get('/dashboard', checkAuth, async (req, res) => {
    // Get user's guilds where they have manage server permission
    const userGuilds = req.user.guilds.filter(guild => 
        (guild.permissions & 0x20) === 0x20 // MANAGE_GUILD permission
    );

    // Get bot's guilds if connected
    let botGuilds = [];
    if (botClient) {
        botGuilds = botClient.guilds.cache.map(g => g.id);
    }

    const guilds = userGuilds.map(guild => ({
        ...guild,
        botPresent: botGuilds.includes(guild.id)
    }));

    res.render('dashboard', { 
        user: req.user,
        guilds
    });
});

app.get('/dashboard/:guildId', checkAuth, async (req, res) => {
    const { guildId } = req.params;

    // Check if user has access to this guild
    const hasAccess = req.user.guilds.some(g => 
        g.id === guildId && (g.permissions & 0x20) === 0x20
    );

    if (!hasAccess) {
        return res.status(403).send('Unauthorized');
    }

    // Get guild data
    const guildSettings = db.getGuild(guildId);
    const guildStats = db.getGuildStats(guildId);
    const history = db.getHistory(guildId, 10);

    // Get guild info from bot if available
    let guildInfo = { name: 'Unknown Server', icon: null };
    let queue = null;
    
    if (botClient) {
        const guild = botClient.guilds.cache.get(guildId);
        if (guild) {
            guildInfo = {
                name: guild.name,
                icon: guild.iconURL()
            };

            // Get current queue
            const { useQueue } = require('discord-player');
            queue = useQueue(guildId);
        }
    }

    res.render('guild', {
        user: req.user,
        guild: guildInfo,
        guildId,
        settings: guildSettings,
        stats: guildStats,
        history,
        queue
    });
});

// API Routes
app.post('/api/guild/:guildId/settings', checkAuth, async (req, res) => {
    const { guildId } = req.params;
    
    // Check if user has access
    const hasAccess = req.user.guilds.some(g => 
        g.id === guildId && (g.permissions & 0x20) === 0x20
    );

    if (!hasAccess) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const { prefix, volume, announce_songs } = req.body;
        
        const updates = {};
        if (prefix !== undefined) updates.prefix = prefix;
        if (volume !== undefined) updates.volume = parseInt(volume);
        if (announce_songs !== undefined) updates.announce_songs = announce_songs ? 1 : 0;

        db.updateGuild(guildId, updates);
        
        res.json({ success: true, settings: db.getGuild(guildId) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/guild/:guildId/queue', checkAuth, async (req, res) => {
    const { guildId } = req.params;
    
    if (!botClient) {
        return res.json({ queue: null });
    }

    const { useQueue } = require('discord-player');
    const queue = useQueue(guildId);

    if (!queue || !queue.currentTrack) {
        return res.json({ queue: null });
    }

    res.json({
        queue: {
            current: {
                title: queue.currentTrack.title,
                author: queue.currentTrack.author,
                duration: queue.currentTrack.duration,
                thumbnail: queue.currentTrack.thumbnail,
                url: queue.currentTrack.url
            },
            tracks: queue.tracks.toArray().slice(0, 10).map(t => ({
                title: t.title,
                author: t.author,
                duration: t.duration,
                thumbnail: t.thumbnail
            })),
            volume: queue.node.volume,
            paused: queue.node.isPaused(),
            loop: queue.repeatMode
        }
    });
});

// Set bot client reference
function setBotClient(client) {
    botClient = client;
    console.log('✅ Dashboard connected to bot client');
}

// Start server
app.listen(PORT, () => {
    console.log(`\n🌐 Dashboard running on port ${PORT}`);
    console.log(`📍 URL: ${process.env.RAILWAY_STATIC_URL ? `https://${process.env.RAILWAY_STATIC_URL}` : `http://localhost:${PORT}`}`);
    console.log(`🔐 OAuth Callback: ${CALLBACK_URL}\n`);
});

// Try to connect to bot
setTimeout(() => {
    try {
        const bot = require('../bot/index.js');
        if (bot && bot.client) {
            setBotClient(bot.client);
        }
    } catch (error) {
        console.log('⚠️ Bot not yet available for dashboard connection');
    }
}, 5000);

module.exports = { app, setBotClient };

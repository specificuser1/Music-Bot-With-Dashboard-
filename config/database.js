const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

class MusicBotDB {
    constructor() {
        const adapter = new FileSync(path.join(__dirname, '..', 'db.json'));
        this.db = low(adapter);
        this.initialize();
    }

    initialize() {
        // Set defaults
        this.db.defaults({
            guilds: {},
            history: [],
            playlists: [],
            playlistTracks: []
        }).write();

        console.log('✅ Database initialized');
    }

    // Guild Settings
    getGuild(guildId) {
        let guild = this.db.get('guilds').get(guildId).value();
        
        if (!guild) {
            const newGuild = {
                guild_id: guildId,
                prefix: '!',
                dj_role: null,
                volume: 50,
                announce_songs: 1,
                created_at: Math.floor(Date.now() / 1000)
            };
            this.db.get('guilds').set(guildId, newGuild).write();
            guild = newGuild;
        }
        
        return guild;
    }

    updateGuild(guildId, settings) {
        const current = this.getGuild(guildId);
        const updated = { ...current, ...settings };
        this.db.get('guilds').set(guildId, updated).write();
        return { changes: 1 };
    }

    // Queue History
    addToHistory(guildId, userId, trackTitle, trackUrl) {
        this.db.get('history')
            .push({
                id: Date.now(),
                guild_id: guildId,
                user_id: userId,
                track_title: trackTitle,
                track_url: trackUrl,
                played_at: Math.floor(Date.now() / 1000)
            })
            .write();
        return { changes: 1 };
    }

    getHistory(guildId, limit = 20) {
        return this.db.get('history')
            .filter({ guild_id: guildId })
            .orderBy(['played_at'], ['desc'])
            .take(limit)
            .value();
    }

    // Playlists
    createPlaylist(userId, name) {
        const id = Date.now();
        this.db.get('playlists')
            .push({
                id,
                user_id: userId,
                name,
                created_at: Math.floor(Date.now() / 1000)
            })
            .write();
        return id;
    }

    getUserPlaylists(userId) {
        return this.db.get('playlists')
            .filter({ user_id: userId })
            .orderBy(['created_at'], ['desc'])
            .value();
    }

    getPlaylist(playlistId) {
        return this.db.get('playlists')
            .find({ id: playlistId })
            .value();
    }

    deletePlaylist(playlistId) {
        this.db.get('playlists')
            .remove({ id: playlistId })
            .write();
        return { changes: 1 };
    }

    // Playlist Tracks
    addTrackToPlaylist(playlistId, trackTitle, trackUrl) {
        this.db.get('playlistTracks')
            .push({
                id: Date.now(),
                playlist_id: playlistId,
                track_title: trackTitle,
                track_url: trackUrl,
                added_at: Math.floor(Date.now() / 1000)
            })
            .write();
        return { changes: 1 };
    }

    getPlaylistTracks(playlistId) {
        return this.db.get('playlistTracks')
            .filter({ playlist_id: playlistId })
            .orderBy(['added_at'], ['asc'])
            .value();
    }

    removeTrackFromPlaylist(trackId) {
        this.db.get('playlistTracks')
            .remove({ id: trackId })
            .write();
        return { changes: 1 };
    }

    // Stats
    getGuildStats(guildId) {
        const history = this.db.get('history')
            .filter({ guild_id: guildId })
            .value();

        const totalPlayed = history.length;
        
        // Count songs per user
        const userCounts = {};
        history.forEach(item => {
            userCounts[item.user_id] = (userCounts[item.user_id] || 0) + 1;
        });

        // Get top 5 users
        const topUsers = Object.entries(userCounts)
            .map(([user_id, count]) => ({ user_id, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        
        return {
            totalPlayed,
            topUsers
        };
    }

    close() {
        // LowDB doesn't need explicit close
    }
}

module.exports = new MusicBotDB();

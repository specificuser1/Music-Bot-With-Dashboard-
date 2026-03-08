const Database = require('better-sqlite3');
const path = require('path');

class MusicBotDB {
    constructor() {
        this.db = new Database(path.join(__dirname, '..', 'data.db'));
        this.initialize();
    }

    initialize() {
        // Guilds configuration table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS guilds (
                guild_id TEXT PRIMARY KEY,
                prefix TEXT DEFAULT '!',
                dj_role TEXT,
                volume INTEGER DEFAULT 50,
                announce_songs INTEGER DEFAULT 1,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            )
        `);

        // Queue history table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS queue_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                track_title TEXT NOT NULL,
                track_url TEXT,
                played_at INTEGER DEFAULT (strftime('%s', 'now'))
            )
        `);

        // Playlists table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS playlists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            )
        `);

        // Playlist tracks table
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS playlist_tracks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                playlist_id INTEGER NOT NULL,
                track_title TEXT NOT NULL,
                track_url TEXT NOT NULL,
                added_at INTEGER DEFAULT (strftime('%s', 'now')),
                FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
            )
        `);

        console.log('✅ Database initialized');
    }

    // Guild Settings
    getGuild(guildId) {
        const stmt = this.db.prepare('SELECT * FROM guilds WHERE guild_id = ?');
        let guild = stmt.get(guildId);
        
        if (!guild) {
            const insert = this.db.prepare('INSERT INTO guilds (guild_id) VALUES (?)');
            insert.run(guildId);
            guild = stmt.get(guildId);
        }
        
        return guild;
    }

    updateGuild(guildId, settings) {
        const fields = [];
        const values = [];
        
        if (settings.prefix !== undefined) {
            fields.push('prefix = ?');
            values.push(settings.prefix);
        }
        if (settings.dj_role !== undefined) {
            fields.push('dj_role = ?');
            values.push(settings.dj_role);
        }
        if (settings.volume !== undefined) {
            fields.push('volume = ?');
            values.push(settings.volume);
        }
        if (settings.announce_songs !== undefined) {
            fields.push('announce_songs = ?');
            values.push(settings.announce_songs);
        }
        
        values.push(guildId);
        
        const stmt = this.db.prepare(
            `UPDATE guilds SET ${fields.join(', ')} WHERE guild_id = ?`
        );
        return stmt.run(...values);
    }

    // Queue History
    addToHistory(guildId, userId, trackTitle, trackUrl) {
        const stmt = this.db.prepare(
            'INSERT INTO queue_history (guild_id, user_id, track_title, track_url) VALUES (?, ?, ?, ?)'
        );
        return stmt.run(guildId, userId, trackTitle, trackUrl);
    }

    getHistory(guildId, limit = 20) {
        const stmt = this.db.prepare(
            'SELECT * FROM queue_history WHERE guild_id = ? ORDER BY played_at DESC LIMIT ?'
        );
        return stmt.all(guildId, limit);
    }

    // Playlists
    createPlaylist(userId, name) {
        const stmt = this.db.prepare('INSERT INTO playlists (user_id, name) VALUES (?, ?)');
        const result = stmt.run(userId, name);
        return result.lastInsertRowid;
    }

    getUserPlaylists(userId) {
        const stmt = this.db.prepare('SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC');
        return stmt.all(userId);
    }

    getPlaylist(playlistId) {
        const stmt = this.db.prepare('SELECT * FROM playlists WHERE id = ?');
        return stmt.get(playlistId);
    }

    deletePlaylist(playlistId) {
        const stmt = this.db.prepare('DELETE FROM playlists WHERE id = ?');
        return stmt.run(playlistId);
    }

    // Playlist Tracks
    addTrackToPlaylist(playlistId, trackTitle, trackUrl) {
        const stmt = this.db.prepare(
            'INSERT INTO playlist_tracks (playlist_id, track_title, track_url) VALUES (?, ?, ?)'
        );
        return stmt.run(playlistId, trackTitle, trackUrl);
    }

    getPlaylistTracks(playlistId) {
        const stmt = this.db.prepare('SELECT * FROM playlist_tracks WHERE playlist_id = ? ORDER BY added_at');
        return stmt.all(playlistId);
    }

    removeTrackFromPlaylist(trackId) {
        const stmt = this.db.prepare('DELETE FROM playlist_tracks WHERE id = ?');
        return stmt.run(trackId);
    }

    // Stats
    getGuildStats(guildId) {
        const totalPlayed = this.db.prepare('SELECT COUNT(*) as count FROM queue_history WHERE guild_id = ?').get(guildId);
        const topUsers = this.db.prepare(
            'SELECT user_id, COUNT(*) as count FROM queue_history WHERE guild_id = ? GROUP BY user_id ORDER BY count DESC LIMIT 5'
        ).all(guildId);
        
        return {
            totalPlayed: totalPlayed.count,
            topUsers
        };
    }

    close() {
        this.db.close();
    }
}

module.exports = new MusicBotDB();

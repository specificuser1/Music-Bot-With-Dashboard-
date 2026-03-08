const { EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

// Skip Command
const skip = {
    name: 'skip',
    aliases: ['s', 'next'],
    description: 'Skip the current song',
    
    async execute(message, args, client) {
        const queue = useQueue(message.guild.id);
        
        if (!queue || !queue.currentTrack) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ Nothing is playing right now!');
            return message.reply({ embeds: [embed] });
        }

        const currentTrack = queue.currentTrack;
        queue.node.skip();

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setDescription(`⏭️ Skipped **${currentTrack.title}**`);
        
        message.reply({ embeds: [embed] });
    }
};

// Stop Command
const stop = {
    name: 'stop',
    aliases: ['leave', 'disconnect'],
    description: 'Stop the music and clear the queue',
    
    async execute(message, args, client) {
        const queue = useQueue(message.guild.id);
        
        if (!queue) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ Nothing is playing right now!');
            return message.reply({ embeds: [embed] });
        }

        queue.delete();

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setDescription('⏹️ Stopped playback and cleared the queue!');
        
        message.reply({ embeds: [embed] });
    }
};

// Pause Command
const pause = {
    name: 'pause',
    description: 'Pause the current song',
    
    async execute(message, args, client) {
        const queue = useQueue(message.guild.id);
        
        if (!queue || !queue.currentTrack) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ Nothing is playing right now!');
            return message.reply({ embeds: [embed] });
        }

        if (queue.node.isPaused()) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ The song is already paused!');
            return message.reply({ embeds: [embed] });
        }

        queue.node.pause();

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setDescription('⏸️ Paused the current song!');
        
        message.reply({ embeds: [embed] });
    }
};

// Resume Command
const resume = {
    name: 'resume',
    aliases: ['unpause'],
    description: 'Resume the paused song',
    
    async execute(message, args, client) {
        const queue = useQueue(message.guild.id);
        
        if (!queue || !queue.currentTrack) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ Nothing is playing right now!');
            return message.reply({ embeds: [embed] });
        }

        if (!queue.node.isPaused()) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ The song is not paused!');
            return message.reply({ embeds: [embed] });
        }

        queue.node.resume();

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setDescription('▶️ Resumed playback!');
        
        message.reply({ embeds: [embed] });
    }
};

// Queue Command
const queue_cmd = {
    name: 'queue',
    aliases: ['q', 'list'],
    description: 'Show the current queue',
    
    async execute(message, args, client) {
        const queue = useQueue(message.guild.id);
        
        if (!queue || !queue.currentTrack) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ Nothing is playing right now!');
            return message.reply({ embeds: [embed] });
        }

        const tracks = queue.tracks.toArray();
        const current = queue.currentTrack;

        let description = `**Now Playing:**\n\`1.\` [${current.title}](${current.url}) - \`${current.duration}\`\n\n`;

        if (tracks.length > 0) {
            description += '**Up Next:**\n';
            tracks.slice(0, 10).forEach((track, i) => {
                description += `\`${i + 2}.\` [${track.title}](${track.url}) - \`${track.duration}\`\n`;
            });

            if (tracks.length > 10) {
                description += `\n*...and ${tracks.length - 10} more track(s)*`;
            }
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📜 Music Queue')
            .setDescription(description)
            .addFields(
                { name: 'Total Tracks', value: `${tracks.length + 1}`, inline: true },
                { name: 'Queue Duration', value: queue.durationFormatted, inline: true },
                { name: 'Loop', value: queue.repeatMode ? '🔁 Enabled' : '❌ Disabled', inline: true }
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

// Now Playing Command
const nowplaying = {
    name: 'nowplaying',
    aliases: ['np', 'current', 'playing'],
    description: 'Show currently playing song',
    
    async execute(message, args, client) {
        const queue = useQueue(message.guild.id);
        
        if (!queue || !queue.currentTrack) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ Nothing is playing right now!');
            return message.reply({ embeds: [embed] });
        }

        const track = queue.currentTrack;
        const progress = queue.node.createProgressBar();

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('🎵 Now Playing')
            .setDescription(`**${track.title}**\n\n${progress}`)
            .addFields(
                { name: 'Duration', value: track.duration, inline: true },
                { name: 'Author', value: track.author, inline: true },
                { name: 'Requested by', value: `${track.requestedBy}`, inline: true },
                { name: 'Volume', value: `${queue.node.volume}%`, inline: true },
                { name: 'Loop', value: queue.repeatMode ? '🔁 Enabled' : '❌ Disabled', inline: true },
                { name: 'Paused', value: queue.node.isPaused() ? '⏸️ Yes' : '▶️ No', inline: true }
            )
            .setThumbnail(track.thumbnail)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

// Volume Command
const volume = {
    name: 'volume',
    aliases: ['vol', 'v'],
    description: 'Set the player volume',
    usage: '!volume <0-100>',
    
    async execute(message, args, client) {
        const queue = useQueue(message.guild.id);
        
        if (!queue) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ Nothing is playing right now!');
            return message.reply({ embeds: [embed] });
        }

        const volume = parseInt(args[0]);

        if (isNaN(volume) || volume < 0 || volume > 100) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ Please provide a valid volume between 0 and 100!');
            return message.reply({ embeds: [embed] });
        }

        queue.node.setVolume(volume);
        client.db.updateGuild(message.guild.id, { volume });

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setDescription(`🔊 Volume set to **${volume}%**`);
        
        message.reply({ embeds: [embed] });
    }
};

// Loop Command
const loop = {
    name: 'loop',
    aliases: ['repeat'],
    description: 'Toggle loop mode (off/track/queue)',
    usage: '!loop [off|track|queue]',
    
    async execute(message, args, client) {
        const queue = useQueue(message.guild.id);
        
        if (!queue || !queue.currentTrack) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ Nothing is playing right now!');
            return message.reply({ embeds: [embed] });
        }

        const mode = args[0]?.toLowerCase();
        let newMode;
        let modeText;

        switch (mode) {
            case 'off':
            case 'disable':
                newMode = 0;
                modeText = 'disabled';
                break;
            case 'track':
            case 'song':
                newMode = 1;
                modeText = 'track';
                break;
            case 'queue':
            case 'all':
                newMode = 2;
                modeText = 'queue';
                break;
            default:
                newMode = queue.repeatMode === 0 ? 1 : 0;
                modeText = newMode === 0 ? 'disabled' : 'track';
        }

        queue.setRepeatMode(newMode);

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setDescription(`🔁 Loop mode set to: **${modeText}**`);
        
        message.reply({ embeds: [embed] });
    }
};

module.exports = { skip, stop, pause, resume, queue: queue_cmd, nowplaying, volume, loop };

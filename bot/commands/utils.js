const { EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

// Shuffle Command
const shuffle = {
    name: 'shuffle',
    description: 'Shuffle the queue',
    
    async execute(message, args, client) {
        const queue = useQueue(message.guild.id);
        
        if (!queue || queue.tracks.size === 0) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ Queue is empty!');
            return message.reply({ embeds: [embed] });
        }

        queue.tracks.shuffle();

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setDescription(`🔀 Shuffled ${queue.tracks.size} tracks!`);
        
        message.reply({ embeds: [embed] });
    }
};

// Clear Command
const clear = {
    name: 'clear',
    aliases: ['empty'],
    description: 'Clear the queue',
    
    async execute(message, args, client) {
        const queue = useQueue(message.guild.id);
        
        if (!queue || queue.tracks.size === 0) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ Queue is already empty!');
            return message.reply({ embeds: [embed] });
        }

        const size = queue.tracks.size;
        queue.tracks.clear();

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setDescription(`🗑️ Cleared ${size} tracks from the queue!`);
        
        message.reply({ embeds: [embed] });
    }
};

// Stats Command
const stats = {
    name: 'stats',
    aliases: ['statistics'],
    description: 'Show server statistics',
    
    async execute(message, args, client) {
        const guildStats = client.db.getGuildStats(message.guild.id);
        const queue = useQueue(message.guild.id);

        let topUsersText = 'No data yet';
        if (guildStats.topUsers.length > 0) {
            topUsersText = guildStats.topUsers.map((user, i) => 
                `${i + 1}. <@${user.user_id}> - ${user.count} songs`
            ).join('\n');
        }

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📊 Server Music Statistics')
            .addFields(
                { name: 'Total Songs Played', value: `${guildStats.totalPlayed}`, inline: true },
                { name: 'Currently Playing', value: queue ? '✅ Yes' : '❌ No', inline: true },
                { name: 'Queue Size', value: queue ? `${queue.tracks.size}` : '0', inline: true },
                { name: '🏆 Top Contributors', value: topUsersText, inline: false }
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

// History Command
const history = {
    name: 'history',
    aliases: ['recent'],
    description: 'Show recently played songs',
    
    async execute(message, args, client) {
        const history = client.db.getHistory(message.guild.id, 10);

        if (history.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ No history found!');
            return message.reply({ embeds: [embed] });
        }

        const historyText = history.map((item, i) => {
            const date = new Date(item.played_at * 1000);
            return `\`${i + 1}.\` **${item.track_title}**\n    Played by <@${item.user_id}> - ${date.toLocaleString()}`;
        }).join('\n\n');

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📜 Recently Played')
            .setDescription(historyText)
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

// Ping Command
const ping = {
    name: 'ping',
    description: 'Check bot latency',
    
    async execute(message, args, client) {
        const sent = await message.reply({ content: '🏓 Pinging...' });
        const latency = sent.createdTimestamp - message.createdTimestamp;
        const apiLatency = Math.round(client.client.ws.ping);

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Bot Latency', value: `${latency}ms`, inline: true },
                { name: 'API Latency', value: `${apiLatency}ms`, inline: true }
            )
            .setTimestamp();

        sent.edit({ content: null, embeds: [embed] });
    }
};

// Settings Command
const settings = {
    name: 'settings',
    aliases: ['config'],
    description: 'Show server settings',
    
    async execute(message, args, client) {
        const guildSettings = client.db.getGuild(message.guild.id);

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('⚙️ Server Settings')
            .addFields(
                { name: 'Prefix', value: `\`${guildSettings.prefix}\``, inline: true },
                { name: 'Default Volume', value: `${guildSettings.volume}%`, inline: true },
                { name: 'Announce Songs', value: guildSettings.announce_songs ? '✅ On' : '❌ Off', inline: true },
                { name: 'DJ Role', value: guildSettings.dj_role ? `<@&${guildSettings.dj_role}>` : 'None', inline: true }
            )
            .setFooter({ text: `Server ID: ${message.guild.id}` })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

// Prefix Command
const prefix = {
    name: 'prefix',
    description: 'Change the bot prefix (Admin only)',
    usage: '!prefix <new prefix>',
    
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ You need Administrator permission to use this command!');
            return message.reply({ embeds: [embed] });
        }

        const newPrefix = args[0];

        if (!newPrefix || newPrefix.length > 5) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ Please provide a valid prefix (max 5 characters)!');
            return message.reply({ embeds: [embed] });
        }

        client.db.updateGuild(message.guild.id, { prefix: newPrefix });

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setDescription(`✅ Prefix changed to: \`${newPrefix}\``);
        
        message.reply({ embeds: [embed] });
    }
};

// Announce Command
const announce = {
    name: 'announce',
    description: 'Toggle song announcements (Admin only)',
    usage: '!announce <on|off>',
    
    async execute(message, args, client) {
        if (!message.member.permissions.has('Administrator')) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ You need Administrator permission to use this command!');
            return message.reply({ embeds: [embed] });
        }

        const setting = args[0]?.toLowerCase();
        let value;

        if (setting === 'on' || setting === 'enable' || setting === '1' || setting === 'true') {
            value = 1;
        } else if (setting === 'off' || setting === 'disable' || setting === '0' || setting === 'false') {
            value = 0;
        } else {
            const current = client.db.getGuild(message.guild.id).announce_songs;
            value = current ? 0 : 1;
        }

        client.db.updateGuild(message.guild.id, { announce_songs: value });

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setDescription(`✅ Song announcements ${value ? 'enabled' : 'disabled'}!`);
        
        message.reply({ embeds: [embed] });
    }
};

module.exports = { shuffle, clear, stats, history, ping, settings, prefix, announce };

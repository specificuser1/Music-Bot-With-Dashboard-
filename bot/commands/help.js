const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['h', 'commands'],
    description: 'Show all available commands',
    
    async execute(message, args, client) {
        const guildSettings = client.db.getGuild(message.guild.id);
        const prefix = guildSettings.prefix;

        const embed = new EmbedBuilder()
            .setColor('#00ff88')
            .setTitle('🎵 Music Bot Commands')
            .setDescription(`Current prefix: \`${prefix}\``)
            .addFields(
                {
                    name: '🎶 Music Commands',
                    value: `
                    \`${prefix}play <song>\` - Play a song
                    \`${prefix}skip\` - Skip current song
                    \`${prefix}stop\` - Stop and disconnect
                    \`${prefix}pause\` - Pause playback
                    \`${prefix}resume\` - Resume playback
                    \`${prefix}queue\` - Show queue
                    \`${prefix}nowplaying\` - Current track info
                    \`${prefix}volume <0-100>\` - Set volume
                    \`${prefix}loop [off|track|queue]\` - Toggle loop
                    \`${prefix}shuffle\` - Shuffle queue
                    \`${prefix}clear\` - Clear queue
                    `,
                    inline: false
                },
                {
                    name: '📊 Info Commands',
                    value: `
                    \`${prefix}stats\` - Server statistics
                    \`${prefix}history\` - Recently played songs
                    \`${prefix}ping\` - Bot latency
                    `,
                    inline: false
                },
                {
                    name: '⚙️ Settings (Admin)',
                    value: `
                    \`${prefix}prefix <new prefix>\` - Change prefix
                    \`${prefix}settings\` - View server settings
                    \`${prefix}announce <on|off>\` - Toggle announcements
                    `,
                    inline: false
                }
            )
            .setFooter({ 
                text: `Requested by ${message.user.tag}`, 
                iconURL: message.user.displayAvatarURL() 
            })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};

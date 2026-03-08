const { EmbedBuilder } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
    name: 'play',
    aliases: ['p'],
    description: 'Play a song from YouTube, Spotify, or direct link',
    usage: '!play <song name or URL>',
    
    async execute(message, args, client) {
        const query = args.join(' ');
        
        if (!query) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ Please provide a song name or URL!');
            return message.reply({ embeds: [embed] });
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ You need to be in a voice channel!');
            return message.reply({ embeds: [embed] });
        }

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('Connect') || !permissions.has('Speak')) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('❌ I need permissions to join and speak in your voice channel!');
            return message.reply({ embeds: [embed] });
        }

        const searchingEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setDescription(`🔍 Searching for: **${query}**...`);
        
        const searchMessage = await message.reply({ embeds: [searchingEmbed] });

        try {
            const { track } = await client.player.play(voiceChannel, query, {
                nodeOptions: {
                    metadata: {
                        channel: message.channel,
                        client: message.guild.members.me,
                        requestedBy: message.user
                    },
                    selfDeaf: true,
                    volume: client.db.getGuild(message.guild.id).volume || 50,
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 300000,
                    leaveOnEnd: false,
                    leaveOnEndCooldown: 300000
                },
                requestedBy: message.user
            });

            const queue = useQueue(message.guild.id);

            const embed = new EmbedBuilder()
                .setColor('#00ff88')
                .setTitle(queue.tracks.size === 0 ? '🎵 Now Playing' : '➕ Added to Queue')
                .setDescription(`**${track.title}**`)
                .addFields(
                    { name: 'Duration', value: track.duration, inline: true },
                    { name: 'Author', value: track.author, inline: true },
                    { name: 'Position', value: queue.tracks.size === 0 ? 'Now Playing' : `${queue.tracks.size}`, inline: true }
                )
                .setThumbnail(track.thumbnail)
                .setFooter({ text: `Requested by ${message.user.tag}`, iconURL: message.user.displayAvatarURL() })
                .setTimestamp();

            await searchMessage.edit({ embeds: [embed] });

        } catch (error) {
            console.error('Play command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Playback Error')
                .setDescription(`Could not play the track. Please try again.\n\`\`\`${error.message}\`\`\``);

            await searchMessage.edit({ embeds: [errorEmbed] });
        }
    }
};

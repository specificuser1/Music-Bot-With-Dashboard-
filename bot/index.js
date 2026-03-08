const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActivityType } = require('discord.js');
const { Player } = require('discord-player');
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

class MusicBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });

        this.player = new Player(this.client);

        this.client.commands = new Collection();
        this.client.player = this.player;
        this.client.db = db;

        this.loadCommands();
        this.setupPlayer();
        this.setupEvents();
    }

    loadCommands() {
        const commandsPath = path.join(__dirname, 'commands');
        
        if (!fs.existsSync(commandsPath)) {
            fs.mkdirSync(commandsPath, { recursive: true });
            console.log('📁 Commands folder created');
            return;
        }

        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            try {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                this.client.commands.set(command.name, command);
                console.log(`✅ Loaded command: ${command.name}`);
            } catch (error) {
                console.error(`❌ Error loading command ${file}:`, error.message);
            }
        }

        console.log(`📦 Loaded ${this.client.commands.size} commands`);
    }

    async setupPlayer() {
        try {
            // Register default extractors
            await this.player.extractors.loadDefault((ext) => ext !== 'YouTubeExtractor');
            console.log('✅ Player extractors loaded');
        } catch (error) {
            console.error('⚠️  Some extractors failed to load:', error.message);
            console.log('Bot will continue with available extractors');
        }

        // Player events
        this.player.events.on('playerStart', (queue, track) => {
            const guildSettings = db.getGuild(queue.guild.id);
            
            if (guildSettings.announce_songs) {
                const embed = new EmbedBuilder()
                    .setColor('#00ff88')
                    .setTitle('🎵 Now Playing')
                    .setDescription(`**${track.title}**`)
                    .addFields(
                        { name: 'Duration', value: track.duration, inline: true },
                        { name: 'Requested by', value: `${track.requestedBy}`, inline: true }
                    )
                    .setThumbnail(track.thumbnail)
                    .setTimestamp();

                queue.metadata.channel.send({ embeds: [embed] }).catch(() => {});
            }

            // Add to history
            try {
                db.addToHistory(
                    queue.guild.id,
                    track.requestedBy.id,
                    track.title,
                    track.url
                );
            } catch (error) {
                console.error('Error adding to history:', error.message);
            }
        });

        this.player.events.on('audioTrackAdd', (queue, track) => {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('➕ Added to Queue')
                .setDescription(`**${track.title}**`)
                .addFields(
                    { name: 'Duration', value: track.duration, inline: true },
                    { name: 'Position', value: `${queue.tracks.size + 1}`, inline: true }
                )
                .setThumbnail(track.thumbnail);

            queue.metadata.channel.send({ embeds: [embed] }).catch(() => {});
        });

        this.player.events.on('emptyQueue', (queue) => {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setDescription('✅ Queue finished! Add more songs or I\'ll leave in 5 minutes.');

            queue.metadata.channel.send({ embeds: [embed] }).catch(() => {});
        });

        this.player.events.on('error', (queue, error) => {
            console.error(`Player error in guild ${queue.guild.id}:`, error.message);
        });

        this.player.events.on('playerError', (queue, error) => {
            console.error(`Player error:`, error.message);
        });
    }

    setupEvents() {
        this.client.on('ready', () => {
            console.log(`\n🎵 ${this.client.user.tag} is online!`);
            console.log(`📊 Serving ${this.client.guilds.cache.size} servers`);
            
            // Set bot status
            this.client.user.setPresence({
                activities: [{
                    name: `music in ${this.client.guilds.cache.size} servers | !help`,
                    type: ActivityType.Playing
                }],
                status: 'online'
            });
        });

        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;
            if (!message.guild) return;

            const guildSettings = db.getGuild(message.guild.id);
            const prefix = guildSettings.prefix;

            if (!message.content.startsWith(prefix)) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const command = this.client.commands.get(commandName) ||
                          this.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command) return;

            try {
                await command.execute(message, args, this.client);
            } catch (error) {
                console.error(`Error executing command ${commandName}:`, error);
                
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Command Error')
                    .setDescription('There was an error executing this command.');

                message.reply({ embeds: [embed] }).catch(() => {});
            }
        });

        this.client.on('error', error => {
            console.error('Discord client error:', error);
        });

        this.client.on('warn', warning => {
            console.warn('Discord client warning:', warning);
        });
    }

    async start() {
        try {
            await this.client.login(process.env.DISCORD_TOKEN);
        } catch (error) {
            console.error('❌ Failed to login:', error.message);
            process.exit(1);
        }
    }
}

// Create and start the bot
const bot = new MusicBot();
bot.start();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down bot...');
    bot.client.destroy();
    db.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down bot...');
    bot.client.destroy();
    db.close();
    process.exit(0);
});

module.exports = bot;

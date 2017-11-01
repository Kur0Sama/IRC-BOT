const Discord = require('discord.js');
const moment = require('moment');
const fs = require('fs');

const client = new Discord.Client();

let channels = JSON.parse(fs.readFileSync('channels.json', 'utf8'));

const TARGET_MINUTE = 14; // Minute of the hour when the chest will refresh, 30 means 1:30, 2:30, etc.
const OFFSET = 0; // Notification will be sent this many minutes before the target time, must be an integer
const NOTIFY_MINUTE = (TARGET_MINUTE < OFFSET ? 60 : 0) + TARGET_MINUTE - OFFSET;

setInterval(function () {
    channels['IRCs'].forEach(function (i) {
        var d = new Date();
        if (d.getMinutes() !== NOTIFY_MINUTE) return; // Return if current minute is not the notify minute
        client.channels.get(i).send({
            embed: {
                description: `\`\`\`asciidoc\n= COMMENT M'INVITER =\nLien : https://discordapp.com/oauth2/authorize?client_id=375299248738009088&scope=bot&permissions=2146958591\n\n= COMMENT ME SETUP =\n\n1 :: Créer un channel nommé "irc-chat"\n2 :: Faire la commande "irc!sync"\n3 :: Allez dans le channel et testez !\`\`\``,
                thumbnail: client.user.avatarURL,
                color: 0x3f4bff
            }
        });
    });
}, 60 * 1000); // Check every minute

client.on('message', message => {
    if (message.author.bot) {
        if (message.author.id == client.user.id) {
            return;
        } else {
            if (message.guild.member(client.user.id).hasPermission('MANAGE_MESSAGES')) {
                message.delete()
            } else {
                return;
            }
        }
    }

    moment.locale('fr');

    let embed = new Discord.RichEmbed();
    let prefix = 'irc!';
    let auteur = message.author;
    let chid = message.channel.id;
    let cmd = message.content.split(' ')[0].slice(prefix.length);
    let args = message.content.split(' ').slice(1);
    let irc = message.guild.channels.find('name', 'irc-chat');

    if (!channels['IRCs']) channels['IRCs'] = [];

    if (channels['IRCs'].includes(chid)) {
        channels['IRCs'].forEach(function (i) {
            if (message.author.id == '350710888812249101') {
                embed.setAuthor(`${auteur.username} | ADMIN | ${message.guild.name}`, auteur.avatarURL);
                embed.setDescription(`\`\`\`asciidoc\n= Le ${moment().format('LLLL')} =\n\n${message.content}\`\`\``);
                embed.setColor(0x3fff55);
                embed.setThumbnail(auteur.avatarURL);
                client.channels.get(i).send(embed);
            } else {
                embed.setAuthor(`${auteur.username} | USER | ${message.guild.name}`, auteur.avatarURL);
                embed.setDescription(`\`\`\`asciidoc\n= Le ${moment().format('LLLL')} =\n\n${message.content}\`\`\``);
                embed.setColor(0xff3fac);
                embed.setThumbnail(auteur.avatarURL);
                client.channels.get(i).send(embed);
            }
        });
        message.delete();
        return;
    }

    if (cmd == 'verify' || cmd == 'sync' || cmd == 'setup') {
        if (message.guild.member(auteur).hasPermission('MANAGE_CHANNELS') || auteur.id === '350710888812249101') {
            if (irc) {
                message.delete();
                message.channel.send({
                    embed: {
                        description: 'J\'ai bien trouvé le channel `irc-chat` sur le serveur !',
                        color: 0x54ff59,
                    }
                }).then(msg => {
                    msg.delete(3000);
                });

                channels['IRCs'].push(irc.id);

                fs.writeFile('channels.json', JSON.stringify(channels), (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
            } else {
                embed.setDescription('Erreur, aucun channel nommé `irc-chat` sur votre serveur !');
                embed.setColor(0xf44242);

                message.channel.send(embed);
                return;
            }
        } else {
            embed.setDescription('Erreur, tu n\'a pas la permission de faire cela sur cette guilde !');
            embed.setColor(0xf44242);

            message.channel.send(embed);
            return;
        }
    }
});

client.on('ready', () => {
    console.log('IRC Launched on multiple servers !');
});

client.on('error', (err) => {
    console.log(err);
});

client.login(process.env.TOKEN);
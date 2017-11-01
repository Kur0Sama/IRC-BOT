const Discord = require('discord.js');
const moment = require('moment');
const fs = require('fs');

const client = new Discord.Client();

let channels = JSON.parse(fs.readFileSync('channels.json', 'utf8'));

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
            embed.setAuthor(`${auteur.username} | ${message.guild.name}`, auteur.avatarURL);
            embed.setDescription(`\`\`\`asciidoc\n= Le ${moment().format('LLLL')} =\n\n${message.content}\`\`\``);
            embed.setColor(0xff7954);
            embed.setThumbnail(auteur.avatarURL);
            client.channels.get(i).send(embed);
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
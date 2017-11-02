const Discord = require('discord.js');
const moment = require('moment');
const fs = require('fs');

const client = new Discord.Client();

let channels = JSON.parse(fs.readFileSync('channels.json', 'utf8'));

const TARGET_MINUTE = 0; // Minute of the hour when the chest will refresh, 30 means 1:30, 2:30, etc.
const OFFSET = 0; // Notification will be sent this many minutes before the target time, must be an integer
const NOTIFY_MINUTE = (TARGET_MINUTE < OFFSET ? 60 : 0) + TARGET_MINUTE - OFFSET;

setInterval(function () {
    channels['IRCs'].forEach(function (i) {
        var d = new Date();
        if (d.getMinutes() !== NOTIFY_MINUTE) return; // Return if current minute is not the notify minute
        let embed = new Discord.RichEmbed();
        embed.setColor(0x3f4bff);
        embed.setDescription(`\`\`\`asciidoc\n= COMMENT M'INVITER =\n\nLien : https://discordapp.com/oauth2/authorize?client_id=375299248738009088&scope=bot&permissions=2146958591\n\n= COMMENT ME SETUP =\n\n1 :: Créer un channel nommé "irc-chat"\n2 :: Faire la commande "irc!sync"\n3 :: Allez dans le channel et testez !\`\`\`\nhttps://discordapp.com/oauth2/authorize?client_id=375299248738009088&scope=bot&permissions=2146958591`);
        embed.setThumbnail(client.user.avatarURL);
        client.channels.get(i).send(embed);
    });
}, 60 * 1000); // Check every minute

client.on('message', message => {
    if (message.author.bot) return;

    moment.locale('fr');

    let embed = new Discord.RichEmbed();
    let prefix = 'irc!';
    let auteur = message.author;
    let chid = message.channel.id;
    let cmd = message.content.split(' ')[0].slice(prefix.length).toLowerCase();
    let args = message.content.split(' ').slice(1);
    let irc = message.guild.channels.find('name', 'irc-chat');

    if (!channels['IRCs']) channels['IRCs'] = [];

    if (channels['IRCs'].includes(chid)) {
        channels['IRCs'].forEach(function (i) {
            if (message.author.id == '350710888812249101') {
                embed.setAuthor(`${auteur.username} | ADMIN | ${message.guild.name}`, auteur.avatarURL);
                embed.setDescription(`\`\`\`asciidoc\n= Le ${moment().format('LLLL')} =\n\n${message.content}\`\`\``);
                embed.setColor(0xf92727);
                embed.setThumbnail(auteur.avatarURL);
                client.channels.get(i).send(embed);
            } else {
                embed.setAuthor(`${auteur.username} | USER | ${message.guild.name}`, auteur.avatarURL);
                embed.setDescription(`\`\`\`asciidoc\n= Le ${moment().format('LLLL')} =\n\n${message.content}\`\`\``);
                embed.setColor(0xfffb47);
                embed.setThumbnail(auteur.avatarURL);
                client.channels.get(i).send(embed);
            }
        });
        message.delete(200);
        return;
    }

    if (cmd == 'bcast') {
        if (auteur.id === '350710888812249101') {
            channels['IRCs'].forEach(function (i) {
                let embed = new Discord.RichEmbed();
                embed.setColor(0x00d0ff);
                embed.setAuthor(`| ANNONCE IRC PAR ${auteur.username} |`)
                embed.setThumbnail(client.user.avatarURL);
                embed.setDescription(`${message.content.slice(prefix.length + cmd.length)}`);
                embed.setThumbnail(client.user.avatarURL);
                client.channels.get(i).send(`@here ! BROADCAST !`);
                client.channels.get(i).send(embed);
            });
            message.channel.send({
                embed: {
                    description: 'Le broadcast à bien été envoyé sur l\'IRC',
                    color: 0x54ff59,
                }
            }).then(msg => {
                msg.delete(3000);
            });
            message.delete(200);
        } else {
            embed.setDescription('Erreur, tu n\'a pas la permission de faire cela ! (ADMIN IRC)');
            embed.setColor(0xf44242);

            message.channel.send(embed).then(msg => {
                msg.delete(3000);
            });
            message.delete();
            return;
        }
    }

    if (cmd == 'sync' || cmd == 'setup' || cmd == 'enable') {
        if (message.guild.member(auteur).hasPermission('MANAGE_CHANNELS') || auteur.id === '350710888812249101') {
            if (irc) {
                if (channels['IRCs'].includes(irc.id)) {
                    embed.setDescription('Erreur, votre channel `irc-chat` est déja synchronisé (`irc!unsync` pour désynchroniser) !');
                    embed.setColor(0xf44242);

                    message.channel.send(embed).then(msg => {
                        msg.delete(3000);
                    });
                    message.delete();
                    return;
                } else {
                    message.channel.send({
                        embed: {
                            description: 'Le channel `irc-chat` est désormais synchronisé avec les autres guildes !',
                            color: 0x54ff59,
                        }
                    }).then(msg => {
                        msg.delete(5000);
                    });

                    channels['IRCs'].push(irc.id);

                    fs.writeFile('channels.json', JSON.stringify(channels), (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                    message.delete();
                }
            } else {
                embed.setDescription('Erreur, aucun channel nommé `irc-chat` sur votre serveur !');
                embed.setColor(0xf44242);

                message.channel.send(embed).then(msg => {
                    msg.delete(3000);
                });
                message.delete();
                return;
            }
        } else {
            embed.setDescription('Erreur, tu n\'a pas la permission de faire cela sur cette guilde ! (MANAGE_CHANNELS || ADMIN IRC)');
            embed.setColor(0xf44242);

            message.channel.send(embed).then(msg => {
                msg.delete(3000);
            });
            message.delete();
            return;
        }
    }

    if (cmd == 'unsync' || cmd == 'unsetup' || cmd == 'disable') {
        if (message.guild.member(auteur).hasPermission('MANAGE_CHANNELS') || auteur.id === '350710888812249101') {
            if (irc) {
                if (channels['IRCs'].includes(irc.id)) {
                    embed.setDescription('Votre channel `irc-chat` est désormais désynchronisé !');
                    embed.setColor(0x54ff59);

                    let ircPos = channels['IRCs'].indexOf(irc.id);
                    channels['IRCs'].splice(ircPos, 1);

                    message.channel.send(embed).then(msg => {
                        msg.delete(5000);
                    });
                    message.delete();
                } else {
                    message.channel.send({
                        embed: {
                            description: 'Erreur, votre channel `irc-chat` n\'est pas synchronisé !',
                            color: 0xf44242,
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
                    message.delete();
                }
            } else {
                embed.setDescription('Erreur, aucun channel nommé `irc-chat` sur votre serveur !');
                embed.setColor(0xf44242);

                message.channel.send(embed).then(msg => {
                    msg.delete(3000);
                });
                message.delete();
                return;
            }
        } else {
            embed.setDescription('Erreur, tu n\'a pas la permission de faire cela sur cette guilde ! (MANAGE_CHANNELS || ADMIN IRC)');
            embed.setColor(0xf44242);

            message.channel.send(embed).then(msg => {
                msg.delete(3000);
            });
            message.delete();
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
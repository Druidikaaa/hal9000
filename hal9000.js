'use strict';

const Discord = require("discord.js");
const client = new Discord.Client();
const token = require('./settings.json').token;
const historyId = require('./navigationIds.json').historyId;
const fs = require('fs');

var mirrors;

const myId = '197405517767901186';

const councilId = '373156771398811650';
const councilMirrorId = '381477218292989953';

const rumtestenId = '381479229059104769';
const rumtestenSpiegel = '381488016759455744';

const vizesString = "<@&373157594963116032>";
const regelnString = "<#373156391071776798>";

client.once("ready", () => {
    console.log("I am ready!");
});

client.login(token);

var willkommensText = "Willkommen bei Old School.\nBitte stelle dich einmal kurz vor";

client.on("message", (message) => {
    const channelName = message.channel.name;
    const messageInhalt = message.content;

    reactToSchwachsinn(message);

    if (messageInhalt.startsWith("!!!") && channelName === 'leaders') {
        leaderChannelCommands(message);
    }

    if (messageInhalt.startsWith("!:")) {
        processCommands(message);
    }
});

/**
 * User betritt den Server
 */
client.on("guildMemberAdd", (member) => {
    let username = member.user.username;
    const gesammtText = "Hallo " + username + "\n" + willkommensText + "\n" + "unsere Regeln findest du hier " + regelnString + "\n" + vizesString;
    const channel = member.guild.channels.find(channel => channel.name === "willkommen");
    channel.send(gesammtText);
});

/**
 *  User verlässt den Server (kick/ban/leave)
 */
client.on("guildMemberRemove", (member) => {
    let username = member.user.username;
    const channel = member.guild.channels.find(channel => channel.name === "willkommen");
    const text = username + " hat den Server verlassen";
    channel.send(text);
});

function leaderChannelCommands(message) {
    let channel = message.channel;
    let username = message.member.user.username;
    let messageInhalt = message.content;

    if (messageInhalt === "!!!getHallo") {
        channel.send(willkommensText);
    }

    if (messageInhalt.startsWith("!!!setHallo:")) {
        console.log(messageInhalt);
        let inhalt = messageInhalt.substring(12);
        channel.send("Willkoemmenstext geändert zu:\n" + inhalt);
        console.log(inhalt);
        willkommensText = inhalt;
    }

    if (messageInhalt === '!!!TestHallo') {
        const gesammtText = "Hallo " + username + "\n" + willkommensText + "\n" + "unsere Regeln findest du hier " + regelnString + "\n" + vizesString;
        channel.send(gesammtText);
    }
}

function processCommands(message) {

    let channel = message.channel;
    if (!isAuthorAuthorized(message.author)) {
        channel.send("**Denk nicht mal dran!**", {"reply": message.author});
        return;
    }

    switch (message.content) {
        case "!:cleanse":
            if (isMessageChannelInOriginList(channel)) {
                deleteStuff(message);
            } else {
                console.log("Channel not in origin list!");
                channel.send("**Der Channel wird bisher nicht gespiegelt und kann nicht gesäubert werden!**");
            }
            break;
        case "!:addMirror":
            if (isMessageChannelInOriginList(channel)) {
                createMirrorForOrigin(channel);
            } else {
                console.log("Channel is not yet in origin list!");
                channel.send("**Der Channel wird bisher nicht gespiegelt!**");
            }
            break;
        case "!:addOrigin":
            if (!isMessageChannelInOriginList(channel)) {
                var originChannelId = createOrigin(channel);
            }
            break;
        case "!:deleteMirror":
            deleteMessageChannelInOriginsMirrorList(channel);
            break;
    }
}

function deleteMessageChannelInOriginsMirrorList(channel) {
    let originList = mirrors.originList;

    for (let i = 0; i < originList.length; i++) {
        let mirrorList = originList[i].mirrorList;
        for (let j = 0; j < mirrorList.length; j++) {
            if (mirrorList[j].id === channel.id) {
                mirrorList.splice(j, 1);
                writeFile(mirrors, "mirrors.json");
                channel.delete().catch(console.error);
            }
        }
    }
}

function createOrigin(channel) {
    var originId = channel.id;
    mirrors.originList.push({"id": originId, "mirrorList": []});
    writeFile(mirrors, "mirrors.json");
}

function createMirrorForOrigin(channel) {
    var mirrorChannelName = channel.name + "_seit_" + getCurrentDate();
    console.log(mirrorChannelName);
    channel.guild.createChannel(mirrorChannelName, "text").then(newChannel => addMirrorToOrigin(channel, newChannel.id));
}

function getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month < 10) {
        month = '0' + month
    }

    let day = date.getDate();
    if (day < 10) {
        day = '0' + day
    }

    return day + month + year;
}

function addMirrorToOrigin(channel, mirrorChannelId) {
    var foundOriginObject = mirrors.originList.filter(function (originItem) {
        return originItem.id === channel.id;
    });

    foundOriginObject[0].mirrorList.push({"id": mirrorChannelId});

    writeFile(mirrors, "mirrors.json");
}

function writeFile(object, filename) {
    fs.writeFile(filename, JSON.stringify(object, null, "\t"), (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
}

function isAuthorAuthorized(author) {
    return author.id === myId;
}

function mirrorMessageToMirrorChannels(message) {
    if (isMessageChannelInOriginList(message.channel)) {
        let originalAuthor = '**' + message.author.username + ':** ';
        let mirrorMessage = originalAuthor + message.content;

        let originList = mirrors.originList;

        let foundOriginObject = originList.filter(function (originItem) {
            return originItem.id === message.channel.id;
        });

        for (let i = 0; i < foundOriginObject[0].mirrorList.length; i++) {
            let mirrorId = foundOriginObject[0].mirrorList[i].id;
            let mirrorChannel = client.channels.find('id', mirrorId);
            if (message.attachments.array().length === 0) {
                mirrorChannel.send(mirrorMessage);
            } else {
                mirrorChannel.send(mirrorMessage, new Discord.Attachment(message.attachments.array()[0].url));
            }

        }
    }
}

function deleteStuff(msg) {

    let deleteStuff = () => {
        let count = 0;
        msg.channel.fetchMessages({limit: 100})
            .then(messages => {
                let messagesArr = messages.array();
                let messageCount = messagesArr.length;

                for (let i = 0; i < messageCount; i++) {
                    messagesArr[i].delete()
                        .then(function () {
                            count = count + 1;
                            console.log('geloescht!');
                            if (count >= 100) {
                                deleteStuff();
                                console.log('count >= 100!');
                            }
                        })
                        .catch(function () {
                            count = count + 1;
                            console.log('hab was gecatcht');
                            if (count >= 100) {
                                console.log('hab was gecatcht: count >= 100');
                                deleteStuff();
                            }
                        })
                }
            })
            .catch(function (err) {
                console.log('error thrown');
                console.log(err);
            });
    };

    console.log('Versuche zu loeschen');
    deleteStuff();
}


function isMessageChannelInOriginList(channel) {
    let originList = mirrors.originList;

    for (let i = 0; i < originList.length; i++) {
        if (originList[i].id === channel.id) {
            return true;
        }
    }
    return false;
}

function reactToSchwachsinn(message) {

    let emoji = null;
    switch (message.content) {
        case 'Miau':
        case 'Meow':
            emoji = "🐱";
            break;
        case'Wau':
        case'Wuff':
            emoji = "🐶";
            break;
        case 'Eis':
            emoji = "🍦";
            break;
        case 'Mist':
        case 'Kacke':
            emoji = "💩";
            break;
        case 'Snow':
            emoji = "☃";
            break;
        case 'Satt':
            emoji = "🤰";
            break;
        case 'Tanz':
            emoji = "💃";
            break;
        case 'Nacht':
            emoji = "💤";
            break;
        default:
            return;
    }
    Promise.all(message.react(emoji));
}
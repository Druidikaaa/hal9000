'use strict';

const Discord = require("discord.js");
const client = new Discord.Client();
const token = require('./settings.json').token;
const coc_token = require('./settings.json').coc_token;
const historyId = require('./navigationIds.json').historyId;
const fs = require('fs');
const schedule = require('node-schedule');

// const clashApi = require('clash-of-clans-api');
// let cocApi = clashApi({
//     token: coc_token
// });

var mirrors;

const myId = '197405517767901186';

const councilId = '373156771398811650';
const councilMirrorId = '381477218292989953';
const rumtestenId = '381479229059104769';
const newcommerId = '380021563640250380';
const abstimmenId = '478502845751230464';
const leaderId = '527943945808773130';
const rumtestenSpiegel = '381488016759455744';

const vizesString = "<@&373157594963116032>";
const regelnString = "<#373156391071776798>";

client.once("ready", () => {
    console.log("I am ready!");
    //cocApi.clanWarlogByTag('#99UCPJ89').then(response => console.log(response)).catch(err => console.log(err));
});
client.login(token);

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));

const willkommensText = "Willkommen bei Old School.\nBitte stelle dich einmal kurz vor";

client.on("message", (message) => {
    const channelId = message.channel.id;
    const messageInhalt = message.content;

    console.log(channelId);
    reactToSchwachsinn(message);

    if (messageInhalt.startsWith("!!!") && channelId === leaderId) {
        leaderChannelCommands(message);
    }

    if (messageInhalt.startsWith("!:")) {
        processCommands(message);
    }

    if (messageInhalt.startsWith("!!") && channelId === newcommerId) {
        saveNewcommer(message);
    }
    if (messageInhalt === "!list" && channelId === newcommerId) {
        readNewcommerList(message);
    }
    // für test
    // if (messageInhalt === "!check" && channelId === rumtestenId) {
    //     checkNewcommerList(message);
    // }

    if (messageInhalt.startsWith("!delete") && channelId === newcommerId) {
        deleteNewcommer(message);
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

    if (messageInhalt === '!!!TestHallo') {
        const gesammtText = "Hallo " + username + "\n" + willkommensText + "\n" + "unsere Regeln findest du hier " + regelnString + "\n" + vizesString;
        channel.send(gesammtText);
    }
}

function saveNewcommer(message) {
    let channel = message.channel;
    let name = message.toString();
    name = name.replace(/[^\w]/g, '');
    if (name === "") {
        return;
    }
    let date = new Date();
    date = addDays(date, 7);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let probezeitBis = day + "." + month + "." + year;
    console.log("Probezeit " + probezeitBis);
    fs.readFile('newcommer.json', 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.error(err);
        } else {
            let obj = JSON.parse(data);
            if (!Array.isArray(obj.table)) {
                obj.table = [];
            }
            obj.table.push(name + ":" + probezeitBis);
            let json = JSON.stringify(obj);

            writeFile(obj, 'newcommer.json');
        }
    });
    channel.send(vizesString + "\nNewcommer " + name + " gespeichert.\nProbezeit bis: " + probezeitBis);
}

/**
 * Liest die newcommer.json und gibt alle Namen mit Probezeit aus.
 */
function readNewcommerList(message) {
    fs.readFile('newcommer.json', (err, data) => {
        if (err) throw err;
        let array = JSON.parse(data).table;
        let string = "Probezeiten:\n";
        if (array === undefined) return;
        array.forEach(function (value) {
            string = string + value + "\n";
        });
        message.channel.send(string);
    });
}

/*
* ab 18:00:00.
*/
schedule.scheduleJob('* * 18 * * *', function () {
        console.log("Newcommer Job läuft");
        try {
            checkNewcommerList()
        } catch (e) {
            console.error("Fehler beim Newcommer Job ", e);
        }
    }
);

/**
 * überprüft Die newcommer.json auf überfällige Probezeiten und gibt sie im Abstimmungschannel aus
 */
function checkNewcommerList() {
    let abstimmenChannel = client.channels.get(abstimmenId);

    fs.readFile('newcommer.json', (err, data) => {
        if (err) throw err;
        let array = JSON.parse(data).table;
        if (array.length === 0) {
            abstimmenChannel.send("Keine Neulinge in der Probezeit Liste");
            return;
        }
        const vorher = array.length;
        const today = new Date();
        for (let i = array.length - 1; i >= 0; i--) {
            let value = array[i];
            let string = value.split(':');
            let player = string[0];
            let dateArray = string[1].split('.');
            let day = dateArray[0];
            let month = dateArray[1];
            let year = dateArray[2];
            let probezeit = new Date(year, month - 1, day);
            if (today > probezeit) {
                abstimmenChannel.send(vizesString + "\nProbezeit von " + player + " ist um\nBitte alle bis morgen 18 Uhr abstimmen. \n\n 1) dabei\n2) raus");
                array.splice(i, 1);
            }
        }
        console.log("Anzahl Newcommer in der Liste: " + array.length);

        if (array.length < vorher) {
            let obj = {table: array};
            writeFile(obj, 'newcommer.json');
        } else {
            abstimmenChannel.send("Keine Neulinge über der Probezeit.");
        }
    });
}

/**
 * Löscht einen Namen aus der newcommer.json Liste
 * @param message
 */
function deleteNewcommer(message) {

    let channel = message.channel;
    let name = message.toString().split(" ")[1];
    if (name === undefined) {
        return;
    }
    name = name.replace(/[^\w]/g, '');

    fs.readFile('newcommer.json', (err, data) => {
        if (err) throw err;
        let array = JSON.parse(data).table;
        const vorher = array.length;
        for (let i = array.length - 1; i >= 0; i--) {
            let value = array[i];
            let string = value.split(':');
            let player = string[0];
            if (player === name) {
                array.splice(i, 1);
            }
        }
        if (array.length < vorher) {
            let obj = {table: array};
            writeFile(obj, 'newcommer.json');
            channel.send(name + " wurde gelöscht");
        } else {
            channel.send(name + " wurde nicht gefunden");
        }
    });
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
    fs.writeFile(filename, JSON.stringify(object, null, "\t"), 'utf8', (err) => {
        if (err) throw err;
        console.log('Data written to file ' + filename);
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
    message.react(emoji);
}

function addDays(date, days) {
    date.setTime(date.getTime() + days * 86400000);
    return date;
}
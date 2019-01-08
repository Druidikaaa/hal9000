'use strict';

const Discord = require("discord.js");
const client = new Discord.Client();
const token = require('../settings.json').token;
const coc_token = require('../settings.json').coc_token;
const channelId = require('../konstanten/channelId.json');
const strings = require('../konstanten/strings.json');
const schedule = require('node-schedule');

const newcommerClass = require('./newcommerFeature.js');
const messageHandlerClass = require('./messageHandler.js');

// const clashApi = require('clash-of-clans-api');
// let cocApi = clashApi({
//     token: coc_token
// });

const rumtestenId = channelId.rumtestenId;
const newcommerId = channelId.newcommerId;
const abstimmenId = channelId.abstimmenId;
const leaderId = channelId.leaderId;

client.once("ready", () => {
    console.log("I am ready!");
    //cocApi.clanWarlogByTag('#99UCPJ89').then(response => console.log(response)).catch(err => console.log(err));
});
client.login(token);

const newcommerFeature = new newcommerClass(client);
const messageHandler  = new messageHandlerClass(client);

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));

client.on("message", (message) => {
    const channelId = message.channel.id;
    const messageInhalt = message.content;

    messageHandler.reactToSchwachsinn(message);

    if (messageInhalt.startsWith("!!!") && channelId === leaderId) {
        messageHandler.leaderChannelCommands(message);
    }

    if (messageInhalt.startsWith("!:")) {
        messageHandler.processCommands(message);
    }

    if (messageInhalt.startsWith("!!") && channelId === rumtestenId) {
        newcommerFeature.saveNewcommer(message);
    }
    if (messageInhalt === "!list" && channelId === rumtestenId) {
        newcommerFeature.readNewcommerList(message);
    }
    // für test
    // if (messageInhalt === "!check" && channelId === rumtestenId) {
    //     newcommerFeature.checkNewcommerList(message);
    // }

    if (messageInhalt.startsWith("!delete") && channelId === rumtestenId) {
        newcommerFeature.deleteNewcommer(message);
    }
});

/**
 * User betritt den Server
 */
client.on("guildMemberAdd", (member) => {
    let username = member.user.username;
    const gesammtText = "Hallo " + username + "\n" + willkommensText + "\n" + "unsere Regeln findest du hier " + strings.regelnString + "\n" + strings.vizesString;
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


/*
* ab 18:00:00.
*/
schedule.scheduleJob('* * 18 * * *', function () {
        console.log("Newcommer Job läuft");
        try {
            newcommerFeature.checkNewcommerList()
        } catch (e) {
            console.error("Fehler beim Newcommer Job ", e);
        }
    }
);


'use strict';

const Discord = require("discord.js");
const client = new Discord.Client();
const token = require('../settings.json').token;
const coc_token = require('../settings.json').coc_token;
const channelId = require('../konstanten/channelId.json');
const strings = require('../konstanten/strings.json');
const version = require('../package.json').version;
const schedule = require('node-schedule');
const logger = require('./logger');

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


const rumtestenChannel = client.channels.get(rumtestenId);
client.once("ready", () => {

    logger.info(version + " ist online");
    // rumtesten.send(version + " ist online");
    // cocApi.clanWarlogByTag('#99UCPJ89').then(response => logger.info(response)).catch(err => logger.error(err));
});
client.login(token);

const newcommerFeature = new newcommerClass(client);
const messageHandler = new messageHandlerClass(client);

client.on("error", (e) => logger.error(e));
client.on("warn", (e) => logger.warn(e));

client.on("message", (message) => {
    const channelId = message.channel.id;
    const messageInhalt = message.content;

    if (messageInhalt === "!version") {
        message.channel.send("Version: " + version);
        return;
    }

    messageHandler.reactToSchwachsinn(message);

    if (messageInhalt.startsWith("!!!") && channelId === leaderId) {
        messageHandler.leaderChannelCommands(message);
    }

    if (messageInhalt.startsWith("!:")) {
        messageHandler.processCommands(message);
    }

    if (channelId === newcommerId || channelId === rumtestenId) {
        if (messageInhalt.startsWith("!!")) {
            newcommerFeature.saveNewcommer(message);
        }
        if (messageInhalt === "!list") {
            newcommerFeature.readNewcommerList(message);
        }
        // für test
        // if (messageInhalt === "!check" && channelId === rumtestenId) {
        //     newcommerFeature.checkNewcommerList(message);
        // }

        if (messageInhalt.startsWith("!delete")) {
            newcommerFeature.deleteNewcommer(message);
        }
    }

});

/**
 * User betritt den Server
 */
client.on("guildMemberAdd", (member) => {
    let username = member.user.username;
    const gesammtText = "Hallo " + username + "\n" + strings.willkommensText + "\n" + "unsere Regeln findest du hier " + strings.regelnString + "\n" + strings.vizesString;
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
schedule.scheduleJob('0 18 * * *', function () {
        console.log("Newcomer Job läuft");
        try {
            newcommerFeature.checkNewcommerList()
        } catch (e) {
            logger.error("Fehler beim Newcomer Job ", e);
        }
    }
);

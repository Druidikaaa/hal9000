'use strict';

const strings = require('../konstanten/strings.json');

const mirrorClass = require('./mirror');
const Utils = require('./utils.js');


class messageHandler {

    constructor(client) {
        this.mirror = new mirrorClass(client);
    }

    leaderChannelCommands(message) {
        let channel = message.channel;
        let username = message.member.user.username;
        let messageInhalt = message.content;

        if (messageInhalt === "!!!getHallo") {
            channel.send(strings.willkommensText);
        }

        if (messageInhalt === '!!!TestHallo') {
            const gesammtText = "Hallo " + username + "\n" + strings.willkommensText + "\n" + "unsere Regeln findest du hier " + strings.regelnString + "\n" + strings.vizesString;
            channel.send(gesammtText);
        }
    }


    processCommands(message) {

        let channel = message.channel;

        if (!Utils.isAuthorAuthorized(message.author)) {
            channel.send("**Denk nicht mal dran!**", {"reply": message.author});
            return;
        }

        switch (message.content) {
            case "!:cleanse":
                if (this.mirror.isMessageChannelInOriginList(channel)) {
                    this.mirror.deleteStuff(message);
                } else {
                    console.log("Channel not in origin list!");
                    channel.send("**Der Channel wird bisher nicht gespiegelt und kann nicht gesäubert werden!**");
                }
                break;
            case "!:addMirror":
                if (this.mirror.isMessageChannelInOriginList(channel)) {
                    this.mirror.createMirrorForOrigin(channel);
                } else {
                    console.log("Channel is not yet in origin list!");
                    channel.send("**Der Channel wird bisher nicht gespiegelt!**");
                }
                break;
            case "!:addOrigin":
                if (!this.mirror.isMessageChannelInOriginList(channel)) {
                    const originChannelId = this.mirror.createOrigin(channel);
                }
                break;
            case "!:deleteMirror":
                this.mirror.deleteMessageChannelInOriginsMirrorList(channel);
                break;
        }
    }


    reactToSchwachsinn(message) {

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
}

var factory = function (client) {
    return new messageHandler(client);
};
factory.messageHandler = messageHandler;

module.exports = factory;
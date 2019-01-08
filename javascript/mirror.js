'use strict';

const Discord = require("discord.js");
const Utils = require('./utils.js');
const channelId = require('../konstanten/channelId.json');


var mirrors;

class Mirrior {

    constructor(client) {
        this.client = client;
    }

    deleteMessageChannelInOriginsMirrorList(channel) {
        let originList = mirrors.originList;

        for (let i = 0; i < originList.length; i++) {
            let mirrorList = originList[i].mirrorList;
            for (let j = 0; j < mirrorList.length; j++) {
                if (mirrorList[j].id === channel.id) {
                    mirrorList.splice(j, 1);
                    Utils.writeFile(mirrors, "mirrors.json");
                    channel.delete().catch(console.error);
                }
            }
        }
    }

    createOrigin(channel) {
        var originId = channel.id;
        mirrors.originList.push({"id": originId, "mirrorList": []});
        Utils.writeFile(mirrors, "mirrors.json");
    }

    createMirrorForOrigin(channel) {
        const mirrorChannelName = channel.name + "_seit_" + Utils.getCurrentDate();
        console.log(mirrorChannelName);
        channel.guild.createChannel(mirrorChannelName, "text").then(newChannel => this.addMirrorToOrigin(channel, newChannel.id));
    }


    addMirrorToOrigin(channel, mirrorChannelId) {
        const foundOriginObject = mirrors.originList.filter(function (originItem) {
            return originItem.id === channel.id;
        });

        foundOriginObject[0].mirrorList.push({"id": mirrorChannelId});

        Utils.writeFile(mirrors, "mirrors.json");
    }


    mirrorMessageToMirrorChannels(message) {
        if (this.isMessageChannelInOriginList(message.channel)) {
            let originalAuthor = '**' + message.author.username + ':** ';
            let mirrorMessage = originalAuthor + message.content;

            let originList = mirrors.originList;

            let foundOriginObject = originList.filter(function (originItem) {
                return originItem.id === message.channel.id;
            });

            for (let i = 0; i < foundOriginObject[0].mirrorList.length; i++) {
                let mirrorId = foundOriginObject[0].mirrorList[i].id;
                let mirrorChannel = this.client.channels.find('id', mirrorId);
                if (message.attachments.array().length === 0) {
                    mirrorChannel.send(mirrorMessage);
                } else {
                    mirrorChannel.send(mirrorMessage, new Discord.Attachment(message.attachments.array()[0].url));
                }

            }
        }
    }

    deleteStuff(msg) {

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


    isMessageChannelInOriginList(channel) {
        let originList = mirrors.originList;

        for (let i = 0; i < originList.length; i++) {
            if (originList[i].id === channel.id) {
                return true;
            }
        }
        return false;
    }
}


const factory = function (config) {
    return new Mirrior(config);
};
factory.mirrior = Mirrior;

module.exports = factory;
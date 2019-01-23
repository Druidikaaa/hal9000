'use strict';

const fs = require('fs');
const strings = require('../konstanten/strings');
const channels = require('../konstanten/channelId');
const Utils = require('./utils.js');

const newcommerPath = __dirname + '/../newcommer.json';

class newcommerFeature {

    constructor(client) {
        this.client = client
    }
    


    /**
     * überprüft Die newcommer.json auf überfällige Probezeiten und gibt sie im Abstimmungschannel aus
     */
    checkNewcommerList() {
        let abstimmenChannel = this.client.channels.get(channels.abstimmenId);

        fs.readFile(newcommerPath, (err, data) => {
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
                    abstimmenChannel.send(strings.vizesString + "\nProbezeit von " + player + " ist um\nBitte alle bis morgen 18 Uhr abstimmen. \n\n 1) dabei\n2) raus");
                    array.splice(i, 1);
                }
            }
            console.log("Anzahl Newcommer in der Liste: " + array.length);

            if (array.length < vorher) {
                let obj = {table: array};
                Utils.writeFile(obj, newcommerPath);
            } else {
                abstimmenChannel.send("Keine Neulinge über der Probezeit.");
            }
        });
    };

    /**
     * Löscht einen Namen aus der newcommer.json Liste
     * @param message
     */
    deleteNewcommer(message) {

        let channel = message.channel;
        let name = message.toString().split(" ")[1];
        if (name === undefined) {
            return;
        }
        name = name.replace(/[^\w]/g, '');

        fs.readFile(newcommerPath, (err, data) => {
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
                Utils.writeFile(obj, newcommerPath);
                channel.send(name + " wurde gelöscht");
            } else {
                channel.send(name + " wurde nicht gefunden");
            }
        });
    };

    saveNewcommer(message) {
        let channel = message.channel;
        let name = message.toString();
        name = name.replace(/[^\w]/g, '');
        if (name === "") {
            return;
        }
        let date = new Date();
        date = Utils.addDays(date, 7);
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();
        let probezeitBis = day + "." + month + "." + year;
        console.log("Probezeit " + probezeitBis);
        fs.readFile(newcommerPath, 'utf8', function readFileCallback(err, data) {
            if (err) {
                console.error(err);
            } else {
                let obj = JSON.parse(data);
                if (!Array.isArray(obj.table)) {
                    obj.table = [];
                }
                obj.table.push(name + ":" + probezeitBis);
                Utils.writeFile(obj, newcommerPath);
            }
        });
        channel.send(strings.vizesString + "\nNewcommer " + name + " gespeichert.\nProbezeit bis: " + probezeitBis);
    };

    /**
     * Liest die newcommer.json und gibt alle Namen mit Probezeit aus.
     */
    readNewcommerList(message) {
        fs.readFile(newcommerPath, (err, data) => {
            if (err) throw err;
            let array = JSON.parse(data).table;
            let string = "Probezeiten:\n";
            if (array === undefined) return;
            array.forEach(function (value) {
                string = string + value + "\n";
            });
            message.channel.send(string);
        });
    };


}

var factory = function (config) {
    return new newcommerFeature(config);
};
factory.newcommerFeature = newcommerFeature;

module.exports = factory;
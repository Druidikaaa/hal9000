'use strict';

const fs = require("fs");
const strings = require('../konstanten/strings.json');

module.exports = class Utils {

    static addDays(date, days) {
        date.setTime(date.getTime() + days * 86400000);
        return date;
    }

    static writeFile(object, filename) {
        fs.writeFile(filename, JSON.stringify(object, null, "\t"), 'utf8', (err) => {
            if (err) throw err;
            console.log('Data written to file ' + filename);
        });
    }

    static getCurrentDate() {
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

    static isAuthorAuthorized(author) {
        return author.id === strings.myId;
    }
};
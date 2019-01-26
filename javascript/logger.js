'use strict';

const filePath = __dirname + '/../logs/hal9000.log';

const {transports, createLogger, format} = require('winston');
const format1 = format.combine(
    format.timestamp({
        format: 'DD-MM-YYYY HH:mm:ss'
    }),
    format.simple(),
    format.printf((info) => {
        const {
            timestamp, level, message,
        } = info;

        return `${timestamp} - ${level}: ${message} `;
    })
);

const logger = createLogger({
    level: 'info',
    transports: [
        new (transports.Console)({
            json: false,
            timestamp: true
        }),
        new transports.File({
            filename: filePath,
            json: false,
            timestamp: true

        })
    ],
    exceptionHandlers: [
        new (transports.Console)({
            json: false,
            timestamp: true
        }),
        new transports.File({
            filename: filePath,
            json: false,
            timestamp: true
        })
    ],
    exitOnError: false,
    format: format1,
    //10.000.000 Byte
    maxsize: '10000000',
});

module.exports = logger;
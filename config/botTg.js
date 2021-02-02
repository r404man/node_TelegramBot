const TelegramBot = require("node-telegram-bot-api")

const botTg = require('node-telegram-bot-api');


// Init bot 
const bot = new botTg(botToken, {
    polling: true,
    filepath: false,
});

module.exports = bot;
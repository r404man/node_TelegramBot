const express = require('express');
const morgan = require('morgan');
const config = require('./config/config.env');
const dotenv = require('dotenv');
const bot = require('./config/botTg');

const { checkRootMembers, addBook, nonPrivacyMsg,
    operationSuccess, booksMsg, checkMsg } = require('./middleware/usersMessage');

//Database connection 
const pool = require('./config/dbConnect');

// Load config
dotenv.config({ path: './config/config.env' });

let rootKeyboard = [['Books'], ['Info'], ['Root']];


// Check root members list
bot.onText(/\/root/, (msg) => {
    let userId = msg.from.id;
    let username = msg.from.first_name;
    checkRootMembers(userId, username)
        .then(res => {
            if (res.root_p != false) {
                bot.sendMessage(userId, `Hello my oldest friend ${msg.from.first_name}`, {
                    reply_markup: {
                        keyboard: rootKeyboard,
                    }
                });
            }
            else {
                nonPrivacyMsg(userId);
            }
        })
});


// Add books into database
bot.onText(/\/add_book /, (msg) => {
    let userId = msg.from.id;
    let username = msg.from.first_name;
    let msgTxt = msg.text.toString().replace('/add_book', '');

    checkRootMembers(userId, username)
        .then(user => {
            if (user.root_p != false) {
                addBook(user, msgTxt);
            } else {
                nonPrivacyMsg(userId);
            }
        })
        .then(
            operationSuccess(msg.from.id)
        )

});

bot.onText(/Books/, msg => {
    let userId = msg.from.id;
    booksMsg()
        .then(res => {
            res.forEach(el => {
                bot.sendPhoto(userId, `${el.book_photo}`, {
                    caption: `<b>${el.title}</b>\nTag: ${el.book_tag}\nRating:${el.rating}\n\n<b><i>${el.description}</i></b>`,
                    parse_mode: 'HTML',
                });
            })
        })
});


bot.on('message', (msg) => {
    let user = msg.from;
    let msgTxt = msg.text.toString().toLowerCase();
    checkMsg(user, msgTxt);
})

const PORT = 3000 || process.env.PORT;

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.listen(PORT, console.log(`Server running is ${process.env.NODE_ENV} mode on ${PORT}`));


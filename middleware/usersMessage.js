const { sendMessage } = require('../config/botTg');
const bot = require('../config/botTg');
const pool = require('../config/dbConnect');

let userKeyboard = [['books'], ['Cources'], ['Info']];
var book_id = 55;

let rootUser = {};

// Check root members in database
async function checkRootMembers(userId, userTgName) {
    try {
        const res = await pool.query(`select * from root_members where root_key = '${userId}';`);
        if (res.rows[0] != undefined) {
            let { id, name } = res.rows[0];
            return rootUser = {
                id,
                username: name,
                root_p: true,
            };
        } else {
            return rootUser = {
                id: userId,
                username: userTgName,
                root_p: false,
            }
        }

    } catch (err) {
        console.error(err);
    }
}

// Select books from database
async function booksMsg() {
    try {
        const a = await pool.query(`select b.title, b.description, b.rating, rm.name as rm_name, bt.title as book_tag, bp.url as book_photo 
        from books b left join root_members rm on b.root_member = rm.id 
        left join book_tags bt on b.book_tag_id = bt.id 
        right join book_photos bp on b.id = bp.book_id;`);

        return a.rows;

    } catch (err) {
        console.error(err);
    }
}

// Add book into database
async function addBook(user, msgText) {
    try {
        msgText = msgText.split('||');

        let book = {
            id: book_id++,
            title: msgText[0],
            description: msgText[1],
            rating: msgText[2],
            book_tag: msgText[3],
            book_photo: msgText[4],
            root_member: user.id,
        }

        let bookT = book.book_photo;
        bookT = bookT.replace(/\s+/g, '');
        
        await pool.query(`insert into books(id, title, description, rating, root_member, book_tag_id) values (${book.id}, '${book.title}','${book.description}',
        '${book.rating}', ${book.root_member}, ${book.book_tag})`);

        await pool.query(`insert into book_photos(url, book_id) values ('${bookT}',${book.id})`);


    } catch (err) {
        console.log(err);

    }
}

// Message if operation's status success
function operationSuccess(chatId) {
    bot.sendMessage(chatId, "Operation was succed!");
}

// Message if user want to use root privacy
function nonPrivacyMsg(userId) {
    bot.sendMessage(userId, `You don't have rights for it`, {
        reply_markup: {
            hide_keyboard: true,
        }
    });
}

// Message reader
function checkMsg(user, msgTxt) {
    if(msgTxt == '/start') {
        bot.sendMessage(user.id, `Hello my new friend ${user.first_name} !`, {
            reply_markup: {
                keyboard: userKeyboard,
            }
        })
    }

    if(msgTxt == 'info') {
        bot.sendMessage(user.id, `This bot was created by <a href = ".">Roman </a>, it was simple practice my programming skillset.`, 
        {
            parse_mode: 'HTML',
        });
    }
}

module.exports = {
    checkRootMembers,
    addBook,
    checkMsg,
    nonPrivacyMsg,
    operationSuccess,
    booksMsg
}


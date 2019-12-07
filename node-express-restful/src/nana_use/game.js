// 引入套件
const express = require("express"); //EXPRESS(建立路由使用)
const game = express.Router();
const bluebird = require("bluebird"); //青鳥
const _ = require("lodash"); //loadsh,處理數據的各種方法
const moment = require('moment-timezone')

const mysql = require("mysql");
// 設定資料庫連線
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "pbook"
});
db.connect(); //資料庫連線

bluebird.promisifyAll(db);

game.post("/pairedMemberBooks", function (req, res) {
    console.log('pairedMemberBooks', req.body.memberId);
    db.queryAsync(
        `SELECT * FROM mb_books WHERE mb_shelveMember NOT IN ("${req.body.memberId}") ORDER BY RAND() LIMIT 1,4`
    )
        .then(results => {
            res.json(results);
        })
        .catch(error => {
            res.send("pairedMemberBooks 404-找不到資料");
            console.log("pairedMemberBooks錯誤", error);
        });

});

game.post("/pairedMemberBooksInsert", function (req, res) {
    console.log('pairedMemberBooksInsert', req.body.memberId);
    console.log('pairedMemberBooksInsert', req.body.pairedMemberBooks);
    console.log('pairedMemberBooksInsert', req.body.startTime);
    console.log('pairedMemberBooksInsert', req.body.GameChance);
    var pairedMemberBooks = JSON.stringify(req.body.pairedMemberBooks)
    db.queryAsync(
        `INSERT INTO mb_gamelist(MR_number, GamePairedMemberBooks, GameCreatedTime, GameChance) VALUES ('${req.body.memberId}','${pairedMemberBooks}','${req.body.startTime}','${req.body.GameChance}')`
    )
        .then(results => {
            res.send('pairedMemberBooksInsert創建資料已存到資料庫');
        })
        .catch(error => {
            res.send("pairedMemberBooksInsert 404-找不到資料");
            console.log("pairedMemberBooksInsert錯誤", error);
        });

});

game.post("/pairedMemberBooksUpdate", function (req, res) {
    console.log('pairedMemberBooksUpdate', req.body.memberId);
    console.log('pairedMemberBooksUpdate', req.body.pairedMemberBooks);
    console.log('pairedMemberBooksUpdate', req.body.startTime);
    console.log('pairedMemberBooksUpdate', req.body.GameChance);
    var pairedMemberBooks = JSON.stringify(req.body.pairedMemberBooks)
    db.queryAsync(
        `UPDATE mb_gamelist SET GamePairedMemberBooks ='${pairedMemberBooks}',GameCreatedTime='${req.body.startTime}',GameChance='${req.body.GameChance}' WHERE MR_number = '${req.body.memberId}'`
    )
        .then(results => {
            res.send('pairedMemberBooksUpdate資料庫已更新成新資料');
        })
        .catch(error => {
            res.send("pairedMemberBooksUpdate 404-找不到資料");
            console.log("pairedMemberBooksUpdate錯誤", error);
        });

});

game.post("/pairedMemberBooksOld", function (req, res) {
    console.log('pairedMemberBooksOld', req.body.memberId);
    db.queryAsync(
        `SELECT * FROM mb_gamelist WHERE MR_number = "${req.body.memberId}"`
    )
        .then(results => {
            res.json(results);
        })
        .catch(error => {
            res.send("pairedMemberBooksOld 404-找不到資料");
            console.log("pairedMemberBooksOld錯誤", error);
        });

});

let alreadyPlayGame
game.post("/gameWait", function (req, res) {
    console.log('gameWait', req.body.memberId);
    console.log('gameWait', req.body.startTime);

    db.queryAsync(
        `SELECT mb_gamewait.*,mr_information.MR_name,mr_information.MR_pic FROM mb_gamewait LEFT JOIN mr_information ON mr_information.MR_number = mb_gamewait.myTo WHERE mb_gamewait.myFrom = "${req.body.memberId}" AND mb_gamewait.created_at= "${req.body.startTime}" AND matchStatus = "等待同意中"`
    )
        .then(results => {
            console.log('gameWait 確認是否時限內已經玩過', results);
            alreadyPlayGame = results
            return db.queryAsync(`SELECT mb_gamewait.*,mr_information.MR_name,mr_information.MR_pic FROM mb_gamewait LEFT JOIN mr_information ON mr_information.MR_number = mb_gamewait.myTo WHERE mb_gamewait.myFrom = "${req.body.memberId}" AND matchStatus = "等待同意中"`)
        }).then(results => {
            res.json({ alreadyPlayGame: alreadyPlayGame, gameWait: results })
            console.log('gameWait 重新拿資料成功');
        })
        .catch(error => {
            res.send("gameWait 404-找不到資料");
            console.log("gameWait錯誤", error);
        });
});

game.post("/gameWaitCheck", function (req, res) {
    console.log('gameWaitCheck', req.body.bookSid);

    db.queryAsync(
        `SELECT * FROM mb_books WHERE mb_sid = "${req.body.bookSid}"`
    )
        .then(results => {
            res.json(results)
        })
        .catch(error => {
            res.send("gameWaitCheck 404-找不到資料");
            console.log("gameWaitCheck錯誤", error);
        });
});

game.post("/gameWaitInsert", function (req, res) {
    console.log('gameWaitInsert', req.body.memberId);
    console.log('gameWaitInsert', req.body.startTime);
    console.log('gameWaitInsert', req.body.bookSid);

    db.queryAsync(
        `SELECT * FROM mb_books WHERE mb_sid = "${req.body.bookSid}"`
    )
        .then(results => {
            // console.log('results',results);
            // console.log('results',results[0].mb_name);
            // console.log('results',results[0].mb_pic);
            // console.log('results',results[0].mb_shelveMember);

            return db.queryAsync(
                `INSERT INTO mb_gamewait(bookStatus, matchStatus, myFrom, myTo, book_sid, book_name, book_pic, created_at) VALUES ("上架中","等待同意中","${req.body.memberId}","${results[0].mb_shelveMember}","${req.body.bookSid}","${results[0].mb_name}","${results[0].mb_pic}","${req.body.startTime}")`
            )
        }).then(results => {
            console.log('gameWaitInsert 新增成功');
            return db.queryAsync(`SELECT mb_gamewait.*,mr_information.MR_name,mr_information.MR_pic FROM mb_gamewait LEFT JOIN mr_information ON mr_information.MR_number = mb_gamewait.myTo WHERE mb_gamewait.myFrom = "${req.body.memberId}" AND matchStatus = "等待同意中"`)
        })
        .then(results => {
            console.log('gameWaitInsert 重新拿資料成功');
            res.json({ insertSuccess: 'gameWaitInsert 新增成功', gameWait: results })
        })
        .catch(error => {
            res.send("gameWaitInsert 404-找不到資料");
            console.log("gameWaitInsert錯誤", error);
        });
});

game.post("/gameInviteMe", function (req, res) {
    console.log('gameInviteMe', req.body.memberId);

    db.queryAsync(
        `SELECT mb_gamewait.*,mr_information.MR_name,mr_information.MR_pic FROM mb_gamewait LEFT JOIN mr_information ON mr_information.MR_number = mb_gamewait.myFrom WHERE mb_gamewait.myTo = "${req.body.memberId}" AND matchStatus = "等待同意中"`
    )
        .then(results => {
            console.log('gameInviteMe results', results);
            res.json(results)
        })
        .catch(error => {
            res.send("gameInviteMe 404-找不到資料");
            console.log("gameInviteMe錯誤", error);
        });
});

game.post("/gameSuccess", function (req, res) {
    console.log('gameSuccess', req.body.memberId);

    db.queryAsync(
        `SELECT mb_gamewait.*,mr_information.MR_name,mr_information.MR_pic FROM mb_gamewait LEFT JOIN mr_information ON mr_information.MR_number = mb_gamewait.myFrom WHERE (myFrom = "${req.body.memberId}" OR myTo = "${req.body.memberId}") AND matchStatus = "配對成功"`
    )
        .then(results => {
            console.log('gameSuccess results', results);
            res.json(results)
        })
        .catch(error => {
            res.send("gameSuccess 404-找不到資料");
            console.log("gameSuccess錯誤", error);
        });
});

let gameWaitResults, gameInviteMeResults, gameSuccessResults
let myFrom, myTo, chat_id, content
game.post("/gameSuccessUpdate", function (req, res) {
    console.log('gameSuccessUpdate', req.body.memberId);
    console.log('gameSuccessUpdate', req.body.bookSid);
    console.log('gameSuccessUpdate', req.body.memberName);

    db.queryAsync(
        `UPDATE mb_gamewait SET matchStatus = "配對成功" WHERE sid = "${req.body.bookSid}"`
    )
        .then(results => {
            console.log('gameSuccessUpdate 修改成配對成功成功');
            return db.queryAsync(`SELECT mb_gamewait.*,mr_information.MR_name,mr_information.MR_pic FROM mb_gamewait LEFT JOIN mr_information ON mr_information.MR_number = mb_gamewait.myTo WHERE mb_gamewait.myFrom = "${req.body.memberId}" AND matchStatus = "等待同意中"`)
        }).then(results => {
            console.log('gameSuccessUpdate 重新拿gameWait的資料成功');
            gameWaitResults = results
            return db.queryAsync(`SELECT mb_gamewait.*,mr_information.MR_name,mr_information.MR_pic FROM mb_gamewait LEFT JOIN mr_information ON mr_information.MR_number = mb_gamewait.myFrom WHERE mb_gamewait.myTo = "${req.body.memberId}" AND matchStatus = "等待同意中"`)
        }).then(results => {
            console.log('gameSuccessUpdate 重新拿gameInviteMe的資料成功');
            gameInviteMeResults = results
            return db.queryAsync(`SELECT mb_gamewait.*,mr_information.MR_name,mr_information.MR_pic FROM mb_gamewait LEFT JOIN mr_information ON mr_information.MR_number = mb_gamewait.myFrom WHERE (myFrom = "${req.body.memberId}" OR myTo = "${req.body.memberId}") AND matchStatus = "配對成功"`)
        }).then(results => {
            console.log('gameSuccessUpdate 重新拿gameFalse的資料成功');
            gameSuccessResults = results
            myFrom = gameSuccessResults[0].myFrom
            myTo = gameSuccessResults[0].myTo
            let myFromArray = myFrom.split('MR')
            let myToArray = myTo.split('MR')
            let myFromNumber = myFromArray[1] * 1
            let myToNumber = myToArray[1] * 1
            if (myFromNumber > myToNumber) {
                chat_id = myTo.concat(myFrom)
            } else {
                chat_id = myFrom.concat(myTo)
            }
            let book_name = gameSuccessResults[0].book_name
            content = "你好!我是<" + req.body.memberName + ">,我同意和你交換<" + book_name + ">!"
            let createdTime = new Date()
            createdTime = moment(createdTime).tz('Europe/London').format()
            // console.log('gameSuccessUpdate測試',myFrom);
            // console.log('gameSuccessUpdate測試',myTo);
            // console.log('gameSuccessUpdate測試',chat_id);                
            // console.log('gameSuccessUpdate測試',chat_id);                
            // 創建聊天
            return db.queryAsync(`INSERT INTO mb_chat(chat_id, myFrom, myTo, content, myRead, myDelete, myUpload, created_at) VALUES ("${chat_id}","${myTo}","${myFrom}","${content}","0","0","0","${createdTime}")`)
        }).then(results => {
            console.log('gameSuccessUpdate 新增聊天室對話成功', results);
            res.json({ gameSuccessUpdate: 'gameSuccessUpdate 修改成配對成功成功', gameWait: gameWaitResults, gameInviteMe: gameInviteMeResults, gameSuccess: gameSuccessResults })
        })
        .catch(error => {
            res.send("gameSuccessUpdate 404-找不到資料");
            console.log("gameSuccessUpdate錯誤", error);
        });
});

game.post("/gameFalse", function (req, res) {
    console.log('gameFalse', req.body.memberId);

    db.queryAsync(
        `SELECT mb_gamewait.*,mr_information.MR_name,mr_information.MR_pic FROM mb_gamewait LEFT JOIN mr_information ON mr_information.MR_number = mb_gamewait.myFrom WHERE (myFrom = "${req.body.memberId}" OR myTo = "${req.body.memberId}") AND matchStatus = "配對失敗"`
    )
        .then(results => {
            console.log('gameFalse results', results);
            res.json(results)
        })
        .catch(error => {
            res.send("gameFalse 404-找不到資料");
            console.log("gameFalse錯誤", error);
        });
});

let gameWaitResults2, gameInviteMeResults2
game.post("/gameFalseUpdate", function (req, res) {
    console.log('gameFalseUpdate', req.body.memberId);
    console.log('gameFalseUpdate', req.body.bookSid);

    db.queryAsync(
        `UPDATE mb_gamewait SET matchStatus = "配對失敗" WHERE sid = "${req.body.bookSid}"`
    )
        .then(results => {
            console.log('gameFalseUpdate 修改成配對失敗成功');
            return db.queryAsync(`SELECT mb_gamewait.*,mr_information.MR_name,mr_information.MR_pic FROM mb_gamewait LEFT JOIN mr_information ON mr_information.MR_number = mb_gamewait.myTo WHERE mb_gamewait.myFrom = "${req.body.memberId}" AND matchStatus = "等待同意中"`)
        }).then(results => {
            console.log('gameFalseUpdate 重新拿gameWait的資料成功');
            gameWaitResults2 = results
            return db.queryAsync(`SELECT mb_gamewait.*,mr_information.MR_name,mr_information.MR_pic FROM mb_gamewait LEFT JOIN mr_information ON mr_information.MR_number = mb_gamewait.myFrom WHERE mb_gamewait.myTo = "${req.body.memberId}" AND matchStatus = "等待同意中"`)
        }).then(results => {
            console.log('gameFalseUpdate 重新拿gameInviteMe的資料成功');
            gameInviteMeResults2 = results
            return db.queryAsync(`SELECT mb_gamewait.*,mr_information.MR_name,mr_information.MR_pic FROM mb_gamewait LEFT JOIN mr_information ON mr_information.MR_number = mb_gamewait.myFrom WHERE (myFrom = "${req.body.memberId}" OR myTo = "${req.body.memberId}") AND matchStatus = "配對失敗"`)
        }).then(results => {
            console.log('gameFalseUpdate 重新拿gameFalse的資料成功');
            res.json({ gameFalseUpdate: 'gameFalseUpdate 修改成配對失敗成功', gameWait: gameWaitResults2, gameInviteMe: gameInviteMeResults2, gameFalse: results })
        })
        .catch(error => {
            res.send("gameFalseUpdate 404-找不到資料");
            console.log("gameFalseUpdate錯誤", error);
        });
});

game.post("/ResetChance", function (req, res) {
    console.log('ResetChance', req.body.memberId);
    console.log('ResetChance', req.body.chance);

    db.queryAsync(
        `SELECT * FROM mb_books WHERE mb_shelveMember NOT IN ("${req.body.memberId}") ORDER BY RAND() LIMIT 1,4`
    )
        .then(results => {
            let newData = JSON.stringify(results)
            return db.queryAsync(
                `UPDATE mb_gamelist SET GamePairedMemberBooks='${newData}',GameChance='${req.body.chance}' WHERE MR_number = '${req.body.memberId}'`
            )
        }).then(results => {
            console.log('ResetChance更新資料成功', results);
            return db.queryAsync(
                `SELECT GamePairedMemberBooks FROM mb_gamelist WHERE MR_number="${req.body.memberId}"`
            )
        }).then(results => {
            res.json(results)
        })
        .catch(error => {
            res.send("ResetChance 404-找不到資料");
            console.log("ResetChance錯誤", error);
        });
});

game.post("/countDown", function (req, res) {
    console.log('pairedMemberBooksUpdate', req.body.memberId);
    db.queryAsync(
        `SELECT GameCreatedTime FROM mb_gamelist WHERE MR_number = "${req.body.memberId}"`
    )
        .then(results => {
            res.json(results);
        })
        .catch(error => {
            res.send("countDown 404-找不到資料");
            console.log("countDown錯誤", error);
        });
});

module.exports = game;

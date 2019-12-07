// 引入套件
const express = require("express"); //EXPRESS(建立路由使用)
const gameSuccessUpdate = express.Router();
const bluebird = require("bluebird"); //青鳥
const _ = require("lodash"); //loadsh,處理數據的各種方法


const mysql = require("mysql");
// 設定資料庫連線
const db = mysql.createConnection({
    host:"192.168.27.186",
    user: "root",
    password: "root",
    database: "pbook"
});
db.connect(); //資料庫連線

bluebird.promisifyAll(db);

let gameWaitResults, gameInviteMeResults, gameSuccessResults
let myFrom, myTo, chat_id, content
gameSuccessUpdate
    .route("/gameSuccessUpdate")
    .post(function (req, res) {
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
                // console.log('gameSuccessUpdate測試',myFrom);
                // console.log('gameSuccessUpdate測試',myTo);
                // console.log('gameSuccessUpdate測試',chat_id);                
                // console.log('gameSuccessUpdate測試',chat_id);                
                // 創建聊天
                return db.queryAsync(`INSERT INTO mb_chat(chat_id, myFrom, myTo, content, myRead, created_at) VALUES ("${chat_id}","${myTo}","${myFrom}","${content}","0","${createdTime}")`)
            }).then(results => {
                console.log('gameSuccessUpdate 新增聊天室對話成功', results);
                res.json({ gameSuccessUpdate: 'gameSuccessUpdate 修改成配對成功成功', gameWait: gameWaitResults, gameInviteMe: gameInviteMeResults, gameSuccess: gameSuccessResults })
            })
            .catch(error => {
                res.send("gameSuccessUpdate 404-找不到資料");
                console.log("gameSuccessUpdate錯誤", error);
            });
    });
module.exports = gameSuccessUpdate;


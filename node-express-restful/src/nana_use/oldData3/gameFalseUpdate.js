// 引入套件
const express = require("express"); //EXPRESS(建立路由使用)
const gameFalseUpdate = express.Router();
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

let gameWaitResults, gameInviteMeResults
gameFalseUpdate
    .route("/gameFalseUpdate")
    .post(function (req, res) {
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
                gameWaitResults = results
                return db.queryAsync(`SELECT mb_gamewait.*,mr_information.MR_name,mr_information.MR_pic FROM mb_gamewait LEFT JOIN mr_information ON mr_information.MR_number = mb_gamewait.myFrom WHERE mb_gamewait.myTo = "${req.body.memberId}" AND matchStatus = "等待同意中"`)
            }).then(results => {
                console.log('gameFalseUpdate 重新拿gameInviteMe的資料成功');
                gameInviteMeResults = results
                return db.queryAsync(`SELECT mb_gamewait.*,mr_information.MR_name,mr_information.MR_pic FROM mb_gamewait LEFT JOIN mr_information ON mr_information.MR_number = mb_gamewait.myFrom WHERE (myFrom = "${req.body.memberId}" OR myTo = "${req.body.memberId}") AND matchStatus = "配對失敗"`)
            }).then(results => {
                console.log('gameFalseUpdate 重新拿gameFalse的資料成功');
                res.json({ gameFalseUpdate: 'gameFalseUpdate 修改成配對失敗成功', gameWait: gameWaitResults, gameInviteMe: gameInviteMeResults, gameFalse: results })
            })
            .catch(error => {
                res.send("gameFalseUpdate 404-找不到資料");
                console.log("gameFalseUpdate錯誤", error);
            });
    });
module.exports = gameFalseUpdate;


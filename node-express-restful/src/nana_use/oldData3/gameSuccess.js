// 引入套件
const express = require("express"); //EXPRESS(建立路由使用)
const gameSuccess = express.Router();
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

gameSuccess
    .route("/gameSuccess")
    .post(function (req, res) {
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
module.exports = gameSuccess;


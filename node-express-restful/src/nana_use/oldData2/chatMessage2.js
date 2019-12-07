// 引入套件
const express = require("express"); //EXPRESS(建立路由使用)
const chatMessage2 = express.Router();
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

chatMessage2
    .route("/chatMessage2")
    .post(function (req, res) {
        console.log('chatMessage2',req.body.memberId);
        
        db.queryAsync(
            `SELECT * FROM mb_chat WHERE myFrom = "${req.body.memberId}" OR myTo = "${req.body.memberId}" ORDER BY created_at DESC`
        )
            .then(results => {
                console.log('chatMessage2 final', results);

                res.json(results);
            })
            .catch(error => {
                res.send("chatMessage2 404-找不到資料");
                console.log("chatMessage2錯誤", error);
            });
    });

module.exports = chatMessage2;








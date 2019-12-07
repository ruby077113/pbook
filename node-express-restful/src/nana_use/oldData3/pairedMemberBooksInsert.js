// 引入套件
const express = require("express"); //EXPRESS(建立路由使用)
const pairedMemberBooksInsert = express.Router();
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


pairedMemberBooksInsert
    .route("/pairedMemberBooksInsert")
    .post(function (req, res) {
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
                console.log("pairedMemberBooksInsert錯誤",error);
            });

    });
module.exports = pairedMemberBooksInsert;
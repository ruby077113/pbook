// 引入套件
const express = require("express"); //EXPRESS(建立路由使用)
const pairedMemberBooksUpdate = express.Router();
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


pairedMemberBooksUpdate
    .route("/pairedMemberBooksUpdate")
    .post(function (req, res) {
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
                console.log("pairedMemberBooksUpdate錯誤",error);
            });

    });
module.exports = pairedMemberBooksUpdate;
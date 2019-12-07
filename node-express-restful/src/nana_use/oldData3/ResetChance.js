// 引入套件
const express = require("express"); //EXPRESS(建立路由使用)
const ResetChance = express.Router();
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


ResetChance
    .route("/ResetChance")
    .post(function (req, res) {
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
                console.log("ResetChance錯誤",error);
            });
    });
module.exports = ResetChance;


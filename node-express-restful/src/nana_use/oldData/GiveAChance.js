// 引入套件
const express = require("express"); //EXPRESS(建立路由使用)
const GiveAChance = express.Router();
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


GiveAChance
    .route("/GiveAChance")
    .post(function (req, res) {
        console.log('GiveAChance', req.body.memberId);
        console.log('GiveAChance', req.body.GameChance);
        var newChance = ++req.body.GameChance

        db.queryAsync(
            `UPDATE mb_gamelist SET GameChance = "${newChance}" WHERE MR_number = "${req.body.memberId}"`
        )
            .then(results => {
                return db.queryAsync(`SELECT GameChance FROM mb_gamelist WHERE MR_number = "${req.body.memberId}"`)
            }).then(results => {
                res.json(results)
            })
            .catch(error => {
                res.send("GiveAChance 404-找不到資料");
                console.log("GiveAChance 錯誤", error);
            });
    });
module.exports = GiveAChance;


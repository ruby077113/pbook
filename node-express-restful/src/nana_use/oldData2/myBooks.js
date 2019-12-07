// 引入套件
const express = require("express"); //EXPRESS(建立路由使用)
const myBooks = express.Router();
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


myBooks
    .route("/myBooks")
    .post(function (req, res) {
        console.log('myBooks', req.body.memberId);
        db.queryAsync(
            `SELECT * FROM mb_books WHERE mb_shelveMember = "${req.body.memberId}"`
        )
            .then(results => {
                res.json(results);
            })
            .catch(error => {
                res.send("myBooks 404-找不到資料");
                console.log("myBooks錯誤",error);
            });

    });
module.exports = myBooks;
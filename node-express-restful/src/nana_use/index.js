// 引入套件
const express = require("express"); //EXPRESS(建立路由使用)
const index = express.Router();
const bluebird = require("bluebird"); //青鳥
const _ = require("lodash"); //loadsh,處理數據的各種方法

const multer = require('multer');
const upload = multer({ dest: 'tmp_uploads/' }); //設定上傳暫存目錄
const fs = require('fs'); //處理檔案的核心套件(內建?)

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


index.get("/timeLine", function (req, res) {
    db.queryAsync(
        "SELECT br_bookcase.*, br_reviewerlist.br_name, br_reviewerlist.sid brr_sid FROM br_bookcase LEFT JOIN br_reviewerlist ON br_reviewerlist.number = br_bookcase.number ORDER BY created_time ASC LIMIT 4,20"
    )
        .then(results => {
            res.json(results)
        })
        .catch(error => {
            res.send("timeLine 404-找不到資料");
            console.log("timeLine錯誤", error);
        });
});

index.get("/theme", function (req, res) {
    db.queryAsync(
        "SELECT * FROM `vb_books` WHERE 1 ORDER BY RAND() LIMIT 1,2"
    )
        .then(results => {
            res.json(results)
        })
        .catch(error => {
            res.send("theme 404-找不到資料");
            console.log("theme錯誤", error);
        });
});

index.get("/storyteller", function (req, res) {
    db.queryAsync(
        "SELECT * FROM `br_reviewerlist` WHERE 1 ORDER BY RAND() LIMIT 1,1"
    )
        .then(results => {
            res.json(results)
        })
        .catch(error => {
            res.send("storyteller 404-找不到資料");
            console.log("storyteller錯誤", error);
        });
});



module.exports = index;

// 引入套件
const express = require("express"); //EXPRESS(建立路由使用)
const gameWaitInsert = express.Router();
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


gameWaitInsert
    .route("/gameWaitInsert")
    .post(function (req, res) {
        console.log('gameWaitInsert', req.body.memberId);
        console.log('gameWaitInsert', req.body.startTime);
        console.log('gameWaitInsert', req.body.bookSid);

        db.queryAsync(
            `SELECT * FROM mb_books WHERE mb_sid = "${req.body.bookSid}"`
        )
            .then(results => {
                // console.log('results',results);
                // console.log('results',results[0].mb_name);
                // console.log('results',results[0].mb_pic);
                // console.log('results',results[0].mb_shelveMember);

                return db.queryAsync(
                    `INSERT INTO mb_gamewait(bookStatus, matchStatus, myFrom, myTo, book_sid, book_name, book_pic, created_at) VALUES ("上架中","等待同意中","${req.body.memberId}","${results[0].mb_shelveMember}","${req.body.bookSid}","${results[0].mb_name}","${results[0].mb_pic}","${req.body.startTime}")`
                )
            }).then(results => {
                console.log('gameWaitInsert 新增成功');
                return db.queryAsync(`SELECT mb_gamewait.*,mr_information.MR_name,mr_information.MR_pic FROM mb_gamewait LEFT JOIN mr_information ON mr_information.MR_number = mb_gamewait.myTo WHERE mb_gamewait.myFrom = "${req.body.memberId}" AND matchStatus = "等待同意中"`)
            })
            .then(results => {
                console.log('gameWaitInsert 重新拿資料成功');
                res.json({ insertSuccess: 'gameWaitInsert 新增成功', gameWait: results })
            })
            .catch(error => {
                res.send("gameWaitInsert 404-找不到資料");
                console.log("gameWaitInsert錯誤", error);
            });
    });
module.exports = gameWaitInsert;


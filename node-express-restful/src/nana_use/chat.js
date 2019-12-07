// 引入套件
const express = require("express"); //EXPRESS(建立路由使用)
const chat = express.Router();
const bluebird = require("bluebird"); //青鳥
const _ = require("lodash"); //loadsh,處理數據的各種方法

const multer = require('multer');
const upload = multer({ dest: 'tmp_uploads/' }); //設定上傳暫存目錄
const fs = require('fs'); //處理檔案的核心套件(內建?)

const mysql = require("mysql");
// 設定資料庫連線
const db = mysql.createConnection({
    host: "192.168.27.186",
    user: "root",
    password: "root",
    database: "pbook"
});
db.connect(); //資料庫連線

bluebird.promisifyAll(db);

var mapResult = [];
chat.post("/chatList2", function (req, res) {
    console.log("chatList2", req.body.memberId);
    db.queryAsync(
        `SELECT mb_chat.*,MR_number,MR_name,MR_pic FROM mb_chat LEFT JOIN mr_information ON MR_number = myTo OR MR_number = myFrom WHERE myFrom = "${req.body.memberId}" OR myTo = "${req.body.memberId}" ORDER BY created_at ASC`
    )
        .then(results => {
            // 一開始拿的資料,MR_number有塞我的跟對方的,為了讓MR_number是塞對方的資料,所以要先篩選一次
            var Without_MY_MR_number = [];
            results.forEach(function (value, index) {
                if (value.MR_number !== req.body.memberId) {
                    Without_MY_MR_number.push(value);
                }
            });

            // 去除重複的chat_id(因為同樣的兩位只需開一個對話框)
            var myResult = {};
            var finalResult = [];
            for (var i = 0; i < Without_MY_MR_number.length; i++) {
                myResult[Without_MY_MR_number[i].chat_id] = Without_MY_MR_number[i];
                //Without_MY_MR_number[i].chat_id不能重复,達到去重效果,這裡必須知道"chat_id"或是其他键名
            }

            var item = [];
            //现在result内部都是不重复的对象了，只需要将其键值取出来转为数组即可
            for (item in myResult) {
                finalResult.push(myResult[item]);
            }

            mapResult = finalResult;

            return db.queryAsync(
                `SELECT * FROM mb_chat WHERE myTo = "${req.body.memberId}" AND myRead = 0`
            );
        })
        .then(results => {
            mapResult.forEach(function (value, index) {
                value.total = 0;
                for (var i = 0; i < results.length; i++) {
                    if (value.MR_number === results[i].myFrom) {
                        value.total++;
                    }
                }
            });

            mapResult = mapResult.sort(function (a, b) {
                return a.created_at < b.created_at;
            });

            res.json(mapResult);
        })
        .catch(error => {
            res.send("chatList2 404-找不到資料");
            console.log("chatlist2錯誤", error);
        });
});

chat.post("/chatMessage2", function (req, res) {
    console.log('chatMessage2', req.body.memberId);

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

chat.post("/chatMemo", function (req, res) {
    console.log('chatMemo', req.body.memberId);

    db.queryAsync(
        `SELECT mb_chatmemo.*,mr_information.MR_name,mr_information.MR_pic FROM mb_chatmemo LEFT JOIN mr_information ON mb_chatmemo.myFrom = mr_information.MR_number WHERE (myFrom = "${req.body.memberId}" OR myTo = "${req.body.memberId}") AND myDelete = 0 ORDER BY created_at DESC`
    )
        .then(results => {
            console.log('chatMemo final', results);

            res.json(results);
        })
        .catch(error => {
            res.send("chatMemo 404-找不到資料");
            console.log("chatMemo錯誤", error);
        });
});

chat.post("/chatAlbum", function (req, res) {
    console.log('chatAlbum', req.body.memberId);

    db.queryAsync(
        `SELECT * FROM mb_chatablum WHERE (myFrom = "${req.body.memberId}" OR myTo = "${req.body.memberId}") AND myDelete = 0 ORDER BY sid DESC`
    )
        .then(results => {
            console.log('chatAlbum final', results);

            res.json(results);
        })
        .catch(error => {
            res.send("chatAlbum 404-找不到資料");
            console.log("chatAlbum錯誤", error);
        });
});

chat.post("/myDataList2", function (req, res) {
    console.log('chatMessage2', req.body.memberId);
    db.queryAsync(
        `SELECT * FROM mr_information WHERE MR_number = "${req.body.memberId}"`
    )
        .then(results => {
            res.json(results);
        })
        .catch(error => {
            res.send("myDataList2 404-找不到資料");
            console.log("myDataList2錯誤", error);
        });

});

chat.post("/myBooks", function (req, res) {
    console.log('myBooks', req.body.memberId);
    db.queryAsync(
        `SELECT * FROM mb_books WHERE mb_shelveMember = "${req.body.memberId}"`
    )
        .then(results => {
            res.json(results);
        })
        .catch(error => {
            res.send("myBooks 404-找不到資料");
            console.log("myBooks錯誤", error);
        });

});

chat.post("/imgFiles", upload.array('avatar', 5), (req, res, next) => {
    console.log("avatar", req.body);
    console.log("Files", req.files.length);

    let images = []
    for (let i = 0; i < req.files.length; i++) {
        if (req.files[i] && req.files[i].mimetype) {
            // console.log([i]);
            switch (req.files[i].mimetype) {
                case 'image/png':
                case 'image/jpeg':
                    fs.createReadStream(req.files[i].path)
                        .pipe(
                            fs.createWriteStream('public/images/chatFile/' + req.files[i].originalname)
                        )
                    images.push(req.files[i].originalname)
                    // console.log(images);            
                    continue;
                default:
                    return res.send('bad file type')
            }

        } else {
            console.log('222');
            res.json({
                pictures: images
            })
        }
    }
    console.log("images", images);

    res.json({
        message: "上傳成功",
        pictures: images
    })

})

module.exports = chat;

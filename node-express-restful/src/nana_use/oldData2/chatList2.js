// 引入套件
const express = require("express"); //EXPRESS(建立路由使用)
const chatList2 = express.Router();
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

var mapResult = [];
chatList2.route("/chatList2").post(function(req, res) {
  console.log("chatList2", req.body.memberId);
  db.queryAsync(
    `SELECT mb_chat.*,MR_number,MR_name,MR_pic FROM mb_chat LEFT JOIN mr_information ON MR_number = myTo OR MR_number = myFrom WHERE myFrom = "${req.body.memberId}" OR myTo = "${req.body.memberId}" ORDER BY created_at ASC`
  )
    .then(results => {
      // 一開始拿的資料,MR_number有塞我的跟對方的,為了讓MR_number是塞對方的資料,所以要先篩選一次
      var Without_MY_MR_number = [];
      results.forEach(function(value, index) {
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
      mapResult.forEach(function(value, index) {
        value.total = 0;
        for (var i = 0; i < results.length; i++) {
          if (value.MR_number === results[i].myFrom) {
            value.total++;
          }
        }
      });

      mapResult = mapResult.sort(function(a, b) {
        return a.created_at < b.created_at;
      });

      res.json(mapResult);
    })
    .catch(error => {
      res.send("chatList2 404-找不到資料");
      console.log("chatlist2錯誤", error);
    });
});

module.exports = chatList2;

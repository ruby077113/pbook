const express = require("express");
const url = require("url");
const mysql = require("mysql");
const bluebird = require("bluebird");
const router = express.Router();
const db = mysql.createConnection({
  // host: '192.168.27.186',
  host: "localhost",
  user: "root",
  password: "root",
  database: "pbook"
});
db.connect();
bluebird.promisifyAll(db);

//書評下方回復增加API
router.get("/reply", (req, res) => {
  const sql = `SELECT mr_information.MR_nickname,vb_reply.*,mr_information.MR_pic FROM mr_information,vb_reply WHERE mr_information.MR_number = vb_reply.member ORDER BY vb_reply.create_time ASC`;
  db.query(sql, (error, results) => {
    if (error) {
      return res.send(error);
    } else {
      return res.json({
        reply: results
      });
    }
  });
});

//新增書評回覆
router.post("/reply/InsertData", (req, res) => {
  let replyInsert = [];
  const text = {
    id: req.body.id,
    review_sid: req.body.review_sid,
    reply: req.body.reply
  };
  replyInsert.push(text);
  const sql = `INSERT INTO vb_reply (review_sid, member, reply_text, create_time) VALUES ( '${replyInsert[0].review_sid}', '${replyInsert[0].id}', '${replyInsert[0].reply}', NOW())`;
  db.query(sql, (error, results) => {
    if (error) {
      return res.send(error);
    } else {
      return res.send("新增成功");
    }
  });
  // console.log(replyInsert);
});

//更新書評回覆API
router.put("/reply/EditData", (req, res) => {
  let data = [];
  const reply = {
    replySid: req.body.replySid,
    editReply: req.body.editReply
  };
  data.push(reply);
  const sql = `UPDATE vb_reply SET reply_text = '${data[0].editReply}', update_time = NOW() WHERE vb_reply.reply_sid = ${data[0].replySid}`;
  db.query(sql, (error, results) => {
    if (error) {
      return res.send(error);
    } else {
      return res.send("更新成功");
    }
  });
});

//刪除書評回覆API
router.delete("/reply/DeleteData/:sid?", (req, res) => {
  let sid = req.params.sid;
  const sql = `DELETE FROM vb_reply WHERE vb_reply.reply_sid = ${sid}`;
  db.query(sql, (error, results) => {
    if (error) {
      return res.send(error);
    } else {
      return res.send("刪除成功");
    }
  });
  console.log(sid);
});

module.exports = router;

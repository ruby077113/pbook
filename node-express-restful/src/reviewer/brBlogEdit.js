const express = require('express');
const mysql = require('mysql');
const bluebird = require('bluebird');
const router = express.Router();

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "pbook"
})
db.connect()
bluebird.promisifyAll(db)

// const express = require('express');
// const app = express();
// const bluebird = require('bluebird');
// const router = express.Router();
// const bodyParser = require("body-parser");
// const multer = require("multer");
// const upload = multer({ dest: "tmp_upload/" });
// const fs = require("fs");
// const session = require('express-session')
// const mysql = require('mysql');
// bluebird.promisifyAll(db);
// const db = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "root",
//     database: "pbook"
// })
// db.connect()
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// bluebird.promisifyAll(db)
// app.use(session({
//     saveUninitialized: false,
//     resave: false,
//     secret: 'fsdfdsfdsfdsf',
//     cookie: {
//         maxAge: 120000,
//     }
// }))
// Postman 測試
// app.post('/brBlogEdit/:id?', (req, res) => {
//     res.json(req.body);
// })
// app.put('/brBlogEdit/:id?', (req, res) => {
//     res.send('put:reviewerBooks')
// })
// Postman 測試結束

// ------------------------------------------------------------------
// 上傳檔案範例 設定middleware → upload.single('avatar')
// 單一個檔案用single('前端給這欄位，後端接受欄位')，查看的話用file不用加s
// app.post("/BlogUpload", upload.single("avatar"), (req, res) => {
//     if (req.file && req.file.originalname) {
//       console.log(req.file);
//       switch (req.file.mimetype) {
//         case "image/png":
//         case "image/jpeg":
//           // 讀取上傳檔案的名字、連同路徑的來源
//           fs.createReadStream(req.file.path).pipe(
//             // 拷貝檔案至 指定位置
//             fs.createWriteStream("public/img/" + req.file.originalname)
//           );
//           res.send("上傳成功");
//           break;
//         default:
//           return res.send("圖檔錯誤");
//       }
//     } else {
//       res.send("沒有上傳！");
//     }
//   });
// ------------------------------------------------------------------
//編輯部落格資料
router.post('/brBlogEdit', (req, res, next)=>{
    let blog = req.body.blog
    let sid = req.body.sid
console.log('發送來的blog',blog,'發送來的sid',sid)
    db.query(`UPDATE br_bookcase SET blog = '${blog}' WHERE br_bookcase.sid = '${sid}'`,(err, result)=>{
        if(err){ res.json(err) }
        res.json({
            status: "編輯成功",
            message: "文章內容已更新"
        })
    })
})
//按讚數
router.post('/brLikeBook', (req, res, next)=>{
    let likebook = req.body.likebook
    let sid = req.body.sid
console.log('發送來的按讚數',likebook,'發送來的sid',sid)
    db.query(`UPDATE br_bookcase SET likebook = '${likebook}' WHERE br_bookcase.sid = '${sid}'`,(err, result)=>{
        if(err){ res.json(err) }
        res.json({
            status: "按讚成功",
            message: "按讚數已更新"
        })
    })
})
//閱讀數
router.post('/brReadBook', (req, res, next)=>{
    let readbook = req.body.readbook
    let sid = req.body.sid
console.log('發送來的按讚數',readbook,'發送來的sid',sid)
    db.query(`UPDATE br_bookcase SET readbook = '${readbook}' WHERE br_bookcase.sid = '${sid}'`,(err, result)=>{
        if(err){ res.json(err) }
        res.json({
            status: "閱讀成功",
            message: "閱讀數已更新"
        })
    })
})
module.exports = router;
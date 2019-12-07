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
// 每一頁數量
const perPage = 200
router.get('/brBookcase/:page?/:keyword?', (req,res)=>{
    // 頁數資料傳輸
    const output = {};
    output.params = req.params
    output.perPage = perPage
    let page = parseInt(req.params.page) || 1
    let keyword = req.params.keyword || ''
    let where = 'WHERE 1'
    if (keyword) {

        where += "AND `name` LIKE '%" + keyword + "%'"
        output.keyword = keyword

    }
    // let t_sql = 'SELECT COUNT(1) `total` FROM `br_bookcase`' + where
    // let w_sql = 'SELECT `br_bookcase`.* ,`vb_books`.`name`,`vb_books`.`author`,`vb_books`.`pic`,`vb_books`.`introduction`,`vb_books`.`detailData` FROM `br_bookcase`LEFT JOIN `vb_books` ON `vb_books`.`isbn`=`br_bookcase`.`isbn`' + where
    let w_sql = 'SELECT `br_bookcase`.* ,`br_reviewerlist`.`tube`,`vb_books`.`name`,`vb_books`.`author`,`vb_books`.`pic`,`vb_books`.`introduction`,`vb_books`.`detailData`,`vb_books`.`sid` vb_book_sid FROM `br_bookcase`LEFT JOIN `vb_books` ON `vb_books`.`isbn`=`br_bookcase`.`isbn` LEFT JOIN `br_reviewerlist` ON `br_reviewerlist`.`number`=`br_bookcase`.`number`' + where

    db.queryAsync(w_sql)

        .then((results) => {
            // 總筆數 取得第一筆"total"
            output.totalRows = results[0][`total`]
            // 總頁數 = 總筆數/每頁筆數
            output.totalPage = Math.ceil(output.totalRows / perPage)
            if (page < 1) page = 1
            if (page > output.totalRows) page = output.totalRows
            output.page = page

            return db.queryAsync('SELECT `br_bookcase`.* ,`vb_books`.`author`,`vb_books`.`pic`,`vb_books`.`introduction`,`vb_books`.`detailData`,`vb_books`.`name`,`vb_books`.`sid` vb_book_sid FROM `br_bookcase`LEFT JOIN `vb_books` ON `vb_books`.`isbn`=`br_bookcase`.`isbn`' + where + ' LIMIT ' + (page - 1) * perPage + ',' + (perPage))

                .then((results) => {
                    output.rows = results
                    res.json(output)
                })
                .catch((error) => {
                    console.log('後端出錯了', error)
                })
        })
})
// 31
// router.get("/book_case", (req, res) => {
//     let w_sql =
//       "SELECT `br_bookcase`.* ,`vb_books`.`author`,`vb_books`.`introduction`,`vb_books`.`detailData`,`vb_books`.`name` FROM `br_bookcase`LEFT JOIN `vb_books` ON `vb_books`.`isbn`=`br_bookcase`.`isbn`";
//       db.query(w_sql,(error,results)=>{
//           if(error){
//               return res.send(error)
//           }else{
//               return res.json({
//                   data:results
//               })
//           }
//       })

//   });
module.exports = router;
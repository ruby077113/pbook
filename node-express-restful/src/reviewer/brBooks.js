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
router.get('/brBooks/:page?/:keyword?', (req, res) => {
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
    let t_sql = 'SELECT COUNT(1) `total` FROM `vb_books`' + where

    db.queryAsync(t_sql)

        .then((results) => {
            // 總筆數 取得第一筆"total"
            output.totalRows = results[0][`total`]
            // 總頁數 = 總筆數/每頁筆數
            output.totalPage = Math.ceil(output.totalRows / perPage)
            if (page < 1) page = 1
            if (page > output.totalRows) page = output.totalRows
            output.page = page

            return db.queryAsync('SELECT * FROM `vb_books` ' + where + ' LIMIT ' + (page - 1) * perPage + ',' + (perPage))

                .then((results) => {
                    output.rows = results
                    res.json(output)
                })
                .catch((error) => {
                    console.log('後端出錯了', error)
                })
        })
})

module.exports = router;
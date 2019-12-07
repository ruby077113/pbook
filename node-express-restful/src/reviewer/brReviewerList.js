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
router.get('/brReviewerList/:page?/:keyword?', (req, res) => {
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

    let t_sql = 'SELECT COUNT(1) `total` FROM `br_reviewerlist`' + where

    db.queryAsync(t_sql)

        .then((results) => {
            // 總筆數 取得第一筆"total"
            output.totalRows = results[0][`total`]
            // 總頁數 = 總筆數/每頁筆數
            output.totalPage = Math.ceil(output.totalRows / perPage)
            if (page < 1) page = 1
            if (page > output.totalRows) page = output.totalRows
            output.page = page

            return db.queryAsync('SELECT * FROM `br_reviewerlist` ' + where + ' LIMIT ' + (page - 1) * perPage + ',' + (perPage))

                .then((results) => {
                    output.rows = results
                    res.json(output)
                })
                .catch((error) => {
                    console.log('後端出錯了', error)
                })
        })
})

//收藏書評家
router.post('/brReviewerAdd', (req, res, next)=>{
    let number = req.body.number
    let number_reviewer = req.body.number_reviewer

    let check = `SELECT COUNT(1) total FROM br_reviewermark where number = '${number}' and number_reviewer = '${number_reviewer}'`
    db.queryAsync(check)
    
    .then((results) => {
        let checkNum = results[0][`total`]

        console.log('比對該書評家納入收藏紀錄，判斷存在的收藏筆數',checkNum)
        console.log('發送來的會員編號',number,'發送來的書評家編號',number_reviewer)

        if(checkNum < 1 ) {
            return db.queryAsync(`INSERT INTO br_reviewermark (sid, number, number_reviewer, created_time) VALUES (NULL, '${number}', '${number_reviewer}', NOW())`,(err, result)=>{
                if(err){ res.json(err) }
                res.json({
                    status: "success",
                    message: "收藏名單已更新"
                    })
                })
                return false;
            }
            res.json({
                status: "error",
                message: "收藏名單已更新"
                })
            })
        })

        //取消收藏
    router.post('/brReviewerDel', (req, res, next)=>{
        let number = req.body.number
        let number_reviewer = req.body.number_reviewer

        let check = `SELECT COUNT(1) total FROM br_reviewermark where number = '${number}' and number_reviewer = '${number_reviewer}'`
        db.queryAsync(check)
        
        .then((results) => {
            let checkNum = results[0][`total`]

        console.log('比對該書評家納入收藏紀錄，判斷存在的收藏筆數',checkNum)
        console.log('取消動作的會員編號',number,'要被取消的書評家編號',number_reviewer)

        if(checkNum >= 1 ) {
            return db.queryAsync(`DELETE FROM br_reviewermark where br_reviewermark.number = '${number}' and br_reviewermark.number_reviewer = '${number_reviewer}'`,(err, result)=>{
                if(err){ res.json(err) }
                res.json({
                    status: "success",
                    message: "已取消收藏"
                    })
                })
            }
            res.json({
                status: "error",
                message: "出現狀況"
                })
            })
        })

module.exports = router;
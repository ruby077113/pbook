const express = require("express");
const url = require("url");
const mysql = require("mysql");
const bluebird = require("bluebird");
const router = express.Router();
const db = mysql.createConnection({
  // host:"localhost",
  host: "localhost",
  user: "root",
  password: "root",
  database: "pbook"
});
db.connect();
bluebird.promisifyAll(db);

//分類
router.post("/categoryBar", (req, res) => {
  const sql = "SELECT * FROM `vb_categories`";
  db.query(sql, (error, results) => {
    if (error) {
      return res.send(error);
    } else {
      return res.json({
        data: results
      });
    }
  });
});
//書本內容
router.get(`/ratings`, (req, res) => {
  let c,
    a,
    page,
    fiveStars = [],
    fourStars = [],
    threeStars = [],
    twoStars = [],
    oneStars = [],
    max = [],
    min = [],
    avg = [],
    totalStars = [],
    sql;
  const urlpart = url.parse(req.url, true);
  if (urlpart.query.c !== undefined) {
    c = "=" + urlpart.query.c;
  } else {
    c = "";
  }

  if (urlpart.query.a == 1) {
    a = "publish_date";
  } else if (urlpart.query.a == 2) {
    a = "page";
  } else {
    a = "fixed_price";
  }
  page = urlpart.query.p || 1;
  let perPage = 10;
  let output = {};
  output.perPage = perPage;
  sql = `SELECT COUNT(1) total FROM vb_ratings WHERE 1 `;
  db.queryAsync(sql)
    .then(results => {
      output.total = results[0]["total"];
      return db.queryAsync(
        `SELECT COUNT(1) total FROM vb_books WHERE categories ${c}`
      );
    })
    .then(results => {
      output.totalRows = results[0]["total"]; //總筆數
      output.totalPage = Math.ceil(output.totalRows / perPage); //總頁數
      return db.queryAsync(
        `SELECT * FROM vb_books WHERE categories ${c} ORDER BY ${a} DESC LIMIT ${(page -
          1) *
          perPage},${perPage}`
      );
    })
    .then(results => {
      output.rows = results;
      return db.queryAsync(
        `SELECT vb_books.*,vb_ratings.star FROM vb_books LEFT JOIN vb_ratings ON vb_books.sid=vb_ratings.book WHERE 1`
      );
    })
    .then(results => {
      if (page !== output.totalPage) {
        for (let j = 0; j < output.perPage; j++) {
          fiveStars[j] = 0;
          fourStars[j] = 0;
          threeStars[j] = 0;
          twoStars[j] = 0;
          oneStars[j] = 0;
          totalStars[j] = 0;
          for (let i = 0; i < output.total; i++) {
            if (output.rows[j].sid == results[i].sid) {
              switch (results[i].star) {
                case 5:
                  fiveStars[j]++;
                  break;
                case 4:
                  fourStars[j]++;
                  break;
                case 3:
                  threeStars[j]++;
                  break;
                case 2:
                  twoStars[j]++;
                  break;
                case 1:
                  oneStars[j]++;
                  break;
                default:
                  break;
              }
            }
          }
        }
        for (let j = 0; j < output.perPage; j++) {
          totalStars[j] =
          fiveStars[j] +
          fourStars[j] +
          threeStars[j] +
          twoStars[j] +
          oneStars[j];
        avg[j] = +(
          (fiveStars[j] * 5 +
            fourStars[j] * 4 +
            threeStars[j] * 3 +
            twoStars[j] * 2 +
            oneStars[j]) /
          totalStars[j]
        ).toFixed(1);
          max[j] = fiveStars[j];
          min[j] = fiveStars[j];
          if (fourStars[j] > max[j]) max[j] = fourStars[j];
          else if (fourStars[j] < min[j]) min[j] = fourStars[j];
          if (threeStars[j] > max[j]) max[j] = threeStars[j];
          else if (threeStars[j] < min[j]) min[j] = threeStars[j];
          if (twoStars[j] > max[j]) max[j] = twoStars[j];
          else if (twoStars[j] < min[j]) min[j] = twoStars[j];
          if (oneStars[j] > max[j]) max[j] = oneStars[j];
          else if (oneStars[j] < min[j]) min[j] = oneStars[j];
        }
        for (let j = 0; j < output.perPage; j++) {
          output.rows[j].fiveStars = fiveStars[j];
          output.rows[j].fourStars = fourStars[j];
          output.rows[j].threeStars = threeStars[j];
          output.rows[j].twoStars = twoStars[j];
          output.rows[j].oneStars = oneStars[j];
          output.rows[j].totalStars = totalStars[j];
          output.rows[j].max = max[j];
          output.rows[j].avg = avg[j];
        }
      } else if (page == output.totalPage) {
        for (let j = 0; j < output.totalRows % output.perPage; j++) {
          fiveStars[j] = 0;
          fourStars[j] = 0;
          threeStars[j] = 0;
          twoStars[j] = 0;
          oneStars[j] = 0;
          totalStars[j] = 0;
          for (let i = 0; i < output.total; i++) {
            if (output.rows[j].sid == results[i].sid) {
              switch (results[i].star) {
                case 5:
                  fiveStars[j]++;
                  break;
                case 4:
                  fourStars[j]++;
                  break;
                case 3:
                  threeStars[j]++;
                  break;
                case 2:
                  twoStars[j]++;
                  break;
                case 1:
                  oneStars[j]++;
                  break;
                default:
                  break;
              }
            }
          }
        }
        for (let j = 0; j < output.total; j++) {
          totalStars[j] =
            fiveStars[j] +
            fourStars[j] +
            threeStars[j] +
            twoStars[j] +
            oneStars[j];
          avg[j] = +(
            (fiveStars[j] * 5 +
              fourStars[j] * 4 +
              threeStars[j] * 3 +
              twoStars[j] * 2 +
              oneStars[j]) /
            totalStars[j]
          ).toFixed(1);
          max[j] = fiveStars[j];
          min[j] = fiveStars[j];
          if (fourStars[j] > max[j]) max[j] = fourStars[j];
          else if (fourStars[j] < min[j]) min[j] = fourStars[j];
          if (threeStars[j] > max[j]) max[j] = threeStars[j];
          else if (threeStars[j] < min[j]) min[j] = threeStars[j];
          if (twoStars[j] > max[j]) max[j] = twoStars[j];
          else if (twoStars[j] < min[j]) min[j] = twoStars[j];
          if (oneStars[j] > max[j]) max[j] = oneStars[j];
          else if (oneStars[j] < min[j]) min[j] = oneStars[j];
        }
        for (let j = 0; j < output.total; j++) {
          output.rows[j].fiveStars = fiveStars[j];
          output.rows[j].fourStars = fourStars[j];
          output.rows[j].threeStars = threeStars[j];
          output.rows[j].twoStars = twoStars[j];
          output.rows[j].oneStars = oneStars[j];
          output.rows[j].totalStars = totalStars[j];
          output.rows[j].max = max[j];
          output.rows[j].avg = avg[j];
        }
  
      }
      res.json(output);
      return db.queryAsync(``);
    })
    .catch(error => {
      console.log(error);
    });
});

//categories
router.get("/book_categories/:keyword?", (req, res) => {
  // const output = {};
  // output.params = req.params; 可以在網址看params用
  let keyword = req.params.keyword || ""; //search用
  let where = " WHERE 1 ";
  if (keyword) {
    keyword = keyword.split("'").join("\\'"); // 避免 SQL injection
    where += " AND `name` LIKE '%" + keyword + "%' ";
    // output.keyword = keyword; 可以在網址看keyword用
  }
  let sql = "SELECT * FROM `vb_categories`" + where;
  // console.log(sql);
  db.queryAsync(sql)
    .then(results => {
      // output.catagories = results;
      res.json(results);
    })
    .catch(error => {
      console.log(error);
      res.send(error);
    });
});

//書本各分類數量

module.exports = router;

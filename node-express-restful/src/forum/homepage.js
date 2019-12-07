const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const multer = require("multer");
const upload = multer({ dest: "tmp_uploads/" }); //圖片上傳
const fs = require("fs"); //檔案處理
const moment = require("moment-timezone");
const db = mysql.createConnection({
  host: "localhost", 
  user: "root",
  password: "root",
  database: "pbook"
});
db.connect();
const bluebird = require("bluebird");
bluebird.promisifyAll(db);

//精選文章 featured
router
  .route("/homepage/:limit?")
  .all((req, res, next) => {
    next();
  })
  .get((req, res) => {
    let limit = req.params.limit ? "ORDER BY RAND() LIMIT 5" : "";
    let output = {};
    let sql =
      "SELECT * FROM `fm_article` article JOIN `vb_categories` vb ON article.`fm_category` = vb.`sid` JOIN `mr_information` mr ON article.`fm_memberId`=mr.`MR_number` WHERE article.`fm_featured`=1  " +
      limit;
    db.query(sql, (error, results, fields) => {
      if (error) throw error;
      output.featured = results;
      res.json(output);
    });
  });
//熱門文章 hotArticle
router

  .route("/hotArticle")
  .all((req, res, next) => {
    next();
  })
  .get((req, res) => {
    let output = {};
    let sql = `SELECT * FROM fm_article article JOIN vb_categories vb ON article.fm_category = vb.sid JOIN mr_information mr ON article.fm_memberId=mr.MR_number WHERE article.fm_featured=1 ORDER BY fm_read DESC LIMIT 5`;
    db.query(sql, (error, results, fields) => {
      if (error) throw error;
      output.featured = results;
      res.json(output);
    });
  });

//文章列表 article list
router
  .route("/articleList/:number")
  .all((req, res, next) => {
    next();
  })
  .get((req, res) => {
    let number = req.params.number;
    let output = {};
    let sql =
      "SELECT * FROM `fm_article` article JOIN `vb_categories` vb ON article.`fm_category` = vb.`sid` JOIN `mr_information` mr ON article.`fm_memberId`=mr.`MR_number` LIMIT " +
      number;
    db.query(sql, (error, results, fields) => {
      if (error) throw error;
      // output.featured = results;
      res.json(results);
    });
  });

//userDetails 讀取作者資料 writer
router
  .route("/writer/:memberId/:category")
  .all((req, res, next) => {
    next();
  })
  .get((req, res) => {
    let memberId = req.params.memberId;
    let category = req.params.category;
    let output = {};
    let sql = `SELECT * FROM mr_information JOIN vb_categories ON vb_categories.sid='${category}' WHERE MR_number= '${memberId}'`;
    // res.json(sql);
    db.queryAsync(sql)
      .then(results => {
        output.sql = sql;
        output.writer = results[0];
        sql = `SELECT COUNT(1) FROM fm_favorite WHERE fm_lovewriter='${memberId}'`;
        return db.queryAsync(sql);
      })
      .then(results => {
        output.follow = results[0]["COUNT(1)"];
        console.log(output, memberId);
        res.json(output);
      });
  });

//讀取文章內容 article content
router
  .route("/article/content/:articleId/:userId")
  .all((req, res, next) => {
    next();
  })
  .get((req, res) => {
    let userId = req.params.userId;
    let articleId = req.params.articleId;
    let output = {};
    let sql =
      "SELECT * FROM `fm_article` JOIN  vb_categories vb ON vb.sid=`fm_category` JOIN fm_subCategories sub ON sub.sid= `fm_subCategories` WHERE `fm_articleId`='" +
      articleId +
      "'";
    db.queryAsync(sql)
      .then(result => {
        output.article = result[0];
        sql =
          "SELECT * FROM `mr_information` WHERE `MR_number`='" +
          result[0].fm_memberId +
          "'";
        return db.queryAsync(sql);
      })
      .then(result => {
        output.member = result[0];
        sql = `SELECT COUNT(1) FROM fm_articleresponse WHERE fm_articleId='${articleId}'`;
        return db.queryAsync(sql);
      })
      .then(result => {
        output.responseNO = result[0];
        sql = `SELECT COUNT(1) FROM fm_bookmark WHERE fm_memberId='${userId}' AND fm_articleId='${articleId}'`;
        return db.queryAsync(sql);
      })
      .then(result => {
        output.bookmark = result[0];
        sql = `SELECT COUNT(1) FROM fm_favorite WHERE fm_userId='${userId}'AND fm_lovewriter='${output.member.MR_number}'`;
        return db.queryAsync(sql);
      })
      .then(result => {
        output.favorite = result[0];
        let sql = `UPDATE fm_article SET fm_read=${output.article.fm_read +
          1} WHERE fm_articleId='${articleId}'`;
        return db.queryAsync(sql);
      })
      .then(result => {
        res.json(output);
      });
  });

//添加書籤 bookmark
router
  .route("/article/bookmark/add/:articleId/:userId")
  .all((req, res, next) => {
    next();
  })
  .get((req, res) => {
    let articleId = req.params.articleId;
    let fm_memberId = req.params.userId;
    let fm_articleId = null;
    let fm_responseSid = null;

    if (articleId.indexOf("MR") > 0) {
      fm_articleId = articleId;
    } else {
      fm_responseId = articleId;
    }
    let sql = `INSERT INTO fm_bookmark(fm_bookmarkSid, fm_articleId, fm_responseSid, fm_memberId) VALUES (NULL,?,?,?)`;

    db.query(
      sql,
      [fm_articleId, fm_responseSid, fm_memberId],
      (error, results, field) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });

//移除書籤 bookmark
router.route("/article/bookmark/delete/:articleId/:userId").get((req, res) => {
  let articleId = req.params.articleId;
  let fm_memberId = req.params.userId;
  let fm_articleId = null;
  let fm_responseId = null;
  let sql = "";
  if (articleId.indexOf("MR") > 0) {
    fm_articleId = articleId;
    sql = `DELETE FROM fm_bookmark WHERE fm_memberId='${fm_memberId}' AND fm_articleId='${fm_articleId}'`;
  } else {
    fm_responseId = articleId;
    sql = `DELETE FROM fm_bookmark WHERE fm_memberId='${fm_memberId}' AND fm_responseId='${fm_responseId}'`;
  }
  db.query(sql, (error, results, field) => {
    res.json(results);
  });
});

//追蹤作者 add favorite writer
router
  .route("/article/follow/add/:writerId/:userId")
  .all((req, res, next) => {
    next();
  })
  .get((req, res) => {
    let writerId = req.params.writerId;
    let userId = req.params.userId;

    let sql = `INSERT INTO fm_favorite(sid, fm_lovewriter, fm_userId) VALUES (NULL,?,?)`;
    db.query(sql, [writerId, userId], (error, results, field) => {
      if (error) throw error;
      res.json(results);
    });
  });

//取消追蹤作者  delete favorite writer
router
  .route("/article/follow/delete/:writerId/:userId")
  .all((req, res, next) => {
    next();
  })
  .get((req, res) => {
    let writerId = req.params.writerId;
    let userId = req.params.userId;

    let sql = `DELETE FROM fm_favorite WHERE fm_userId='${userId}'AND fm_lovewriter='${writerId}'`;
    db.query(sql, (error, results, field) => {
      if (error) throw error;
      res.json(results);
    });
  });

//喜歡文章 like
router
  .route("/article/like/:articleId/:prevLike")
  .all((req, res, next) => {
    next();
  })
  .get((req, res) => {
    let articleId = req.params.articleId;
    let prevLike = req.params.prevLike;

    let sql = `UPDATE fm_article SET fm_like=${+prevLike +
      1} WHERE fm_articleId='${articleId}'`;
    db.queryAsync(sql).then(results => {
      res.json(results);
    });
  });

//新增留言 response new
router
  .route("/article/newResponse/:articleId/:memberId")
  .all((req, res, next) => {
    next();
  })
  .post(upload.array(), (req, res) => {
    let fm_articleId = req.params.articleId;
    let fm_responseId = req.params.memberId;
    let fm_responseContent = req.body.contentValue;
    // console.log(123, req.body);
    let sql = `INSERT INTO fm_articleresponse(sid, fm_articleId, fm_responseId, fm_responseContent, fm_resLike, responseTime) VALUES (NULL,?,?,?,0,NOW())`;
    db.query(
      sql,
      [fm_articleId, fm_responseId, fm_responseContent],
      (error, results, fields) => {
        if (error) throw error;
        res.json(results);
      }
    );
  });

//喜歡留言 response like
router
  .route("/article/responseLike/:sid/:prevLike")
  .all((req, res, next) => {
    next();
  })
  .get((req, res) => {
    let prevLike = req.params.prevLike;
    let sid = req.params.sid;

    let sql = `UPDATE fm_articleresponse SET fm_resLike = ${+prevLike +
      1} WHERE sid = '${sid}'`;
    db.query(sql, (error, results, fields) => {
      if (error) throw error;
      res.json(results);
    });
  });

//讀取留言 message
router
  .route("/message/content/:articleId")
  .all((req, res, next) => {
    next();
  })
  .get((req, res) => {
    let articleId = req.params.articleId;
    let sql = `SELECT res.* ,mr.MR_pic, mr.MR_nickname FROM fm_articleresponse res JOIN  mr_information mr ON mr.MR_number=fm_responseId WHERE fm_articleId ='${articleId}'`;
    db.queryAsync(sql).then(results => {
      res.json(results);
    });
  });

//分類文章
router
  .route("/cate/:number/:subCate?")
  .all((req, res, next) => {
    next();
  })
  .get((req, res) => {
    let output = {};
    let number = req.params.number;
    let subCate = req.params.subCate;
    let sql =
      "SELECT * FROM `fm_article` WHERE `fm_featured`='1' AND `fm_category`='" +
      number +
      "'";
    db.queryAsync(sql)
      .then(results => {
        output.featured = results;
        sql = `SELECT * FROM fm_article JOIN vb_categories vb ON vb.sid= '${number}' WHERE fm_category='${number}'`;
        return db.queryAsync(sql);
      })
      .then(results => {
        output.article = results;
        sql =
          "SELECT * FROM `fm_subcategories` WHERE `fm_categories`='" +
          number +
          "'";
        return db.queryAsync(sql);
      })
      .then(results => {
        output.subcategory = results;
        res.json(output);
      });
  });

//搜尋serach
router
  .route("/search/:keyWord")
  .all((req, res, next) => {
    next();
  })
  .get((req, res) => {
    let keyWord = req.params.keyWord;
    let sql = `SELECT * FROM fm_article  JOIN vb_categories vb ON vb.sid= fm_article.fm_category WHERE fm_title LIKE '%${keyWord}%'`;
    db.queryAsync(sql).then(results => {
      res.json(results);
    });
  });

//manage article 管理已發表文章
router
  .route("/manageArticle/posted/:memberId")
  .all((req, res, next) => {
    next();
  })
  .get((req, res) => {
    let memberId = req.params.memberId;
    let sql = `SELECT * FROM fm_article  JOIN vb_categories vb ON vb.sid= fm_article.fm_category WHERE fm_memberId='${memberId}'`;
    db.queryAsync(sql).then(results => {
      res.json(results);
    });
  });
// manage article delete 刪除文章
router
  .route("/manageArticle/delete/:articleId")
  .all((req, res, next) => {
    next();
  })
  .get((req, res) => {
    let articleId = req.params.articleId;
    let sql = `DELETE FROM fm_article WHERE fm_articleId ='${articleId}'`;
    db.queryAsync(sql).then(results => {
      res.json(results);
    });
  });

// manage bookmark 管理書籤
router
  .route("/manageArticleMark/list/:memberId")
  .all((req, res, next) => {
    next();
  })
  .get((req, res) => {
    let memberId = req.params.memberId;
    let sql = `SELECT * FROM fm_bookmark JOIN fm_article ON fm_article.fm_articleId=fm_bookmark.fm_articleId JOIN vb_categories ON vb_categories.sid=fm_article.fm_category WHERE fm_bookmark.fm_memberId='${memberId}'`;
    db.queryAsync(sql).then(results => {
      res.json(results);
    });
  });

//發表新文章
router
  .route("/postNew")
  .all((req, res, next) => {
    next();
  })
  .get((req, res) => {
    res.send("get");
  })
  .post(upload.array("imgFile[]"), (req, res) => {
    console.log("post article");
    let resData = {};
    let data = req.body;
    console.log(req.body);
    let articleId = +new Date() + data.MR_number;
    let filename = "";
    let mainImg = "";
    // res.json(req.files);

    if (data.imgCount === "0") {
      mainImg = Math.floor(Math.random() * 10) + 1 + "0.jpg";
    }
    for (let i = 0; i < data.imgCount; i++) {
      if (req.files[i] && req.files[i].mimetype) {
        filename = articleId + i + "." + req.files[i].mimetype.slice(6, 10);
        if (i === 0) {
          mainImg = filename;
        }

        switch (req.files[i].mimetype) {
          case "image/png":
          case "image/jpeg":
            fs.createReadStream(req.files[i].path).pipe(
              fs.createWriteStream(
                "public/images/forum/article_key/" + filename
              )
            );
            resData.filename = filename;
            break;
          default:
            return res.send("bad file type");
        }
      } else {
        resData.filename = "no img file";
      }
    }
    if (data.isMainUpload === "2") {
      mainImg = data.imgFromUnsplash[0];
    }
    let category = data.cate;
    let subCategories = data.subcate;
    let title = data.title;

    let subTitle = data.textareaValue.filter(item => {
      if (item !== "") {
        return item.slice(0, 200);
      }
    })[0];

    let demoImage = mainImg;
    let content = {
      element: data.element,
      textareaValue: data.textareaValue.filter(item => item !== ""),
      imgFromUnsplash: data.imgFromUnsplash
    };
    fs.writeFile(
      __dirname + "/../../public/forum/content/" + articleId + ".json",

      JSON.stringify(content),
      error => {
        if (error) return console.log(error);
      }
    );
    let memberId = data.MR_number;
    const timeFormat = "YYYY-MM-DD  HH:mm:ss";
    let time = moment(new Date()).format(timeFormat);
    // res.json(time);
    resData.content = content;
    let sql =
      "INSERT INTO `fm_article`(`fm_articleId`, `fm_category`, `fm_subCategories`, `fm_title`, `fm_subTitle`, `fm_demoImage`, `fm_content`, `fm_memberId`, `fm_featured`, `fm_like`, `fm_read`, `fm_publishTime`, `fm_updateTime`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NOW() )";

    db.query(
      sql,
      [
        articleId,
        category,
        subCategories,
        title,
        subTitle,
        demoImage,
        articleId + ".json",
        memberId,
        0,
        // Math.floor(Math.random() * 60 + 1),
        0,
        Math.floor(Math.random() * 1000 + 1),
        time
      ],
      (error, results, fields) => {
        if (error) throw error;
        if (results.affectedRows === 1) {
          resData.message = true;
        } else {
          resData.message = false;
        }
        res.json(resData);
      }
    );
  });

//新增假留言API =>Input
router
  .route("/aaa/:articleId")
  .all((req, res, next) => {
    next();
  })
  .post(upload.array(), (req, res) => {
    let articleId = req.params.articleId;
    let aa = Math.floor(Math.random() * 20 + 1);
    let fm_responseId = "";
    if (aa <= 9) {
      fm_responseId = "MR0000" + aa;
    } else if (aa >= 10 && aa <= 20) {
      fm_responseId = "MR000" + aa;
    }
    let fm_responseContent = req.body.text;
    let like = Math.floor(Math.random() * 20) + 1;
    let sql = `INSERT INTO fm_articleresponse(sid, fm_articleId, fm_responseId, fm_responseContent, fm_resLike, responseTime) VALUES (NULL,?,?,?,?,NOW())`;
    db.query(
      sql,
      [articleId, fm_responseId, fm_responseContent, like],
      (error, result, field) => {
        res.json(result);
      }
    );
  });

//新增假書籤
router
  .route("/bookmark")
  .all((req, res, next) => {
    next();
  })
  .get((req, res) => {
    let sql = `SELECT fm_articleId FROM fm_article ORDER BY RAND() LIMIT 1`;
    db.queryAsync(sql).then(results => {
      let fm_articleId = results[0].fm_articleId;
      let fm_responseId = null;
      let fm_memberId = fakeMember(20);
      sql = `INSERT INTO fm_bookmark(fm_bookmarkSid, fm_articleId, fm_responseId, fm_memberId) VALUES (NULL,?,?,?)`;
      db.query(
        sql,
        [fm_articleId, fm_responseId, fm_memberId],
        (error, result, field) => {
          res.json(result);
        }
      );
    });
  });

function randomNumber(num) {
  return Math.floor(Math.random() * num) + 1;
}

function fakeMember(num) {
  let fm_responseId;
  let aa = Math.floor(Math.random() * num) + 1;
  if (aa <= 9) {
    fm_responseId = "MR0000" + aa;
  } else if (aa >= 10 && aa <= 20) {
    fm_responseId = "MR000" + aa;
  }
  return fm_responseId;
}
// router.route("/homepage/:id?").get((req, res) => {
//   let output = {};
//   let sql = "SELECT * FROM `fm_article` WHERE `fm_featured`= 1";
//   db.queryAsync(sql)
//     .then(result => {
//       output.article = result;
//       console.log(result)
//       sql =
//         "SELECT * FROM `mr_information` WHERE `MR_number`= '" +
//         result[0].fm_memberId +
//         "'";
//       return db.queryAsync(sql);
//     })
//     .then(results => {
//       output.user = results[0];
//       res.json(output);
//     })
//     .catch(error => {
//       console.log(error);
//     });
// });

module.exports = router;

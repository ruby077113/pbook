const express = require("express");
const mysql = require("mysql");
const bluebird = require("bluebird");
const router = express.Router();
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "pbook"
});
db.connect(error => {
  if (error) {
    return error;
  }
});
bluebird.promisifyAll(db);

//bookData
router.get("/book_data/:page?/:categories?/:keyword?", (req, res) => {
  let fiveStars = [],
    fourStars = [],
    threeStars = [],
    twoStars = [],
    oneStars = [],
    totalStars = [],
    max = [],
    min = [],
    avg = [];
  const output = {};
  const perPage = 8; // 每頁幾筆
  output.params = req.params; //可以在網址看params用
  output.perPage = perPage;
  let page = parseInt(req.params.page) || 1; //page預設1
  let keyword = req.params.keyword || ""; //search用
  let categories = req.params.categories || "";
  // let col = req.params.col || "name";
  // let ord = req.params.ord || "ASC";

  let where = " WHERE 1 ";
  if (keyword) {
    keyword = keyword.split("'").join("\\'"); // 避免 SQL injection
    where += " AND (`vb_books`.`name` LIKE '%" + keyword + "%' OR `vb_books`.`author` LIKE '%" + keyword + "%') ";
    output.keyword = keyword; //可以在網址看keyword用
  }
  if (categories && categories !== "search") {
    where += " AND `vb_books`.`categories`" + " = " + categories;
    output.categories = categories;
  }
  console.log(where)
  
  let sql =
    "SELECT COUNT(1) `total` FROM `vb_books` LEFT JOIN `cp_data_list` ON `vb_books`.`publishing` = `cp_data_list`.`sid` LEFT JOIN `vb_ratings` ON `vb_books`.`sid`=`vb_ratings`.`book`" +
    where;
  db.queryAsync(sql)
    .then(results => {
      output.total = results[0]["total"]; //給下面計算用的ratings總筆數
      return db.queryAsync("SELECT COUNT(1) `total` FROM `vb_books`" + where);
    })
    .then(results => {
      output.totalRows = results[0]["total"]; //總筆數
      output.totalPage = Math.ceil(output.totalRows / perPage); //總頁數
      if (output.totalPage == 0) return;
      if (page < 1) page = 1;
      if (page > output.totalPage) page = output.totalPage;
      output.page = page;
      return db.queryAsync(
        "SELECT `vb_books`.*,`cp_data_list`.`cp_name` FROM `vb_books` LEFT JOIN `cp_data_list` ON `vb_books`.`publishing` = `cp_data_list`.`sid`" +
          where +
          " LIMIT ?, ? ",
        [(page - 1) * perPage, perPage]
      );
    })
    .then(results => {
      output.rows = results;
      return db.queryAsync(
        "SELECT `vb_books`.*,`cp_data_list`.`cp_name`,`vb_ratings`.`star` FROM `vb_books` LEFT JOIN `cp_data_list` ON `vb_books`.`publishing` = `cp_data_list`.`sid` LEFT JOIN `vb_ratings` ON `vb_books`.`sid`=`vb_ratings`.`book`" +
          where
      );
    })
    .then(results => {
      //計算每本書每個星星共有幾筆
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
        for (let j = 0; j < output.totalRows % output.perPage; j++) {
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
        for (let j = 0; j < output.totalRows % output.perPage; j++) {
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
    })
    .catch(error => {
      console.log(error);
    });
});

//bookInfo
router.get("/book_info/:sid?", (req, res) => {
  let fiveStars = [],
    fourStars = [],
    threeStars = [],
    twoStars = [],
    oneStars = [],
    max = [],
    min = [],
    totalStars = [],
    avg = [];
  const output = {};
  let sid = req.params.sid || "";
  let where = " WHERE 1 ";
  if (sid) {
    where += " AND `vb_books`.`sid`" + " = " + sid;
    output.sid = sid;
  }
  let sql =
    "SELECT COUNT(1) `total` FROM `vb_books` LEFT JOIN `cp_data_list` ON `vb_books`.`publishing` = `cp_data_list`.`sid` LEFT JOIN `vb_categories` ON `vb_books`.`categories`= `vb_categories`.`sid` LEFT JOIN `vb_ratings` ON `vb_books`.`sid`=`vb_ratings`.`book`" +
    where;
  db.queryAsync(sql)
    .then(results => {
      output.totalRatings = results[0]["total"]; //給下面計算用的ratings總筆數
      return db.queryAsync(
        "SELECT  COUNT(1) `total` FROM `vb_books` LEFT JOIN `cp_data_list` ON `vb_books`.`publishing` = `cp_data_list`.`sid` LEFT JOIN `vb_categories` ON `vb_books`.`categories`= `vb_categories`.`sid`" +
          where
      );
    })
    .then(results => {
      output.total = results[0]["total"];
      return db.queryAsync(
        "SELECT `vb_books`.*,`cp_data_list`.`cp_name`,`vb_categories`.`categoriesName` FROM `vb_books` LEFT JOIN `cp_data_list` ON `vb_books`.`publishing` = `cp_data_list`.`sid` LEFT JOIN `vb_categories` ON `vb_books`.`categories`= `vb_categories`.`sid`" +
          where
      );
    })
    .then(results => {
      output.rows = results;
      return db.queryAsync(
        "SELECT `vb_books`.*,`vb_ratings`.`star` FROM `vb_books` LEFT JOIN `vb_ratings` ON `vb_books`.`sid`=`vb_ratings`.`book`" +
          where
      );
    })
    .then(results => {
      //計算每本書每個星星共有幾筆

      for (let j = 0; j < output.total; j++) {
        fiveStars[j] = 0;
        fourStars[j] = 0;
        threeStars[j] = 0;
        twoStars[j] = 0;
        oneStars[j] = 0;
        totalStars[j] = 0;
        for (let i = 0; i < output.totalRatings; i++) {
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

      res.json(output);
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
    });
});

router.get("/addToCart", (req, res) => {
  const output = {};
  output.cart = req.session.cart;
  output.totalCart = req.session.totalCart;
  output.totalAmount = req.session.totalAmount;
  output.totalPrice = req.session.totalPrice;
  res.json(output);
});

router.post("/addToCart", (req, res) => {
  let bookSid = req.body.sid;
  let price = req.body.price;
  let sql = "SELECT * FROM `vb_books` WHERE `sid`= " + bookSid;
  // if (!req.session.cart) req.session.cart = [];
  // if (!req.session.totalCart) req.session.totalCart = 0;
  db.queryAsync(sql)
    .then(results => {
      req.session.cart.push({
        sid: results[0].sid,
        pic: results[0].pic,
        name: results[0].name,
        amount: 1,
        fixed_price: price
      });
      let index = req.session.cart.findIndex(carts => carts.sid === bookSid);
      req.session.totalAmount += req.session.cart[index].amount;
      req.session.totalPrice +=
        req.session.cart[index].fixed_price * req.session.cart[index].amount;
      req.session.totalCart++;
      // results.length=1
      res.json(req.session.cart);
    })
    .catch(error => {
      console.log(error);
    });
});

router.post("/editCart", (req, res) => {
  let amount = req.body.amount;
  let bookSid = req.body.sid;
  let index = req.session.cart.findIndex(carts => carts.sid === bookSid);
  if (index !== -1) {
    //有找到
    req.session.cart[index].amount = amount;
    if (req.session.cart[index].amount <= 1) req.session.cart[index].amount = 1;
    else if (req.session.cart[index].amount > 99)
      req.session.cart[index].amount = 99;
    req.session.totalAmount = 0;
    req.session.totalPrice = 0;
    for (let i = 0; i < req.session.totalCart; i++) {
      req.session.totalAmount += req.session.cart[i].amount;
      req.session.totalPrice +=
        req.session.cart[i].fixed_price * req.session.cart[i].amount;
    }
    res.json({
      message: "修改成功"
    });
  } else if (index == -1) {
    res.json({
      message: "修改失敗"
    });
  }
  req.session.cart;
});

router.post("/delCart", (req, res) => {
  let bookSid = req.body.sid;
  let index = req.session.cart.findIndex(carts => carts.sid === bookSid);
  if (index !== -1) {
    req.session.cart.splice(index, 1);
    req.session.totalCart--;
    req.session.totalAmount = 0;
    req.session.totalPrice = 0;
    for (let i = 0; i < req.session.totalCart; i++) {
      req.session.totalAmount += req.session.cart[i].amount;
      req.session.totalPrice +=
        req.session.cart[i].fixed_price * req.session.cart[i].amount;
    }
    res.json({
      message: "刪除成功"
    });
  } else if (index == -1) {
    res.json({
      message: "刪除失敗"
    });
  }
});

router.get("/order/:member?", (req, res) => {
  const output = {};
  let member = req.params.member || "";
  let where = " WHERE 1";
  if (member) {
    member = member.split("'").join("\\'"); // 避免 SQL injection
    where += " AND `od_list`.`memberID` = '" + member + "'";
    output.memberID = member;
  }
  let sql = "SELECT COUNT(1) `total` FROM `od_list`" + where;
  // console.log(sql);
  db.queryAsync(sql)
    .then(results => {
      output.totalBooks = results[0]["total"]; //會員購買的書本數
      return db.queryAsync("SELECT * FROM `od_list` " + where);
    })
    .then(results => {
      output.rows = results;
      res.json(output);
      // return db.queryAsync(
      //   "SELECT `od_list`.*,`od_detail`.`bookName`,`od_detail`.`bookAmount`,`od_detail`.`bookPrice` FROM `od_list` LEFT JOIN `od_detail` ON `od_list`.`memberID` = `od_detail`.`member`" +
      //     where
      // );
    })
    .catch(error => {
      console.log(error);
    });
});

router.post("/addOrder", (req, res) => {
  let memberID = req.body.memberID;
  let bookName = req.body.bookName;
  let singlePrice = req.body.singlePrice;
  let bookAmount = req.body.bookAmount;
  let orderPrice = req.body.orderPrice;
  let created_time = req.body.created_time;
  console.log(req.body);

  let sql =
    "INSERT INTO `od_list`(`memberID`, `bookName`, `singlePrice`, `bookAmount`, `orderPrice`, `created_time`) VALUES ('" +
    memberID +
    "','" +
    bookName +
    "','" +
    singlePrice +
    "','" +
    bookAmount +
    "','" +
    orderPrice +
    "','" +
    created_time +
    "')";
  db.queryAsync(sql)
    .then(results => {
      res.json({
        message: "新增訂單成功"
      });
    })
    .catch(error => {
      console.log(error);
    });
});

router.get("/reviews/:book", (req, res) => {
  const output = {};
  let book = req.params.book || "";
  let where = " WHERE 1";
  book = book.split("'").join("\\'"); // 避免 SQL injection
  where += " AND `vb_ratings`.`book` = '" + book + "'";
  output.bookSid = book;

  let sql = "SELECT COUNT(1) `total` FROM `vb_ratings`" + where;
  // console.log(sql);
  db.queryAsync(sql)
    .then(results => {
      output.total = results[0]["total"]; //這本書多少人評論
      return db.queryAsync(
        "SELECT `vb_ratings`.*,`mr_information`.`MR_pic`,`mr_information`.`MR_nickname`,`mr_level`.`MR_levelName` FROM `vb_ratings` LEFT JOIN `mr_information` ON `vb_ratings`.`member` = `mr_information`.`MR_number` LEFT JOIN `mr_level` ON `mr_information`.`MR_personLevel` = `mr_level`.`MR_personLevel` " +
          where
      );
    })
    .then(results => {
      output.rows = results;
      res.json(output);
    })
    .catch(error => {
      console.log(error);
    });
});

router.get("/favorite/:member", (req, res) => {
  let member = req.params.member; //search用
  let where = " WHERE 1 ";
  member = member.split("'").join("\\'"); // 避免 SQL injection
  where += " AND `number` = '" + member + "'";
  let sql = "SELECT `br_bookcase`.`isbn` FROM `br_bookcase`" + where;
  // console.log(sql);
  db.queryAsync(sql)
    .then(results => {
      res.json(results);
    })
    .catch(error => {
      console.log(error);
    });
});

router.get("/favoriteNum/:sid", (req, res) => {
  let sid = req.params.sid; //search用
  let where = " WHERE 1 ";
  sid = sid.split("'").join("\\'"); // 避免 SQL injection
  where += " AND `bookSid` = '" + sid + "'";
  let sql = "SELECT COUNT(1) `total` FROM `br_bookcase`" + where;
  db.queryAsync(sql)
    .then(results => {
      res.json(results[0]["total"]);
    })
    .catch(error => {
      console.log(error);
    });
});
module.exports = router;

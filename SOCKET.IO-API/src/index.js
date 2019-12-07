var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

const bluebird = require("bluebird"); //青鳥
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

app.get("/", function (req, res) {
  res.send("socket首頁");
});

var users = [];
io.sockets.on("connection", function (socket) {
  users.push({
    socketId: socket.id,
    MR_number: socket.handshake.query.MR_number,
    MR_name: socket.handshake.query.MR_name,
    MR_pic: socket.handshake.query.MR_pic
  });

  console.log("open---總共幾位會員連接上socket", users.length);
  console.log("open---現在進入會員的socketId", socket.id);
  console.log("open---現在所有會員的詳細資料", users);

  socket.on("clientToSeverMsg", async function (data) {
    console.log("服務器端收到客戶端資料", data);
    if (data.square === false) {
      console.log("私人聊天");

      await db.queryAsync(
        `UPDATE mb_chat SET myRead = 1 WHERE chat_id = "${data.chat_id}" AND myTo = "${data.myFrom}"`
      );

      console.log('測試私人聊天2', `INSERT INTO mb_chat(chat_id, myFrom, myTo, content, myRead, created_at, myDelete, myUpload) VALUES ("${data.chat_id}","${data.myFrom}","${data.myTo}","${data.content}","${data.myRead}","${data.created_at}", "${data.myDelete}", "${data.myUpload}")`);

      await db.queryAsync(
        `INSERT INTO mb_chat(chat_id, myFrom, myTo, content, myRead, created_at, myDelete, myUpload) VALUES ("${data.chat_id}","${data.myFrom}","${data.myTo}",'${data.content}',"${data.myRead}","${data.created_at}", "${data.myDelete}", "${data.myUpload}")`
      );


      const results = await db.queryAsync(
        `SELECT mb_chat.*,MR_number,MR_name,MR_pic FROM mb_chat LEFT JOIN mr_information ON MR_number = myTo OR MR_number = myFrom WHERE myFrom = "${data.myFrom}" OR myTo = "${data.myFrom}" ORDER BY created_at ASC`
      );
      // 一開始拿的資料,MR_number有塞我的跟對方的,為了讓MR_number是塞對方的資料,所以要先篩選一次
      var Without_MY_MR_number = [];
      results.forEach(function (value, index) {
        if (value.MR_number !== data.myFrom) {
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
      console.log("mapResult", mapResult);

      const results2 = await db.queryAsync(
        `SELECT * FROM mb_chat WHERE myTo = "${data.myFrom}" AND myRead = 0`
      );

      mapResult.forEach(function (value, index) {
        value.total = 0;
        for (var i = 0; i < results2.length; i++) {
          if (value.MR_number === results2[i].myFrom) {
            value.total++;
          }
        }
      });

      mapResult = mapResult.sort(function (a, b) {
        return a.created_at < b.created_at;
      });

      const chatMessage = await db.queryAsync(
        `SELECT * FROM mb_chat WHERE myFrom = "${data.myFrom}" OR myTo = "${data.myFrom}" ORDER BY created_at DESC`
      );

      console.log("chatMessage", chatMessage);

      io.sockets.emit("SeverToClientMsg", {
        square: data.square,
        data: data,
        oldDataMessage: chatMessage,
        oldDataList: mapResult
      });
    } else {
      console.log("廣場聊天");
      io.sockets.emit("SeverToClientMsg", {
        square: data.square,
        myFrom: data.myFrom,
        myTo: users,
        content: data.content,
        myUpload: data.myUpload,
        created_at: data.created_at
      });
    }
  });

  socket.on("clientToSeverDelete", async function (data) {
    console.log("clientToSeverDelete 服務器端收到客戶端資料", data);

    await db.queryAsync(
      `UPDATE mb_chat SET myRead = 1, myDelete = 1 WHERE sid = "${data.MessageSid}"`
    );

    const results = await db.queryAsync(
      `SELECT mb_chat.*,MR_number,MR_name,MR_pic FROM mb_chat LEFT JOIN mr_information ON MR_number = myTo OR MR_number = myFrom WHERE myFrom = "${data.myFrom}" OR myTo = "${data.myFrom}" ORDER BY created_at ASC`
    );
    // 一開始拿的資料,MR_number有塞我的跟對方的,為了讓MR_number是塞對方的資料,所以要先篩選一次
    var Without_MY_MR_number = [];
    results.forEach(function (value, index) {
      if (value.MR_number !== data.myFrom) {
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
    console.log("mapResult", mapResult);

    const results2 = await db.queryAsync(
      `SELECT * FROM mb_chat WHERE myTo = "${data.myFrom}" AND myRead = 0`
    );

    mapResult.forEach(function (value, index) {
      value.total = 0;
      for (var i = 0; i < results2.length; i++) {
        if (value.MR_number === results2[i].myFrom) {
          value.total++;
        }
      }
    });

    mapResult = mapResult.sort(function (a, b) {
      return a.created_at < b.created_at;
    });

    const chatMessage = await db.queryAsync(
      `SELECT * FROM mb_chat WHERE myFrom = "${data.myFrom}" OR myTo = "${data.myFrom}" ORDER BY created_at DESC`
    );

    console.log("chatMessage", chatMessage);

    io.sockets.emit("SeverToClientDelete", {
      data: data,
      oldDataMessage: chatMessage,
      oldDataList: mapResult
    });
  });

  socket.on("clientToSeverInsertMemo", async function (data) {
    console.log("clientToSeverInsertMemo 服務器端收到客戶端資料", data);
    await db.queryAsync(
      `INSERT INTO mb_chatmemo( chat_id, myFrom, myTo, content, created_at, myDelete) VALUES ("${data.chat_id}","${data.myFrom}","${data.myTo}","${data.content}","${data.created_at}","${data.myDelete}")`
    );

    const oldDataMemo = await db.queryAsync(
      `SELECT mb_chatmemo.*,mr_information.MR_name,mr_information.MR_pic FROM mb_chatmemo LEFT JOIN mr_information ON mb_chatmemo.myFrom = mr_information.MR_number WHERE (myFrom = "${data.myFrom}" OR myTo = "${data.myFrom}") AND myDelete = 0 ORDER BY created_at DESC`
    );

    io.sockets.emit("SeverToClientInsertMemo", oldDataMemo);
  })

  socket.on("clientToSeverInsertAlbum", async function (data) {
    console.log("clientToSeverInsertAlbum 服務器端收到客戶端資料", data);
    await db.queryAsync(
      `INSERT INTO mb_chatablum( chat_id, myFrom, myTo, content, myDelete) VALUES ("${data.chat_id}","${data.myFrom}","${data.myTo}","${data.content}","${data.myDelete}")`
    );

    const oldDataAlbum = await db.queryAsync(
      `SELECT * FROM mb_chatablum WHERE (myFrom = "${data.myFrom}" OR myTo = "${data.myFrom}") AND myDelete = 0 ORDER BY sid DESC`
    );

    io.sockets.emit("SeverToClientInsertAlbum", oldDataAlbum);
  })

  socket.on("clientToSeverMemoDelete", async function (data) {
    console.log("clientToSeverMemoDelete 服務器端收到客戶端資料", data);
    await db.queryAsync(
      `UPDATE mb_chatmemo SET myDelete = 1 WHERE sid = "${data.memoSid}"`
    );

    const oldDataMemo = await db.queryAsync(
      `SELECT mb_chatmemo.*,mr_information.MR_name,mr_information.MR_pic FROM mb_chatmemo LEFT JOIN mr_information ON mb_chatmemo.myFrom = mr_information.MR_number WHERE (myFrom = "${data.myFrom}" OR myTo = "${data.myFrom}") AND myDelete = 0 ORDER BY created_at DESC`
    );

    io.sockets.emit("SeverToClientInsertMemo", oldDataMemo);
  })

  socket.on("clientToSeverEditMemo", async function (data) {
    console.log("clientToSeverEditMemo 服務器端收到客戶端資料", data);
    await db.queryAsync(
      `UPDATE mb_chatmemo SET content = "${data.content}" WHERE sid = "${data.memoSid}"`
    );

    const oldDataMemo = await db.queryAsync(
      `SELECT mb_chatmemo.*,mr_information.MR_name,mr_information.MR_pic FROM mb_chatmemo LEFT JOIN mr_information ON mb_chatmemo.myFrom = mr_information.MR_number WHERE (myFrom = "${data.myFrom}" OR myTo = "${data.myFrom}") AND myDelete = 0 ORDER BY created_at DESC`
    );

    io.sockets.emit("SeverToClientInsertMemo", oldDataMemo);
  })

  socket.on("disconnect", function (data) {
    socket.disconnect();

    for (var i = 0; i < users.length; i++) {
      if (users[i].socketId === socket.id) {
        users.splice(i, 1);
      }
    }

    console.log("close---總共幾位會員連接上socket", users.length);
    console.log("close---現在離開會員的socketId", socket.id);
    console.log("close---現在剩下所有會員的詳細資料", users);

    io.sockets.emit("SeverToClientPeople", users.length);
  });

  io.sockets.emit("SeverToClientPeople", users.length);
});

http.listen(5000, function () {
  console.log("listening on *:5000");
});

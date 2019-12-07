const mysql = require('mysql')
const bluebird = require('bluebird')
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "pbook"

})
db.connect();
bluebird.promisifyAll(db)

function sqlQuery(sql) {
    let data
    try {
        data = db.queryAsync(sql)
    } catch (err) {
        console.log('in connecting db',err);
    }
    return data
}

module.exports = { db, sqlQuery }
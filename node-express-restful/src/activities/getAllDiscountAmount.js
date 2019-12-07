import request from 'request'
import bluebird from 'bluebird'
bluebird.promisifyAll(request)

async function getAllDiscountAmount(){
    console.log(1)
    await request.getAsync('http://localhost:5555/activities/book-discount-for-member-level/1')
    console.log(2)
    await request.getAsync('http://localhost:5555/activities/book-discount-for-member-level/2')
    console.log(3)
    await request.getAsync('http://localhost:5555/activities/book-discount-for-member-level/3')
    console.log(4)
    await request.getAsync('http://localhost:5555/activities/book-discount-for-member-level/4')
    console.log(5)
    await request.getAsync('http://localhost:5555/activities/book-discount-for-member-level/5')
    console.log(6)
    await request.getAsync('http://localhost:5555/activities/book-discount-for-member-level/6')
    return '活動折價計算完畢'
}

module.exports = getAllDiscountAmount
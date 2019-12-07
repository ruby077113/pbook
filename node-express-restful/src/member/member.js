import express from 'express'
import db from './db/database'
import member from './domain/member'
import login from './domain/login'
const router = express.Router()
const bluebird = require("bluebird");
bluebird.promisifyAll(db);

var Member = new member()

//註冊
router.post('/register', (req, res, next) => {
    const crypto = require('crypto')
    let sha1 = crypto.createHash('sha1')
    let hash = sha1.update(req.body.email).digest('hex')
    // console.log(hash);
    
    let nickname = req.body.nickname
    // console.log(hash);
    // return
    let Member = new member(req.body.name, req.body.email, req.body.password, req.body.filename)
    let number_blank = "MR00000"
    let new_number =""
    //驗證email格式
    if(Member.checkEmail(req.body.email) === false){
        res.json({
            status: "註冊失敗。",
            err: "請輸入正確的Eamil格式"
        })
        return
    }else{

        // 尋找是否有重複的email
        db.query(Member.queryEmail(), (err, rows) => {
            // console.log(rows);
            
                // 如果有重複的email
                if(rows.length >=1){
                    res.json({
                        status: "註冊失敗",
                        message: "已有重複的Email。"
                     })
                     return
                }else{
                    db.query(`SELECT MAX(sid) FROM mr_information`,(err, data)=>{
                       new_number = number_blank.slice(0, -3)+ (data[0]['MAX(sid)']+1)
                        console.log(new_number, hash, nickname);
                        
                       db.query(Member.getAddMemberSql(new_number, hash, nickname), (err, data) => {
                           console.log(1, data);
                           console.log(2, err);
                           
                           if(err){
                               res.json({
                                   status: "伺服器錯誤，請稍後在試",
                                   message: "註冊失敗",
                                })
                               return;
                           }

                           // 若寫入資料庫成功，則回傳給clinet端下：
                           res.json({
                               status: "註冊成功",
                               message:"歡迎" + req.body.name + "的加入!",
                            })
                         })
                    })

                }
        })
    }
})

//寄發EMAIL
import nodemailer from 'nodemailer'
router.post('/sendPwd', (req, res)=>{
    let email = req.body.email
    // console.log(email);
    let sql = `SELECT * FROM mr_information WHERE MR_email = '${email}'`
    db.query(sql, (err, row)=>{
        console.log(row);
        
        if(! row.length){
            return res.json({
                status: '寄送失敗',
                message: '這個信箱還未註冊過'
            })
        }
        // console.log(123);
        let token = row[0].tokenId;
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth:{
                user: 'dragonqoo1988@gmail.com',
                pass: '29894199',
            
            }
        })
        let mailOptions = {
            form: '"品書網"<dragonqoo1988@gmail.com>',
            to: `${email}`,
            subject: '重設密碼',
            html: `<h1>親愛的品書會員您好:</h1><br><h3>請點擊下方進行重新設定密碼</h3><br><a href="http://localhost:3000/ResetPWD/${token}"><h2>重設密碼頁</h2></a>`
        }
        transporter.sendMail(mailOptions, (err, info)=>{
            // console.log(info);
            res.json({
                status: '傳送成功',
                message: '請到信箱修改密碼'
                })
            })
    })
})

//用token查詢email，再去修改密碼
router.post('/queryEmail', (req, res, next)=>{
    let token = req.body.token
    let sql = `SELECT MR_number FROM mr_information WHERE tokenId = '${token}'`
    db.query(sql, (err, row)=>{

        //空陣列的判斷
        if (! row.length){
            // console.log(111);
            res.json({
                status: "找不到這個token",
            })
            return
        }
        res.json({
            number: row[0]
        })
    })
})

//取個人書櫃書籍資料
router.post('/queryBookcase/:page?', (req,res)=>{
    let number = req.body.number
    let output = {}
    let perPage = 15 //每頁幾筆
    output.params = req.params  //可以在網址看params
    output.perPage = perPage;
    let page = parseInt(req.params.page) || 1
    
    let sql = `SELECT COUNT(1) total FROM vb_books b LEFT JOIN br_bookcase bc ON b.isbn = bc.isbn WHERE bc.number='${number}'`
    db.queryAsync(sql)
        .then(result=>{
            output.totalRows = result[0]["total"] //總筆數
            output.totalPage = Math.ceil(output.totalRows / perPage) //總頁數
            if(output.totalPage == 0 ) return
            if(page < 1) page = 1
            if(page > output.totalPage) page = output.totalPage
            output.page = page
            // console.log(page);
            
            page = (page - 1) * perPage 
            return db.queryAsync(`SELECT b.* FROM vb_books b LEFT JOIN 
                br_bookcase bc ON b.isbn = bc.isbn WHERE bc.number='${number}' LIMIT ${page}, ${perPage}`)
        })
        .then( result =>{
            output.rows = result
            res.json(output)
        } )
})

//取個人書櫃書評家資料
router.post('/queryReviewer/:page', (req, res)=>{
    let number = req.body.number
    let output = {}
    let perPage = 3 //每頁幾筆
    output.params = req.params  //可以在網址看params
    output.perPage = perPage;
    let page = parseInt(req.params.page) || 1
    let sql = `SELECT COUNT(1) total FROM br_reviewerlist b LEFT JOIN br_reviewermark bc ON b.number = bc.number_reviewer WHERE bc.number='${number}'`
    db.queryAsync(sql)
        .then( result =>{
            output.totalRows = result[0]["total"]//總比數
            output.totalPage = Math.ceil(output.totalRows / perPage) //總頁數
            if(output.totalPage == 0 ) return
            if(page < 1 ) page = 1
            if(page > output.totalPage) page = output.totalPage
            output.page = page
            // console.log(page);
            page = (page - 1) * perPage
            return db.queryAsync(`SELECT b.* FROM br_reviewerlist b LEFT JOIN 
                br_reviewermark bc ON b.number = bc.number_reviewer WHERE bc.number='${number}' LIMIT ${page}, ${perPage}`)
        })
        .then( result => {
            output.rows = result
            res.json(output)
        })
})






    //書評家加入個人書櫃
    router.post('/addBookcase_Review', (req, res)=>{
        let number = req.body.number
        let number_reviewer = req.body.number_reviewer
        let sql = `SELECT COUNT(1) total FROM br_reviewermark WHERE number = '${number}' && number_reviewer = '${number_reviewer}'`
        db.queryAsync(sql)
            .then( row => {
                console.log(row[0].total);
                if(row[0].total >= 1 ){
                    res.json({
                        message: "此書評家已加入過收藏"
                    })
                    return
                }else{
                    //新增書評家到書櫃
                    let sql = `INSERT INTO br_reviewermark(number, number_reviewer, created_time) 
                                VALUES ('${number}','${number_reviewer}', now())`
                    return db.queryAsync(sql)
                    }
                })
                .then(result=>{
                    if(result)
                        res.json({
                            status: "新增到書櫃",
                            message: "加入到書櫃成功"
                        })
                })            
            })

    //書評家取消追蹤
    router.post('/removeBookcase_Review', (req, res) => {
        let number = req.body.number
        let number_reviewer = req.body.number_reviewer
        // console.log(number, isbn);

        db.query(Member.removeBookcase_Review(number, number_reviewer), (err, result)=>{
            // console.log(result);
            res.json({
                message: '取消追蹤成功'
            })
        })
    })



//書籍加入個人書櫃
router.post('/addBookcase', (req, res)=>{
    let number = req.body.number
    let isbn = req.body.isbn
    let bookSid = req.body.bookSid
    let sql = `SELECT COUNT(1) total FROM br_bookcase WHERE number = '${number}' && isbn = '${isbn}'`
    db.queryAsync(sql)
        .then( row => {
            // console.log(row[0].total);
            if(row[0].total >= 1 ){
                res.json({
                    message: "本書已加入過收藏"
                })
                return
            }else{
                //新增書籍到書櫃
                let sql = `INSERT INTO br_bookcase(number, isbn, bookSid, title, bookName, blog, created_time) 
                            VALUES('${number}', '${isbn}', '${bookSid}', '', '', '',now()) `
                return db.queryAsync(sql)
                }
            })
            .then(result=>{
                if(result)
                    res.json({
                        status: "新增到書櫃",
                        message: "加入到書櫃成功"
                    })
            })            
        })

//書籍取消追蹤
router.post('/removeBookcase', (req, res) => {
    let number = req.body.number
    let isbn = req.body.isbn
    // console.log(number, isbn);

    db.query(Member.removeBookcase(number, isbn), (err, result)=>{
        // console.log(result);
        res.json({
            message: '取消追蹤成功'
        })
    })
})

//查詢二手書籍
router.post('/queryMemberBooks', (req, res)=>{
    let number = req.body.number
    db.query(Member.queryMemberBook(number),(err, rows)=>{       
        if(!rows.length){
            res.json({
                message: "查不到資料"
            })
        }else{
            res.json({rows})
        }
    })
})



//登入
router.post('/login', (req, res, next) => {
    let Member = new login(req.body.email, req.body.password)
    
    db.query(Member.getLoginSql(), (err, rows) => {
        
        if( rows.length == 0){
            res.json({
                status:"登入失敗",
                message:"請輸入正確的帳號或密碼"
            })
            return
        }else if(err){
            res.json({
                status:"登入失敗",
                message:"伺服器錯誤，請稍後在試！"
            })
            return
        }else{
            //設定session
            // 在session內塞memberData物件，用來存放會員資料
            req.session.memberData = {
                memberId: rows[0].MR_number,
                memberLv: rows[0].MR_personLevel,
            } 
            // console.log(req.session);
            
            res.json({
                status:"登入成功",
                message:"歡迎" + rows[0].MR_name + "的登入!",
                info: rows[0],
            })
        }
    })

})

//查詢分類
router.get('/categories', (req, res, next)=>{
    db.query(Member.queryCategories(), (err, row)=>{
        res.json({
            row
        })
    })
})

//刪除上架書籍
router.post('/deleteBook', (req, res)=>{
    let sid = req.body.sid
    console.log("sid",sid);
    
    db.query(Member.deleteBook(sid), (err, row) => {
        res.json({
            message: "刪除成功",
            row
        })
    })
})

//修改會員密碼
router.post('/changePassword', (req, res, next)=>{
    let number = req.body.number
    let password = req.body.password
    // console.log(number, password);
    
    db.query(Member.changePassword(number,password), (err, row)=>{

        if(err) return res.json({err: err})
        // console.log(row);
        if(row.changedRows == 0){

            res.json({
                status: "修改密碼失敗",
                message: "會員編號有誤"
            })
            return
        }
        else{
            res.json({
                status: "修改密碼成功",
                message: "完成密碼更新"
            })
        }
    })
})



//查詢會員資料
router.post('/', (req, res, next)=>{
    let number = req.body.number
    db.query(Member.getMemberInfo(number), (err, rows)=>{
        res.send(rows)
    })
})


//修改會員資料
router.post('/edit', (req, res, next)=>{
    let number = req.body.number
    let email = req.body.email
    let name = req.body.name
    let nickname = req.body.nickname
    let birthday = req.body.birthday
    let mobile = req.body.mobile
    let address = req.body.address
    let filename = req.body.filename

    
    db.query(Member.modifyMemberInfoSql(number, email, name, nickname, birthday, mobile, address, filename), (err, result)=>{
        if(err){ res.json(err) }
        res.json({
            status: "修改成功",
            message: "完成資料的更新"
        })
    })
})


//新增會員書籍
router.post('/addBook', (req, res)=>{
    let isbn = req.body.isbn
    let name = req.body.name
    let author = req.body.author
    let publishing = req.body.publishing
    let publishDate = req.body.publishDate
    let version = req.body.version
    let price = req.body.price
    let pages = req.body.pages
    let savingStatus = req.body.savingStatus
    let memberNo = req.body.memberNo
    let categories = req.body.categories
    let remark = req.body.remark
    let imgs = req.body.imgs

    db.query(Member.addMemberBoos(isbn, name, author, publishing, 
        publishDate, version, price, pages, savingStatus, memberNo, imgs, 
        categories, remark), (err, row)=>{
            console.log(row);
            if(row == undefined){
                res.json({
                    status: "上架書籍失敗",
                    message: "資訊有誤"
                })
                return
            }
            else{
                res.json({
                    status: "上架書籍成功",
                    message: "可以參加配對活動"
                })
            }
    })
})


//前端上傳圖片單張
const multer =require('multer')
const upload =multer({dest:'tmp_uploads/'})
const fs = require('fs')
router.post('/upload', upload.single('avatar'),(req, res) =>{
        console.log("avatar",  req.body.avatar);
        if(req.file && req.file.mimetype){
            // console.log(req.file)
            switch(req.file.mimetype){
                case 'image/png':
                case 'image/jpeg':
                    fs.createReadStream(req.file.path)
                        .pipe(
                            fs.createWriteStream('public/images/member/' + req.file.originalname)
                        )
                        // console.log(req.file.filename);
                        
                        res.json({
                           filename: req.file.originalname
                        })
                        break;
                default:
                    return res.send('bad file type')
            }
        }else{
            res.json({
                filename: ""
            })
        }
    })


//前端上傳圖片多張
//API用POSTMAN測試可以
router.post('/imgFiles', upload.array('avatar', 5 ),(req, res, next) =>{
        console.log("avatar",  req.body);
        console.log("Files", req.files); 
        
        let images = []
        for(let i=0; i<req.files.length;i++){
            if(req.files[i] && req.files[i].mimetype){
                // console.log([i]);
                switch(req.files[i].mimetype){
                        case 'image/png':
                        case 'image/jpeg':
                            fs.createReadStream(req.files[i].path)
                                .pipe(
                                    fs.createWriteStream('public/images/memberBooks/' + req.files[i].originalname)
                                )
                                images.push( req.files[i].originalname)
                                // console.log(images);            
                                continue;
                                default:
                                return res.send('bad file type')
                        }
                            
            }else{
                    // console.log('222');
                    res.json({
                        pictures: images
                    })
            }
        }
        // console.log("images", images);
        
        res.json({
            message: "上傳成功",
            pictures: images
        })
        
    })




module.exports = router;
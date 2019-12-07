/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import styled from '@emotion/styled'
import BookScoreAndLine from './BookScore/BookScoreAndLine'
import BookStar from './BookScore/BookScoreForBR'
import BookScoreForMember from './BookScore/BookScoreForMember'
import { faTimes, faPen, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import swal from '@sweetalert/with-react'
import { BrowserRouter as Router, Route, Link, NavLink } from 'react-router-dom'
import Nav from './components/Navbar'

//---------------------------------------------------------------------------------------------------------
const All = styled.section`
  background-image: url('../../images/bg.png');
`

//主要內容外框
const Main = styled.section`
  margin: 40px auto -35px auto;
  width: 1200px;
`

// 書本外框
const Book = styled.div`
  display: flex;
  margin: 5px 0;
  height: 300px;
`
//橫排
const BookRow = styled.div`
  display: flex;
  flex-direction: row;
`
//未登入會員橫排
const BookRow2 = styled.div`
  display: flex;
  flex-direction: row-reverse;
`

//直排
const BookColumn = styled.div`
  display: flex;
  flex-direction: column;
`

//直排右側分數
const BookColumnScore = styled.div`
  position: relative;
  bottom: 140px;
  right: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

//未登入直排右側分數
const BookColumnScore2 = styled.div`
  display: flex;
  flex-direction: column;
`

//直排下方會員
const BookColumnMember = styled.div`
  display: flex;
  margin: 0 0 0 20px;
  align-items: center;
  flex-direction: column;
`

//書本資訊
const BookInfo = styled.div`
  margin: 0 0 0 50px;
  width: 1000px;
`
//回復評論外框
const Review = styled.section`
  display: flex;
  width: 1200px;
  margin: 0 0 3rem 0;
  border-bottom: 1px dashed #ccc;
`
//會員頭像
const Member = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 0 0 5px;
`
//------------------------------------------------------------------------------------------------------

const List = () => {
  //從nodejs拿取資料的sid值
  const urlParams = window.location.pathname.replace('/book_reviews/', '')

  //變數

  //上方書本資料
  const [List, setList] = useState([])
  //推薦書本資料
  const [recommendBook, setRecommendBook] = useState([])
  //會員書評
  const [memberReview, getMemberReview] = useState([])
  //會員個人資料設定
  const [user, setUser] = useState({
    isLogin: false,
    pic: 'yui.png',
    nickname: '',
  })
  //CRUD設定
  const [review, setReview] = useState({
    id: '',
    sid: '',
    pic: '',
    editReview: '',
    reviewText: '',
    book: urlParams,
    star: '1',
    isEdit: false,
  })
  //ISBN
  const [ISBN, setISBN] = useState()
  //書評下方顯示欄資料
  const [reply, setReply] = useState([])
  //書評回覆用對照ID
  const [reviewID, setReviewID] = useState(1)
  //書評回覆內容更新
  let replyTxt
  //書評回覆CRUD狀態
  const [replyMode, setReplyMode] = useState({
    isEdit: false,
    sid: '',
    editReply: '',
  })
  useEffect(() => {
    bookList()
    reviewList()
    replyText()
    if (JSON.parse(localStorage.getItem('user')) !== null) {
      let data = JSON.parse(localStorage.getItem('user'))
      setUser({
        isLogin: true,
        pic: data.MR_pic,
        nickname: data.MR_nickname,
      })
      setReview({ ...review, id: data.MR_number })
      recommend(data.MR_number)
    }
  }, [])

  //書評分頁資料ajax
  const bookList = async () => {
    await axios
      .get(`http://localhost:5555/reviews/book_reviews/${urlParams}`)
      .then(res => {
        let data = res.data.data[0]
        setList(res.data.data)
        setISBN(data.isbn)
        // setReview({ ...review, isbn: data.isbn, pic: data.pic })
      })
      .catch(error => {
        console.log(error)
      })
  }
  //書評資料
  const reviewList = async () => {
    await axios
      .get(`http://localhost:5555/reviews/memberReview/${urlParams}`)
      .then(res => {
        getMemberReview(res.data.reviews)
      })
      .catch(error => {
        console.log(error)
      })
  }
  //書籍推薦資料
  const recommend = async e => {
    await axios
      .get(`http://localhost:5555/activities/recommend-books/${e}/4`)
      .then(res => {
        setRecommendBook(res.data)
      })
  }
  //書評回覆 用ENTER 發送&修改
  const keypress = e => {
    if (e.which === 13) {
      if (replyMode.editReply !== '' && replyMode.editReply !== undefined) {
        submitHandler2(e)
        updateHandler(e)
      } else {
        swal('內容為空', '', 'warning')
      }
    }
  }

  //輸入時更新資料
  const changeHandler = e => {
    setReview({
      ...review,
      [e.target.name]: e.target.value,
    })
    setReviewID(e.target.name)
    replyTxt = {
      name: e.target.value,
    }
    console.log(replyTxt)
    setReplyMode({ ...replyMode, editReply: e.target.value })
    console.log(replyMode.editReply)
  }

  //新增資料
  const submitHandler = e => {
    e.preventDefault()
    let api
    api = `http://localhost:5555/reviews/book_reviews/${urlParams}/data`

    if (review.reviewText !== '') {
      axios
        .post(api, {
          id: review.id,
          book: review.book,
          reviewText: review.reviewText,
          star: review.star,
        })
        .then(res => {
          swal('新增成功', '', 'success').then(value => {
            setTimeout(() => {
              window.location.reload()
            }, 100)
          })
        })

        .catch(error => {
          setReview({
            error: true,
            submitSuccess: false,
          })
        })
    } else {
      swal('書評內容為空')
    }
  }
  //新增資料下方回覆
  const submitHandler2 = e => {
    e.preventDefault()
    let api = `http://localhost:5555/reviews/reply/InsertData`

    if (user.isLogin) {
      axios
        .post(api, {
          id: review.id,
          review_sid: reviewID,
          reply: replyMode.editReply,
        })
        .then(res => {
          swal('新增成功', '', 'success').then(value => {
            setTimeout(() => {
              window.location.reload()
            }, 100)
          })
        })

        .catch(error => {
          setReview({
            error: true,
            submitSuccess: false,
          })
        })
    } else {
      swal('書評內容為空')
    }
  }
  //更新書評&回覆資料
  const updateHandler = e => {
    e.preventDefault()
    let api
    if (replyMode.isEdit) {
      api = `http://localhost:5555/reviews/reply/EditData`
    } else {
      api = `http://localhost:5555/reviews/editReview/data`
    }
    axios
      .put(api, {
        sid: review.sid,
        replySid: replyMode.sid,
        editReview: review.editReview,
        editReply: replyMode.editReply,
      })
      .then(res => {
        swal('修改成功!').then(value => {
          setTimeout(() => {
            window.location.reload()
          }, 100)
        })
      })

      .catch(error => {
        setReview({
          error: true,
          submitSuccess: false,
        })
      })
  }

  //刪除書評資料
  const deleteHandler = e => {
    let delete_data = e
    let api
    if (replyMode.isEdit) {
      api = `http://localhost:5555/reviews/reply/DeleteData/${delete_data}`
    } else {
      api = `http://localhost:5555/reviews/deleteReview/${delete_data}`
    }
    console.log(delete_data)
    swal({
      title: '確定刪除嗎?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        swal('刪除成功!', '', {
          icon: 'success',
        }).then(value => {
          axios.delete(api)
          setTimeout(() => {
            window.location.reload()
          }, 100)
        })
      } else {
        swal('已取消刪除!')
      }
    })
  }

  //刪除書評回覆資料
  const deleteHandler2 = e => {
    let delete_data = e
    let api
    api = `http://localhost:5555/reviews/reply/DeleteData/${delete_data}`

    console.log(delete_data)
    swal({
      title: '確定刪除嗎?',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    }).then(willDelete => {
      if (willDelete) {
        swal('刪除成功!', '', {
          icon: 'success',
        }).then(value => {
          axios.delete(api)
          setTimeout(() => {
            window.location.reload()
          }, 100)
        })
      } else {
        swal('已取消刪除!')
      }
    })
  }

  // 跳至登入畫面
  const login = () => {
    let loginBtn = document.querySelector('.loginButton')
    loginBtn.click()
  }

  //加入書櫃
  const addCase = e => {
    e.preventDefault()
    let api = `http://localhost:5555/reviews/bookcase`
    if (user.isLogin) {
      axios
        .post(api, {
          number: review.id,
          isbn: ISBN,
        })
        .then(res => {
          swal('新增成功', '', 'success')
        })
    } else {
      swal('請登入會員').then(value => {
        login()
      })
    }
  }

  // -----------------------------------------------------------------------

  //書評下方顯示資料
  const replyText = async () => {
    await axios.get(`http://localhost:5555/reviews/reply/`).then(res => {
      setReply(res.data.reply)
      console.log(res.data)
    })
  }

  return (
    <>
      <All>
        <Nav />
        <Main>
          {List.map(data => (
            <Book key={data.sid}>
              <BookColumn>
                <img
                  className="reviews_list_img"
                  key={data.sid}
                  src={`http://localhost:5555/images/books/${data.pic}`}
                />
              </BookColumn>
              <BookColumn>
                <BookInfo>
                  <h3>{data.name}</h3>
                  {'作者:'}&nbsp;
                  <span style={{ opacity: 0.6 }}>{data.author}</span>
                  &nbsp;&nbsp;&nbsp;
                  {'出版社:'}&nbsp;
                  <span style={{ opacity: 0.6 }}>{data.cp_name}</span>
                  &nbsp;&nbsp;&nbsp;
                  {'出版日期:'} &nbsp;
                  <span style={{ opacity: 0.6 }}>
                    {new Intl.DateTimeFormat('zh-TW', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour12: false,
                    })
                      .format(new Date(data.publish_date))
                      .replace(/\//g, '-')}
                  </span>
                  <br />
                  <br />
                  {'內容簡介:'}
                  <div>
                    {data.introduction
                      .replace(/<[^>]*>/g, '')
                      .replace(/&nbsp;/g, '')
                      .replace(/&hellip;/g, '')
                      .replace(/&bull;/g, '')}
                  </div>
                </BookInfo>
              </BookColumn>
            </Book>
          ))}
          {user.isLogin ? (
            <div className="reviews_recommendText">推薦書籍</div>
          ) : (
            ''
          )}
          <div className="reviews_recommendBook">
            {recommendBook.map((book, index) => (
              <Link
                key={index}
                className="reviews_recommendBook_Link"
                to={'/book_reviews/' + book.sid}
              >
                <div>
                  <img
                    className="reviews_recommendBook_img"
                    src={`http://localhost:5555/images/books/${book.pic}`}
                  />
                  <div className="reviews_recommendBookName">{book.name}</div>
                </div>
              </Link>
            ))}
          </div>

          {user.isLogin ? (
            <BookColumnScore>
              <Link to={`/books/information/${urlParams}`}>
                <button style={{ outline: 0 }} className="reviews_BookBuy">
                  立即購買
                </button>
              </Link>
              <BookRow>
                <BookScoreAndLine List={List} />
              </BookRow>
              <form onSubmit={addCase}>
                <button type="submit" className="reviews_BookCase">
                  加入書櫃
                </button>
              </form>
            </BookColumnScore>
          ) : (
            <BookColumnScore2>
              <Link to={`/books/information/${urlParams}`}>
                <button style={{ outline: 0 }} className="reviews_BookBuy">
                  立即購買
                </button>
              </Link>
              <BookRow2>
                <BookScoreAndLine List={List} />
              </BookRow2>
              <form onSubmit={addCase}>
                <button type="submit" className="reviews_BookCase">
                  加入書櫃
                </button>
              </form>
            </BookColumnScore2>
          )}
          <h3 className="reviews_push">發表評論</h3>
          <Review>
            <BookColumnMember>
              <Member>
                {user.isLogin ? (
                  <img
                    className="reviews_member_img"
                    src={`http://localhost:5555/images/member/${user.pic}`}
                  />
                ) : (
                  ''
                )}
                <h6 className="reviews_member_nickname">{user.MR_nickname}</h6>
              </Member>
            </BookColumnMember>
            {user.isLogin ? (
              <form className="reviews_form" onSubmit={submitHandler}>
                <textarea
                  className="reviews_textarea"
                  name="reviewText"
                  value={review.reviewText}
                  onChange={changeHandler}
                  onKeyPress={keypress}
                  placeholder="新增評論..."
                />
                <div className="reviews_push2">
                  <p style={{ width: '80px' }}>幫書籍評分</p>
                  <BookStar
                    score_star={review.star}
                    setScore_star={changeHandler}
                  />
                  <button
                    style={{ outline: 0 }}
                    type="submit"
                    className="reviews_submitBtn"
                  >
                    送出評論
                  </button>
                </div>
              </form>
            ) : (
              <form className="reviews_form">
                <h6 className="reviews_Login">
                  <a onClick={login} href="#">
                    請登入會員填寫評論
                  </a>
                </h6>
              </form>
            )}
          </Review>
          {memberReview.map((data, index) => (
            <Review key={index}>
              <BookColumnMember>
                <Member>
                  <img
                    className="reviews_memberReview_img"
                    src={`http://localhost:5555/images/member/${data.MR_pic}`}
                  />
                </Member>
              </BookColumnMember>
              <div className="reviews_member_text">
                <BookRow>
                  <BookScoreForMember score_star={data.star} />
                  {data.MR_levelName}
                </BookRow>
                <BookRow>
                  <h6 className="reviews_member_nickname">
                    {data.MR_nickname}
                  </h6>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <div className="reviews_time">
                    {new Intl.DateTimeFormat('zh-TW', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour12: false,
                    })
                      .format(new Date(data.create_time))
                      .replace(/\//g, '-')}
                  </div>
                </BookRow>
                <br />
                {review.isEdit && data.sid === review.sid ? (
                  <form onSubmit={updateHandler}>
                    <textarea
                      className="reviews_textarea"
                      name="editReview"
                      value={review.editReview}
                      onChange={changeHandler}
                      // onKeyPress={keypress}
                    />
                    <button
                      style={{ outline: 0 }}
                      type="submit"
                      className="reviews_UpdateBtn"
                    >
                      修改評論
                    </button>
                  </form>
                ) : (
                  <div className="reviews_text">{data.message}</div>
                )}
                {reply.map((item, index) =>
                  item.review_sid == data.sid ? (
                    <div key={index} className="reviews_reply_view">
                      <img
                        className="reviews_memberReply_img"
                        src={`http://localhost:5555/images/member/${item.MR_pic}`}
                      />
                      {replyMode.isEdit && replyMode.sid === item.reply_sid ? (
                        <form
                          className="reviews_reply_form"
                          onSubmit={updateHandler}
                        >
                          {item.MR_nickname}
                          &nbsp;
                          {':'}
                          &nbsp;
                          <input
                            className="reviews_reply_editText"
                            name="editReply"
                            onChange={changeHandler}
                            value={replyMode.editReply}
                          ></input>
                        </form>
                      ) : (
                        <div className="reviews_reply_form">
                          {item.MR_nickname}
                          &nbsp;
                          {':'}
                          &nbsp;
                          {item.reply_text}
                        </div>
                      )}
                      {item.member == review.id ? (
                        <>
                          {replyMode.isEdit &&
                          replyMode.sid === item.reply_sid ? (
                            <FontAwesomeIcon
                              className="reviews_reply_cancel"
                              onClick={() => {
                                setReplyMode({
                                  ...replyMode,
                                  isEdit: false,
                                  sid: item.reply_sid,
                                  editReply: item.reply_text,
                                })
                              }}
                              icon={faTimes}
                            />
                          ) : (
                            <FontAwesomeIcon
                              className="reviews_reply_edit"
                              onClick={() => {
                                setReplyMode({
                                  ...replyMode,
                                  isEdit: true,
                                  sid: item.reply_sid,
                                  editReply: item.reply_text,
                                })
                              }}
                              icon={faPen}
                            />
                          )}
                          {replyMode.isEdit &&
                          replyMode.sid === item.reply_sid ? (
                            ''
                          ) : (
                            <FontAwesomeIcon
                              className="reviews_reply_delete"
                              value={item.reply_sid}
                              onClick={() => {
                                deleteHandler2(item.reply_sid)
                              }}
                              icon={faTrashAlt}
                            />
                          )}
                        </>
                      ) : (
                        ''
                      )}
                    </div>
                  ) : (
                    ''
                  )
                )}
                {user.isLogin ? (
                  <form onSubmit={submitHandler2} key={index}>
                    <textarea
                      value={replyTxt}
                      onChange={changeHandler}
                      name={data.sid}
                      placeholder="回覆此書評"
                      className="reviews_reply_text"
                      onKeyPress={keypress}
                    />
                  </form>
                ) : (
                  ''
                )}
              </div>
              {review.id === data.member ? (
                <div>
                  {review.isEdit && data.sid === review.sid ? (
                    <>
                      <FontAwesomeIcon
                        onClick={() => {
                          setReview({
                            ...review,
                            isEdit: false,
                            editReview: data.message,
                            sid: data.sid,
                          })
                        }}
                        className="reviews_member_icon_times"
                        icon={faTimes}
                      />
                    </>
                  ) : (
                    <FontAwesomeIcon
                      onClick={() => {
                        setReview({
                          ...review,
                          isEdit: true,
                          sid: data.sid,
                          editReview: data.message,
                        })
                      }}
                      className="reviews_member_icon"
                      icon={faPen}
                    />
                  )}
                  <br />
                  {review.isEdit && data.sid === review.sid ? (
                    ''
                  ) : (
                    <FontAwesomeIcon
                      onClick={() => deleteHandler(data.sid)}
                      value={data.sid}
                      className="reviews_member_icon"
                      icon={faTrashAlt}
                    />
                  )}
                </div>
              ) : (
                ''
              )}
            </Review>
          ))}
        </Main>
      </All>
    </>
  )
}

export default List

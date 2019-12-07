/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react'
import styled from '@emotion/styled'
import { LinkContainer } from 'react-router-bootstrap'
import axios from 'axios'
import { Pagination } from 'react-bootstrap'
import BookScore from './BookScore/BookScore'
import BooksData from './components/BooksData'
import BookSearch from './components/Search'
import Category from './components/Category'
import './Reviews.css'
import 'react-tabs/style/react-tabs.css'

function Bookinfo() {
  const [bookInformation, setBookInformation] = useState([]) //書籍資料
  const [array, setArray] = useState(1) //排序方式
  const [categorys, setCategorys] = useState([])
  const [page, getPage] = useState()
  const [bs, setBs] = useState([])
  const [sb, setSb] = useState({
    isSearch: false,
  })
  //---------------------------------------------------------------------------
  //分頁功能

  let pageNum = []
  let c,
    p = 1,
    s1,
    s2,
    s
  const url = window.location.search.replace('?', '')
  if (url !== '') {
    let urlSplit = url.split('&')
    if (url.indexOf('c') !== -1) {
      if (urlSplit.length >= 1) {
        s1 = urlSplit[0].split('=')
        c = 'c=' + s1[1] + '&'
        p = 1
      }
    } else {
      c = ''
      s1 = urlSplit[0].split('=')
      p = s1[1]
    }
    if (urlSplit.length >= 2) {
      s2 = urlSplit[1].split('=')
      p = s2[1]
    }
  }
  if (c == undefined) {
    c = ''
  }

  const searchParams = new URLSearchParams(window.location.search)
  s = +searchParams.get('p') || 1
  console.log(s)

  //---------------------------------------------------------------------------

  //---------------------------------------------------------------------------

  const Main = styled.section`
    margin: -25px auto;
    width: 1200px;
  `

  //右上排列方式欄位
  const OptionBar = styled.div`
    display: flex;
    flex-direction: row-reverse;
    margin: 50px 200px 0px 0;
  `

  // 書本外框
  const Book = styled.section`
    display: flex;
    margin: 0px 0 20px 0;
    align-items: center;
  `
  //直排
  const BookColumn = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
  `
  //書本星數
  const BookScoreSet = styled.div`
    width: 350px;
    height: 250px;
    margin: 100px auto;
    border: 1px solid #ccc;
  `

  //---------------------------------------------------------------------
  useEffect(() => {
    bookInfo()
    categoryBar()
    star()
  }, [array, c, p])

  const star = async () => {
    await axios.get('http://localhost:5555/reviews/book_ratings').then(res => {
      setBs(res.data.data)
    }, [])
  }

  const categoryBar = async () => {
    await axios
      .get('http://localhost:5555/reviews/categoryBar')
      .then(res => {
        let data = res.data.data
        setCategorys(data)
      })
      .catch(error => {
        console.log(error)
      })
  }

  const bookInfo = async e => {
    if (e == undefined) {
      e = ''
    }
    await axios
      .get(`http://localhost:5555/reviews/?${c}a=${array}&p=${p}&s=${e}`)
      .then(res => {
        setBookInformation(res.data.rows)
        getPage(Math.ceil(res.data.total / 15))
        console.log(res.data)
      })
      .catch(error => {
        console.log(error)
      })
  }

  for (let i = 1; i <= page; i++) {
    pageNum.push(
      <LinkContainer key={i} to={'reviews?' + c + 'p=' + i}>
        <Pagination.Item>
          <button
            className={
              `reviews_P_button` + ` ` + (i === s ? `reviews_P_button2` : '')
            }
          >
            {i}
          </button>
        </Pagination.Item>
      </LinkContainer>
    )
  }

  const callback = useCallback(() => {
    return bookInformation
  }, [bookInformation])

  const callback2 = useCallback(() => {
    return bs
  }, [bs])

  const callback3 = useCallback(() => {
    return categorys
  }, [categorys])

  const search_result = e => {
    if (e !== '' && e !== undefined) {
      setSb({ isSearch: true })
      axios
        .get(`http://localhost:5555/reviews/?${c}a=${array}&p=${p}&s=${e}`)
        .then(res => {
          setBookInformation(res.data.rows)

          console.log(bookInformation)
        })
        .catch(error => {
          console.log(error)
        })
    } else if (e.length == 0) {
      bookInfo()
    }
  }

  return (
    <>
      <section className="reviews_MainPage">
        <div className="reviews_searchBar">
          <BookSearch search_result={search_result} />
        </div>
        <Main>
          <Category callback3={callback3} search_result={search_result} />
          <OptionBar>
            <select
              onChange={e => {
                setArray(e.target.value)
              }}
              value={array}
              name="array"
            >
              <option value="1">討論度(高>低)</option>
              <option value="2">上市日期(新>舊)</option>
              <option value="3">暢銷度</option>
            </select>
          </OptionBar>

          {
            <Book>
              <BooksData bookInformation={bookInformation} />
              <BookColumn>
                <BookScore callback={callback} callback2={callback2} />
              </BookColumn>
            </Book>
          }

          {!sb.isSearch ? (
            <Pagination className="reviews_pagination">
              {p >= 2 && (
                <LinkContainer to={'/reviews?' + c + 'p=1'}>
                  <Pagination.First className="pageNum" />
                </LinkContainer>
              )}
              {p >= 2 && (
                <LinkContainer to={'/reviews?' + c + 'p=' + Number(p - 1)}>
                  <Pagination.Prev className="pageNum" />
                </LinkContainer>
              )}
              {pageNum.filter((key, index) => index < 15)}
              {p < page && (
                <LinkContainer to={'/reviews?' + c + 'p=' + (Number(p) + 1)}>
                  <Pagination.Next className="pageNum" />
                </LinkContainer>
              )}
              {p < page && (
                <LinkContainer to={'/reviews?' + c + 'p=' + page}>
                  <Pagination.Last className="pageNum" />
                </LinkContainer>
              )}
            </Pagination>
          ) : (
            ''
          )}
        </Main>
      </section>
    </>
  )
}

export default Bookinfo

import React, { useMemo } from 'react'
import styled from '@emotion/styled'
import useSWR from 'swr'
import { BrowserRouter as Router, Route, Link } from 'react-router-dom'

// const fetcher = (url) => fetch(url).then(r => r.json())

function BooksData(props) {
  //直排
  const BookColumn = styled.div`
    display: flex;
    flex-direction: column;
  `
  //書本圖片
  const BookImage = styled.div`
    margin: 36px auto;
  `
  //書本資訊
  const BookInfo = styled.div`
    width: 600px;
    height: 183px;
    margin: 20px 2rem;
    overflow: hidden;
    white-space: wrap;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  `

  const { bookInformation } = props

  return (
    <>
      <BookColumn>
        {bookInformation.map(item => (
          <BookImage key={item.sid}>
            <Link to={'/book_reviews/' + item.sid}>
              <img
                key={item.sid}
                className="reviews_img"
                src={`http://localhost:5555/images/books/${item.pic}`}
              />
            </Link>
          </BookImage>
        ))}
      </BookColumn>
      <BookColumn>
        {bookInformation.map(item => (
          <BookInfo key={item.sid}>
            <Link
              style={{ textDecoration: 'none' }}
              className="reviews_list_sid"
              to={'/book_reviews/' + item.sid}
            >
              <h4> {item.name}</h4>
            </Link>
            {'作者:'}&nbsp;
            <span style={{ opacity: 0.6 }}>{item.author}</span>
            &nbsp;&nbsp;&nbsp;
            {'出版社:'} &nbsp;
            <span style={{ opacity: 0.6 }}>{item.cp_name}</span>
            &nbsp;&nbsp;&nbsp;
            {'出版日期:'} &nbsp;
            <span style={{ opacity: 0.6 }}>
              {new Intl.DateTimeFormat('zh-TW', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour12: false,
              })
                .format(new Date(item.publish_date))
                .replace(/\//g, '-')}
            </span>
            <div />
            <br />
            {'內容簡介:'}
            <div>
              {item.introduction
                .replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, '')
                .replace(/&hellip;/g, '')
                .replace(/&bull;/g, '')}
            </div>
          </BookInfo>
        ))}
      </BookColumn>
    </>
  )
}

export default BooksData

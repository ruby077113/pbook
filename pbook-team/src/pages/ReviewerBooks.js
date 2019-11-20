import React from 'react'
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'
// import Data from '../pages/reviewer_page/data/reviewer_data'
import { withRouter } from 'react-router-dom'
import BR_ReviewerList from './reviewer_page/BR_ReviewerList'
import BR_BookcaseList from './reviewer_page/BR_BookcaseList'
import BR_BookcaseHot_books from './reviewer_page/BR_BookcaseHot_books'
import BR_Navbar from './reviewer_page/BR_Navbar'
import ReviewerBlog from './ReviewerBlog'
import axios from 'axios'

class ReviewerBooks extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      brData: [],
      csData: [],
      bkData: [],
    }
  }
  componentDidMount() {
    let newbrData
    let newcsData
    axios
      .get('http://localhost:5555/reviewer/brReviewerList')
      .then(res => {
        newbrData = res.data.rows
        // this.setState({ brData: res.data.rows })
        // console.log( res.data.rows[0])
        return axios.get('http://localhost:5555/reviewer/brBookcase')
      })
      .then(res => {
        // this.setState({ brData: newbrData, csData: res.data.rows })
        newcsData = res.data.rows
        return axios.get('http://localhost:5555/reviewer/brbooks')
      })
      .then(res=>{
        this.setState({ brData: newbrData, csData: newcsData, bkData:res.data.rows})
        // console.log('前端取得資料' , res.data.rows)
      })
      .catch(function(error) {
        console.log(
          '前端沒有取得資料',error)
        })
      }
      render(props) {
        // console.log('render brData 書評家',this.state.brData);
        // console.log('render csData 看看書櫃',this.state.csData);
        // console.log('render bkData 書籍資料',this.state.bkData);
        
    // if (!this.state.brData.length) return <></>
    if (this.state.brData.length === 0) return <><h1>取得資料中...</h1></>
    
    let brData = this.state.brData
    let csData = this.state.csData
    let bkData = this.state.bkData

    let reviewerData = null
    // console.log('bkData[0].name', bkData[0].name)
    for (let i = 0; i < brData.length; i++) {
      if (brData[i].sid == this.props.match.params.sid) {
        reviewerData = brData[i]
      }
    }
    
    let bookcaseData = null
    
    for (let i = 0; i < csData.length; i++) {
      if (csData[i].number == reviewerData.number) {
        bookcaseData = csData[i]
      }
    }
    console.log('從ckData完整資料撈出：isbn', bookcaseData.isbn,
    '從ckData完整資料撈出：cs書名',bookcaseData.name)
    console.log('從bkData完整資料撈出：isbn', bkData[0].isbn,'從bkData完整資料撈出：bk書名',bkData[0].name)
    console.log('撈書櫃的書籍 會員編號', csData[0].number)
    return (
      <>
        <BR_Navbar />
        <h1>看看書櫃</h1>
        <section className="reviewerBooks borderLine">
          {/* 接應id的書評家個人介紹 */}
          <BR_ReviewerList
            key={reviewerData.sid}
            sid={reviewerData.sid}
            title={reviewerData.title}
            img={reviewerData.img}
            name={reviewerData.name}
            job={reviewerData.job}
            intro={reviewerData.intro}
            tube={reviewerData.tube}
          ></BR_ReviewerList>

      <Router>
          {/* 熱門書評列表 */}
          <div className="HotBookBoxAll_Light">
          <div className="blackBG">
              <h5 className="h5_hotText">熱門書評</h5>
              <div className="HotBookBoxAll_Bookcase">
                  {this.state.csData.filter(({number}) => reviewerData.number == number )
                  .map(({pic, sid, name})=>(
                    <BR_BookcaseHot_books
                    key={sid}
                    to={"/reviewer/reviewerBooks/reviewerBlog/" + sid}
                    sid={sid}
                    pic={pic}
                    name={name}
                    ></BR_BookcaseHot_books>
                  ))}
              </div>
          </div>
          </div>
                <Switch>
                      <Route exact
                      path="/reviewer/reviewerBooks/reviewerBlog/:sid?" 
                      component={ReviewerBlog} />
                </Switch>
      </Router>
          {/* 針對書評家 - 書櫃列表 */}
          {this.state.bkData.filter(({isbn}) => bookcaseData.isbn == isbn)
          .map(({name,pic,introduction,sid})=>(
            <BR_BookcaseList
            sid={sid}
            key={sid}
            to={"/reviewer/reviewerBooks/reviewerBlog/" + sid}
            name={name}
            author={bookcaseData.isbn}
            // author={this.state.bkData.filter(({isbn})=> isbn == isbn).map(({author})=>author)}
            pic={pic}
            introduction={introduction}
            ></BR_BookcaseList>
          ))}
            {/* 完整資料全部倒出來，測試 */}
          {this.state.bkData.map(({name,pic,introduction,sid,author})=>(
            <BR_BookcaseList
            sid={sid}
            key={sid}
            to={"/reviewer/reviewerBooks/reviewerBlog/" + sid}
            name={name}
            author={author}
            // author={this.state.bkData.filter(({isbn})=> isbn == isbn).map(({author})=>author)}
            pic={pic}
            introduction={introduction}
            ></BR_BookcaseList>
          ))}
          {/* {this.state.csData.filter(({number}) => reviewerData.number == number)
          .map(({name,pic,isbn,info,sid})=>(
            <BR_BookcaseList
            sid={sid}
            key={sid}
            to={"/reviewer/reviewerBooks/reviewerBlog/" + sid}
            name={name}
            isbn={isbn}
            author={bookcaseData.isbn}
            // author={this.state.bkData.filter(({isbn})=> isbn == isbn).map(({author})=>author)}
            pic={pic}
            info={info}
            ></BR_BookcaseList>
          ))} */}
        </section>
      </>
    )
  }
}

export default withRouter(ReviewerBooks)
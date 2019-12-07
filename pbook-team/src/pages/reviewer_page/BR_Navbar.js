import React from 'react'
import { withRouter } from 'react-router-dom'
// import BR_PathNow from './BR_PathNow'
// import BR_DateTime from './BR_DateTime'

const Navbar = props => {
  let x = window.location.pathname.slice(-1)
  let y, z
  const { brData } = props
  console.log(brData)
  if (brData)
    for (let i = 0; i < brData.length; i++) {
      if (x == brData[i].sid) {
        y = brData[i].br_name
        console.log(y)
      }
    }

  return (
        <>
          <div className="brNavbar">
            {/* <BR_PathNow /> */}
            {/* <BR_DateTime /> */}
            <h5 className="h5_bread">首頁 > 書評家 <span style={{ color: '#FF525B',fontWeight:"bold"}}>{y}</span></h5>
          </div>
        </>
          )
        }

export default withRouter(Navbar)

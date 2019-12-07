import React, { useState, useEffect } from 'react'
import { lighten, makeStyles, withStyles } from '@material-ui/core/styles'
import LinearProgress from '@material-ui/core/LinearProgress'
import Rating from '@material-ui/lab/Rating'
import FavoriteIcon from '@material-ui/icons/Favorite'
import Box from '@material-ui/core/Box'

const BorderLinearProgress = withStyles({
  root: {
    height: 10,
    backgroundColor: lighten('#cde2d0', 0),
  },
  bar: {
    borderRadius: 20,
    backgroundColor: '#ffc408',
  },
})(LinearProgress)

const useStyles = makeStyles(theme => ({
  root: {
    margin: '0px auto -10px auto  ',
  },
  margin: {
    margin: theme.spacing(0.5),
    borderRadius: '20px',
    width: '180px',
  },
}))

const StyledRating = withStyles({
  iconFilled: {
    color: '#ff6d75',
  },
  iconHover: {
    color: '#ff3d47',
  },
})(Rating)

const BookScore = ({ callback, callback2 }) => {
  const [bs, setBs] = useState(() => callback2())
  const [bookinfo, setBookinfo] = useState(() => callback())
  useEffect(() => {
    setBookinfo(callback())
    setBs(callback2())
  }, [callback, callback2])

  let fiveStars = [],
    fourStars = [],
    threeStars = [],
    twoStars = [],
    oneStars = [],
    max = [],
    min = [],
    avg = []

  const classes = useStyles()
  function countRate(bs) {
    for (let j = 1; j <= 1002; j++) {
      fiveStars[j] = 0
      fourStars[j] = 0
      threeStars[j] = 0
      twoStars[j] = 0
      oneStars[j] = 0
      for (let i = 0; i < bs.length; i++) {
        if (bs[i].book === j) {
          switch (bs[i].star) {
            case 5:
              fiveStars[j]++
              break
            case 4:
              fourStars[j]++
              break
            case 3:
              threeStars[j]++
              break
            case 2:
              twoStars[j]++
              break
            case 1:
              oneStars[j]++
              break
            default:
              break
          }
        }
      }
    }
    for (let j = 1; j <= 1002; j++) {
      avg[j] = (
        (fiveStars[j] * 5 +
          fourStars[j] * 4 +
          threeStars[j] * 3 +
          twoStars[j] * 2 +
          oneStars[j]) /
        (fiveStars[j] +
          fourStars[j] +
          threeStars[j] +
          twoStars[j] +
          oneStars[j])
      ).toFixed(1)
      max[j] = fiveStars[j]
      min[j] = fiveStars[j]
      if (fourStars[j] > max[j]) max[j] = fourStars[j]
      else if (fourStars[j] < min[j]) min[j] = fourStars[j]

      if (threeStars[j] > max[j]) max[j] = threeStars[j]
      else if (threeStars[j] < min[j]) min[j] = threeStars[j]

      if (twoStars[j] > max[j]) max[j] = twoStars[j]
      else if (twoStars[j] < min[j]) min[j] = twoStars[j]

      if (oneStars[j] > max[j]) max[j] = oneStars[j]
      else if (oneStars[j] < min[j]) min[j] = oneStars[j]
    }
  }
  countRate(bs)

  return (
    <div className="reviews_right">
      {bookinfo.map(data => (
        <section key={data.sid} className="reviews_sec">
          <div className="d-flex book_star mb-2">
            <div className={classes.root}>
              <div className="d-flex">
                <span style={{ fontSize: '0.5rem' }}>5</span>
                <BorderLinearProgress
                  className={classes.margin}
                  variant="determinate"
                  color="secondary"
                  value={(fiveStars[data.sid] / max[data.sid]) * 100}
                />
              </div>
              <div className="d-flex">
                <span style={{ fontSize: '0.5rem' }}>4</span>
                <BorderLinearProgress
                  className={classes.margin}
                  variant="determinate"
                  color="secondary"
                  value={(fourStars[data.sid] / max[data.sid]) * 100}
                />
              </div>
              <div className="d-flex">
                <span style={{ fontSize: '0.5rem' }}>3</span>
                <BorderLinearProgress
                  className={classes.margin}
                  variant="determinate"
                  color="secondary"
                  value={(threeStars[data.sid] / max[data.sid]) * 100}
                />
              </div>
              <div className="d-flex">
                <span style={{ fontSize: '0.5rem' }}>2</span>
                <BorderLinearProgress
                  className={classes.margin}
                  variant="determinate"
                  color="secondary"
                  value={(twoStars[data.sid] / max[data.sid]) * 100}
                />
              </div>
              <div className="d-flex">
                <span style={{ fontSize: '0.5rem' }}>1</span>
                <BorderLinearProgress
                  className={classes.margin}
                  variant="determinate"
                  color="secondary"
                  value={(oneStars[data.sid] / max[data.sid]) * 100}
                />
              </div>
            </div>
          </div>
          <div className="reviews_col">
            <span className="reviews_bol">
              {!isNaN(avg[data.sid]) && avg[data.sid]}
            </span>
            <Box component="fieldset" mt={0} borderColor="transparent">
              <StyledRating
                name="customized-color"
                value={avg[data.sid]}
                precision={0.1}
                readOnly
                size="small"
                icon={<FavoriteIcon fontSize="inherit" />}
              />
            </Box>
            <span>
              {fiveStars[data.sid] +
                fourStars[data.sid] +
                threeStars[data.sid] +
                twoStars[data.sid] +
                oneStars[data.sid]}
              篇評論
            </span>
          </div>
        </section>
      ))}
    </div>
  )
}

export default BookScore

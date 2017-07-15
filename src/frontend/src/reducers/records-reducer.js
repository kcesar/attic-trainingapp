import * as actions from '../actions'
import moment from 'moment'

function doDates(record) {
  record.completed = record.completed ? moment(record.completed) : null
  record.expires = record.expires ? moment(record.expires) : null
  return record
}

export default function recordsReducer(state = [], action) {
  switch (action.type) {
    case actions.REQUEST_RECORDS:
      return Object.assign({}, state, { loading: true })
      
    case actions.RECEIVE_RECORDS:
      const names = action.payload.filterNames.reduce((prev, cur) => { prev[cur] = true; return prev }, {})
      const interestingRecords = action.payload.data.filter(r => names[r.course.name]).sort(r => r.completed)
      const records = interestingRecords.reduce((prev, cur) => { prev[cur.course.name] = doDates(cur); return prev}, {})

      return Object.assign({}, state, {
         loading: false,
         loaded: true,
         items: records
      })

    default:
      return state;
  }  
}
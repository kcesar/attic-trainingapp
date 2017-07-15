import * as actions from '../actions'
import moment from 'moment'

const computers = {
  online: function(task, state) {
    const record = state.records.items[task.title] || {}
    return {
      status: record.completed ? 'Complete' : null,
      completed: record.completed ? moment(record.completed) : null
    }
  },
  session: function(task, state) {
    const record = state.records.items[task.title] || {}
    return {
      status: record.completed ? 'Complete' : null,
      completed: record.completed ? moment(record.completed) : null
    }
  },
  paperwork: function(task, state) {
    return { status: null }
  },
  personal: function(task, state) {
    return { status: null }
  }
}

function getProgress(task, progress, state) {
  const p = computers[task.category](task, state);
  const blocking = []
  for (var i=0; i < (task.prereqs || []).length; i++) {
    const name = task.prereqs[i]
    var otherProgress = progress[name]
    if (otherProgress.status !== 'Complete') blocking.push(name)
  }

  const result = Object.assign(p, {
    available: task.category !== 'personal' && !p.completed && !blocking.length,
    blocked: task.category === 'personal' ? null : blocking.length ? blocking : null,
  })
  return result
}

export default function progressReducer(state = [], action) {
  switch (action.type) {
    case actions.UPDATE_PROGRESS:
      return action.payload.tasks.reduce((prev, cur) => { prev[cur.title] = getProgress(cur, prev, action.payload); return prev }, {})
    default:
      return state
  }
}

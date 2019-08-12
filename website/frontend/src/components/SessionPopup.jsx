import React from 'react'
import { ListGroup, ListGroupItem } from 'reactstrap'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { Gateway } from 'react-gateway'
import moment from 'moment'

import InfoPopup from './InfoPopup'
import AuthRoute from './auth/AuthRoute'

class SessionPopup extends InfoPopup {
  state = {
    leavePrompt: null,
    leaving: false,
    joinPrompt: null,
    joining: false
  }

  constructor(props) {
    super(props)
    this.renderProgress = this.renderProgress.bind(this)
    this.onConfirmLeave = this.onConfirmLeave.bind(this)
  }



  onClickLeave = (signup) => {
    this.setState({leavePrompt: signup})
  }

  onConfirmLeave = () => {
    this.setState({leaving: true})
    this.props.actions.doLeave(this.state.leavePrompt.id)
    .then(msg => {
      this.setState({ leavePrompt: null })
    })
    .catch(() => {})
    .then(() => {
      this.setState({leaving: false})
    })
  }

  onClickJoin = (session) => {
    this.setState({joining: true, joinPrompt: session})
    this.props.actions.doJoin(session.id)
    .then(msg => {
      this.setState({ joinPrompt: null })
    })
    .catch(() => {})
    .then(() => {
      this.setState({joining: false})
    })
  }

  renderLocation = (location) => {
    return location
  }

  renderProgress() {
    const {task, schedule, progress, member} = this.props
    const sched = schedule.courses[task.title]
    const baseContent = super.renderProgress()
    const prog = progress[task.title]

    if (!sched || prog.completed) return baseContent
    const blocked = prog.blocked && prog.blocked.length
    //const registered = !!sched.find(s => s.registered === 'yes')

    return !sched ? baseContent : <div>
      {baseContent}
      {blocked ? <div><small>You'll be able to register after completing the prerequisites</small></div>: null}
      <div>Class Schedule:</div>
      <ListGroup style={{marginBottom: '1em'}}>

      {sched.map(s => {
        const moment1 = moment(s.when)
        const moment2 = moment(s.when).add(task.hours, 'hour')
        const dates = moment1.isSame(moment2, 'day') ? moment1.format('MMM Do h:mma') :
                      (moment1.format('MMM D') + ' - ' + moment2.format(moment1.isSame(moment2, 'month') ? 'D' : 'MMM Do'))

        var signup = sched.find(f => s.id === f.id && f.registered !== 'no')

        const slotsText = `${s.current}/${s.capacity} filled` + (s.waiting ? `, ${s.waiting} waiting` : '')
        const registerText = s.current >= s.capacity || s.waiting ? 'Join Wait List' : 'Register'
        const registrationButton = s === signup
                                       ? <Button disabled={this.state.leaving || this.state.joining} style={{padding:0}} color="link" onClick={() => this.onClickLeave(s)}>Leave</Button>
                                       : <Button disabled={this.state.leaving || this.state.joining} style={{padding:0}} color="link" onClick={() => this.onClickJoin(s)}>
                                           {this.state.joining && s === this.state.joinPrompt ? <i className="fa fa-circle-o-notch fa-spin" style={{marginRight: 5}}></i> : null}
                                           {registerText}
                                         </Button>
        const registrationAction = blocked 
                                      ? <AuthRoute denied='' roles='esar.training.admin'>{registrationButton}</AuthRoute>
                                      : <AuthRoute denied='' roles='esar.training.admin' self={(member||{}).id}>{registrationButton}</AuthRoute>

        const registeredText = s === signup ? s.registered === 'wait' ? <span>, <strong>Wait Listed</strong></span> : <span>, <strong>Registered</strong></span> : null

        const registration = moment().isAfter(s.when) ? null : <div className='justify-content-between'><div>{slotsText}{registeredText}</div>{registrationAction}</div>

/*        let registration = blocked ? null : <div><Authorization allowSelf allowAdmin><div><Button style={{padding:0}} color="link">{registerText}</Button></div></Authorization>
        var signup = sched.find(f => s.id === f.id && f.registered !== 'no')
        if (s === signup) {
          registration = <div>{slotsText}, {s.registered === 'wait' ? 'Wait Listed' : 'Registered'} <Authorization allowSelf allowAdmin><Button style={{padding:0}} color="link" onClick={() => this.onClickLeave(s)}>Leave</Button></Authorization></div>
        } else {
          registration = <div>{slotsText}</div>
        }
*/
        return <ListGroupItem key={s.when} style={{flexDirection: 'column', alignItems:'stretch'}}>
          <div className='justify-content-between'>
            <strong>{dates}</strong>
            <span>{this.renderLocation(s.location)}</span>
          </div>
          {registration}
        </ListGroupItem>
      })}
      </ListGroup>
      { this.state.leavePrompt ? <Gateway into="root">
      <Modal isOpen={true}>
          <ModalHeader>Leave Session</ModalHeader>
          <ModalBody>
            <p>If you leave this session and then choose to re-register you may be placed at the end of a wait list.</p>
            <p> Do you want to leave the {task.title} session {moment(this.state.leavePrompt.when).calendar(null, { sameElse: '[on] MMM Do' })}?</p>
          </ModalBody>
          <ModalFooter>
            <Button disabled={this.state.leaving} color="danger" onClick={this.onConfirmLeave}>Leave{this.state.leaving ? <i style={{marginLeft:10}} className='fa fa-circle-o-notch fa-spin'></i> : null}</Button>
            <Button disabled={this.state.leaving} outline color="primary" onClick={() => this.setState({leavePrompt: null})}>Cancel</Button>
          </ModalFooter>
        </Modal>
      </Gateway> : null }
    </div>
  }
}

export default SessionPopup
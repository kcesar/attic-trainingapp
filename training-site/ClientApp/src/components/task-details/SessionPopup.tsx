import { ListGroup, ListGroupItem } from 'reactstrap'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
//import { Gateway } from 'react-gateway'
import moment from 'moment'

import { InfoPopup, InfoPopupProps } from './infoPopup'
import { ScheduledCourse } from '../../models/scheduledCourse'
import { Authorized } from '../Authorized'
import { Trainee } from '../../models/trainee'
import { observer } from 'mobx-react'
import { TrainingStore } from '../../store'

export interface SessionPopupProps extends InfoPopupProps {
  store: TrainingStore,
  schedule?: ScheduledCourse[],
  trainee: Trainee,
  actions: {
    doLeaveSession?: () => void,
    doJoinSession?: () => void
  }
}

export interface SessionPopupState {
  leavePrompt?: ScheduledCourse,
  leaving: boolean,
  joinPrompt?: any,
  joining: boolean,
}

class SessionPopup extends InfoPopup<SessionPopupProps, SessionPopupState> {
  constructor(props: SessionPopupProps) {
    super(props)
    this.renderProgress = this.renderProgress.bind(this)
    this.onConfirmLeave = this.onConfirmLeave.bind(this)

    this.state = {
      leavePrompt: undefined,
      leaving: false,
      joinPrompt: undefined,
      joining: false
    }
  }

  onClickLeave = (session: ScheduledCourse) => {
    this.setState({leavePrompt: session})
  }

  onConfirmLeave = () => {
    this.setState({leaving: true})
    this.props.store.startLeave(this.state.leavePrompt!.id)
    .then(msg => {
      if (msg) alert(msg);
      this.setState({ leavePrompt: undefined })
    })
    .catch(() => {})
    .then(() => {
      this.setState({leaving: false})
    })
  }

  onClickJoin = (session: ScheduledCourse) => {
    this.setState({joining: true, joinPrompt: session})
    this.props.store.startJoin(session.id)
    .then(msg => {
      if (msg) alert(msg);
      this.setState({ joinPrompt: undefined })
    })
    .catch(() => {})
    .then(() => {
      this.setState({joining: false})
    })
  }

  renderLocation = (location: string) => {
    return location
  }

  renderProgress() {
    const {task, schedule, progress, trainee, store} = this.props

    const user = store.user!

    const baseContent = super.renderProgress()
    const prog = progress[task.title]

    if (!schedule || prog.completed) return baseContent
    const blocked = prog.blocked && prog.blocked.length

    return !schedule ? baseContent : <div>
      {baseContent}
      {blocked ? <div><small>You'll be able to register after completing the prerequisites</small></div>: null}
      <div>Class Schedule:</div>
      <ListGroup style={{marginBottom: '1em'}}>

      {schedule.map(s => {
        const moment1 = moment(s.when)
        const moment2 = moment(s.when).add(task.hours, 'hour')
        const dates = moment1.isSame(moment2, 'day') ? moment1.format('MMM Do h:mma') :
                      (moment1.format('MMM D') + ' - ' + moment2.format(moment1.isSame(moment2, 'month') ? 'D' : 'MMM Do'))

        var signup = schedule.find(f => s.id === f.id && f.registered !== 'no')

        const slotsText = `${s.current}/${s.capacity} filled` + (s.waiting ? `, ${s.waiting} waiting` : '')
        const registerText = s.current >= s.capacity || s.waiting ? 'Join Wait List' : 'Register'
        const registrationButton = s === signup
                                       ? <Button disabled={this.state.leaving || this.state.joining} style={{padding:0}} color="link" onClick={() => this.onClickLeave(s)}>Leave</Button>
                                       : <Button disabled={this.state.leaving || this.state.joining} style={{padding:0}} color="link" onClick={() => this.onClickJoin(s)}>
                                           {this.state.joining && s === this.state.joinPrompt ? <i className="fa fa-circle-o-notch fa-spin" style={{marginRight: 5}}></i> : null}
                                           {registerText}
                                         </Button>
        const registrationAction = blocked 
                                      ? <Authorized denied='' roles='admins' user={user}>{registrationButton}</Authorized>
                                      : <Authorized denied='' roles='admins' self={trainee.id} user={user}>{registrationButton}</Authorized>
        
        const registeredText = s === signup ? s.registered === 'wait' ? <span>, <strong>Wait Listed</strong></span> : <span>, <strong>Registered</strong></span> : null

        const registration = moment().isAfter(s.when) ? null : <div className='justify-content-between'><div>{slotsText}{registeredText}</div>{registrationAction}</div>

        return <ListGroupItem key={s.when} style={{flexDirection: 'column', alignItems:'stretch'}}>
          <div className='justify-content-between'>
            <strong>{dates}</strong>
            <span>{this.renderLocation(s.location)}</span>
          </div>
          {registration}
        </ListGroupItem>
      })}
      </ListGroup>
      { this.state.leavePrompt ?
      <Modal isOpen={true}>
          <ModalHeader>Leave Session</ModalHeader>
          <ModalBody>
            <p>If you leave this session and then choose to re-register you may be placed at the end of a wait list.</p>
            <p> Do you want to leave the {task.title} session {moment(this.state.leavePrompt.when).calendar(null, { sameElse: '[on] MMM Do' })}?</p>
          </ModalBody>
          <ModalFooter>
            <Button disabled={this.state.leaving} color="danger" onClick={this.onConfirmLeave}>Leave{this.state.leaving ? <i style={{marginLeft:10}} className='fa fa-circle-o-notch fa-spin'></i> : null}</Button>
            <Button disabled={this.state.leaving} outline color="primary" onClick={() => this.setState({leavePrompt: undefined})}>Cancel</Button>
          </ModalFooter>
        </Modal> : null }
    </div>
  }
}

export default observer(SessionPopup)
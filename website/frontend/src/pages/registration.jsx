import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormGroup, Label, Input } from 'reactstrap'
import moment from 'moment'

import Step from '../components/step'
import AuthRoute from '../components/auth/AuthRoute'

import * as actions from '../actions'
import axios, { CancelToken } from 'axios';

const requiredTrainings = [ {name: "Core/First Aid", id: "f9975ace-6ac0-4655-abac-6e4cf7c78802" }, { name: "Core/CPR", id: '25dd4c86-31a7-4b07-a665-3b87fa94a45d' } ];

function ExistingAccountRow(props) {
  const { account, memberId, sendInvitation, sendingInvite } = props
  var inviteDom = null
  if (account.username && account.username.length && sendInvitation) inviteDom = <button disabled={sendingInvite} onClick={() => sendInvitation(memberId, account.username)}>Send Invitation</button>
  return <div><strong>{account.username}</strong> ({account.name || 'unnamed'} / {account.email}) {inviteDom}</div>
}

class RegistrationPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      newMember: true,
      firstname: '',
      middlename: '',
      lastname: '',
      birthdate: '',
      memberQueryToken: null,
      memberSearchList: [],
      memberName: '',
      memberId: '',
      gender: 'unknown',
      creatingMemberToken: null,

      loadingMember: false,

      email: '',
      emailId: '',

      phone: '',
      phoneId: '',

      trainings: null,

      username: '',
      userQueryToken: null,
      usernameOk: true,
      userAccounts: []
    }
  }
  changeFirst = (evt) => {
    this.setState({firstname: evt.target.value })
  }
  changeMiddle = (evt) => {
    this.setState({middlename: evt.target.value })
  }
  changeLast = (evt) => {
    this.setState({lastname: evt.target.value })
  }
  changeBirth = (evt) => {
    this.setState({birthdate: evt.target.value })
  }
  changeGender = (evt) => {
    this.setState({gender: evt.target.value })
  }
  changeEmail = (evt) => {
    this.setState({email: evt.target.value })
  }
  changePhone = (evt) => {
    this.setState({phone: evt.target.value })
  }

  changeUsername = (evt) => {
    this.setState({username: evt.target.value })
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.firstname !== prevState.firstname || this.state.lastname !== prevState.lastname) {
      this.throttledMemberSearch()
    }

    if (this.state.username !== prevState.username) {
      this.throttledUserSearch()
    }
  }

  useMember = (summary) => {
    this.setState({
      newMember: false,
      memberName: summary.name,
      memberId: summary.id,
      memberSearchList: []
    })
    this.loadMember(summary.id);
  }

  throttledMemberSearch = () => {
    this.memberLookupTimer && clearTimeout(this.memberLookupTimer);
    this.memberLookupTimer = setTimeout(() => {
      let cancelToken;
      axios.get(`${this.props.config.apis.data.url}/search?t=Member&q=${this.state.lastname}`, {
        cancelToken: new CancelToken(function executor(c) {
          // An executor function receives a cancel function as a parameter
          cancelToken = c;
        })
      })
      .then(msg => {
        this.setState({ memberSearchList: msg.data })
      })
      .finally(msg => {
        this.memberLookupTimer = null
        this.setState({memberQueryToken: null})
      })
      this.setState({memberQueryToken: cancelToken})
    }, 250)
  }

  createMember = () => {
    let cancelToken;
    var bd = moment(this.state.birthdate)
    if (!bd.isValid()) { alert('Invalid birth date.'); return }
    if (!this.state.firstname || !this.state.lastname) { alert('First and last name required'); return }

    const postData = {
      first: this.state.firstname,
      middle: this.state.middlename,
      last: this.state.lastname,
      birthDate: this.state.birthdate,
      gender: this.state.gender
    }

    axios.post(`${this.props.config.apis.training.url}/api/trainees`, postData, {
      cancelToken: new CancelToken(function executor(c) {
        // An executor function receives a cancel function as a parameter
        cancelToken = c;
      })
    })
    .then(msg => {
      this.setState({
        memberId: msg.data.memberId,
        memberName: msg.data.name,
        memberSearchList: []
      })
      this.loadMember(msg.data.memberId)
    })
    .catch(reason => {
      alert("Failed to create member in database");
    })
    .finally(msg => {
      this.setState({ creatingMemberToken: null })
    })
    this.setState({creatingMemberToken: cancelToken})
  }

  loadMember = (memberId) => {
    this.setState({loadingMember: true})
    axios.all([
      axios.get(`${this.props.config.apis.data.url}/members/${memberId}/contacts`),
      axios.get(`${this.props.config.apis.data.url}/members/${memberId}/trainingrecords`),
      axios.get(`${this.props.config.apis.accounts.url}/account/formember/${memberId}`)
    ])
    .then(axios.spread(function (contacts, trainings, accounts) {
      var emails = contacts.data.filter(f => f.type === 'email')
      if (emails.length > 0) {
        this.setState({ email: emails[0].value, emailId: emails[0].id })
      }

      var phones = contacts.data.filter(f => f.type === 'phone')
      if (phones.length > 0) {
        this.setState({ phone: phones[0].value, phoneId: phones[0].id })
      }

      const userTrainings = trainings.data.items.reduce((prev,cur) => { prev[cur.course.id] = cur; return prev; }, {})
      this.setState({trainings: userTrainings})

      this.setState({userAccounts: accounts.data.data})
    }.bind(this)))
    .finally(() => {
      this.setState({loadingMember: false })
    });
  }

  createEmail = () => {
    let cancelToken;
    const postData = {
      type: 'email',
      value: this.state.email
    }
    console.log("create email", postData)
    axios.post(`${this.props.config.apis.data.url}/members/${this.state.memberId}/contacts`, postData, {
      cancelToken: new CancelToken(function executor(c) {
        // An executor function receives a cancel function as a parameter
        cancelToken = c;
      })
    })
    .then(msg => {
      this.setState({email: msg.data.value, emailId: msg.data.id })
    })
    .catch(reason => {
      alert("Failed to create email in database");
    })
    .finally(() => {
      this.setState({creatingEmailToken: null })
    })
    this.setState({ creatingEmailToken: cancelToken })
  }

  createPhone = () => {
    let cancelToken;
    const postData = {
      type: 'phone',
      subType: 'cell',
      value: this.state.phone
    }
    console.log("create phone", postData)
    axios.post(`${this.props.config.apis.data.url}/members/${this.state.memberId}/contacts`, postData, {
      cancelToken: new CancelToken(function executor(c) {
        // An executor function receives a cancel function as a parameter
        cancelToken = c;
      })
    })
    .then(msg => {
      this.setState({phone: msg.data.value, phoneId: msg.data.id })
    })
    .catch(reason => {
      alert("Failed to create phone in database");
    })
    .finally(() => {
      this.setState({creatingPhoneToken: null })
    })
    this.setState({ creatingPhoneToken: cancelToken })
  }

  throttledUserSearch = () => {
    if (!(/^[a-zA-Z][a-zA-Z.-]+$/.test(this.state.username))) {
      this.setState({usernameOk: false})
      return
    }
    this.usernameLookupTimer && clearTimeout(this.usernameLookupTimer);
    this.usernameLookupTimer = setTimeout(() => {
      let cancelToken;
      axios.get(`${this.props.config.apis.accounts.url}/account/checkname/${this.state.username}`, {
        cancelToken: new CancelToken(function executor(c) {
          // An executor function receives a cancel function as a parameter
          cancelToken = c;
        })
      })
      .then(msg => {
        console.log("username query", msg.data)
        this.setState({ usernameOk: msg.data.data.available })
      })
      .finally(msg => {
        this.usernameLookupTimer = null
        this.setState({usernameQueryToken: null})
      })
      this.setState({usernameQueryToken: cancelToken})
    }, 250)
  }

  createUser = () => {
    let cancelToken;
    const postData = {
      username: this.state.username,
      email: this.state.email,
      name: this.state.memberName,
      memberId: this.state.memberId
    }
    console.log("create user", postData)
    axios.post(`${this.props.config.apis.accounts.url}/account`, postData, {
      cancelToken: new CancelToken(function executor(c) {
        // An executor function receives a cancel function as a parameter
        cancelToken = c;
      })
    })
    .then(msg => {
      this.setState({userAccounts: [ msg.data.data ]})
      return this.sendInvitation(this.state.memberId, this.state.username)
    })
    .finally(() => {
      this.setState({creatingUserToken: null })
    })
    this.setState({ creatingUserToken: cancelToken })

    window.setTimeout(() => {
      this.setState({creatingUserToken: null })
    }, 1000)
    this.setState({creatingUserToken: 'hi'})
  }

  sendInvitation = (memberId, username) => {
    this.setState({sendingInvite: true})
    var url = `${this.props.config.apis.training.url}/api/trainees/${memberId}/invite`
    if (username) url += `?username=${username}`
    axios.post(url, {})
    .catch(() => {
      alert('Failed to send invite')
    })
    .finally(msg => {
      this.setState({sendingInvite: false})
    })
  }

  render() {
    const { oidc } = this.props

    var trainingDom = null
    if (this.state.memberId) {
      trainingDom = <div>Loading ...</div>
      if (this.state.trainings) {
        trainingDom = requiredTrainings.map(t => {
          const userTraining = this.state.trainings[t.id]
          const completeDom = (userTraining === undefined || userTraining === null) ? <div>not found</div>
                            : (userTraining.status === 'Complete' || userTraining.status === 'NotExpired') ? <span style={{color: '#008800'}}> {'\u2713'}</span>
                            : userTraining.status === 'Expired' ? <span style={{color: '#800'}}> Expired</span>
                            : <span> Status {userTraining.status} unknown, please check</span>
          
          return (<div key={t.id}>{t.name}{completeDom}</div>)
        })
      }
    }

    return (
      <AuthRoute oidc={oidc} roles='acct-managers' denied='Access denied'>
        <div className='container-fluid py-4'>
          <Step step={1} title='Find / Create Member'>
            {this.state.newMember ?
            <div className='row'>
              <FormGroup className='col-12 col-md'>
                <Label for='lastname'>Last Name</Label>
                <Input name='lastname' value={this.state.lastname} onChange={this.changeLast} readOnly={!!this.state.memberId} />
              </FormGroup>
              <FormGroup className='col-12 col-md'>
                <Label for='firstname'>First Name</Label>
                <Input name='firstname' value={this.state.firstname} onChange={this.changeFirst} readOnly={!!this.state.memberId} />
              </FormGroup>
              <FormGroup className='col-12 col-md'>
                <Label for='middlename'>Middle Name</Label>
                <Input name='middlename' value={this.state.middlename} onChange={this.changeMiddle} readOnly={!!this.state.memberId} />
              </FormGroup>
            </div>
            :
            <div>Existing member {this.state.memberName} <a target='_blank' rel="noopener noreferrer" href={this.props.config.apis.data.url.replace("/api2", `/members/detail/${this.state.memberId}`)}>database</a></div>
            }
            {this.state.newMember ?
            <div className='row'>
              <FormGroup className='col-12 col-md'>
                <Label for='birthdate'>Birth Date (yyyy-mm-dd)</Label>
                <Input name='birthdate' value={this.state.birthdate} onChange={this.changeBirth} readOnly={!!this.state.memberId} />
              </FormGroup>
              <FormGroup className='col-12 col-md'>
                <Label for='gender'>Gender</Label>
                <Input type="select" name="gender" value={this.state.gender} onChange={this.changeGender} disabled={!!this.state.memberId}>
                  <option value="unknown">Unknown / Other</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Input>
              </FormGroup>
            </div> : null}
            {this.state.newMember && !this.state.memberId ?
              <button className="btn btn-primary" disabled={this.state.creatingMember} onClick={this.createMember}>Create Member{this.state.creatingMemberToken ? <span> <i className='fa fa-fw fa-spin fa-spinner'></i></span> : null}</button>
              : null}
            <div>
              {this.state.memberQueryToken != null ? <div>Searching ...</div> : null}
              {this.state.memberSearchList.length > 0 ? <div>Possible existing members:</div> : null}
              {this.state.memberSearchList.map(m => (
                <div key={m.summary.id}>{m.summary.name} <button onClick={() => this.useMember(m.summary)} >use</button> <a target='_blank' rel="noopener noreferrer" href={this.props.config.apis.data.url.replace("/api2", `/members/detail/${m.summary.id}`)}>database</a></div>
              ))}
            </div>
          </Step>
          <Step step={2} title='Contact Information'>
            {!this.state.memberId ? null :
            <div className='row'>
              <FormGroup className='col-12 col-md'>
                <Label for='email'>Email</Label>
                <Input name='email' value={this.state.email} onChange={this.changeEmail} readOnly={!!this.state.emailId} />
                {this.state.emailId ? null : <button className="btn btn-primary" disabled={this.state.creatingEmailToken} onClick={this.createEmail}>Save{this.state.creatingEmailToken ? <span> <i className='fa fa-fw fa-spin fa-spinner'></i></span> : null}</button>}
              </FormGroup>
              <FormGroup className='col-12 col-md'>
                <Label for='phone'>Cell Number</Label>
                <Input name='phone' value={this.state.phone} onChange={this.changePhone} readOnly={!!this.state.phoneId} />
                {this.state.phoneId ? null : <button className="btn btn-primary" disabled={this.state.creatingPhoneToken} onClick={this.createPhone}>Save{this.state.creatingPhoneToken ? <span> <i className='fa fa-fw fa-spin fa-spinner'></i></span> : null}</button>}
              </FormGroup>
            </div>}
          </Step>
          <Step step={3} title='Prerequisite Training'>
            {trainingDom}
          </Step>
          <Step step={4} title='User Account'>
            {!this.state.memberId ? null :
              this.state.userAccounts.length
                ? <div>
                    {this.state.userAccounts.length && !this.state.username ? <div>This user already has one or more accounts:</div> : null }
                    {this.state.userAccounts.map(a => <ExistingAccountRow key={a.id} account={a} memberId={this.state.memberId} sendInvitation={this.state.username ? null : this.sendInvitation} sendingInvite={this.state.sendingInvite} />)}
                  </div>
                : <div>
                    <div className='row'>
                      <FormGroup className='col-6 col-md'>
                        <Label for='username'>Username</Label>
                        <Input name='username' value={this.state.username} onChange={this.changeUsername} />
                      </FormGroup>
                    </div>
                    <div>
                      <button className="btn btn-primary" disabled={!(this.state.emailId && this.state.username && this.state.usernameOk)} onClick={this.createUser}>Create User{this.state.creatingUser ? <span> <i className='fa fa-fw fa-spin fa-spinner'></i></span> : null}</button>
                      {this.state.usernameOk ? null : <div className="text-danger">Username is invalid or already exists</div> }
                      {this.state.emailId ? null : <div className="text-warning">Member needs at least one email</div> }
                    </div>
                  </div>
              }
          </Step>
        </div>
      </AuthRoute>
    )
  }
}

const storeToProps = (store) => {
  return {
    oidc: store.oidc,
    user: store.oidc ? store.oidc.user : undefined,
    config: store.config
  }
}

const dispatchToProps = (dispatch, ownProps) => {
  return {
    getUserData: () => dispatch(actions.getUserData())
  }
}

export default connect(storeToProps, dispatchToProps)(RegistrationPage)
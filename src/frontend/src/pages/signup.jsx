import React, { Component } from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { FormGroup, Label, Input, Button, Modal, ModalBody, ModalFooter } from 'reactstrap'

import { LocalForm, Errors, actions as formActions } from 'react-redux-form'
import moment from 'moment'
import { DropdownList } from 'react-widgets'
import axios from 'axios'

import Step from '../components/step'
import ValidatedControl from '../components/validated-control'
import * as actions from '../actions'

class SignupPage extends Component {
  state = {
    first: '',
    middle: '',
    last: '',
    email: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    birthdate: '',
    gender: 'male',
    errMsg: ''
  }

  showBirthdayPicker = () => {
    this.birthdayPicker.show()
  }

  setFirst = (e,v) => {
    this.setState({first: v})
  }

  setGender = (v) => {
    this.setState({gender: v})
  }

  setDate = (y,m,d) => {
    console.log(y,m,d)    
    this.setState({
      birthYear: y,
      birthMonth: m,
      birthDay: d
    })
    this.formDispatch(formActions.change('user.birthdate', moment([y,m,d])))
  }

   closeError = () => {
     this.setState({errMsg: ''})
   }

  handleUpdate = (form) => {
    //console.log('handleUpdate', form);
    this.setState({ form })
  }
  handleChange = (valudes) => {}
  handleSubmit = (values) => {
    const { localRoot, goToDashboard } = this.props
    console.log(values)
    this.setState({submitting: true})
    axios.post(`${localRoot}/signup`, {...values, birthdate: values.birthdate.format('YYYY-MM-DD'), gender: this.state.gender})
    .then(msg => { goToDashboard(); return true}, err => { this.setState({errMsg: err.response.data}) })
    .then(() => this.setState({submitting: false}))

    return true
  }

  render() {
    const form = this.state.form || {}
    const { authRoot } = this.props
    const thisYear = moment().year()
    const validDate = ((this.state.birthDay === '' || this.state.birthMonth === '' || this.state.birthYear === '') || !(form['$form']||{}).submitFailed || !(form.birthdate||{}).valid)
    const page = (
      <LocalForm
        className='container-fluid py-4'
        onUpdate={this.handleUpdate}
        onChange={this.handleChange}
        onSubmit={this.handleSubmit}
        getDispatch={(dispatch) => this.formDispatch = dispatch}
        initialState={{
          first: '',
          middle: '',
          last: '',
          email: '',
          username: '',
          password: '',
          confirm: '',
          birthdate: ''
        }}
        model="user"
          validators={{
            confirm: {
              passwordsMatch: v => v === ((form||{}).password||{}).value
            },
            birthdate: {
              valid: v => v && moment.isMoment(v) && v.isValid()
            }
          }}
      >
      <Errors model='user.confirm' />
        <p><strong>If you are already a member of another King County SAR unit,
         contact <a href="mailto:database@kcesar.org">database@kcesar.org</a> instead
         of using this form</strong></p>
        <Step step={1} title='Personal Information'>
          <div className='row'>
            <ValidatedControl form={form} label="First name *" name="first" className="col-12 col-md" required component={Input} messages={{
              valueMissing: 'Required'
            }} />
            <ValidatedControl form={form} label="Middle name" name="middle" className="col-12 col-md" component={Input} />
            <ValidatedControl form={form} label="Last name *" name="last" className="col-12 col-md" component={Input} required messages={{ valueMissing: 'Required' }} />
          </div>
          <div className='row'>
            <ValidatedControl form={form} label="Email *" name="email" className="col col-md-6" component={Input} required messages={{ valueMissing: 'Required' }} />
          </div>
          <div className='row'>
            <FormGroup className={'col-12 col-sm-7 col-md-6 col-lg-5 col-xl-4' + (validDate ? '' : ' has-danger')}>
              <Label for='birthdate'>Birth Date *</Label>
              <div className='row tight-cols'>
              <div className='col-5'>
              <DropdownList
                data={moment.months().map((m,i) => ({ i, m }))}
                textField='m'
                valueField='i'
                value={this.state.birthMonth}
                placeholder='Month'
                onChange={v => this.setDate(this.state.birthYear, v.i, this.state.birthDay)} />
                </div>
              <div className='col-3'>
              <DropdownList
                data={[...Array(31)].map((_,i) => i + 1)}
                value={this.state.birthDay}
                placeholder='Day'
                onChange={v => this.setDate(this.state.birthYear, this.state.birthMonth, v)} />
                </div>
                <div className='col-4'>
              <DropdownList
                data={[...Array(60)].map((_,i) => thisYear - 13 - i)}
                value={this.state.birthYear}
                placeholder='Year'
                onChange={v => this.setDate(v, this.state.birthMonth, this.state.birthDay)} />
              </div>
              { validDate ? null :
                <div className='row text-danger'><Errors model='.birthdate' messages={{ valid: 'Not a valid date' }}  /></div> 
              }

              </div>
            </FormGroup>
            <div className='col-1 hidden-sm-down'></div>
            <FormGroup className='col-12 col-sm-5 col-md-4 col-lg-3'>
              <Label for='gender'>Gender</Label>
              <DropdownList
                data={[{v: 'male', t: 'Male'}, {v:'female', t:'Female'}, {v:'', t:'Other / Undisclosed'}]}
                textField='t'
                valueField='v'
                value={this.state.gender}
                placeholder='Gender'
                onChange={v => this.setGender(v.v)} />
            </FormGroup>
          </div>
        </Step>
        <Step step={2} title='Login Information'>
          <p>Some of our systems require you to log in with a username and password. Use the fields
          below to create an account. In later steps you'll be able to link this account to a
          Facebook or Google account.</p>
          <ValidatedControl form={form} label='Username *' name='username' className='col-9 col-md-7 col-lg-5 col-xl-4' required component={Input}
              asyncValidators={{
                isAvailable: (value, done) => {
                  axios.get(`${authRoot}/checkusername/${encodeURIComponent(value)}`)
                    .then(msg => {
                      done(msg.data ==='Available')
                    }, err => {alert("Can't talk to server. Try again."); return done(false)})
                }
              }}
              validators = {{
                format: v => /^[a-z0-9][a-z0-9_.-]*$/i.test(v),
                length: v => v && v.length > 3
              }}
               messages={{
                isAvailable: 'Username not available',
                format: 'Can only use letters, numbers, _, -, or period. Must start with letter or number.',
                length: 'Must be longer than 3 characters'
              }} />
          <ValidatedControl form={form} label='Password *' name='password' className='col-9 col-md-7 col-lg-5 col-xl-4' required component={Input} type='password' />
          <ValidatedControl form={form} label='Confirm password' name='confirm' className='col-9 col-md-7 col-lg-5 col-xl-4' component={Input} type='password'
              messages={{
                passwordsMatch: 'Passwords do not match'
              }} />
        </Step>
        <Step step={3} title='Create Account'>
          <p>Click the button below to sign up as a trainee with King County Explorer Search and
          Rescue. You'll then be able to sign in using the username and password specified above
          to track your progress through the training season.</p>
          <button className="btn btn-primary" disabled={this.state.submitting}>Sign Up{this.state.submitting ? <span> <i className='fa fa-fw fa-spin fa-spinner'></i></span> : null}</button>
        </Step>
        <Modal isOpen={!!this.state.errMsg} toggle={this.closeError}>
          <ModalBody className='text-danger'>{JSON.stringify(this.state.errMsg)}</ModalBody>
          <ModalFooter><Button color="outline-primary" onClick={this.closeError}>Close</Button></ModalFooter>
        </Modal>
      </LocalForm>
    );

    //return page;
    return <div>Registration for the 2017-2018 training season is currently closed. Please check back in July 2018. Email <a href="mailto:recruiting@kcesar.org">Recruiting@kcesar.org</a> for more information.</div>
  }
}

const storeToProps = (store) => {
  return {
    user: store.oidc ? store.oidc.user : undefined,
    authRoot: store.config.authRoot,
    localRoot: store.config.localRoot
  }
}

const dispatchToProps = (dispatch, ownProps) => {
  return {
    getUserData: () => dispatch(actions.getUserData()),
    goToDashboard: () => dispatch(push('/me'))
  }
}

export default connect(storeToProps, dispatchToProps)(SignupPage);
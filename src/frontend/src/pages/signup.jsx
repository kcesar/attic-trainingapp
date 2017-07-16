import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormGroup, Label, Input } from 'reactstrap';
import Step from '../components/step'
import moment from 'moment'
import momentLocalizer from 'react-widgets/lib/localizers/moment'
import { DropdownList } from 'react-widgets'
import * as actions from '../actions'

momentLocalizer(moment)

class SignupPage extends Component {
  state = {
    firstName: '',
    middle: '',
    lastName: '',
    email: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    birthdate: '',
    gender: 'male'
  }

  showBirthdayPicker = () => {
    this.birthdayPicker.show()
  }

  setFirst = (e,v) => {
    this.setState({firstName: v})
  }

  setGender = (v) => {
    this.setState({gender: v})
  }

  doSignup = (e) => {
    alert('sign up')
  }

  setDate = (y,m,d) => {
    console.log(y,m,d)
    this.setState({
      birthYear: y,
      birthMonth: m,
      birthDay: d,
      birthdate: (y !== '' && m !== '' && d !== '') ? new Date(y, m, d) : ''
    })
  }

  render() {
    const thisYear = moment().year()
    return (
      <div className='container-fluid py-4'>
        <p><strong>If you are already a member of another King County SAR unit,
         contact <a href="mailto:database@kcesar.org">database@kcesar.org</a> instead
         of using this form</strong></p>
        <Step step={1} title='Personal Information'>
          <div className='row'>
            <FormGroup className='col-12 col-md'>
              <Label for="firstname">First name *</Label>
              <Input type="text" name="firstname" />
            </FormGroup>
            <FormGroup className='col-12 col-md'>
              <Label for='middlename'>Middle</Label>
              <Input type='text' name='middlename' />
            </FormGroup>
            <FormGroup className='col-12 col-md'>
              <Label for='lastname'>Last name *</Label>
              <Input type='text' name='lastname' />
            </FormGroup>
          </div>
          <div className='row'>
            <FormGroup className='col col-md-6'>
              <Label for='email'>Email *</Label>
              <Input type='email' name='email' />
            </FormGroup>
          </div>
          <div className='row'>
            <FormGroup className='col-12 col-sm-7 col-md-6 col-lg-5 col-xl-4'>
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
          <FormGroup className='col-9 col-md-7 col-lg-5 col-xl-4'>
            <Label for='username'>Username *</Label>
            <Input type='text' name='username' />
          </FormGroup>
          <FormGroup className='col-9 col-md-7 col-lg-5 col-xl-4'>
            <Label for='password'>Password *</Label>
            <Input type='password' name='password' />
          </FormGroup>
          <FormGroup className='col-9 col-md-7 col-lg-5 col-xl-4'>
            <Label for='confirm'>Confirm Password</Label>
            <Input type='password' name='confirm' />
          </FormGroup>
        </Step>
        <Step step={3} title='Create Account'>
          <p>Click the button below to sign up as a trainee with King County Explorer Search and
          Rescue. You'll then be able to sign in using the username and password specified above
          to track your progress through the training season.</p>
          <button className='btn btn-primary' onClick={this.doSignup}>Sign up</button>
        </Step>
      </div>
    );
  }
}

const storeToProps = (store) => {
  return {
    user: store.oidc ? store.oidc.user : undefined
  }
}

const dispatchToProps = (dispatch, ownProps) => {
  return {
    getUserData: () => dispatch(actions.getUserData())
  }
}

export default connect(storeToProps, dispatchToProps)(SignupPage);
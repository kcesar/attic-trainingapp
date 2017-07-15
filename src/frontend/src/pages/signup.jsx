import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Stepper, Step, StepLabel, TextField, IconButton, SelectField, MenuItem } from 'material-ui'
import StepContent from '../workarounds/material-ui/StepContent'
import DatePickerDialog from 'material-ui/DatePicker/DatePickerDialog'
import moment from 'moment'

import * as actions from '../actions'
class SignupPage extends Component {
  state = {
    firstName: '',
    middle: '',
    lastName: '',
    email: '',
    birthday: null,
    birthdayText: '',
    gender: ''
  }

  showBirthdayPicker = () => {
    this.birthdayPicker.show()
  }

  setFirst = (e,v) => {
    this.setState({firstName: v})
  }

  setGender = (e,i,v) => {
    console.log('hi', JSON.stringify(v))
    this.setState({gender: v})
  }

  render() {
    const { user } = this.props
    const maxBirthday = moment().subtract(13, 'years').toDate()
    return (
      <div>
{/*      <Stepper activeStep={0} orientation="vertical">
          <Step>
            <StepLabel>Personal Information</StepLabel>
            <StepContent>
            <div>
      <div>{this.state.birthday ? this.state.birthday.fromNow() : null}</div>
              <div className="layout-row">
                <TextField floatingLabelText="First name *" value={this.state.firstName} onChange={this.setFirst} />
                <TextField floatingLabelText="Middle name" />
                <TextField floatingLabelText="Last name *" />
              </div>
              <div>
                <TextField floatingLabelText="Email *" />
              </div>
              <div>
                <TextField floatingLabelText="Birthday *" value={this.state.birthdayText} onChange={(o,v) => this.setState({birthdayText: v})} />
                <IconButton iconClassName="material-icons" onTouchTap={this.showBirthdayPicker}>date_range</IconButton>
                <DatePickerDialog open={true} firstDayOfWeek={0} initialDate={maxBirthday} maxDate={maxBirthday} onAccept={s => {const b = moment(s); this.setState({birthday: b, birthdayText: b.format()})}} ref={(e) => this.birthdayPicker = e} />
              </div>
  <div> */}
  <div>
              <div>{this.state.gender}</div>
                <SelectField value={this.state.gender} onChange={this.setGender} floatingLabelText="Gender" hintText='blah'>
                  {/*<MenuItem key='male' value='male'>Male</MenuItem>
                  <MenuItem key='female' value='female'>Female</MenuItem>
                  <MenuItem key='other' value='two'>Other</MenuItem>*/}
                  <MenuItem value='male' primaryText="Male" />
                  <MenuItem value='female' primaryText="Female" />
                  <MenuItem value='' primaryText="Other" />
                </SelectField>
              </div>
       {/*}     </div> */}
{/*                <md-input-container class="md-block" flex-gt-xs>
              <label>First name</label>
              <input ng-model="user.first" required>
            </md-input-container>
            <md-input-container class="md-block" flex-gt-xs>
              <label>Middle name</label>
              <input ng-model="user.middle">
            </md-input-container>
            <md-input-container class="md-block" flex-gt-xs>
              <label>Last name</label>
              <input ng-model="user.last" required>
            </md-input-container>
          </div>
          <div layout-gt-sm="row">
            <md-input-container class="md-block">
              <label>Email</label>
              <input ng-model="user.email" type="email" required>
            </md-input-container>
          </div>
          <div layout="row">
            <md-datepicker name="birthdate" ng-model="user.birthdate" md-placeholder="Birth date" required md-min-date="minBirth" md-max-date="maxBirth" md-open-on-focus>
            </md-datepicker>
            <div ng-messages="signupForm.birthdate.$error" ng-if="signupForm.birthdate.$touched">
              <div ng-message="required">Required</div>
              <div ng-message="minDate">Must be 3 or more characters</div>
              <div ng-message="maxDate">Too long</div>
            </div>
          </div>
          <div layout="row">
            <md-input-container class="md-block" flex="50" flex-gt-xs="20">
              <label>Gender</label>
              <md-select ng-model="user.gender">
                <md-option value="male">Male</md-option>
                <md-option value="female">Female</md-option>
                <md-option>Other / Undisclosed</md-option>
              </md-select>
            </md-input-container>
          </div>
          */}
{/*}          </StepContent>
        </Step>
        <Step>
          <StepLabel>Login Information</StepLabel>
          <StepContent></StepContent>
        </Step>
        <Step>
          <StepLabel>Create Account</StepLabel>
          <StepContent></StepContent>
        </Step>
</Stepper> */}
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
import React, { Component } from 'react'
import { FormGroup, Label } from 'reactstrap'
import { Control, Errors } from 'react-redux-form'

export default class ValidatedControl extends Component {
  isValid = (form, property) => {const p = ((form||{})[property] || {}); return !p.touched || p.valid}

  render() {
    const { form, label, name, className, messages, ...inputProps } = this.props
    const spin = ((form||{})[name] || {}).validating
    return <FormGroup className={className + (this.isValid(form, name) ? '' : ' has-danger') + ' has-feedback'}>
              <Label for={name}>{label}</Label>
              <Control model={'.'+name} name={name} className={this.isValid(form, name) ? '' : 'form-control-danger'} {...inputProps} />
              {spin ? <i className="fa fa-fw fa-spin fa-spinner form-control-feedback"></i> : null}
              <Errors className='form-control-feedback' model={'.' + name} messages={messages} show='touched' component='div'/>
            </FormGroup>
  }
}
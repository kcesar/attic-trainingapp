import React, { Component } from 'react'
import { ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Badge } from 'reactstrap'

export { ListGroup }

export class Subheader extends Component {
  render() {
    return <p className='text-muted' style={{marginTop: '1rem'}}>{this.props.children}</p>
  }
}

export class ListItem extends Component {
  render() {
    const { text, secondary, badge, loading } = this.props
    return <ListGroupItem tag="button" action onClick={this.props.onClick}>
    <ListGroupItemHeading className="justify-content-between" style={{flexWrap:'wrap'}}>
      {text}
      {badge ? <Badge pill>{badge}</Badge> : null}
      {loading ? <i className='fa fa-circle-o-notch fa-spin'></i> : null}
    </ListGroupItemHeading>
    <ListGroupItemText>{secondary}</ListGroupItemText>
    </ListGroupItem>
  }
}


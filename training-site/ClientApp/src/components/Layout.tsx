import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Container } from 'reactstrap';
import NavMenu from './NavMenu';
import { SiteConfig } from '../models/siteConfig';

export class Layout extends Component<{config: SiteConfig}> {
  static displayName = Layout.name;

  render () {
    return (
      <div>
        <NavMenu config={this.props.config} />
        <Container>
          {this.props.children}
        </Container>
      </div>
    );
  }
}

export default observer(Layout);
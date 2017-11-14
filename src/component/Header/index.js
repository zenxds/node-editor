import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import {
  Link
} from 'react-router-dom'

import styles from './less/styles.less'

@CSSModules(styles)
class Header extends Component {
  render() {
    return (
      <div styleName="header">
        <Link to='/' styleName="logo">顶象技术</Link>
      </div>
    )
  }
}

export default Header

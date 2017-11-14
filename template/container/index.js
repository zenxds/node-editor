import { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { observer, inject } from "mobx-react"

@inject('{{ name }}Store')
@withRouter
@observer
class Page extends Component {
  constructor(props, context) {
    super(props, context)
  }

  render() {
    return (
      <div></div>
    )
  }
}

export default Page

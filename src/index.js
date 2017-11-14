/**
 * 入口
 */
import 'babel-polyfill'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import { useStrict } from 'mobx'
import { AppContainer } from 'react-hot-loader'

import App from './app'
import injects from './inject'

// 不允许在@action之外进行状态的修改
useStrict(true)

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Provider {...injects}>
        <Component />
      </Provider>
    </AppContainer>,
    document.getElementById('app')
  )
}

render(App)
if (module.hot) {
  module.hot.accept('./app', () => { render(App)})
}

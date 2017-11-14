import { action } from 'mobx'
import request from '../../../util/request'
import store from '../store'

class Actions {
  constructor(store) {
    this.store = store
  }

  @action
  merge = (obj={}) => {
    Object.assign(this.store, obj)
  }
}

export default new Actions(store)

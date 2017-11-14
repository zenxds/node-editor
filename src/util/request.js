import fetch from 'isomorphic-fetch'

export default (input, options={}) => {
  options = Object.assign({
    credentials: "same-origin"
  }, options)

  if (/post/i.test(options.method)) {
    let headers = {}

    if (typeof options.body === 'string') {
      headers = {
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
      }
    }

    options.headers = Object.assign({}, headers, options.headers || {})
  }

  return fetch(input, options).then((response) => {
    return response.json()
  }).then((response) => {
    if (response.success) {
      return response.data
    } else {
      throw new Error(response.msg || 'request error')
    }
  })
}

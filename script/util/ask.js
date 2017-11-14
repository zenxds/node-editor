'use strict'
const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

/**
 * ask a question
 */
module.exports = question => new Promise((resolve, reject) => {
  rl.question(question, answer => {
    resolve(answer.trim())
    rl.resume()
  })
})
const fs = require('fs')
const esprima = require('esprima')
const escodegen = require('escodegen')

/**
 * 是否是安全目录
 */
exports.isSafeDir = dest => {
  return !fs.existsSync(dest) || (fs.statSync(dest).isDirectory() && !fs.readdirSync(dest).length)
}

const substitute = (str, o) => {
  return str.replace(/\\?\{\{\s*([^{}\s]+)\s*\}\}/g, function (match, name) {
    if (match.charAt(0) === '\\') {
      return match.slice(1)
    }
    return (o[name] == null) ? '' : o[name]
  })
}

exports.replace = (file, o) => {
  let content = fs.readFileSync(file, 'utf8')
  content = substitute(content, o)

  fs.writeFileSync(file, content)
}


/**
 * code => ast
 */
exports.getAstFromCode = (code) => {
  return esprima.parse(code, {
    sourceType: 'module'
  })
}

/**
 * ast => code
 */
exports.getCodeFromAst = (ast) => {
  return escodegen.generate(ast, {
    comment: false,
    format: {
      indent: {
        style: '  '
      },
      semicolons: false
    }
  })
}

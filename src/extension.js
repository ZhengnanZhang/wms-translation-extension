const { msg } = require('../utils/vs')
const { plugin } = require('../utils/constant')
const generateKeys = require('./generateKeys')
const generateSnippets = require('./generateSnippets')
const generateEnums = require('./generateEnums')

function activate (context) {
  // register
  // generate i18n json by regexp

  generateKeys(context)
  generateSnippets(context)
  generateEnums(context)

  msg.info(`${plugin.name} 已激活！`)
}
exports.activate = activate
function deactivate () {
  msg.info(`${plugin.name} 已移除！`)
}

module.exports = {
  activate,
  deactivate
}

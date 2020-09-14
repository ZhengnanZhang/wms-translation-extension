const { registerCommand } = require('../utils/vs')
const { openFileByPath } = require('../utils')
const { operation } = require('../utils/constant')
const updateSnippets = require('../lib/updateSnippets')
module.exports = context => {
  context.subscriptions.push(
    registerCommand(operation.generateSnippets.cmd, uri => {
      if (uri && uri.path) {
        openFileByPath(uri.path).then(editor => {
          updateSnippets({ editor, context })
        })
      } else {
        updateSnippets({ context })
      }
    })
  )
}

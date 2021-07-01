const { registerCommand } = require('../utils/vs')
const { operation } = require('../utils/constant')
const updateEnums = require('../lib/updateEnums')
module.exports = context => {
  context.subscriptions.push(
    registerCommand(operation.generateEnums.cmd, uri => {
      updateEnums({ context })
    })
  )
}

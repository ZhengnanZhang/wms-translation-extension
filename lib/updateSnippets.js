const {
  getLocales,
  getEditor,
  showMessage
} = require('../utils')
const { operation } = require('../utils/constant')
const fs = require('fs')
const path = require('path')
const mkdir = require('mkdirp')
const retrieveSnippets = require('../utils/retrieveSnippets')
const {
  msg
} = require('../utils/vs')

const tipBeforeWriteJson = (currentEditor, localesPath) => {
  msg
    .info(
      `${operation.generateSnippets.title} will generate the snippets in: \n${localesPath}`,
      { modal: true },
      'OK' // 此处的顺序位置 对应 enter的响应
    )
    .then(result => {
      if (result === 'OK') {
        writeSnippetsJson(currentEditor, localesPath)
      }
    })
}

const writeSnippetsJson = (currentEditor, localesPath) => {
  const linesObj = retrieveSnippets(currentEditor)
  fs.readFile(localesPath, () => {
    let str = JSON.stringify(linesObj)
    fs.writeFile(localesPath, str, err => {
      if (!err) {
        showMessage({
          message: `${operation.generateKeys.title} Success : ${localesPath}`,
          file: localesPath,
          editor: currentEditor
        })
      }
    })
  })
}

module.exports = async ({ editor, context }) => {
  let currentEditor = getEditor(editor)
  if (!currentEditor) return
  const defaultLocalesPath = 'defaultSnippetsPath'
  const { localesPath, exist } = getLocales({
    fsPath: currentEditor.document.uri.fsPath,
    defaultLocalesPath,
    showError: false,
    showInfo: false
  })
  if (!exist) {
    mkdir(path.dirname(localesPath), async () => {
      await tipBeforeWriteJson(currentEditor, localesPath)
    })
  } else {
    await tipBeforeWriteJson(currentEditor, localesPath)
  }
}

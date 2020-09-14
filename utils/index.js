const fs = require('fs')
const validator = require('validator')
const {
  executeCommand,
  msg,
  open,
  file,
  Range,
  Position,
  workspace,
  window
} = require('./vs')
const {
  templateBeginRegexp,
  templateEndRegexp,
  scriptBeginRegexp,
  scripteEndRegexp
} = require('./regex')
const {
  langArr,
  operation,
  pkgFileName
} = require('./constant')
const path = require('path')
const settings = workspace.getConfiguration('extension')

const getCustomSettingKey = (customSetting, key) =>
  customSetting && customSetting.hasOwnProperty(key)
    ? customSetting[key]
    : settings.get(key)

const showMessage = ({
  type = 'info',
  message,
  file,
  editor,
  callback,
  needOpen = true
}) => {
  const actions = [
    'Got it',
    callback && callback.name,
    needOpen && 'View it'
  ].filter(v => !!v)

  const vsMsg = type === 'error' ? msg.error : msg.info

  const viewColumn = editor
    ? editor.viewColumn + 1
    : getEditor(editor)
      ? getEditor(editor).viewColumn + 1
      : 1

  vsMsg(message, ...actions).then(val => {
    if (val === 'View it') {
      openFileByPath(file, {
        selection: new Range(new Position(0, 0), new Position(0, 0)),
        preview: false,
        viewColumn
      })
    }
    if (callback && val === callback.name) {
      callback.func()
    }
  })
}

// 获取配置项
const getCustomSetting = (fsPath, key, forceIgnoreCustomSetting = false) => {
  const dirName = path.dirname(fsPath)
  if (fs.existsSync(path.join(dirName, pkgFileName))) {
    let customSetting = {}
    if (typeof key === 'string') {
      return getCustomSettingKey(customSetting, key)
    }
    return {}
  } else {
    return getCustomSetting(dirName, key, forceIgnoreCustomSetting)
  }
}

const defaultOption = {
  selection: new Range(new Position(0, 0), new Position(0, 0)),
  preview: false
}

const openFileByPath = (fPath, option) => {
  return open(file(fPath), option || defaultOption)
}

const getCellRange = ({ editor, regex, line }) =>
  // zero base charactor is 0
  editor.document.getWordRangeAtPosition(new Position(line, 0), regex)

const getRange = editor => {
  const range = {
    template: {},
    script: {}
  }
  const lineCount = editor.document.lineCount
  for (let i = 0; i < lineCount; i++) {
    const line = editor.document.lineAt(i)
    const tBegin = getCellRange({
      editor,
      regex: templateBeginRegexp,
      line: i
    })
    const tEnd = getCellRange({
      editor,
      regex: templateEndRegexp,
      line: i
    })
    const sBegin = getCellRange({
      editor,
      regex: scriptBeginRegexp,
      line: i
    })
    const sEnd = getCellRange({
      editor,
      regex: scripteEndRegexp,
      line: i
    })
    if (tBegin) {
      range.template.begin = tBegin.start.line
    } else if (tEnd) {
      range.template.end = tEnd.start.line
    }
    if (sBegin) {
      range.script.begin = sBegin.start.line
    } else if (sEnd) {
      range.script.end = sEnd.start.line
    }
  }
  return range
}

const getEditor = editor => {
  let currentEditor = editor || window.activeTextEditor
  const stopFlag =
    !currentEditor || !langArr.includes(currentEditor.document.languageId)
  if (stopFlag) return false
  return currentEditor
}

const varifyFile = ({ fsPath, showError, showInfo }) => {
  let exist = false
  if (!fs.existsSync(fsPath)) {
  // TODO: 跳转到国际化设置路径!
    showError &&
    showMessage({
      type: 'error',
      message: `Not Found File:${fsPath}`,
      needOpen: false,
      callback: {
        name: operation.updateI18n.title,
        func: () => executeCommand(operation.generateKeys.cmd)
      }
    })
  } else {
    showInfo &&
      showMessage({
        message: `Get Locales Path:${fsPath}`,
        file: fsPath
      })
    exist = true
  }
  return { localesPath: fsPath, exist }
}

const getLocales = ({
  fsPath,
  isGetRootPath = false,
  defaultLocalesPath,
  showInfo = false,
  showError = true
}) => {
  const dirName = path.dirname(fsPath)
  if (fs.existsSync(path.join(dirName, pkgFileName))) {
    if (isGetRootPath) return dirName
    let lang
    if (defaultLocalesPath === 'defaultSnippetsPath') {
      lang = getCustomSetting(path.join(dirName, pkgFileName), 'snippetsFile') // default 'snippetsFile.json'
    } else {
      lang = getCustomSetting(path.join(dirName, pkgFileName), 'langFile') // default 'translationKeys.json'
    }
    const localesPath = getCustomSetting(
      path.join(dirName, pkgFileName),
      'defaultLocalesPath'
    )
    let jsonPath = path.join(dirName, localesPath || '', lang)
    if (defaultLocalesPath) {
      jsonPath = path.join(dirName, defaultLocalesPath, lang)
    }
    return varifyFile({ fsPath: jsonPath, showInfo, showError })
  } else {
    return getLocales({
      fsPath: dirName,
      isGetRootPath,
      defaultLocalesPath,
      showInfo,
      showError
    })
  }
}

module.exports = {
  openFileByPath,
  getCellRange,
  getRange,
  getLocales,
  getEditor,
  showMessage,
  getCustomSetting
}

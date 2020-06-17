const {
  openFileByPath,
  getPrefix,
  getLocales,
  getEditor,
  showMessage,
  getCustomSetting
} = require('../utils')
const { operation } = require('../utils/constant')
const fs = require('fs')
const path = require('path')
const mkdir = require('mkdirp')
const retrieveKeys = require('../utils/retrieveKeys')
const {
  msg
} = require('../utils/vs')
var rp = require('request-promise')

const tipBeforeWriteJson = (currentEditor, localesPath) => {
  const { notAlertBeforeUpdateI18n } = getCustomSetting(
    currentEditor.document.uri.fsPath,
    ['notAlertBeforeUpdateI18n']
  )
  if (notAlertBeforeUpdateI18n) {
    writeJson(currentEditor, localesPath)
  } else {
    msg
      .info(
        `${operation.generateKeys.title} will generate the key in: \n${localesPath}`,
        { modal: true },
        'OK' // 此处的顺序位置 对应 enter的响应
      )
      .then(result => {
        if (result === 'OK') {
          writeJson(currentEditor, localesPath)
        }
      })
  }
}

const sendJsonToTransify = (currentEditor, localesPath) => {
  const defaultToken = getCustomSetting(
    currentEditor.document.uri.fsPath,
    'token'
  )
  const defaultResourceId = getCustomSetting(
    currentEditor.document.uri.fsPath,
    'resource'
  )
  var options = {
    method: 'POST',
    uri: `https://transify.seagroup.com/api/resources/${defaultResourceId}/languagestoken/import/json`,
    formData: {
      file: {
        value: fs.createReadStream(localesPath),
        options: {
          filename: 'translationKeys.json',
          contentType: 'json'
        }
      }
    },
    headers: {
      'Authorization': `Token ${defaultToken}`,
      'Content-Type': 'multipart/form-data;'
    }
  }

  rp(options)
    .then(function () {
      msg.info(`upload keys to transify success`)
    })
    .catch(function (err) {
      console.log('error', err)
      msg.info(`Please try once more`)
    })
}

const writeJson = (currentEditor, localesPath) => {
  const linesObj = retrieveKeys(currentEditor)
  fs.readFile(localesPath, () => {
    let _data = {}
    let temp = _data
    if (Object.keys(linesObj).length !== 0) {
      // 已存在 => 智能替换（1.相同val时，新的key,val替换原来的key,val。2.不同val时，保存新增key,val和原有的key,val,）
      Object.keys(linesObj).forEach(v => {
        if (!temp || Object.keys(temp).length === 0) {
          _data = linesObj
        } else {
          Object.keys(temp).forEach(p => {
            if (p === v) return
            temp[v] = ''
          })
          _data = temp
        }
      })
    } else {
      showMessage({
        message: 'There are no keys match in :',
        file: localesPath,
        needOpen: false
      })
      return
    }
    let str = JSON.stringify(_data, null, 4)
    fs.writeFile(localesPath, str, err => {
      if (!err) {
        showMessage({
          message: `${operation.generateKeys.title} Success : ${localesPath}`,
          file: localesPath,
          editor: currentEditor
        })
        sendJsonToTransify(currentEditor, localesPath)
      }
    })
  })
}

module.exports = async ({ editor, context }) => {
  let currentEditor = getEditor(editor)
  if (!currentEditor) return
  const defaultLocalesPath = getCustomSetting(
    currentEditor.document.uri.fsPath,
    'defaultLocalesPath'
  )
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

const {
  openFileByPath,
  getPrefix,
  getLocales,
  getEditor,
  showMessage,
  getCustomSetting
} = require('../utils')
const { operation } = require('../utils/constant')
const unflatten = require('unflatten')
const fs = require('fs')
const path = require('path')
const mkdir = require('mkdirp')
const retrieveKeys = require('../utils/retrieveKeys')
const {
  msg
} = require('../utils/vs')
const axios = require('axios')
var FormData = require('form-data')

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
        // if (result === 'View it') {
        //   openFileByPath(localesPath, {
        //     selection: new Range(new Position(0, 0), new Position(0, 0)),
        //     preview: false,
        //     viewColumn: currentEditor.viewColumn + 1
        //   })
        // }
        if (result === 'OK') {
          writeJson(currentEditor, localesPath)
        }
      })
  }
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
    let str = JSON.stringify(unflatten(_data), null, 4)
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

module.exports = ({ editor, context }) => {
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
    mkdir(path.dirname(localesPath), () => {
      tipBeforeWriteJson(currentEditor, localesPath)
    })
  } else {
    tipBeforeWriteJson(currentEditor, localesPath)
  }
  const form = new FormData()
  // Object.keys(temp).forEach(key => {
  //   form.append(key, temp[key])
  // })
  // form.append('file', fs.createReadStream('./test.json'))
  // console.log('sss', fs.createReadStream('./test.json'))
  // console.log('form', form)

  var fileStream = fs.createReadStream(localesPath)
  fs.access(localesPath, function (e) {
    console.log(e)
  })
  // console.log('ff', fs.exists('./test.json'))
  var content = ''

  fileStream.setEncoding('utf8')
  fileStream.on('data', function (chunk) {
    content += chunk
  })
  fileStream.on('end', function (chunk) {
    console.log('文件读取完成，文件内容是 [%s]', content)
    form.append('file', fileStream)
    console.log('form', fileStream)
    const url = `https://transify.seagroup.com/api/resources/608/languagestoken/import/json`
    axios.post(url, {
      data: form
    }, {
      headers: {
        'Authorization': 'Token d4e564628ff86c305916910cd8a5c40358866da5',
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundaryF2eg9zYfl4h2GiyB'
      }
    }).then(resp => {
      console.log('resp1', resp)
    }, error => {
      console.log('error', error)
    })
  })
}

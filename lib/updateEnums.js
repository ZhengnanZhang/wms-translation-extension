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
const axios = require('axios')

const remainBrackets = (str, bracketsStack) => {
  if (str === '}') {
    bracketsStack.pop()
    return bracketsStack.length
  }
}

const formatKey = (key) => {
  let resultKey = key.replace(/ _/g, '_')
  resultKey = resultKey.replace(/ /g, '_')
  resultKey = resultKey.replace(/\'/g,'\\\'')
  return resultKey
}

module.exports = async ({ editor, context }) => {
  // 处理本地ts中的enums
  let preTsCode = ''
  let postTsCode = ''
  let uniqueStartEnumsFlag = false
  let currentEditor = getEditor(editor)
  if (!currentEditor || !currentEditor.document) return {}
  const { lineCount, languageId, lineAt } = currentEditor.document
  if (languageId !== 'typescript') return
  let enumsStartFlag = false
  let bracketsStack = []
  let keyValue = {}
  let tempEnumsKey = ''
  for (let i = 0; i < lineCount; i++) {
    const lineText = lineAt(i).text
    const enumsRegExp = new RegExp(/ENUMS/)
    // Awww.baidu.comB => www.baidu.com
    const enumsKeyRegExp = new RegExp(/(?<=enum).*?(?={)/)
    const enumsValueRegExp = new RegExp(/.*?(?=,)/)
    if (enumsRegExp.test(lineText)) {
      enumsStartFlag = true
      bracketsStack.push('{')
      uniqueStartEnumsFlag = true
    }
    if (enumsStartFlag === false && tempEnumsKey === '') {
      if (uniqueStartEnumsFlag) {
        postTsCode += lineText + '\n'
      } else {
        preTsCode += lineText + '\n'
      }
    }
    const matchResult = lineText.match(enumsKeyRegExp)
    if (matchResult && enumsStartFlag) {
      tempEnumsKey = matchResult && matchResult[0].trim()
      bracketsStack.push('{')
      keyValue[tempEnumsKey] = {}
    } else {
      if (enumsStartFlag) {
        if (lineText.indexOf('}') !== -1) {
          const remainBracketsNum = remainBrackets('}', bracketsStack)
          if (remainBracketsNum) {
            tempEnumsKey = ''
          } else {
            enumsStartFlag = false
          }
        } else if (tempEnumsKey) {
          const lineTextKeyValue = lineText.split('=')
          const key = lineTextKeyValue[0].trim()
          const value = lineTextKeyValue[1].match(enumsValueRegExp)
          keyValue[tempEnumsKey][key] = value[0].trim()
        }
      }
    }
  }
  // 获取远端的数据并对比本地与远端
  const request = axios.create({})
  const enumApi = vscode.workspace.getConfiguration().get('extension.enumApiUrl')
  const res = ((await request.get(enumApi)).data).data
  let updateEnumsFlag = false
  Object.keys(res).forEach(item => {
    if (!keyValue[item]) {
      updateEnumsFlag = true
      keyValue[item] = res[item]
    }
  })
  // keyValue转为ts代码
  if (updateEnumsFlag) {
    let tsCode = `
  namespace ENUMS {\n`
    for (const [key, value] of Object.entries(keyValue)) {
      tsCode += `    enum ${key} {\n`
      if (Array.isArray(value)) {
        value.forEach(item => {
          const key = formatKey(item.key)
          if (isNaN(+item.value)) {
            tsCode += `      '${key}' = '${item.value}',\n`
          } else {
            tsCode += `      '${key}' = ${+item.value},\n`
          }
        })
      } else {
        for (const [itemKey, itemValue] of Object.entries(value)) {
          const key = formatKey(itemKey)
          if (isNaN(+itemValue)) {
            tsCode += `      '${key}' = '${itemValue}',\n`
          } else {
            tsCode += `      '${key}' = ${+itemValue},\n`
          }
        }
      }
      tsCode += `    }\n`
    }
    tsCode += `  }\n`
    const result = preTsCode + tsCode + postTsCode
    fs.writeFile(currentEditor.document.uri.fsPath, result, err => {
      if (!err) {
        showMessage({
          message: `Success update Enums`
        })
      }
    })
  }
}

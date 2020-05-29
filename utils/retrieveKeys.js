const { getRange } = require('.')
const {
  scriptRegexp,
  propertyRegexp,
  quotationRegexp,
  commentRegexp,
  commentLeft,
  commentRight,
  warnRegexp
} = require('./regex')

const getLineCnWord = ({ lineText, reg, resoloveReg, initWordArr = [] }) => {
  let word = lineText.match(reg) || initWordArr
  if (Array.isArray(word) && word.length > 0) {
    word = word
      .map(v => {
        // 过滤特殊字符的匹配
        if (v.match(warnRegexp)) {
          return false
        } else {
          return v.replace(resoloveReg, '').split(')')[0]
        }
      })
      .filter(v => !!v)
      .concat(initWordArr)
  }
  return word
}

const getlinesObj = (arr) =>
  arr.reduce((p, c) => {
    p[c] = ''
    return p
  }, {})

// return linesObj
module.exports = (currentEditor) => {
  if (!currentEditor || !currentEditor.document) return {}
  const { lineCount, languageId, lineAt } = currentEditor.document
  const isJavascript = languageId === 'javascript'
  const isVue = languageId === 'vue'
  const { template, script } = getRange(currentEditor)
  const lines = []
  let commentFlag = false
  for (let i = 0; i < lineCount; i++) {
    const lineText = lineAt(i).text
    let wordArr = []

    // 跳过单行注释
    if (lineText.match(commentRegexp)) {
      continue
    }
    // 多行注释跳过
    let regCommentLeft = new RegExp(commentLeft)
    let regCommentRight = new RegExp(commentRight)
    if (regCommentLeft.test(lineText)) {
      commentFlag = true
    }
    if (regCommentRight.test(lineText)) {
      commentFlag = false
    }
    if (commentFlag) {
      continue
    }
    // js文件(诸如mixin.js等)
    if (isJavascript) {
      wordArr = getLineCnWord({
        lineText,
        reg: scriptRegexp,
        resoloveReg: quotationRegexp,
        initWordArr: wordArr
      })
    }

    // vue文件
    if (isVue) {
      const inVueTemplate = i <= template.end && i >= template.begin
      const inVueScript = i <= script.end && i >= script.begin
      if (inVueTemplate) {
        // const inAngleBracketSpacet = lineText.match(angleBracketSpaceRegexp)
        // const inProperty = lineText.match(propertyRegexp)
        let inTemplateScript = lineText.match(scriptRegexp)
        if (inTemplateScript) {
          wordArr = getLineCnWord({
            lineText,
            reg: scriptRegexp,
            resoloveReg: quotationRegexp,
            initWordArr: wordArr
          })
        }
      }
      if (inVueScript) {
        wordArr = getLineCnWord({
          lineText,
          reg: scriptRegexp,
          resoloveReg: quotationRegexp,
          initWordArr: wordArr
        })
      }
    }
    if (wordArr.length > 0) {
      lines.push(...wordArr)
    }
  }
  const result = getlinesObj(Array.from(new Set(lines)))
  return result
}

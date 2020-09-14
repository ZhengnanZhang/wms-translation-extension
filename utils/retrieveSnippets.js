const { getRange } = require('.')
const fs = require('fs')
const compiler = require('vue-template-compiler')
const {
  commentRegexp,
  commentLeft,
  commentRight
} = require('./regex')

const { parseHtml } = require('./generateTemplate')

// return linesObj
module.exports = (currentEditor) => {
  if (!currentEditor || !currentEditor.document) return {}
  const { lineCount, languageId, lineAt } = currentEditor.document
  // const isJavascript = languageId === 'javascript'
  const isVue = languageId === 'vue'
  let commentFlag = false
  let pageContent = ''
  const vueFileContent = fs.readFileSync(currentEditor.document.uri.fsPath, 'utf8')
  const sfc = compiler.parseComponent(vueFileContent)
  if (isVue) {
    const astTplRes = compiler.compile(sfc.template.content, {
      comments: true,
      preserveWhitespace: false,
      shouldDecodeNewlines: true
    }).ast
    const wxmlResult = parseHtml(astTplRes)
    pageContent = wxmlResult
  }
  for (let i = 0; i < lineCount; i++) {
    const lineText = lineAt(i).text

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
//     // js文件(诸如mixin.js等)
//     // if (isJavascript) {
//     //   wordArr = getLineCnWord({
//     //     lineText,
//     //     reg: scriptRegexp,
//     //     resoloveReg: quotationRegexp,
//     //     initWordArr: wordArr
//     //   })
//     // }
  }
//       if (inVueScript) {
//         // wordArr = getLineCnWord({
//         //   lineText,
//         //   reg: scriptRegexp,
//         //   resoloveReg: quotationRegexp,
//         //   initWordArr: wordArr
//         // })
//         pageContent += lineText
//       }
//     }
//   }
  return pageContent
}

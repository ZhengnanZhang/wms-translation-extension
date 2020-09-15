const fs = require('fs')
const compiler = require('vue-template-compiler')

const { parseHtml } = require('./generateTemplate')

// return linesObj
module.exports = (currentEditor) => {
  if (!currentEditor || !currentEditor.document) return {}
  const { languageId } = currentEditor.document
  // const isJavascript = languageId === 'javascript'
  const isVue = languageId === 'vue'
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
  return pageContent
}

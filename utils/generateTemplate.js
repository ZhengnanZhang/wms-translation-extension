const { start } = require("repl")

const parseHtml = function (tagsTree) {
  return handleTagsTree(tagsTree)
}

const handleTagsTree = function (topTreeNode) {
  // 为每一个节点生成开始标签和结束标签
  generateTag(topTreeNode)
  let bodyList = []
  const formatVue = createVue(topTreeNode, bodyList)
  formatVue['vue-template'].body.unshift(`<template>`)
  formatVue['vue-template'].body.push(`</template>`)
  return formatVue
}

// 递归生成 首尾标签
const generateTag = function (node) {
  let children = node.children
  let slots
  if (node.scopedSlots) {
    slots = Object.values(node.scopedSlots)
  }
  // 如果是if表达式 需要做如下处理
  if (children && children.length) {
    let ifChildren
    const ifChild = children.find(subNode => subNode.ifConditions && subNode.ifConditions.length)
    if (ifChild) {
      const ifChildIndex = children.findIndex(subNode => subNode.ifConditions && subNode.ifConditions.length)
      ifChildren = ifChild.ifConditions.map(item => item.block)
      delete ifChild.ifConditions
      children.splice(ifChildIndex, 1, ...ifChildren)
    }
    children.forEach(function (subNode) {
      generateTag(subNode)
    })
  } else if (slots && slots.length) {
    slots.forEach(function (subNode) {
      generateTag(subNode)
    })
  }
  node.startTag = generateStartTag(node) // 生成开始标签
  node.endTag = generateEndTag(node) // 生成结束标签
}

const generateStartTag = function (node) {
  let startTag
  const { tag, attrsMap, type, isComment, text } = node
  // 如果是注释
  if (type === 3) {
    startTag = isComment ? `<!-- ${text} -->` : text
    return startTag
  }
  // 如果是表达式节点
  if (type === 2) {
    startTag = text.trim()
    startTag = startTag.replace(/\s/g, '')
    if (startTag.indexOf('enums.systemEnums') !== -1) {
      let startTags = startTag.split('enums.systemEnums')
      startTag = startTags[0] + `enums.systemEnums.' , scope.row )}}`
    }
    const scriptRegexp = /(?<=(\$i18n|\$t)\()('|").*('|")/g
    startTag = startTag.replace(scriptRegexp, `''`)
    return startTag
  }
  switch (tag) {
    case 'span':
      startTag = handleTag({ tag: 'span', attrsMap })
      break
    case 'div':
      startTag = handleTag({ tag: 'div', attrsMap })
      break
    case 'img':
      startTag = handleTag({ tag: 'img', attrsMap })
      break
    case 'template':
      startTag = handleTag({ tag: 'template', attrsMap })
      break
    case 's-table-column':
      startTag = handleTag({ tag: 's-table-column', attrsMap })
      break
    case 's-button':
      startTag = handleTag({ tag: 's-button', attrsMap })
      break
    default:
      startTag = handleTag({ tag, attrsMap })
  }
  return startTag
}

const handleTag = function ({
  attrsMap,
  tag
}) {
  let stringExpression = ''
  if (attrsMap) {
    stringExpression = ' ' + handleAttrsMap(attrsMap)
  }
  return `<${tag}${stringExpression}>`
}

// 这个函数是处理 AttrsMap，把 AttrsMap 的所有值 合并成一个字符串
const handleAttrsMap = function (attrsMap) {
  let stringExpression = ''
  stringExpression = Object.entries(attrsMap).map(([key, value]) => {
    // 替换 bind 的 :
    if (key.charAt(0) === ':') {
      if (`${key.slice(1)}` === 'filterConfig') {
        return `:${key.slice(1)}="filterConfig"`
      }
      if (`${key.slice(1)}` === 'label') {
        return `:${key.slice(1)}="$i18n('')"`
      }
      if (`${key.slice(1)}` === 'width') {
        return ''
      }
    }
    // 统一做成 bindtap
    if (key === '@click' || key === '@click.native.prevent') {
      return `${key}=""`
    }
    if (key === 'v-model') {
      return `value="{{${value}}}"`
    }
    if (key === 'v-if') {
      return ''
    }
    if (key === 'v-else-if') {
      return ''
    }
    if (key === 'v-else') {
      return ''
    }
    // if (key === 'v-for') {
    //   const [ params, list ] = value.split('in ')
    //   const paramsList = params.replace(/\(|\)/g, '').split(',')
    //   const [item, index] = paramsList
    //   const indexString = index ? ` wx:for-index="${index.trim()}"` : ''
    //   return `wx:for="{{${list.trim()}}}" wx:for-item="${item.trim()}"${indexString}`
    // }
    if (key === 'class') {
      return value.indexOf('sp-card') !== -1 ? 'class="sp-card"' : ''
    }
    if (key === 'fixed') {
      return ''
    }
    if (key === 'prop') {
      return `prop=""`
    }
    return `${key}="${value}"`
  }).join(' ')
  return stringExpression
}

const generateEndTag = function (node) {
  let endTag
  const { tag, attrsMap, type, isComment, text } = node
  // 如果是表达式节点或者注释
  if (type === 3 || type === 2) {
    endTag = ''
    return endTag
  }
  endTag = `</${tag}>`
  return endTag
}

// const createWxml = function (node) {
//   const { startTag, endTag, children } = node
//   let childrenString = ''
//   if (children && children.length) {
//     childrenString = children.reduce((allString, curentChild) => {
//       const curentChildString = createWxml(curentChild)
//       return `${allString}\n${curentChildString}\n`
//     }, '')
//   }
//   return `${startTag}${childrenString}${endTag}`
// }

const createVue = function (node, bodyList) {
  let nodeType = 'vue'
  let result
  let slots
  const { startTag, endTag, children, scopedSlots } = node
  if (scopedSlots) {
    slots = Object.values(scopedSlots)
  }
  bodyList.push(`${startTag}`)
  if (children && children.length) {
    children.reduce((allString, curentChild) => {
      const curentChildString = createVue(curentChild, bodyList)
      return `${allString}\n${curentChildString}\n`
    }, '')
  }
  if (slots && slots.length) {
    slots.reduce((allString, curentChild) => {
      const curentChildString = createVue(curentChild, bodyList)
      return `${allString}\n${curentChildString}\n`
    }, '')
  }
  bodyList.push(`${endTag}`)
  if (nodeType === 'vue') {
    result = {
      'vue-template': {
        'prefix': 'vue',
        'body': bodyList,
        'description': 'my vue template'
      }
    }
  }
  return result
}

module.exports = {
  parseHtml
}

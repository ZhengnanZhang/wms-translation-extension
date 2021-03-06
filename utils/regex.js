//当看到这个页面，说明你对Regexp赋值了↓↓↓
//欢迎使用JavaScript中的RegExp的众多陷阱之一，当flag 是global时，第二次使用它将会从第一次匹配到的lastIndex开始查。。。
//所以只要是变量赋值多次使用的Regexp，都需要使用match，或者在使用完test,exec之后重置lastIndex

const spaceRegexp = /\s/g;
const firstSpaceRegexp = /\s+/;
const quotationRegexp = /[\"|\']/g;
const angleBracketsRegexp = /[\<|\>]/g;
const templateBeginRegexp = /\<template/g;
const templateEndRegexp = /\<\/template/g;
const scriptBeginRegexp = /\<script/g;
const scripteEndRegexp = /\<\/script/g;

//只匹配单行注释，多行注释不考虑
const commentRegexp = /^(\/\/)|^(<!--)|^(\/\*)/g;

//只匹配vue注释左半部分
const commentLeft = /^\s*(<!--)/g;

//只匹配vue注释右半部分
const commentRight = /(-->)$/g;

//匹配js中的汉字,配合template range 判断 是否是template中的js汉字  √ (?<!=)["'][\u4e00-\u9fa5]\S*["|']
const scriptRegexp = /(?<=(\$i18n|\$t)\()('|").*('|")/g
// const scriptRegexp = /(?<!=)[\$18n]\S*/g

//匹配到特殊字符串说明前面正则匹配有问题，给出提示，去掉匹配
const warnRegexp = /[{}<>:]/g;

// 匹配 $t替换的字符串
// const dollarTRegexp = /(?<!=(\$i18n\.t)\(["'])[^'"]+/gm

module.exports = {
  templateBeginRegexp,
  templateEndRegexp,
  scriptBeginRegexp,
  scripteEndRegexp,
  scriptRegexp,
  // propertyRegexp,
  // angleBracketSpaceRegexp,
  warnRegexp,
  angleBracketsRegexp,
  quotationRegexp,
  spaceRegexp,
  firstSpaceRegexp,
  commentRegexp,
  commentLeft,
  commentRight
  // dollarTRegexp
}

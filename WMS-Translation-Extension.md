# 前言
作为跨境电商，在项目是需要提供给多国工作人员使用的，所以页面的国际化是必须的功能。在vue项目中国际化是非常繁琐的事情，我们需要将所有需要国际化的文字从js文件和vue文件中复制粘贴到我们的翻译平台，在vue文件中还需要分别从template，property或script中分别找到并复制粘贴，而且每一个页面都需要重复这样的事情，非常的浪费效率也很累。

# 快速开始
## 1 安装
将wms-translation-extension-0.0.1.vsix安装
![我是图片](https://github.com/ZhengnanZhang/wms-translation-extension/master/image/安装插件.jpg)
## 2 使用
点击鼠标右键，选择generate key 就会生成json文件
![我是图片](https://github.com/ZhengnanZhang/wms-translation-extension/master/image/选取vsix文件.jpg)

## 3 详述
### 3.1 鼠标右键增加选项
在插件中，我们首先注册一个叫做generateKeys的command，这样就可以右键点击的时候就执行这个任务。
然后我们在menu中注册一个选项，当点击时候就可以执行generateKeys这个命令。
### 3.2 读取文件并逐行进行正则匹配
如果这是首次执行，我们利用mkdir生成一个新的文件夹叫做locale，然后在这个文件夹之下我们生成我们最后的json文件。
### 3.2.1 判断文件类型以及分析起止位
我们先进行判断我们需要进行提取key值的文件是vue文件还是js文件，通过languageId这个参数我们可以进行判断。
如果是vue文件，我们再进一步通过getRange函数来知道template和script的起止位置。
![我是图片](https://github.com/ZhengnanZhang/wms-translation-extension/master/image/判断文件类型.jpg)
### 3.2.2 去除注释
在vue中的注释于js的注释不同，js中注释多行的时候，每一行前面都会有 `//` 符号，这样就比较容易匹配，我们只要通过正则然后利用test进行判断就可以。但是vue中多行注释是开头一个`<!==` 然后结尾`!==>`符号，中间部分的代码都是被注释的。所以这时候我们通过一个commentFlag的参数，来判断目前的代码行是否是注释的。
![我是图片](https://github.com/ZhengnanZhang/wms-translation-extension/master/image/跳过注释.jpg)
### 3.3.3 正则匹配
当代码行不是被注释的，我们利用正则将需要添加翻译的字段提取出来，`/(?<=(\$i18n|\$t)\()('|").*('|")/g`，这样就可以把代码中的$i18n('xxx')或者$t('xxx')中的内容提取出来。
### 3.3.4 生成json文件
当我们所有key值都提取出以后，我们将结果利用writeFile写入translationKeys.json文件中。

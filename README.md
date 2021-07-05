# 前言
此插件将后端返回的JSON数据如
```
response: {  data: {    ABCClassification: {      A: 1,      B: 2,      C: 3,      EXCLUDED: 5,      SA: 4,      UNDEFINED: 0    },    AdjustTaskStatus: [     {key: "Created", value: 1},
     {key: "Pending", value: 2},
     {key: "Locked", value: 21}    ]  },  message: "success",  retcode: 0
}

```
这两种数据格式的数据，转换为 Typescript 中的枚举值，数据仅会增量更新，对于已经有的本地数据不会进行修改，这样是为了避免后端数据改错，常量值的修改我们希望是手动进行。

## 1 使用
首先在插件配置页面放入项目对应的 api 接口地址，如需token等配置，按照参考放在header中
打开项目 Typescript 配置的全局 .d.ts 文件，点击鼠标右键，选择generate Enums 就会将接口返回转换为枚举值。

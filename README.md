# react-spa-boilerplate

## 目录规范

```
config
  webpack.config.${env}.js
  postcss.config.js
src
  component: 展示型组件
  container: 容器组件
    component: UI组件 or 业务组件
    constant: 常量定义
    action: action定义
    store: store配置
```

## polyfill

* [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch)
* babel-polyfill

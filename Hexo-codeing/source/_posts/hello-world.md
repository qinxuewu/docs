---
title: GitHub+hexo搭建个人静态博客 
date: 2019-01-22 17:13:21
tags: hexo
categories: 随笔
---
* 写博客的好处是我们用博客表达自己、升华自己。
* 平时学习新知识总是经常性会遗忘部分内容，使用过有道云，印象笔记，公众号，缺金社区，csdn,Github,码云等等记录了零零散散一些内容。所以准备使用hexo做一个归纳

## 快速开始
首选安装好node.js和npm
 <!-- more -->
#### 安装 Hexo
``` bash
$ npm install -g hexo-cli
```
### 初始化博客

``` bash
$ hexo init

# 会生成如下文件
├── .deploy #需要部署的文件
├── node_modules #Hexo插件
├── public #生成的静态网页文件
├── scaffolds #模板
├── source #博客正文和其他源文件，404、favicon、CNAME 都应该放在这里
| ├── _drafts #草稿
| └── _posts #文章
├── themes #主题
├── _config.yml #全局配置文件
└── package.json
```

More info: [Writing](https://hexo.io/docs/writing.html)

### 启动

``` bash
$ hexo server
```

More info: [Server](https://hexo.io/docs/server.html)

### 发表草稿。
``` bash
$ hexo publish [layout] <filename>
```
### 创建文章
``` bash
$ hexo new [layout] <title>
```


### 生成静态文件

``` bash
$ hexo generate
```

More info: [Generating](https://hexo.io/docs/generating.html)

### 部署网站

``` bash
$ hexo deploy
#打包并上传的github
$ hexo d -g
```
More info: [Deployment](https://hexo.io/docs/deployment.html)

### 清除缓存文件
``` bash
$ hexo clean
```

### 列出网站资料
``` bash
$ hexo list <type>
```
### 显示 Hexo 版本
``` bash
$ hexo version
```


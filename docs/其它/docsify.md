### 简介
在日常开发中 前后端对接时 经常要写很多文档Api。docsify就是一个强大的文档生成工具 界面清新好 支持语法高亮和Markdown 语法，并且docsify 扩展了一些 Markdown 语法可以让文档更易读。像vue.js官网(https://cn.vuejs.org/)就是docsify 其中的一种注意 并且是目前用的的最多的主题

### 效果图如下
预览链接：https://a870439570.github.io/interview-docs
![在这里插入图片描述](https://user-gold-cdn.xitu.io/2019/1/4/16816de06fadda89?w=1237&h=607&f=png&s=367834)

![在这里插入图片描述](https://user-gold-cdn.xitu.io/2019/1/4/16816de06f91f058?w=1919&h=933&f=png&s=239829)


### 快速开始
首先先安装好npm和nodejs,这里就不做过多介绍了 自信安装即可 （https://blog.csdn.net/zimushuang/article/details/79715679）

安装docsify 推荐安装 docsify-cli 工具，可以方便创建及本地预览文档网站。

```
npm i docsify-cli -g
```
初始化项目 
```
# 进入指定文件目录 如下：F:\ideWork\githubWork\test_docs 
运行    docsify init ./docs
```
![在这里插入图片描述](https://user-gold-cdn.xitu.io/2019/1/4/16816de06fdd7ea4?w=485&h=72&f=png&s=3356)
初始化成功后，可以看到 ./docs 目录下创建的几个文件

    index.html 入口文件
    README.md 会做为主页内容渲染
    .nojekyll 用于阻止 GitHub Pages 会忽略掉下划线开头的文件

![在这里插入图片描述](https://user-gold-cdn.xitu.io/2019/1/4/16816de0706dda77?w=341&h=172&f=png&s=13375)


## 本地预览网站
运行一个本地服务器通过 docsify serve 可以方便的预览效果，而且提供 LiveReload 功能，可以让实时的预览。默认访问http://localhost:3000/#/。
```
docsify serve docs
```
一个基本的文档网站就搭建好了，docsify还可以自定义导航栏，自定义侧边栏以及背景图和一些开发插件等等
更多配置请参考官方文档  https://docsify.js.org/#/zh-cn/quickstart

### 下面介绍docsify如何部署到Github  使用免费的站点
和 GitBook 生成的文档一样，我们可以直接把文档网站部署到 GitHub Pages 或者 VPS 上

 
## GitHub Pages
GitHub Pages 支持从三个地方读取文件

 - docs/ 目录
 - master 分支
 - gh-pages 分支

上传文件至Github仓库  官方推荐直接将文档放在 docs/ 目录下，在设置页面开启 GitHub Pages 功能并选择 master branch /docs folder 选项。


此时等待几秒钟 就可以访问了   我这里使用了自定义域名 

### Github如何配置自定义域名 
在根目录下创建CNAME文件  并配置你的阿里云或其它网站购买的域名 
![在这里插入图片描述](https://user-gold-cdn.xitu.io/2019/1/4/16816de07178e371?w=628&h=309&f=png&s=33631)

设置页面 Custom domain 更改域名
![在这里插入图片描述](https://user-gold-cdn.xitu.io/2019/1/4/16816de096c243bc?w=746&h=460&f=png&s=61973)


进入域名平台 进行解析  添加继续记录 ；类型为CNAME
![在这里插入图片描述](https://user-gold-cdn.xitu.io/2019/1/4/16816de098ed1780?w=644&h=463&f=png&s=32769)

解析后 等待十分钟既可开启了


官方文档  https://docsify.js.org/#/zh-cn/quickstart

预览链接：https://a870439570.github.io/interview-docs

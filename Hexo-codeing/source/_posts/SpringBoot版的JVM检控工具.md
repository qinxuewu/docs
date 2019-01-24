---
title: SpringBoot版的JVM检控工具
date: 2019-01-30 17:46:51
tags: springboot
categories: springboot
---

![](https://user-gold-cdn.xitu.io/2019/1/6/168214665581edf1?w=1909&h=931&f=png&s=126744)
    <!-- more -->

#### 项目介绍
- 基于SpringBoot2.0 实现的jvm远程监工图形化工具，可以同时监控多个web应用
- 该项目是借鉴另个一开源项目 （ JavaMonitor） https://gitee.com/zyzpp/JavaMonitor 演变而来，剔除了一些功能，增加了可远程监控模块，只需要在需要监控的项目集成监控的jar包 并设置可访问的IP（默认为空 则不拦截IP访问） 就可以实现远程监控,和用户管理模块,动态定时任务
支付windows服务器和Linux服务监控,Mac还未测试 应该也支持 


#### 目录说明
1. boot-actuator  需要监控的项目demo
1. actuator-service  监控端点jar包 需要引入到需要监控的项目中（已打包好上传）
1. boot-monitor    监监控图形化工程
1. Sql文件  /boot-monitor/src/main/resources/db/actuator.sql

### [部署文档](https://a870439570.github.io/work-doc/actuator/)    
- https://a870439570.github.io/work-doc/actuator/

### 效果图如下

### 登录
![输入图片说明](https://user-gold-cdn.xitu.io/2019/1/6/16821466557caba0?w=1305&h=714&f=png&s=338901 "屏幕截图.png")

### 监控列表主页  增加应用，删除应用

![输入图片说明](https://user-gold-cdn.xitu.io/2019/1/6/168214665581edf1?w=1909&h=931&f=png&s=126744 "屏幕截图.png")

### 监控详情
![输入图片说明](https://user-gold-cdn.xitu.io/2019/1/6/1682146656904113?w=1912&h=936&f=png&s=164206 "屏幕截图.png")


### 用户管理
![输入图片说明](https://user-gold-cdn.xitu.io/2019/1/6/1682146654d495fc?w=1895&h=659&f=png&s=62302 "屏幕截图.png")
### 定时任务
![输入图片说明](https://user-gold-cdn.xitu.io/2019/1/6/16821466580b1a29?w=1344&h=660&f=png&s=125645 "屏幕截图.png")



##  概述
- SpringCloud组件它主要提供的模块包括：服务发现（Eureka），断路器（Hystrix），智能路有（Zuul），客户端负载均衡（Ribbon），Archaius，Turbine等
- Eureka作用相当于zookeeper,用于微服务项目中的服务注册及发现，在采用springBoot+springCloud开发微服务时，通过一些简单的配置就能够达到基本的目的

 
### 注册中心访问权限配置
在注册中心服务pom.xml添加依赖

```
 <!-- 添加注册中心权限依赖  -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
```
在注册中心服务application.properties文件（注意），内容如下

```
#新版本开启权限
#注册中心配置
spring.application.name=szq-server
server.port=8761
eureka.instance.hostname=localhost
eureka.client.registerWithEureka=false
eureka.client.fetch-registry=false
eureka.client.serviceUrl.defaultZone=http://admin:123456@${eureka.instance.hostname}:${server.port}/eureka/

#新版本开启权限
spring.security.user.name=admin
spring.security.user.password=123456
```
启动注册中心服务项目，浏览器输入http://localhost:8761/出现eureka控制台页面并要求输入用户名和密码框即为成功

![输入图片说明](https://images.gitee.com/uploads/images/2018/0724/140715_4f6f683e_1478371.png "微信图片_20180724140701.png")

## 开启验证后服务无法连接注册中心解决方案
运行错误提示
```
com.netflix.discovery.shared.transport.TransportException: Cannot execute request on any known server
```
Spring Cloud 2.0 以上的security默认启用了csrf检验，要在eurekaServer端配置security的csrf检验为false

```
服务注册中心注册时加上账号密码
eureka.client.serviceUrl.defaultZone=http://admin:123456@localhost:8761/eureka/ 
```
- 添加一个继承 WebSecurityConfigurerAdapter 的类
- 在类上添加 @EnableWebSecurity 注解；
- 覆盖父类的 configure(HttpSecurity http) 方法，关闭掉 csrf
```
package com.pflm;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

/**
 * eureka开启验证后无法连接注册中心?
 * spring Cloud 2.0 以上）的security默认启用了csrf检验，要在eurekaServer端配置security的csrf检验为false
 * @author qxw
 * @data 2018年7月24日下午1:58:31
 */
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter{
	 @Override
	    protected void configure(HttpSecurity http) throws Exception {
	        http.csrf().disable();
	        super.configure(http);
	    }
}

```

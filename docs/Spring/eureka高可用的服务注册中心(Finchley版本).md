在eureka-server工程中resources文件夹下，创建配置文件application-peer1.yml:

```
server:
  port: 8761

spring:
  profiles: peer1
eureka:
  instance:
    hostname: peer1
  client:
    serviceUrl:
      defaultZone: http://peer2:8769/eureka/
```
并且创建另外一个配置文件application-peer2.yml：

```
server:
  port: 8769

spring:
  profiles: peer2
eureka:
  instance:
    hostname: peer2
  client:
    serviceUrl:
      defaultZone: http://peer1:8761/eureka/
```
这时eureka-server就已经改造完毕。

按照官方文档的指示，需要改变etc/hosts，linux系统通过vim /etc/hosts ,加上：

```
127.0.0.1 peer1
127.0.0.1 peer2
```
 这里时候需要改造服务提供者
单个注册中心时，服务提供者的配置
```
spring.application.name=szq-api
server.port=8762
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka/ 
```

```
eureka.client.serviceUrl.defaultZone=http://peer1:8761/eureka/
server.port=8762
spring.application.name=service-api
```

启动多个不同端口号注册中心eureka-server和服务提供者

eureka.instance.preferIpAddress=true是通过设置ip让eureka让其他服务注册它。也许能通过去改变去通过改变host的方式。


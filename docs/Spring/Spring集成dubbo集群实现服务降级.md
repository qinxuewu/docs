

## dubbo源码地址
[https://github.com/alibaba/dubbo](https://github.com/alibaba/dubbo)
- 进入下载dubbo-admin管理界面源码，进行maven打包 把打包war包部署到tomcat
- 打包war包，进入dubbo-admin这个文件目录 运行命令：
```
mvn package -Dmaven.skip.test=true
```
- zookeeper 安装 windows环境
- 在apache的官方网站提供了好多镜像下载地址，然后找到对应的版本
下载地址：
[https://mirrors.cnnic.cn/apache/zookeeper/](https://mirrors.cnnic.cn/apache/zookeeper/)
- 把下载的zookeeper的文件解压到指定目录
- 修改conf下增加一个zoo.cfg,可以用zoo_sample.cfg内内容替代
安装完成进入bin目录启动zkServer.cmd命令
```
# The number of milliseconds of each tick  心跳间隔 毫秒每次
tickTime=2000
# The number of ticks that the initial 
# synchronization phase can take
#多少个心跳时间内，允许其他server连接并初始化数据，如果ZooKeeper管理的数据较大，则应相应增大这个值
initLimit=10
# The number of ticks that can pass between 
# sending a request and getting an acknowledgement
#多少个tickTime内，允许follower同步，如果follower落后太多，则会被丢弃
syncLimit=5
# the directory where the snapshot is stored.
#日志位置
dataDir=F:\\zookeeper-3.3.6\\logs
# the port at which the clients will connect  监听客户端连接的端口
clientPort=2181
```
## w系统伪集群安装


- 在 一台机器上通过伪集群运行时可以修改 zkServer.cmd 文件在里面加入
- set ZOOCFG=..\conf\zoo1.cfg  这行，另存为  zkServer-1.cmd
![![输入图片说明](https://gitee.com/uploads/images/2018/0112/110016_3b751c35_1478371.png "屏幕截图.png")](https://gitee.com/uploads/images/2018/0112/110013_3184576d_1478371.png "屏幕截图.png")

如果有多个可以以此类推
![输入图片说明](https://gitee.com/uploads/images/2018/0112/110051_f7eee2fa_1478371.png "屏幕截图.png")
![输入图片说明](https://gitee.com/uploads/images/2018/0112/110152_d20e3d5a_1478371.png "屏幕截图.png")

![输入图片说明](https://gitee.com/uploads/images/2018/0112/110221_2df369d0_1478371.png "屏幕截图.png")
![输入图片说明](https://gitee.com/uploads/images/2018/0112/110233_5f93ceee_1478371.png "屏幕截图.png")

![输入图片说明](https://gitee.com/uploads/images/2018/0112/110254_a25e92a9_1478371.png "屏幕截图.png")
还需要 在对应的

/tmp/zookeeper/1，

/tmp/zookeeper/2，

/tmp/zookeeper/3

 建立一个文本文件命名为myid，内容就为对应的zoo.cfg里server.后数字
## Linux环境下安装

 
- 安装:

```
wget http://www.apache.org/dist//zookeeper/zookeeper-3.3.3/zookeeper-3.3.3.tar.gz
tar zxvf zookeeper-3.3.3.tar.gz
cd zookeeper-3.3.3
cp conf/zoo_sample.cfg conf/zoo.cfg
```
- 配置:
```
vi conf/zoo.cfg
```
如果不需要集群，zoo.cfg 的内容如下 2：
```
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/home/dubbo/zookeeper-3.3.3/data
clientPort=2181
```
如果需要集群，zoo.cfg 的内容如下
```
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/home/dubbo/zookeeper-3.3.3/data
clientPort=2181
server.1=10.20.153.10:2555:3555
server.2=10.20.153.11:2555:3555
```
并在 data 目录 4 下放置 myid 文件：
```
mkdir data
vi myid
```
myid 指明自己的 id，对应上面 zoo.cfg 中 server. 后的数字，第一台的内容为 1，第二台的内容为2
```
启动:

./bin/zkServer.sh start
停止:

./bin/zkServer.sh stop
命令行 5:
telnet 127.0.0.1 2181
dump
```
## Dubbo架构


- Provider: 暴露服务的服务提供方。
- Consumer: 调用远程服务的服务消费方。
- Registry: 服务注册与发现的注册中心。
- Monitor: 统计服务的调用次调和调用时间的监控中心。
- Container: 服务运行容器。
- ZooKeeper是一个分布式的，开放源码的分布式应用程序协调服务。

## Dubbo提供的注册中心有如下几种类型 


- * Multicast注册中心 
- * Zookeeper注册中心 
- * Redis注册中心 
- * Simple注册中心

## Dubbo优缺点


- 优点： 
- 透明化的远程方法调用 
- 像调用本地方法一样调用远程方法；只需简单配置，没有任何API侵入。 
- 软负载均衡及容错机制 
- 可在内网替代nginx lvs等硬件负载均衡器。 
- 服务注册中心自动注册 & 配置管理 
- 不需要写死服务提供者地址，注册中心基于接口名自动查询提供者ip。 
- 使用类似zookeeper等分布式协调服务作为服务注册中心，可以将绝大部分项目配置移入zookeeper集群。 
- 服务接口监控与治理 
- Dubbo-admin与Dubbo-monitor提供了完善的服务接口管理与监控功能，针对不同应用的不同接口，可以进行 多
  版本，多协议，多注册中心管理
- 缺点：只支持JAVA语言
* Dubbo中zookeeper做注册中心，如果注册中心集群都挂掉，发布者和订阅者之间还能通信么？


- 可以的，启动dubbo时，消费者会从zk拉取注册的生产者的地址接口等数据，缓存在本地。每次调用时，按照本地存储的地址进行调用
- 可以，消费者本地有一个生产者的列表，他会按照列表继续工作，倒是无法从注册中心去同步最新的服务列表，短期的注册中心挂掉是不要紧的，但一定要尽快修复

## Dubbo在安全机制方面是如何解决的 
Dubbo通过Token令牌防止用户绕过注册中心直连，然后在注册中心上管理授权。Dubbo还提供服务黑白名单，来控制服务所允许的调用方。

## dubbo配置文件详解   


1. [Dubbo用户手册](http://dubbo.io/books/dubbo-user-book/)
1. [Dubbo开发者指南](http://dubbo.io/books/dubbo-dev-book/)
1. [Dubbo管理员手册](http://dubbo.io/books/dubbo-admin-book/)
```
<dubbo:service/> 要暴露服务的接口 个服务可以用多个协议暴露，一个服务也可以注册到多个注册中心。
 <dubbo:service interface="com.qxw.service.UserService" ref="userService" />


<dubbo:reference/> 引用服务配置，用于创建一个远程服务代理，一个引用可以指向多个注册中心。
<dubbo:reference id="demoService" interface="com.unj.dubbotest.provider.DemoService" />


<dubbo:protocol/> 协议配置，用于配置提供服务的协议信息，协议由提供方指定，消费方被动接受。
 <!-- 用dubbo协议在28080端口暴露服务 -->
<dubbo:protocol name="dubbo" port="28080" />


<dubbo:application/> 应用配置，用于配置当前应用信息，不管该应用是提供者还是消费者。
 <!-- 应用名称 -->
<dubbo:application name="service_provider" />


<dubbo:registry/> 注册中心配置，用于配置连接注册中心相关信息。
<!-- 使用zookeeper注册中心暴露服务地址   连接到哪个本地注册中心  -->
<dubbo:registry address="zookeeper://127.0.0.1:2181" />

<dubbo:module/> 模块配置，用于配置当前模块信息，可选。
<dubbo:monitor/> 监控中心配置，用于配置连接监控中心相关信息，可选。
<dubbo:provider/> 提供方的缺省值，当ProtocolConfig和ServiceConfig某属性没有配置时，采用此缺省值，可选。
<dubbo:consumer/> 消费方缺省配置，当ReferenceConfig某属性没有配置时，采用此缺省值，可选。
<dubbo:method/> 方法配置，用于ServiceConfig和ReferenceConfig指定方法级的配置信息。
<dubbo:argument/> 用于指定方法参数配置。
```
## dubbo实现服务降级


- 查看dubbo的官方文档，可以发现有个mock的配置，mock只在出现非业务异常(比如超时，网络异常等)时执行。mock的配置支持两种
- 一种为boolean值，默认的为false。如果配置为true，则缺省使用mock类名，即类名+Mock后缀;
- 接口名要注意命名规范：接口名+Mock后缀。此时如果调用失败会调用Mock实现；

![输入图片说明](https://gitee.com/uploads/images/2018/0112/143502_9437c862_1478371.png "屏幕截图.png")


- 另外一种则是配置"return null"，可以很简单的忽略掉异常。

```
在服务消费者放的增加mock就可以实现服务降级

 <dubbo:reference interface="com.qxw.service.UserService" id="userService" check="false" timeout="10000"  mock="return null" />
```

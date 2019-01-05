## 概述
**Spring Cloud 支持很多服务发现的软件，Eureka 只是其中之一，下面是 Spring Cloud 支持的服务发现软件以及特性对比：** 
![输入图片说明](https://images.gitee.com/uploads/images/2018/0722/114233_d074dcb0_1478371.png "FA26E544-309C-4D8C-9317-45F2F3C790A6.png")

## Consul介绍
- Consul 是 HashiCorp 公司推出的开源工具，用于实现分布式系统的服务发现与配置。与其他分布式服务注册与发现的方案，Consul 的方案更“一站式”，内置了服务注册与发现框 架、分布一致性协议实现、健康检查、Key/Value 存储、多数据中心方案，不再需要依赖其他工具（比如 ZooKeeper 等）。使用起来也较 为简单。Consul 使用 Go 语言编写，因此具有天然可移植性(支持Linux、windows和Mac OS X)；安装包仅包含一个可执行文件，方便部署，与 Docker 等轻量级容器可无缝配合。

## Consul的优势：
- 使用 Raft 算法来保证一致性, 比复杂的 Paxos 算法更直接. 相比较而言, zookeeper 采用的是 Paxos, 而 etcd 使用的则是 Raft。
- 支持多数据中心，内外网的服务采用不同的端口进行监听。 多数据中心集群可以避免单数据中心的单点故障,而其部署则需要考虑网络延迟, 分片等情况等。 zookeeper 和 etcd 均不提供多数据中心功能的支持。
- 支持健康检查。 etcd 不提供此功能。
- 支持 http 和 dns 协议接口。 zookeeper 的集成较为复杂, etcd 只支持 http 协议。
- 官方提供 web 管理界面, etcd 无此功能。
- 综合比较, Consul 作为服务注册和配置管理的新星, 比较值得关注和研究。

## 特性
- 服务发现
- 健康检查
- Key/Value 存储
- 多数据中心

## Consul角色
- client: 客户端, 无状态, 将 HTTP 和 DNS 接口请求转发给局域网内的服务端集群。
- server: 服务端, 保存配置信息, 高可用集群, 在局域网内与本地客户端通讯, 通过广域网与其他数据中心通讯。 每个数据中心的 server 数量推荐为 3 个或是 5 个。

## 安装
Consul 不同于 Eureka 需要单独安装，访问Consul 官网下载 Consul 的最新版本，

我这里以 Windows 为例，下载下来是一个 consul_1.2.1_windows_amd64.zip 的压缩包，解压是是一个 consul.exe 的执行文件。
![输入图片说明](https://images.gitee.com/uploads/images/2018/0722/114708_5c0d764e_1478371.png "64517552831A48A88E3B1906BC501705.png")

cd 到对应的目录下，使用 cmd 启动 Consul

```
cd D:\Common Files\consul

#cmd启动：
consul agent -dev        # -dev表示开发模式运行，另外还有-server表示服务模式运行
```
为了方便期间，可以在同级目录下创建一个 run.bat 脚本来启动，脚本内容如下

```
consul agent -dev
```

启动结果如下：
![输入图片说明](https://images.gitee.com/uploads/images/2018/0722/114845_60f171f4_1478371.png "F2A8ABD028D8428D875EE8806BDA0CF7.png")

启动成功之后访问：http://localhost:8500，可以看到 Consul 的管理界面
![输入图片说明](https://images.gitee.com/uploads/images/2018/0722/114926_f1eef9a6_1478371.png "F74DE8E446464BC1A3AE58534A7AB8D8.png")

这样就意味着我们的 Consul 服务启动成功了。

## Linux环境安装
把下载的linux下的安装包consul拷贝到linux环境里面，使用unzip进行解压：

 **2，配置环境变量** 
```
vi /etc/profile

export JAVA_HOME=/usr/local/jdk1.8.0_172
export MAVEN_HOME=/usr/local/apache-maven-3.5.4
export CONSUL_HOME=/usr/local/consul
 
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
export PATH=$JAVA_HOME/bin:$MAVEN_HOME/bin:$CONSUL_HOME:$PATH

#上面的CONSUL_HOME就是consul的路径，上面的配置仅供参考。
source /etc/profile #命令使配置生效

#查看安装的consul版本
[root@CentOS124 /]# consul -v
Consul v1.2.2
Protocol 2 spoken by default, understands 2 to 3 (agent will automatically use protocol >2 when speaking to compatible agents)
[root@CentOS124 /]# 
```


## 服务端
创建一个 spring-cloud-consul-producer 项目 依赖包如下：
```
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-consul-discovery</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```
- spring-boot-starter-actuator 健康检查依赖于此包。
- spring-cloud-starter-consul-discovery Spring Cloud Consul 的支持。

 **配置文件内容如下** 

```
spring.application.name=spring-cloud-consul-producer
server.port=8501
spring.cloud.consul.host=localhost
spring.cloud.consul.port=8500
#注册到consul的服务名称
spring.cloud.consul.discovery.serviceName=service-producer
```
- Consul 的地址和端口号默认是 localhost:8500 ，如果不是这个地址可以自行配置。
- spring.cloud.consul.discovery.serviceName 是指注册到 Consul 的服务名称，后期客户端会根据这个名称来进行服务调用。

 **启动类** 

```
@SpringBootApplication
@EnableDiscoveryClient
public class ConsulProducerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConsulProducerApplication.class, args);
    }
}
```
添加了 @EnableDiscoveryClient 注解表示支持服务发现。

 **创建一个 Controller，推文提供 hello 的服务** 

```
@RestController
public class HelloController {
    @RequestMapping("/hello")
    public String hello() {
        return "helle consul";
    }
}
```
为了模拟注册均衡负载复制一份上面的项目重命名为 spring-cloud-consul-producer-2 ,修改对应的端口为 8502，修改 hello 方法的返回值为："helle consul two"，修改完成后依次启动两个项目。

这时候我们再次在浏览器访问地址：http://localhost:8500 就会显示出来两个服务提供者

## 消费端
创建一个 spring-cloud-consul-consumer 项目，pom 文件和上面示例保持一致

**配置文件内容如下** 

```
spring.application.name=spring-cloud-consul-consumer
server.port=8503
spring.cloud.consul.host=127.0.0.1
spring.cloud.consul.port=8500
#设置不需要注册到 consul 中
spring.cloud.consul.discovery.register=false
```
客户端可以设置注册到 Consul 中，也可以不注册到 Consul 注册中心中，根据我们的业务来选择，只需要在使用服务时通过 Consul 对外提供的接口获取服务信息即可。

 **启动类** 

```
@SpringBootApplication
public class ConsulConsumerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConsulConsumerApplication.class, args);
    }
}
```

 **进行测试** 

创建一个 ServiceController ,试试如果去获取 Consul 中的服务

```
@RestController
public class ServiceController {
    @Autowired
    private LoadBalancerClient loadBalancer;
    @Autowired
    private DiscoveryClient discoveryClient;
     //获取所有服务
    @RequestMapping("/services")
    public Object services() {
        return discoveryClient.getInstances("service-producer");
    }
    //从所有服务中选择一个服务（轮询）
    @RequestMapping("/discover")
    public Object discover() {
     return loadBalancer.choose("service-producer").getUri().toString();
    }
}
```
Controller 中有俩个方法，一个是获取所有服务名为service-producer的服务信息并返回到页面，一个是随机从服务名为service-producer的服务中获取一个并返回到页面。

添加完 ServiceController 之后我们启动项目，访问地址：http://localhost:8503/services，返回jsn数据 

```
[{"serviceId":"service-producer","host":"windows10.microdone.cn","port":8501,"secure":false,"metadata":{"secure":"false"},"uri":"http://windows10.microdone.cn:8501","scheme":null},{"serviceId":"service-producer","host":"windows10.microdone.cn","port":8502,"secure":false,"metadata":{"secure":"false"},"uri":"http://windows10.microdone.cn:8502","scheme":null}]
```

发现我们刚才创建的端口为 8501 和 8502 的两个服务端都存在

多次访问地址：http://localhost:8503/discover，页面会交替返回信息：

说明 8501 和 8501 的两个服务会交替出现，从而实现了获取服务端地址的均衡负载。

大多数情况下我们希望使用均衡负载的形式去获取服务端提供的服务，因此使用第二种方法来模拟调用服务端提供的 hello 方法。

 **创建 CallHelloController ：** 

```
@RestController
public class CallHelloController {
    @Autowired
    private LoadBalancerClient loadBalancer;
    @RequestMapping("/call")
    public String call() {
        ServiceInstance serviceInstance = loadBalancer.choose("service-producer");
        System.out.println("服务地址：" + serviceInstance.getUri());
        System.out.println("服务名称：" + serviceInstance.getServiceId());
        String callServiceResult = new RestTemplate().getForObject(serviceInstance.getUri().toString() + "/hello", String.class);
        System.out.println(callServiceResult);
        return callServiceResult;
    }
}
```
使用 RestTemplate 进行远程调用。添加完之后重启 spring-cloud-consul-consumer 项目。在浏览器中访问地址：http://localhost:8503/call，依次返回结果如下：

```
helle consul

helle consul two
```

说明我们已经成功的调用了 Consul 服务端提供的服务，并且实现了服务端的均衡负载功能

示例代码:https://github.com/ityouknow/spring-cloud-examples







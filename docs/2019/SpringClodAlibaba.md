## alibaba-cloud
本项目演示如何使用 spring cloud alibaba系列
## 引入依赖
- 版本 0.2.1.RELEASE 对应的是 Spring Cloud Finchley 版本，
- 版本 0.1.1.RELEASE 对应的是 Spring Cloud Edgware 版本。
- 官方文档目前推荐的SpringBoot 2.0.6.RELEASE版本。如果注册不了一般都是版本不对。可以去官方文档查看对应的版本
如果需要使用已发布的版本，在 `dependencyManagement` 中添加如下配置。

	<dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-alibaba-dependencies</artifactId>
                <version>0.2.1.RELEASE</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

然后在 `dependencies` 中添加自己所需使用的依赖即可使用。

如果您想体验最新的 BUILD-SNAPSHOT 的新功能，则可以将版本换成最新的版本，但是需要在 pom.xml 中配置 Spring BUILDSNAPSHOT 仓库，**注意: SNAPSHOT 版本随时可能更新**

	<repositories>
        <repository>
            <id>spring-snapshot</id>
            <name>Spring Snapshot Repository</name>
            <url>https://repo.spring.io/snapshot</url>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
        </repository>
    </repositories>
## 1.服务的注册发现(Nacos Discovery)
Nacos 是阿里巴巴开源的一个更易于构建云原生应用的动态服务发现、配置管理和服务管理平台。
如何使用Nacos Discovery Starter 完成 Spring Cloud 应用的服务注册与发现
### 创建服务提供者
新建一个项目 cloud-client

1. 引入Nacos Discovery Starter


```
	  <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>
```

	
2. 配置Nacos Server地址
```
server.port=18082
#服务名称
spring.application.name=cloud-client
#Nacos Server 地址
spring.cloud.nacos.discovery.server-addr=127.0.0.1:8848
```
    
3. 启动类上使用 @EnableDiscoveryClient 注解开启服务注册与发现功能

4 下载 Nacos Server ：https://github.com/alibaba/nacos/releases

5. 启动 Server
- Linux/Unix/Mac 操作系统，执行命令 sh startup.sh -m standalone
- Windows 操作系统，执行命令 cmd startup.cmd
- 访问控制台：http://127.0.0.1:8848/nacos/index.html  

  **0.8版本默认登录账号的密码nacos/nacos.** 

![输入图片说明](https://images.gitee.com/uploads/images/2019/0124/125758_aa62dddb_1478371.png)
![输入图片说明](https://images.gitee.com/uploads/images/2019/0124/130000_4da3402a_1478371.png "登录界面")

### 启动
出现如下信息说明注册到nacos成功
![输入图片说明](https://images.gitee.com/uploads/images/2019/0125/180020_c426127d_1478371.png)
nacos控制条界面就会出现注册的服务
![输入图片说明](https://images.gitee.com/uploads/images/2019/0125/180210_3d75c743_1478371.png)

以上步骤向您展示了如何将一个服务注册到 Nacos。

### 创建消费者
新建一个项目 cloud-consumer.配置文件和消费者一样更换下端口即可。

```
server.port=18083
spring.application.name=service-consumer
#Nacos Server 地址
spring.cloud.nacos.discovery.server-addr=127.0.0.1:8848
management.endpoints.web.exposure.include=*

```
启动类同样添加@EnableDiscoveryClient 注册到nacos


```
@EnableDiscoveryClient
@SpringBootApplication
public class CloudConsumerApplication {
    public static void main(String[] args) {
        SpringApplication.run(CloudConsumerApplication.class, args);
    }


    //实例化 RestTemplate 实例
    @Bean
    public RestTemplate restTemplate(){

        return new RestTemplate();
    }

}
```
新建一个 ConsumerController

```
@RestController
public class ConsumerController {

    @Autowired
    private LoadBalancerClient loadBalancerClient;
    @Autowired
    private RestTemplate restTemplate;

    @Value("${spring.application.name}")
    private String appName;

    /**
     * 通过带有负载均衡的RestTemplate 和 FeignClient 也是可以访问的
     * @return
     */
    @GetMapping("/echo/app-name")
    public String echoAppName(){
        //使用 LoadBalanceClient 和 RestTemolate 结合的方式来访问
        ServiceInstance serviceInstance = loadBalancerClient.choose("service-provider");
        String url = String.format("http://%s:%s/echo/%s",serviceInstance.getHost(),serviceInstance.getPort(),appName);
        System.out.println("request url:"+url);
        return restTemplate.getForObject(url,String.class);
    }

}

```
分别启动cloud-client和cloud-consumer刷新nacos
![输入图片说明](https://images.gitee.com/uploads/images/2019/0125/183238_acff8d12_1478371.png)
两个服务都注册成功
##测试
访问 http://127.0.0.1:18083/echo/app-name 消费者输出访问日志说明请求成功

![输入图片说明](https://images.gitee.com/uploads/images/2019/0125/183350_f130882c_1478371.png)

浏览器出现 第一个Nacos 程序service-consumer 到此Over 基于Nacos实现的服务注册发现已经调用就到此为止。入门还是很简单的 阿里巴巴大法好！

### Nacos更多配置信息

```
spring.cloud.nacos.discovery.server-addr  #Nacos Server 启动监听的ip地址和端口
spring.cloud.nacos.discovery.service  #给当前的服务命名
spring.cloud.nacos.discovery.weight  #取值范围 1 到 100，数值越大，权重越大
spring.cloud.nacos.discovery.network-interface #当IP未配置时，注册的IP为此网卡所对应的IP地址，如果此项也未配置，则默认取第一块网卡的地址
spring.cloud.nacos.discovery.ip  #优先级最高
spring.cloud.nacos.discovery.port  #默认情况下不用配置，会自动探测
spring.cloud.nacos.discovery.namespace #常用场景之一是不同环境的注册的区分隔离，例如开发测试环境和生产环境的资源（如配置、服务）隔离等。

spring.cloud.nacos.discovery.access-key  #当要上阿里云时，阿里云上面的一个云账号名
spring.cloud.nacos.discovery.secret-key #当要上阿里云时，阿里云上面的一个云账号密码
spring.cloud.nacos.discovery.metadata    #使用Map格式配置，用户可以根据自己的需要自定义一些和服务相关的元数据信息
spring.cloud.nacos.discovery.log-name   日志文件名
spring.cloud.nacos.discovery.enpoint   #地域的某个服务的入口域名，通过此域名可以动态地拿到服务端地址
ribbon.nacos.enabled  #是否集成Ribbon 一般都设置成true即可
```
## 2.限流组件Sentinel
- Sentinel是把流量作为切入点，从流量控制、熔断降级、系统负载保护等多个维度保护服务的稳定性。
- 默认支持 Servlet、Feign、RestTemplate、Dubbo 和 RocketMQ 限流降级功能的接入，可以在运行时通过控制台实时修改限流降级规则，还支持查看限流降级 Metrics 监控。
- 自带控台动态修改限流策略。但是每次服务重启后就丢失了。所以它也支持ReadableDataSource 目前支持file, nacos, zk, apollo 这4种类型
### 接入Sentinel
创建项目cloud-sentinel
* 1 引入 Sentinel starter
``` java
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```
* 2 application.properties配置如下
``` bash
server.port=18084
spring.application.name=service-sentinel

#Sentinel 控制台地址
spring.cloud.sentinel.transport.dashboard=localhost:8080
#取消Sentinel控制台懒加载
spring.cloud.sentinel.eager=true
```
### 接入限流埋点
Sentinel 默认为所有的 HTTP 服务提供了限流埋点。引入依赖后自动完成所有埋点。只需要在控制配置限流规则即可
* 注解埋点
如果需要对某个特定的方法进行限流或降级，可以通过 @SentinelResource 注解来完成限流的埋点

``` java
@SentinelResource("resource")
@RequestMapping("/sentinel/hello")
public Map<String,Object> hello(){
        Map<String,Object> map=new HashMap<>(2);
        map.put("appName",appName);
        map.put("method","hello");
        return map;
}
```
### 部署Sentinel控制台
#### 安装
[Sentinel下载](http://edas-public.oss-cn-hangzhou.aliyuncs.com/install_package/demo/sentinel-dashboard.jar)
#### 启动控制台
执行 Java 命令 `java -jar sentinel-dashboard.jar` 默认的监听端口为 `8080`
#### 访问
打开http://localhost:8080 即可看到控制台界面
![输入图片说明](https://images.gitee.com/uploads/images/2019/0128/142828_12667ffe_1478371.png)
说明cloud-sentinel已经成功和Sentinel完成率通讯
### 配置限流规则
如果控制台没有找到自己的应用，可以先调用一下进行了 Sentinel 埋点的 URL 或方法或着禁用Sentinel 的赖加载`spring.cloud.sentinel.eager=true`
#### 配置 URL 限流规则
控制器随便添加一个普通的http方法
``` Java
  /**
     * 通过控制台配置URL 限流
     * @return
     */
    @RequestMapping("/sentinel/test")
    public Map<String,Object> test(){
        Map<String,Object> map=new HashMap<>(2);
        map.put("appName",appName);
        map.put("method","test");
        return map;
    }

```
点击新增流控规则。为了方便测试阀值设为 1
![输入图片说明](https://images.gitee.com/uploads/images/2019/0128/143410_16ca33b7_1478371.png)
浏览器重复请求 http://localhost:18084/sentinel/test 如果超过阀值就会出现如下界面
![输入图片说明](https://images.gitee.com/uploads/images/2019/0128/143600_56ead0a3_1478371.png)

整个URL限流就完成了。但是返回的提示不够友好。

#### 配置自定义限流规则(@SentinelResource埋点)
自定义限流规则就不是添加方法的访问路径。 配置的是@SentinelResource注解中value的值。比如` @SentinelResource("resource")`就是配置路径为resource
![输入图片说明](https://images.gitee.com/uploads/images/2019/0128/144027_2261e5f6_1478371.png)
- 访问：http://localhost:18084/sentinel/hello
- 通过`@SentinelResource`注解埋点配置的限流规则如果没有自定义处理限流逻辑，当请求到达限流的阀值时就返回404页面
![输入图片说明](https://images.gitee.com/uploads/images/2019/0128/144236_3ea6d1b5_1478371.png)

### 自定义限流处理逻辑
@SentinelResource 注解包含以下属性：
- value: 资源名称，必需项（不能为空）
- entryType: 入口类型，可选项（默认为 EntryType.OUT）
- blockHandler:blockHandlerClass中对应的异常处理方法名。参数类型和返回值必须和原方法一致
- blockHandlerClass：自定义限流逻辑处理类
``` java

 //通过注解限流并自定义限流逻辑
 @SentinelResource(value = "resource2", blockHandler = "handleException", blockHandlerClass = {ExceptionUtil.class})
 @RequestMapping("/sentinel/test2")
    public Map<String,Object> test2() {
        Map<String,Object> map=new HashMap<>();
        map.put("method","test2");
        map.put("msg","自定义限流逻辑处理");
        return  map;
    }

public class ExceptionUtil {

    public static Map<String,Object> handleException(BlockException ex) {
        Map<String,Object> map=new HashMap<>();
        System.out.println("Oops: " + ex.getClass().getCanonicalName());
        map.put("Oops",ex.getClass().getCanonicalName());
        map.put("msg","通过@SentinelResource注解配置限流埋点并自定义处理限流后的逻辑");
        return  map;
    }
}
```
控制台新增resource2的限流规则并设置阀值为1。访问http://localhost:18084/sentinel/test2 请求到达阀值时机会返回自定义的异常消息

![输入图片说明](https://images.gitee.com/uploads/images/2019/0128/144957_69a6d3d0_1478371.png)

基本的限流处理就完成了。 但是每次服务重启后 之前配置的限流规则就会被清空因为是内存态的规则对象.所以下面就要用到Sentinel一个特性ReadableDataSource 获取文件、数据库或者配置中心是限流规则
### 读取文件的实现限流规则
一条限流规则主要由下面几个因素组成：
* resource：资源名，即限流规则的作用对象
* count: 限流阈值
* grade: 限流阈值类型（QPS 或并发线程数）
* limitApp: 流控针对的调用来源，若为 default 则不区分调用来源
* strategy: 调用关系限流策略
* controlBehavior: 流量控制效果（直接拒绝、Warm Up、匀速排队）
SpringCloud alibaba集成Sentinel后只需要在配置文件中进行相关配置，即可在 Spring 容器中自动注册 DataSource，这点很方便。配置文件添加如下配置

``` bash
#通过文件读取限流规则
spring.cloud.sentinel.datasource.ds1.file.file=classpath: flowrule.json
spring.cloud.sentinel.datasource.ds1.file.data-type=json
spring.cloud.sentinel.datasource.ds1.file.rule-type=flow
```
在resources新建一个文件 比如flowrule.json 添加限流规则

``` javascript
[
  {
    "resource": "resource",
    "controlBehavior": 0,
    "count": 1,
    "grade": 1,
    "limitApp": "default",
    "strategy": 0
  },
  {
    "resource": "resource3",
    "controlBehavior": 0,
    "count": 1,
    "grade": 1,
    "limitApp": "default",
    "strategy": 0
  }
]

```
 **重新启动项目。出现如下日志说明文件读取成功** 

``` Java
 [Sentinel Starter] DataSource ds1-sentinel-file-datasource start to loadConfig
 [Sentinel Starter] DataSource ds1-sentinel-file-datasource load 2 FlowRule
```

 **刷新Sentinel 控制台 限流规则就会自动添加进去** 
![输入图片说明](https://images.gitee.com/uploads/images/2019/0128/154204_aafdbed2_1478371.png)
### Sentinel的配置

``` bash
spring.cloud.sentinel.enabled              #Sentinel自动化配置是否生效
spring.cloud.sentinel.eager               #取消Sentinel控制台懒加载
spring.cloud.sentinel.transport.dashboard   #Sentinel 控制台地址
spring.cloud.sentinel.transport.heartbeatIntervalMs        #应用与Sentinel控制台的心跳间隔时间
spring.cloud.sentinel.log.dir            #Sentinel 日志文件所在的目录
```
## 3.Nacos Config配置中心

## 概述
- Nacos 是阿里巴巴开源的一个更易于构建云原生应用的动态服务发现、配置管理和服务管理平台。
- Nacos Config就是一个类似于SpringCloud Config的配置中心

## 接入
- SpringCloud项目集成Nacos Config配置中心很简单。只需要部署Nacos 客户端并在里面添加配置即可。然后引入Nacos Config动态读取即可

 **1. 创建一个SpringCloud工程cloud-config 修改 pom.xml 文件，引入 Nacos Config Starter** 

前提得选引入spring-cloud-alibaba-dependencies
```
 <dependency>
     <groupId>org.springframework.cloud</groupId>
     <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
 </dependency>
```

 **2. 修改application.properties配置** 

```
server.port=18085
management.endpoints.web.exposure.include=*
```
 **3. 新建bootstrap.properties文件** 

```
spring.application.name=cloud-config
spring.cloud.nacos.config.server-addr=127.0.0.1:8848
```

 **4. 启动Nacos客户端** 
* 具体步骤可参考 [上篇文章](https://blog.qinxuewu.club/2019/01/27/spring-xi-lie/springcloudalibaba-zhi-fu-wu-zhu-ce-fa-xian/) 



 **5. 配置列表新增配置** 
* `dataId` ：格式如下 `${prefix} - ${spring.profiles.active} . ${file-extension}`
* prefix 默认为 spring.application.name 的值
* spring.profiles.active 当前环境对应的 profile

* file-extension 为配置内容的数据格式，可以通过配置项 spring.cloud.nacos.config.file-extension来配置。 目前只支持 properties 类型。
* group 默认`DEFAULT_GROUP`

`当activeprofile 为空时直接填写 spring.application.name值即可 默认properties`

![](https://images.gitee.com/uploads/images/2019/0130/114945_8addfbe3_1478371.png "添加配置")

 **5. 添加Controller并在类上添加 @RefreshScope动态获取配置中心的值** 
```
@RestController
@RefreshScope
public class SampleController {

    @Value("${user.name}")
    String userName;

    @Value("${user.age}")
    int age;


    @RequestMapping("/user")
    public String simple() {
        return "获取 Nacos Config配置如下："  + userName + " " + age + "!";
    }
}
```

 **6.启动测试** 

这样就可以获取到配置中心的值。并且配置中心修改值后。可以立即动态刷新获取最新的值

![](https://images.gitee.com/uploads/images/2019/0130/115742_50cdb2ee_1478371.png)


* 个人博客：https://blog.qinxuewu.club/
* 案例源码：https://github.com/a870439570/alibaba-cloud

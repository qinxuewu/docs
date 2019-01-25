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
## 服务的注册发现(Nacos Discovery)
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

## 创建消费者
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

# spring-cloud

[SpringCloud 教程Finchley版本](https://blog.csdn.net/forezp/article/details/81040925)

###  服务链路追踪(Spring Cloud Sleuth)(Finchley版本)
在spring Cloud为F版本的时候，已经不需要自己构建Zipkin Server了，只需要下载jar即可，下载地址：
https://dl.bintray.com/openzipkin/maven/io/zipkin/java/zipkin-server/

```
java -jar zipkin-server-2.10.1-exec.jar

访问 localhost:9411
```
 **构建工程** 
- 基本知识讲解完毕，下面我们来实战，本文的案例主要有三个工程组成:一个server-zipkin,它的主要作用使用ZipkinServer 的功能，收集调用数据，并展示；一个service-hi,对外暴露hi接口；一个service-miya,对外暴露miya接口；这两个service可以相互调用；并且只有调用了，server-zipkin才会收集数据的，这就是为什么叫服务追踪了。

 **创建service-hi** 

application.properties配制文件
```
server.port=8988
spring.zipkin.base-url=http://localhost:9411
spring.application.name=service-hi

```
启动类
```
@SpringBootApplication
@RestController
public class ServiceHiApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServiceHiApplication.class, args);
    }
    private static final Logger LOG = Logger.getLogger(ServiceHiApplication.class.getName());
    @Autowired
    private RestTemplate restTemplate;
    @Bean
    public RestTemplate getRestTemplate(){
        return new RestTemplate();
    }
    @RequestMapping("/hi")
    public String callHome(){
        LOG.log(Level.INFO, "calling trace service-hi  ");
        return restTemplate.getForObject("http://localhost:8989/miya", String.class);
    }
    @RequestMapping("/info")
    public String info(){
        LOG.log(Level.INFO, "calling trace service-hi ");
        return "i'm service-hi";
    }
    @Bean
    public Sampler defaultSampler() {
        return Sampler.ALWAYS_SAMPLE;
    }
}

```

  **创建service-miya** 

 创建过程痛service-hi，引入相同的依赖，配置下spring.zipkin.base-url。
application.properties配制文件
```
server.port=8989
spring.zipkin.base-url=http://localhost:9411
spring.application.name=service-miya
```
启动类

```
@SpringBootApplication
@RestController
public class ServiceMiyaApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServiceMiyaApplication.class, args);
    }
    private static final Logger LOG = Logger.getLogger(ServiceMiyaApplication.class.getName());
    @RequestMapping("/hi")
    public String home(){
        LOG.log(Level.INFO, "hi is being called");
        return "hi i'm miya!";
    }
    @RequestMapping("/miya")
    public String info(){
        LOG.log(Level.INFO, "info is being called");
        return restTemplate.getForObject("http://localhost:8988/info",String.class);
    }
    @Autowired
    private RestTemplate restTemplate;
    @Bean
    public RestTemplate getRestTemplate(){
        return new RestTemplate();
    }
    @Bean
    public Sampler defaultSampler() {
        return Sampler.ALWAYS_SAMPLE;
    }
}
```
pom.xml
```
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.pflm</groupId>
    <artifactId>service-miya</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>service-miya</name>
    <description>服务链路追踪演示</description>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.0.3.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
        <java.version>1.8</java.version>
        <spring-cloud.version>Finchley.RELEASE</spring-cloud.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-zipkin</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>

```
- 依次启动上面的工程，打开浏览器访问：http://localhost:9411/，会出现以下界面：
- 访问：http://localhost:8989/miya，浏览器出现： i’m service-hi
- 再打开http://localhost:9411/的界面，点击Dependencies,可以发现服务的依赖关系：
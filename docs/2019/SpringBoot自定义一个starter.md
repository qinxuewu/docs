

> SprngBoot之所以现在这吗火热，是因为spring starter模式使我们日常模块化开发独立化, 模块之间依赖关系更加松散，更加的方便集成

## 如何实现
首先建立一个普通maven工程，修改pom配置文件

```java
<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-autoconfigure</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-configuration-processor</artifactId>
			<optional>true</optional>
		</dependency>
	</dependencies>

	<dependencyManagement>
			<dependencies>
				<dependency>
					<groupId>org.springframework.boot</groupId>
					<artifactId>spring-boot-starter-parent</artifactId>
					<version>2.0.6.RELEASE</version>
					<type>pom</type>
					<scope>import</scope>
				</dependency>
			</dependencies>
	</dependencyManagement>
```
然后定义一个配置文件属性的类，为后续再其它项目中配置属性时使用。以spring.test-starter为开头，后面配置时间添加相应的属性即可

```java
@ConfigurationProperties(prefix = "spring.test-starter")
public class TestProperties {
    private  String name;
    private  int age;
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public int getAge() {
        return age;
    }
    public void setAge(int age) {
        this.age = age;
    }
}
```
t添加一个测试的service。其它模块集成这个starter时可以直接调用
```java
public class TestService {

    private TestProperties properties;

    public TestService() {
    }

    public TestService(TestProperties properties) {
        this.properties = properties;
    }

    public String  sayHello(){
        return "自定义starter->读取配置文件,name="+properties.getName()+"age="+properties.getAge();
    }
}
```
创建自动配置。用于读取自定义的配置属性和自动注入TestService的 bean。每个starter都至少会有一个自动配置类

```java
@Configuration
@EnableConfigurationProperties(TestProperties.class)
@ConditionalOnClass(TestService.class)
@ConditionalOnProperty(prefix = "spring.test-starter", value = "enabled", matchIfMissing = true)
public class TestServiceAutoConfiguration {
    @Autowired
    private TestProperties properties;
    /**
     *
     * 容器中没有指定Bean时会自动配置PestService
     * @return
     */
    @Bean
    @ConditionalOnMissingBean(TestService.class)
    public TestService testService(){
        TestService testService = new TestService(properties);
        return testService;
    }
```
在resources目录下创建META-INF文件夹并添加spring.factories文件。在该文件中配置自己的自动配置类。如果去debug springboot源码会发现SpringApplication.run中就执行了读取spring.factories文件的操作去进行自动配置
```java
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.TestServiceAutoConfiguration
```
这样自定义一个starter 就完成了。接下来就可以到其它模块中使用了。首先在其他模块中引入
```java
		<dependency>
			<groupId>com.example</groupId>
			<artifactId>test-springboot-starter</artifactId>
			<version>1.0</version>
		</dependency>
```
application.properties中添加配置属性
```java
spring.test-starter.name=qxwxww
spring.test-starter.age=25
```
测试
```java
@RunWith(SpringRunner.class)
@SpringBootTest
public class TestSpringbootApplicationTests {
	@Autowired
	TestService testService;
	@Test
	public void contextLoads() {
		System.err.println(testService.sayHello());
	}

}
```
输出如下提示，表示成功
![](http://wx1.sinaimg.cn/large/006b7Nxngy1g2eniz3zfpj30nl08gaj7.jpg)


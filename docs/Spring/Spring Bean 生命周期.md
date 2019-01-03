## Spring Bean 生命周期


### 前言
- 在Spring中，那些组成应用程序的主体及由Spring IoC容器所管理的对象，被称之为bean。简单地讲，bean就是由IoC容器初始化、装配及管理的对象，除此之外，bean就与应用程序中的其他对象没有什么区别了。而bean的定义以及bean相互间的依赖关系将通过配置元数据来描述。
- Spring 只帮我们管理单例模式 Bean 的完整生命周期，对于 prototype 的 bean ，Spring 在创建好交给使用者之后则不会再管理后续的生命周期。

首先看下生命周期图：

![输入图片说明](https://images.gitee.com/uploads/images/2018/0709/202510_bb8f4dca_1478371.png "3131012-249748bc2b49e857.png")


### bean的五种作用域作
![输入图片说明](https://images.gitee.com/uploads/images/2018/0709/125902_d205149e_1478371.png "微信图片_20180709125851.png")

五种作用域中，request、session和global session三种作用域仅在基于web的应用中使用（不必关心你所采用的是什么web应用框架），只能用在基于web的Spring ApplicationContext环境。

### Singleton作用域
- 当一个bean的作用域为Singleton，那么Spring IoC容器中只会存在一个共享的bean实例，并且所有对bean的请求，只要id与该bean定义相匹配，则只会返回bean的同一实例。Singleton是单例类型，就是在创建起容器时就同时自动创建了一个bean的对象，不管你是否使用，他都存在了，每次获取到的对象都是同一个对象。注意，Singleton作用域是Spring中的缺省作用域。
要在XML中将bean定义成singleton，可以这样配置：

```
<bean id="ServiceImpl" class="cn.csdn.service.ServiceImpl" scope="singleton">
```
### Prototype作用域
- 当一个bean的作用域为Prototype，表示一个bean定义对应多个对象实例。Prototype作用域的bean会导致在每次对该bean请求（将其注入到另一个bean中，或者以程序的方式调用容器的getBean()方法）时都会创建一个新的bean实例。Prototype是原型类型，它在我们创建容器的时候并没有实例化，而是当我们获取bean的时候才会去创建一个对象，而且我们每次获取到的对象都不是同一个对象。根据经验，对有状态的bean应该使用prototype作用域，而对无状态的bea

```
<bean id="account" class="com.foo.DefaultAccount" scope="prototype"/>  
 或者
<bean id="account" class="com.foo.DefaultAccount" singleton="false"/> 
```
### request作用域
- 当一个bean的作用域为Request，表示在一次HTTP请求中，一个bean定义对应一个实例；即每个HTTP请求都会有各自的bean实例，它们依据某个bean定义创建而成。该作用域仅在基于web的Spring ApplicationContext情形下有效。考虑下面bean定义：

```
<bean id="loginAction" class=cn.csdn.LoginAction" scope="request"/>
```
- 针对每次HTTP请求，Spring容器会根据loginAction bean的定义创建一个全新的LoginAction bean实例，且该loginAction bean实例仅在当前HTTP request内有效，因此可以根据需要放心的更改所建实例的内部状态，而其他请求中根据loginAction bean定义创建的实例，将不会看到这些特定于某个请求的状态变化。当处理请求结束，request作用域的bean实例将被销毁。

### session作用域
- 当一个bean的作用域为Session，表示在一个HTTP Session中，一个bean定义对应一个实例。该作用域仅在基于web的Spring ApplicationContext情形下有效。考虑下面bean定义：

```
<bean id="userPreferences" class="com.foo.UserPreferences" scope="session"/>
```

### 　global session作用域

- 当一个bean的作用域为Global Session，表示在一个全局的HTTP Session中，一个bean定义对应一个实例。典型情况下，仅在使用portlet context的时候有效。该作用域仅在基于web的Spring ApplicationContext情形下有效。考虑下面bean定义：
```
<bean id="user" class="com.foo.Preferences "scope="globalSession"/>
```
- global session作用域类似于标准的HTTP Session作用域，不过仅仅在基于portlet的web应用中才有意义。Portlet规范定义了全局Session的概念，它被所有构成某个portlet web应用的各种不同的portlet所共享。在global session作用域中定义的bean被限定于全局portlet Session的生命周期范围内。

### Bean实例生命周期的执行过程如下：
1. Spring对bean进行实例化，默认bean是单例；
1. Spring对bean进行依赖注入；
1. 如果bean实现了BeanNameAware接口，spring将bean的id传给setBeanName()方法；
1. 如果bean实现了BeanFactoryAware接口，spring将调用setBeanFactory方法，将BeanFactory实例传进来；
1. 如果bean实现了ApplicationContextAware接口，它的setApplicationContext()方法将被调用，将应用上下文的引用传入到bean中；
1. 如果bean实现了BeanPostProcessor接口，它的postProcessBeforeInitialization方法将被调用；
1. 如果bean实现了InitializingBean接口，spring将调用它的afterPropertiesSet接口方法，类似的如果bean使用了init-method属性声明了初始化方法，该方法也会被调用；
1. 如果bean实现了BeanPostProcessor接口，它的postProcessAfterInitialization接口方法将被调用；
1. 此时bean已经准备就绪，可以被应用程序使用了，他们将一直驻留在应用上下文中，直到该应用上下文被销毁；
1. 若bean实现了DisposableBean接口，spring将调用它的distroy()接口方法。同样的，如果bean使用了destroy-method属性声明了销毁方法，则该方法被调用；

### springBean自定义初始化和销毁方法

 **springBoot方式** 
```
public class SpringLifeCycle {
    private final static Logger LOGGER = LoggerFactory.getLogger(LifeCycleConfig.class);
    public void start(){
        LOGGER.info("bean初始化 start");
    }
    public void destroy(){
        LOGGER.info("bean销毁 destroy");
    }
}

@Configuration
public class LifeCycleConfig {
    @Bean(initMethod = "start", destroyMethod = "destroy")
    public SpringLifeCycle create(){
        SpringLifeCycle springLifeCycle = new SpringLifeCycle() ;

        return springLifeCycle ;
    }

}

@RunWith(SpringRunner.class)
@SpringBootTest
public class DemoApplicationTests {

    @Test
    public void contextLoads() {
        System.out.println("dsadsasdasd");
        SpringLifeCycle s=new SpringLifeCycle();
    }

}
```
 **传统xml配置方式** 

```
<bean id="person1" destroy-method="myDestroy" 
            init-method="myInit" class="com.test.spring.life.Person">
        <property name="name">
            <value>jack</value>
        </property>
</bean>
<!-- 配置自定义的后置处理器 -->
<bean id="postProcessor" class="com.pingan.spring.life.MyBeanPostProcessor" />
```


```
public class Person implements BeanNameAware, BeanFactoryAware,
        ApplicationContextAware, InitializingBean, DisposableBean {

    private String name;
    
    public Person() {
        System.out.println("PersonService类构造方法");
    }
    
    
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
        System.out.println("set方法被调用");
    }

    //自定义的初始化函数
    public void myInit() {
        System.out.println("myInit被调用");
    }
    
    //自定义的销毁方法
    public void myDestroy() {
        System.out.println("myDestroy被调用");
    }

    public void destroy() throws Exception {
        // TODO Auto-generated method stub
     System.out.println("destory被调用");
    }

    public void afterPropertiesSet() throws Exception {
        // TODO Auto-generated method stub
        System.out.println("afterPropertiesSet被调用");
    }

    public void setApplicationContext(ApplicationContext applicationContext)
            throws BeansException {
        // TODO Auto-generated method stub
       System.out.println("setApplicationContext被调用");
    }

    public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
        // TODO Auto-generated method stub
         System.out.println("setBeanFactory被调用,beanFactory");
    }

    public void setBeanName(String beanName) {
        // TODO Auto-generated method stub
        System.out.println("setBeanName被调用,beanName:" + beanName);
    }
    
    public String toString() {
        return "name is :" + name;
    }
public class MyBeanPostProcessor implements BeanPostProcessor {

    public Object postProcessBeforeInitialization(Object bean,
            String beanName) throws BeansException {
        // TODO Auto-generated method stub
        
        System.out.println("postProcessBeforeInitialization被调用");
        return bean;
    }

    public Object postProcessAfterInitialization(Object bean,
            String beanName) throws BeansException {
        // TODO Auto-generated method stub
        System.out.println("postProcessAfterInitialization被调用");
        return bean;
    }

}
```
 **测试类** 
```
public class MyBeanPostProcessor implements BeanPostProcessor {

    public Object postProcessBeforeInitialization(Object bean,
            String beanName) throws BeansException {
        // TODO Auto-generated method stub
        
        System.out.println("postProcessBeforeInitialization被调用");
        return bean;
    }

    public Object postProcessAfterInitialization(Object bean,
            String beanName) throws BeansException {
        // TODO Auto-generated method stub
        System.out.println("postProcessAfterInitialization被调用");
        return bean;
    }

}

public static void main(String[] args) {
        // TODO Auto-generated method stub

        System.out.println("开始初始化容器");
        ApplicationContext ac = new ClassPathXmlApplicationContext("com/test/spring/life/applicationContext.xml");
        
        System.out.println("xml加载完毕");
        Person person1 = (Person) ac.getBean("person1");
        System.out.println(person1);        
        System.out.println("关闭容器");
        ((ClassPathXmlApplicationContext)ac).close();
        
    }

```


 **使用前面定义好的Person类和MyBeanPostProcessor类，以及ApplicationContext.xml文件，main函数实现如下：** 

```
public static void main(String[] args) {
        // TODO Auto-generated method stub
        System.out.println("开始初始化容器");  
        ConfigurableBeanFactory bf = new XmlBeanFactory(new ClassPathResource("com/pingan/spring/life/applicationContext.xml"));
        System.out.println("xml加载完毕");      
        //beanFactory需要手动注册beanPostProcessor类的方法
        bf.addBeanPostProcessor(new MyBeanPostProcessor());
        Person person1 = (Person) bf.getBean("person1");
            System.out.println(person1);
        System.out.println("关闭容器");
        bf.destroySingletons();
    }
```



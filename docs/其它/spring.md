### Spring面试题
1. 聊一下Spring中的IOC和AOP

```
IOC（Inverse of Control）：控制反转，也可以称为依赖倒置。
依赖注入和控制反转是同一个概念，具体的讲：当某个角色需要另外一个角色协助的时候，在传统的程序
设计过程中，通常由调用者来创建被调用者的实例。但在spring中创建被调用者的工作不再由调用者来
完成，因此称为控制反转。
创建被调用者的工作由spring来完成，然后注入调用者 因此也称为依赖注入。 

spring以动态灵活的方式来管理对象 ， 注入的两种方式，设置注入和构造注入。 
设置注入的优点：直观，自然 
构造注入的优点：可以在构造器中决定依赖关系的顺序。 


面向切面编程（AOP）完善spring的依赖注入（DI），面向切面编程在spring中主要表现为两个方面 
1.面向切面编程提供声明式事务管理 
2.spring支持用户自定义的切面 

AOP是作为面向对象的一种补充，主要用于处理系统中分布在各个环节的的横切的关注点，比如日志记录，异常处理，缓存,事物等等。

Spring AOP使用的动态代理，所谓的动态代理就是说AOP框架不会去修改字节码，而是在内存中临时为方法生成一个AOP对象，这个AOP对象包含了目标对象的全部方法，并且在特定的切点做了增强处理，并回调原对象的方法。
```
1. Spring IOC初始化过程

```
IOC容器的初始化分为三个过程实现：

第一个过程是Resource资源定位。这个Resouce指的是BeanDefinition的资源定位。这个过程就是容器找数据的过程，就像水桶装水需要先找到水一样。

第二个过程是BeanDefinition的载入过程。这个载入过程是把用户定义好的Bean表示成Ioc容器内部的数据结构，而这个容器内部的数据结构就是BeanDefition。

第三个过程是向IOC容器注册这些BeanDefinition的过程，这个过程就是将前面的BeanDefition保存到HashMap中的过程。

上面提到的过程一般是不包括Bean的依赖注入的实现。在Spring中，Bean的载入和依赖注入是两个独立的过程。依赖注入一般发生在应用第一次通过getBean向容器索取Bean的时候。
```
1. Spring中管理的bean是单例还是多例的，是线程安全的吗？为什么？抛开框架，单例一定是线程安全的么？怎么实现线程安全的单例

```
Spring管理的Bean对象默认是单例模式
Spring框架并没有对单例bean进行任何多线程的封装处理.Spring框架中的单例bean不是线程安全的。

解决办法:
最浅显的解决办法就是将多态bean的作用域由“singleton”变更为“prototype”。

在Bean对象中尽量避免定义可变的成员变量；
在bean对象中定义一个ThreadLocal成员变量，将需要的可变成员变量保存在ThreadLocal中

抛开框架 单例在并发环境下 不一定是线程安全的。可以使使用双重锁检查实现单列模式来保证线程安全的单例
```

1. 说说Spring的事物处理以及隔离级别

```
spring的事务处理主要是依靠AOP实现的 
spring使用AOP来支持声明式事务，会根据事务属性，自动在方法调用之前决定是否开启一个事务，并在方法执行之后决定事务提交或回滚事务。

spring事物的七种事物传播属性行为及五种隔离级别
REQUIRED：支持当前事务，如果当前没有事务，就新建一个事务。这是最常见的选择。 

SUPPORTS：支持当前事务，如果当前没有事务，就以非事务方式执行。 

MANDATORY：支持当前事务，如果当前没有事务，就抛出异常。 

REQUIRES_NEW：新建事务，如果当前存在事务，把当前事务挂起。 

NOT_SUPPORTED：以非事务方式执行操作，如果当前存在事务，就把当前事务挂起。 

NEVER：以非事务方式执行，如果当前存在事务，则抛出异常。 

NESTED：支持当前事务，如果当前事务存在，则执行一个嵌套事务，如果当前没有事务，就新建一个事务

ISOLATION_DEFAULT
这是一个PlatfromTransactionManager默认的隔离级别，使用数据库默认的事务隔离级别.

另外四个与JDBC的隔离级别相对应；
ISOLATION_READ_UNCOMMITTED 
这是事务最低的隔离级别，它充许别外一个事务可以看到这个事务未提交的数据。
这种隔离级别会产生脏读，不可重复读和幻像读。

ISOLATION_READ_COMMITTED 
保证一个事务修改的数据提交后才能被另外一个事务读取。另外一个事务不能读取
该事务未提交的数据。这种事务隔离级别可以避免脏读出现，但是可能会出现不可重复读和幻像读。

ISOLATION_REPEATABLE_READ 
这种事务隔离级别可以防止脏读，不可重复读。但是可能出现幻像读。它除了保证
一个事务不能读取另一个事务未提交的数据外，还保证了避免下面的情况产生(不可重复读)。

ISOLATION_SERIALIZABLE 
这是花费最高代价但是最可靠的事务隔离级别。事务被处理为顺序执行。除了防止脏读，
不可重复读外，还避免了幻像读。
```

1. Spring Bean 的生命周期

```
Spring容器 从XML 文件中读取bean的定义，并实例化bean。

Spring根据bean的定义填充所有的属性。

如果bean实现了BeanNameAware 接口，Spring 传递bean 的ID 到 setBeanName方法。

如果Bean 实现了 BeanFactoryAware 接口， Spring传递beanfactory 给setBeanFactory 方法。

如果有任何与bean相关联的BeanPostProcessors，Spring会在postProcesserBeforeInitialization()方法内调用它们。

如果bean实现IntializingBean了，调用它的afterPropertySet方法，如果bean声明了初始化方法，调用此初始化方法。

如果有BeanPostProcessors 和bean 关联，这些bean的postProcessAfterInitialization() 方法将被调用。

如果bean实现了 DisposableBean，它将调用destroy()方法。

```

2. xml 中配置的 init、destroy 方法怎么可以做到调用什么方法？

```
在bean初始化之后要执行的初始化方法，以及在bean销毁时执行的方法。
```
 **什么是spring?** 
- Spring是个java企业级应用的开源开发框架。Spring主要用来开发Java应用，但是有些扩展是针对构建J2EE平台的web应用。Spring框架目标是简化Java企业级应用开发，并通过POJO为基础的编程模型促进良好的编程习惯。

 **使用Spring框架的好处是什么？**  
- 轻量：Spring是轻量的，基本的版本大约2MB。
- 控制反转：Spring通过控制反转实现了松散耦合，对象们给出它们的依赖，而不是创建或查找依赖的对象们。
- 面向切面的编程(AOP)：Spring支持面向切面的编程，并且把应用业务逻辑和系统服务分开。
- 容器：Spring包含并管理应用中对象的生命周期和配置。
- MVC框架：Spring的WEB框架是个精心设计的框架，是Web框架的一个很好的替代品。
- 管理：Spring提供一个持续的事务管理接口，可以扩展到上至本地事务下至全局事务（JTA）。
- 异常处理：Spring提供方便的API把具体技术相关的异常（比如由JDBC，HibernateorJDO抛出的）转化为一致的unchecked异常。

 **为什么说Spring是一个容器？** 
- 因为用来形容它用来存储单例的bean对象这个特性。

 **什么是Spring的依赖注入？** 
- 依赖注入，是IOC的一个方面，是个通常的概念，它有多种解释。这概念是说你不用创建对象，而只需要描述它如何被创建。你不在代码里直接组装你的组件和服务，但是要在配置文件里描述哪些组件需要哪些服务，之后一个容器（IOC容器）负责把他们组装起来。

 **什么是Springbeans?** 
- Springbeans是那些形成Spring应用的主干的java对象。它们被SpringIOC容器初始化，装配，和管理。这些beans通过容器中配置的元数据创建。比如，以XML文件中<bean/>的形式定义。
- Spring框架定义的beans都是单件beans。在beantag中有个属性”singleton”，如果它被赋为TRUE，bean就是单件，否则就是一个prototypebean。默认是TRUE，所以所有在Spring框架中的beans缺省都是单件。

 **Spring支持的几种bean的作用域。** 
- singleton:bean在每个Springioc容器中只有一个实例。
- prototype：一个bean的定义可以有多个实例。
- request：每次http请求都会创建一个bean，该作用域仅在基于web的SpringApplicationContext情形下有效。
- session：在一个HTTPSession中，一个bean定义对应一个实例。该作用域仅在基于web的SpringApplicationContext情形下有效
- global-session：在一个全局的HTTPSession中，一个bean定义对应一个实例。该作用域仅在基于web的SpringApplicationContext情形下有效。

 **哪些是重要的bean生命周期方法？你能重载它们吗？** 
- 两个重要的bean生命周期方法，第一个是setup，它是在容器加载bean的时候被调用。第二个方法是teardown它是在容器卸载类的时候被调用。
- Thebean标签有两个重要的属性（init-method和destroy-method）。用它们你可以自己定制初始化和注销方法。它们也有相应的注解（@PostConstruct和@PreDestroy）。

 **什么是Spring的内部bean？** 
- 当一个bean仅被用作另一个bean的属性时，它能被声明为一个内部bean，为了定义innerbean，在Spring的基于XML的配置元数据中，可以在<property/>或<constructor-arg/>元素内使用<bean/>元素，内部bean通常是匿名的，它们的Scope一般是prototype。

 **什么是bean装配?** 
- 装配，或bean装配是指在Spring容器中把bean组装到一起，前提是容器需要知道bean的依赖关系，如何通过依赖注入来把它们装配到一起。

 **什么是bean的自动装配？** 
- Spring容器能够自动装配相互合作的bean，这意味着容器不需要<constructor-arg>和<property>配置，能通过Bean工厂自动处理bean之间的协作。

 **解释不同方式的自动装配。** 
- no：默认的方式是不进行自动装配，通过显式设置ref属性来进行装配。
- byName：通过参数名自动装配，Spring容器在配置文件中发现bean的autowire属性被设置成byname，之后容器试图匹配、装配和该bean的属性具有相同名字的bean。
- byType:：通过参数类型自动装配，Spring容器在配置文件中发现bean的autowire属性被设置成byType，之后容器试图匹配、装配和该bean的属性具有相同类型的bean。如果有多个bean符合条件，则抛出错误。
- constructor：这个方式类似于byType，但是要提供给构造器参数，如果没有确定的带参数的构造器参数类型，将会抛出异常。
- autodetect：首先尝试使用constructor来自动装配，如果无法工作，则使用byType方式。


 **自动装配有哪些局限性?** 
- 重写：你仍需用<constructor-arg>和<property>配置来定义依赖，意味着总要重写自动装配。
- 基本数据类型：你不能自动装配简单的属性，如基本数据类型，String字符串，和类。
- 模糊特性：自动装配不如显式装配精确，如果有可能，建议使用显式装配。

 **Spring支持的事务管理类型** 
- Spring支持两种类型的事务管理：
- 编程式事务管理：这意味你通过编程的方式管理事务，给你带来极大的灵活性，但是难维护。
- 声明式事务管理：这意味着你可以将业务代码和事务管理分离，你只需用注解和XML配置来管理事务。

Spring框架的事务管理有哪些优点？
- 它为不同的事务API如JTA，JDBC，Hibernate，JPA和JDO，提供一个不变的编程模式。
- 它为编程式事务管理提供了一套简单的API而不是一些复杂的事务API
- 它支持声明式事务管理
- 它和Spring各种数据访问抽象层很好得集成。

 **你更倾向用那种事务管理类型？** 
- 大多数Spring框架的用户选择声明式事务管理，因为它对应用代码的影响最小，因此更符合一个无侵入的轻量级容器的思想。声明式事务管理要优于编程式事务管理，虽然比编程式事务管理（这种方式允许你通过代码控制事务）少了一点灵活性。

在SpringAOP中，关注点和横切关注的区别是什么？
- 关注点是应用中一个模块的行为，一个关注点可能会被定义成一个我们想实现的一个功能。&#x2028;横切关注点是一个关注点，此关注点是整个应用都会使用的功能，并影响整个应用，比如日志，安全和数据传输，几乎应用的每个模块都需要的功能。因此这些都属于横切关注点。

 **连接点** 
- 连接点代表一个应用程序的某个位置，在这个位置我们可以插入一个AOP切面，它实际上是个应用程序执行SpringAOP的位置。

 **通知** 
- 通知是个在方法执行前或执行后要做的动作，实际上是程序执行时要通过SpringAOP框架触发的代码段。
- Spring切面可以应用五种类型的通知：

```
before：前置通知，在一个方法执行前被调用。
after:在方法执行之后调用的通知，无论方法执行是否成功。
after-returning:仅当方法成功完成后执行的通知。
after-throwing:在方法抛出异常退出时执行的通知。
around:在方法执行之前和之后调用的通知。
```
 **切点** 
- 切入点是一个或一组连接点，通知将在这些位置执行。可以通过表达式或匹配的方式指明切入点。

 **什么是引入?** 
- 引入允许我们在已存在的类中增加新的方法和属性。

 **什么是目标对象?** 
- 被一个或者多个切面所通知的对象。它通常是一个代理对象。也指被通知（advised）对象。

 **什么是代理?** 
- 代理是通知目标对象后创建的对象。从客户端的角度看，代理对象和目标对象是一样的。

 **为什么不用工厂模式而使用IOC?** 
- 因为IOC是通过反射机制来实现的。当我们的需求出现变动时，工厂模式会需要进行相应的变化。但是IOC的反射机制允许我们不重新编译代码，因为它的对象都是动态生成的。







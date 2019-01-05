## 概述
- aop一般被叫做面向方面（切面）的编程。是作为面向对象的一种补充，主要用于处理系统中分布在各个环节的的横切的关注点，比如日志记录，异常处理，缓存,事物等等。
- aop的实现关键在于aop框架自动创建aop代理，aop代理主要分为静态代理和动态代理两种
- 静态代理的代表为AspectJ；而动态代理则以Spring AOP为代表


## 使用AspectJ的编译时增强实现AOP
AspectJ是静态代理的增强，所谓的静态代理就是AOP框架会在编译阶段生成AOP代理类，因此也称为编译时增强。

首先我们有一个普通的Hello类
```
package com.example.Proxy.aspectJ;

/**
 * AspectJ是静态代理的增强，所谓的静态代理就是AOP框架会在编译阶段生成AOP代理类<br>
 *
 * @author qinxuewu
 * @create 18/7/7下午1:57
 * @since 1.0.0
 */
public class HelloTest {
    public void sayHello() {
        System.out.println("hello");
    }
    public static void main(String[] args) {
        HelloTest h = new HelloTest();
        h.sayHello();
    }
}

```
使用AspectJ编写一个Aspect

```
public aspect TxAspect {
    void around():call(void Hello.sayHello()){
        System.out.println("开始事务 ...");
        proceed();
        System.out.println("事务结束 ...");
    }
}
```
这里模拟了一个事务的场景，类似于Spring的声明式事务。使用AspectJ的编译器编译

```
ajc -d . Hello.java TxAspect.aj
```
编译完成之后再运行这个Hello类，可以看到以下输出
```
开始事务 ...
hello
事务结束 ...
```
AOP已经生效了,它会在编译阶段将Aspect织入Java字节码中， 运行的时候就是经过增强之后的AOP对象。


## Spring AOP实现原理
- Spring AOP使用的动态代理，所谓的动态代理就是说AOP框架不会去修改字节码，而是在内存中临时为方法生成一个AOP对象，这个AOP对象包含了目标对象的全部方法，并且在特定的切点做了增强处理，并回调原对象的方法。

## Spring AOP中的动态代理主要有两种方式
 **JDK动态代理和CGLIB动态代理。** 
- JDK动态代理通过反射来接收被代理的类，并且要求被代理的类必须实现一个接口。
- JDK动态代理的核心是InvocationHandler接口和Proxy类。
- 如果目标类没有实现接口，那么Spring AOP会选择使用CGLIB来动态代理目标类
- CGLIB是一个代码生成的类库，可以在运行时动态的生成某个类的子类，注意，CGLIB是通过继承的方式做的动态代理，因此如果某个类被标记为final，那么它是无法使用CGLIB做动态代理的。

 **AspectJ 支持 5 种类型的通知注解：** 
- @Before：前置通知，在方法执行之前执行
- @After：后置通知，在方法执行之后执行 
- @AfterRunning：返回通知，在方法返回结果之后执行
- @AfterThrowing：异常通知，在方法抛出异常之后
- @Around：环绕通知，围绕着方法执行

```
package com.example.aspect;

import java.util.Arrays;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * 实现Web层的日志切面
 * @author qxw
 * 2018年3月28日
 */

@Aspect
@Component
public class WebLogAspect {

	/**
	 *  使用@Aspect注解将一个java类定义为切面类
		使用@Pointcut定义一个切入点，可以是一个规则表达式，比如下例中某个package下的所有函数，也可以是一个注解等。
		根据需要在切入点不同位置的切入内容
		使用@Before在切入点开始处切入内容
		使用@After在切入点结尾处切入内容
		使用@AfterReturning在切入点return内容之后切入内容（可以用来对处理返回值做一些加工处理）
		使用@Around在切入点前后切入内容，并自己控制何时执行切入点自身的内容
		使用@AfterThrowing用来处理当切入内容部分抛出异常之后的处理逻辑
	 */
	 private Logger logger = Logger.getLogger(getClass());
	 
	 
	   @Pointcut("execution(public * com.example.modules..*.*(..))")
	    public void webLog(){}

	    @Before("webLog()")
	    public void doBefore(JoinPoint joinPoint) throws Throwable {
	    	System.out.println("===================================webLog--------------------------------------");
	        // 接收到请求，记录请求内容
	        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
	        HttpServletRequest request = attributes.getRequest();

	        // 记录下请求内容
	        logger.info("URL : " + request.getRequestURL().toString());
	        logger.info("HTTP_METHOD : " + request.getMethod());
	        logger.info("IP : " + request.getRemoteAddr());
	        logger.info("CLASS_METHOD : " + joinPoint.getSignature().getDeclaringTypeName() + "." + joinPoint.getSignature().getName());
	        logger.info("ARGS : " + Arrays.toString(joinPoint.getArgs()));

	    }

	    @AfterReturning(returning = "ret", pointcut = "webLog()")
	    public void doAfterReturning(Object ret) throws Throwable {
	        // 处理完请求，返回内容
	        logger.info("RESPONSE : " + ret);
	    }
}

```
## jdk动态代理实现

```
//定义一个接口
public interface UserService {
	public String getName(int id);  
	  
    public Integer getAge(int id);  
}

//实现类
public class UserServiceImpl implements UserService {

	@Override
	public String getName(int id) {
			System.out.println("------ 方法  getName  被调用------");
	        return "Tom"; 
	}

	@Override
	public Integer getAge(int id) {
		   System.out.println("------方法  getAge  被调用------");
	        return 10;  
	}

}
```

```
/**
 * jdk动态代理实现
 * @author qxw
 * 2018年1月23日
 */
public class MyInvocationHandler implements InvocationHandler {
	 // 目标对象   
    private Object target;  
      
    /** 
     * 构造方法 
     * @param target 目标对象  
     */  
    public MyInvocationHandler(Object target) {  
        super();  
        this.target = target;  
    }
    /** 
     * 执行目标对象的方法 
     */  
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {  
          
    	System.out.println("调用的方法------------  "+method.getName());
        // 在目标对象的方法执行之前简单的打印一下  
        System.out.println("------------------在目标对象的方法执行之前简单的打印一下   before------------------");
          
        // 执行目标对象的方法  
        Object result = method.invoke(target, args);  
          
        // 在目标对象的方法执行之后简单的打印一下  
        System.out.println("-------------------在目标对象的方法执行之后简单的打印一下 after------------------");
          
        return result;  
    }
    /** 
     * 获取目标对象的代理对象 
     * @return 代理对象 
     */  
    public Object getProxy() {  
        return Proxy.newProxyInstance(Thread.currentThread().getContextClassLoader(),target.getClass().getInterfaces(), this);  
    }  
}


/**
 * 使用动态代理   基本上就是AOP的一个简单实现了
 * 目标对象的方法执行之前和执行之后进行了增强。Spring的AOP实现其实也是用了Proxy和InvocationHandler这两个东西的。 
 * @author qxw
 * 2018年1月23日
 */
public class ProxyTest {
	/**
	 * 代理模式是一种常用的设计模式，其目的就是为其他对象提供一个代理以控制对某个真实对象的访问。
	 * 代理类负责为委托类预处理消息，过滤消息并转发消息，以及进行消息被委托类执行后的后续处理
	 * @param args
	 */
	public static void main(String[] args) {
		  // 实例化目标对象  
        UserService userService = new UserServiceImpl();  
        
        List<String> list=new ArrayList<>();
        // 实例化InvocationHandler  
        MyInvocationHandler invocationHandler = new MyInvocationHandler(userService);            
        
        MyInvocationHandler invocationHandler2 = new MyInvocationHandler(list);  
        // 根据目标对象生成代理对象  
        UserService proxy = (UserService) invocationHandler.getProxy();  
          
        List<String> proxy2=(List<String>) invocationHandler2.getProxy();
        
        // 调用代理对象的方法  
        proxy.getName(11);
        proxy2.add("dsdsdsds");
        
	}
}

```
## cglib 动态代理

```
public class UserDaoImpl {

    public void add(Object o) {
        System.out.println("UserDAO -> Add: " + o.toString());
    }

    public void get(Object o) {
        System.out.println("UserDAO -> Get: " + o.toString());
    }
}

```

```
public class CGLibProxyFactory {
        public  Object target;
        public CGLibProxyFactory(Object target) {
            this.target = target;
        }

    private Callback callback = new MethodInterceptor(){
        /**
         *
         * @param obj   代理对象
         * @param method    当期调用方法
         * @param args  方法参数
         * @param proxy 被调用方法的代理对象(用于执行父类的方法)
         * @return
         * @throws Throwable
         */
        @Override
        public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable {
            // 前置增强
            System.out.println("+ Before Advice ...");

            // 执行目标方法
            //Object result = method.invoke(target, args);
            Object result = proxy.invoke(target, args);

            // 后置增强
            System.out.println("+ After Advice ...");

            return result;
        }
    };

    public Object createProxy() {

        // 1. 创建Enhancer对象
        Enhancer enhancer = new Enhancer();

        // 2. cglib创建代理, 对目标对象创建子对象
        enhancer.setSuperclass(target.getClass());

        // 3. 传入回调接口, 对目标增强
        enhancer.setCallback(callback);

        return enhancer.create();
    }
    public static void main(String[] args) {
        UserDaoImpl user=(UserDaoImpl) new CGLibProxyFactory(new UserDaoImpl()).createProxy();
        user.get("get qxw");
        user.add("add qdddasdasdada");
    }

}
```




## 小结
- AspectJ在编译时就增强了目标对象，Spring AOP的动态代理则是在每次运行时动态的增强，生成AOP代理对象，区别在于生成AOP代理对象的时机不同，相对来说AspectJ的静态代理方式具有更好的性能，但是AspectJ需要特定的编译器进行处理，而Spring AOP则无需特定的编译器处理。


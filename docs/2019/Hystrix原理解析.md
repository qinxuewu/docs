## hystrix与高可用系统架构
- hystrix，框架，提供了高可用相关的各种各样的功能，然后确保说在hystrix的保护下，整个系统可以长期处于高可用的状态，100%，99.99999%
- hystrix的特点：线程资源隔离、限流、熔断、降级、运维监控
- 资源隔离：让你的系统里，某一块东西，在故障的情况下，不会耗尽系统所有的资源，比如线程资源
- 限流：高并发的流量涌入进来，比如说突然间一秒钟100万QPS，废掉了，10万QPS进入系统，其他90万QPS被拒绝了
- 熔断：系统后端的一些依赖，出了一些故障，比如说mysql挂掉了，每次请求都是报错的，熔断了，后续的请求过来直接不接收了，拒绝访问，10分钟之后再尝试去看看mysql恢复没有
- 降级：mysql挂了，系统发现了，自动降级，从内存里存的少量数据中，去提取一些数据出来
- 运维监控：监控+报警+优化，各种异常的情况，有问题就及时报警，优化一些系统的配置和参数，或者代码

### Hystrix的设计原则是什么
- 1）对依赖服务调用时出现的调用延迟和调用失败进行控制和容错保护
- 2）在复杂的分布式系统中，阻止某一个依赖服务的故障在整个系统中蔓延
- 3）提供fail-fast（快速失败）和快速恢复的支持
- 4）提供fallback优雅降级的支持
- 5）支持近实时的监控、报警以及运维操作

### Hystrix的更加细节的设计原则是什么
- 1）阻止任何一个依赖服务耗尽所有的资源，比如tomcat中的所有线程资源
- 2）避免请求排队和积压，采用限流和fail fast来控制故障
- 3）提供fallback降级机制来应对故障
- 4）使用资源隔离技术，比如bulkhead（舱壁隔离技术），swimlane（泳道技术），circuit breaker（短路技术），来限制任何一个依赖服务的故障的影响
- 5）通过近实时的统计/监控/报警功能，来提高故障发现的速度
- 6）通过近实时的属性和配置热修改功能，来提高故障处理和恢复的速度
- 7）保护依赖服务调用的所有故障情况，而不仅仅只是网络故障情况

### Hystrix是如何实现它的目标的
- 1）通过`HystrixCommand`或者`HystrixObservableCommand`来封装对外部依赖的访问请求，这个访问请求一般会运行在独立的线程中，资源隔离
- 2）对于超出我们设定阈值的服务调用，直接进行超时，不允许其耗费过长时间阻塞住。这个超时时间默认是`99.5%`的访问时间，但是一般我们可以自己设置一下
- 3）为每一个依赖服务维护一个`独立的线程池`，或者是`semaphore`，当线程池已满时，直接拒绝对这个服务的调用
- 4）对依赖服务的调用的成功次数，失败次数，拒绝次数，超时次数，进行统计
- 5）如果对一个依赖服务的调用失败次数超过了一定的阈值，自动进行熔断，在一定时间内对该服务的调用直接降级，一段时间后再自动尝试恢复
- 6）当一个服务调用出现失败，被拒绝，超时，短路等异常情况时，自动调用fallback降级机制
- 7）对属性和配置的修改提供近实时的支持
- hystrix进行资源隔离，其实是提供了一个抽象，叫做command，就是说，你如果要把对某一个依赖服务的所有调用请求，全部隔离在同一份资源池内。对这个依赖服务的所有调用请求，全部走这个资源池内的资源，不会去用其他的资源了，这个就叫做资源隔离
- hystrix最最基本的资源隔离的技术，线程池隔离技术，对某一个依赖服务，商品服务，所有的调用请求，全部隔离到一个线程池内，对商品服务的每次调用请求都封装在一个command里面，每个command（每次服务调用请求）都是使用线程池内的一个线程去执行的。所以哪怕是对这个依赖服务，商品服务，现在同时发起的调用量已经到了1000了，但是线程池内就10个线程，最多就只会用这10个线程去执行。不会说，对商品服务的请求，因为接口调用延迟，将tomcat内部所有的线程资源全部耗尽，不会出现了

### Hystrix常用方法
- HystrixCommand：是用来获取一条数据的
- HystrixObservableCommand：是设计用来获取多条数据的
- 同步执行：`new CommandHelloWorld("World").execute()`，`new ObservableCommandHelloWorld("World").toBlocking().toFuture().get()`
- 异步执行：`new CommandHelloWorld("World").queue()`，`new ObservableCommandHelloWorld("World").toBlocking().toFuture()`
- 对command调用queue()，仅仅将command放入线程池的一个等待队列，就立即返回，拿到一个Future对象，后面可以做一些其他的事情，然后过一段时间对future调用get()方法获取数据

### Hystrix不同的执行方式
- execute()，获取一个 Future.get()，然后拿到单个结果。
- queue()，返回一个 Future。
- observe()，立即订阅 Observable，然后启动 8 大执行步骤，返回一个拷贝的 - Observable，订阅时立即回调给你结果。
- toObservable()，返回一个原始的 Observable，必须手动订阅才会去执行 8 大步骤。

### Hystrix常见参数设置
- `withCircuitBreakerEnabled`:控制短路器是否允许工作，包括跟踪依赖服务调用的健康状况，以及对异常情况过多时是否允许触发短路，默认是true
- `withCircuitBreakerRequestVolumeThreshold`:设置滑动窗口中，最少要有多少个请求时，才触发开启短路,举例来说，如果设置为20（默认值），那么在一个10秒的滑动窗口内，如果只有19个请求，即使这19个请求都是异常的，也是不会触发开启短路器的
- `withCircuitBreakerSleepWindowInMilliseconds`:设置在短路之后，需要在多长时间内直接reject请求，然后在这段时间之后,尝试允许请求通过以及自动恢复，默认值是5000毫秒
- `withCircuitBreakerErrorThresholdPercentage`:设置异常请求量的百分比，当异常请求达到这个百分比时，就触发打开短路器，默认是50，也就是50%
- `withCircuitBreakerForceOpen`:如果设置为true的话，直接强迫打开短路器，相当于是手动短路了，手动降级，默认false
- `withCircuitBreakerForceClosed`:如果设置为ture的话，直接强迫关闭短路器，相当于是手动停止短路了，手动升级，默认false
- `execution.isolation.strategy`:strategy，设置为SEMAPHORE，那么hystrix就会用semaphore机制来替代线程池机制，来对依赖服务的访问进行限流,如果通过semaphore调用的时候，底层的网络调用延迟很严重，那么是无法timeout的，只能一直block住,一旦请求数量超过了semephore限定的数量之后，就会立即开启限流
- `withCoreSize`：设置你的线程池的大小
- `withMaxQueueSize：`设置的是你的等待队列，缓冲队列的大小
- `withQueueSizeRejectionThreshol`:如果withMaxQueueSize<withQueueSizeRejectionThreshold，那么取的是withMaxQueueSize，反之，取得是withQueueSizeRejectionThreshold；线程池本身的大小，如果你不设置另外两个queue相关的参数，等待队列是关闭的
- `timeoutInMilliseconds`:手动设置timeout时长，一个command运行超出这个时间，就被认为是timeout，然后将hystrixcommand标识为timeout，同时执行fallback降级逻辑。默认是1000，也就是1000毫秒
- `withExecutionTimeoutEnabled`:控制是否要打开timeout机制，默认是true
- 

### Hystrixz执行的整个工作流程
![hystrix执行流程.png](http://ww1.sinaimg.cn/large/0068QeGHgy1g8vcnody2jj30dc0he75g.jpg)

- 步骤一：创建 command,一个 HystrixCommand 或 HystrixObservableCommand 对象，代表了对某个依赖服务发起的一次请求或者调用。创建的时候，可以在构造函数中传入任何需要的参数。
- 步骤二：调用 command执行方法,执行command，就可以发起一次对依赖服务的调用。要执行 command，可以在4个方法中选择其中的一个：execute()、queue()、observe()、toObservable()。
- 步骤三：检查是否开启缓存，如果这个 command 开启了请求缓存 Request Cache，而且这个调用的结果在缓存中存在，那么直接从缓存中返回结果。否则，继续往后的步骤
- 步骤四：检查是否开启了断路器，检查这个command对应的依赖服务是否开启了断路器。如果断路器被打开了，那么Hystrix就不会执行这个command，而是直接去执行 fallback 降级机制，返回降级结果。
- 步骤五：检查线程池/队列/信号量是否已满，如果这个command线程池和队列已满，或者 semaphore 信号量已满，那么也不会执行 command，而是直接去调用 fallback 降级机制，同时发送 reject 信息给断路器统计。
- 步骤六：执行 command，调用 HystrixObservableCommand 对象的construct() 方法，或者 HystrixCommand 的 run() 方法来实际执行这个 command。
- 步骤七：断路健康检查，Hystrix会把每一个依赖服务的调用成功、失败、Reject、Timeout 等事件发送给 circuit breaker 断路器。断路器就会对这些事件的次数进行统计，根据异常事件发生的比例来决定是否要进行断路（熔断）。如果打开了断路器，那么在接下来一段时间内，会直接断路，返回降级结果。
- 步骤八：调用 fallback 降级机制，在以下几种情况中，Hystrix 会调用 fallback 降级机制。断路器处于打开状态；线程池/队列/semaphore满了；command 执行超时；run() 或者 construct() 抛出异常

### 线程程池隔离技术与信号量隔离技术的区别
- 线程池隔离技术,并不是说，去控制类似Tomcat这种Web容器,控制的是Tomcat线程的执行，线程池满后，确保Tomcat线程不会因为依赖服务的接口调用延迟或故障，tomcat其他线程不会卡死，快速返回支撑其他的操作
- 线程池隔离技术是用自己的线程去执行调用;信号量隔离技术是直接让Tomcat线程去调用依赖服务，它只是一道关卡，控制请求的数量
- 线程池：适合绝大多数的场景，99%的，线程池，对依赖服务的网络请求的调用和访问，timeout这种问题
- 信号量：适合，你的访问不是对外部依赖的访问，而是对内部的一些比较复杂的业务逻辑的访问，但是像这种访问，系统内部的代码，其实不涉及任何的网络请求，那么只要做信号量的普通限流就可以了，因为不需要去捕获timeout类似的问题

### HystrixCommand解析
- command key，代表了一类command，一般来说，代表了底层的依赖服务的一个接口
- command group，代表了某一个底层的依赖服务，合理，一个依赖服务可能会暴露出来多个接口，每个接口就是一个command key
- command group，在逻辑上去组织起来一堆command-key的调用，统计信息，成功次数，timeout超时次数，失败次数，可以看到某一个服务整体的一些访问情况
- 一般来说，推荐是根据一个服务去划分出一个线程池，command key默认都是属于同一个线程池的
- HystrixCommand在提交到线程池之前，其实会先进入一个队列中，这个队列满了之后，才会reject  默认值是5


### Hystrix的request cache运行流程
- hystrix有一个reqeust-context，请求上下文的概念，它可以对每一个请求都施加一个请求上下文。在一次请求上下文中，如果有多个command，参数都是一样的，调用的接口也是一样的，其实结果可以认为也是一样的，我们就可以让第一次command执行，返回的结果，被缓存在内存中，然后这个请求上下文中，后续的其他对这个依赖的调用全部从内存中取用缓存结果就可以了
- HystrixCommand和HystrixObservableCommand都可以指定一个缓存key，然后hystrix会自动进行缓存，接着在同一个request-context内，再次访问的时候，就会直接取用缓存
-

### Hystrix的fallback降级机制
- 对每个外部依赖，无论是服务接口，中间件，资源隔离，对外部依赖只能用一定量的资源去访问，线程池/信号量，如果资源池已满，reject,访问外部依赖的时候，访问时间过长，可能就会导致超时，报一个TimeoutException异常，timeout,都会去调用fallback降级机制
- 短路器发现异常事件的占比达到了一定的比例，直接开启短路
- run()抛出异常，超时，线程池或信号量满了，或短路了，都会调用fallback机制
- 两种最经典的降级机制：纯内存数据，默认值

### Hystrix短路器深入的工作原理
- 如果经过短路器的流量超过了一定的阈值，可能看起来是这样子的，要求在10s内，经过短路器的流量必须达到20个；在10s内，经过短路器的流量才10个，那么根本不会去判断要不要短路
- 如果断路器统计到的异常调用的占比超过了一定的阈值,比如说在10s内，经过短路器的流量（只要执行一个command，这个请求就一定会经过短路器）达到了30个；同时其中异常的访问数量，占到了一定的比例，比如说60%的请求都是异常会开启短路

### Hystrix线程池机制的优点
- 1）任何一个依赖服务都可以被隔离在自己的线程池内，即使自己的线程池资源填满了，也不会影响任何其他的服务调用
- 2）服务可以随时引入一个新的依赖服务，因为即使这个新的依赖服务有问题，也不会影响其他任何服务的调用
- 3）当一个故障的依赖服务重新变好的时候，可以通过清理掉线程池，瞬间恢复该服务的调用，而如果是tomcat线程池被占满，再恢复就很麻烦
- 4）如果一个client调用库配置有问题，线程池的健康状况随时会报告，比如成功/失败/拒绝/超时的次数统计，然后可以近实时热修改依赖服务的调用配置，而不用停机
- 5）如果一个服务本身发生了修改，需要重新调整配置，此时线程池的健康状况也可以随时发现
- 6）基于线程池的异步本质，可以在同步的调用之上，构建一层异步调用层
- 最大的好处，就是资源隔离，确保说，任何一个依赖服务故障，不会拖垮当前的这个服务

### Hystrix线程池机制的缺点
- 线程池机制最大的缺点就是增加了cpu的开销，除了tomcat本身的调用线程之外，还有hystrix自己管理的线程池
- 每个command的执行都依托一个独立的线程，会进行排队，调度，还有上下文切换
- Hystrix官方自己做了一个多线程异步带来的额外开销，通过对比多线程异步调用+同步调用得出，Netflix-API每天通过hystrix执行10亿次调用，每个服务实例有40个以上的线程池，每个线程池有10个左右的线程,最后发现说，用hystrix的额外开销，就是给请求带来了3ms左右的延时，最多延时在10ms以内，相比于可用性和稳定性的提升，这是可以接受的

### Hystrix请求合并技术request collapser
- 当获取一个商品相关数据时，需要发送多次网络请求，调用多次接口，才能拿到结果，可以使用`HystrixCollapser`将多个`HystrixCommand`合并到一起，多个command放在一个command里面去执行，发送一次网络请求，就拉取到多条数据
- 可以减少高并发访问下需要使用的线程数量以及网络连接数量，这都是hystrix自动进行的

> 请求合并的三种级别：

- global context，tomcat所有调用线程，对一个依赖服务的任何一个command调用都可以被合并在一起，hystrix就传递一个HystrixRequestContext
- user request context，tomcat内某一个调用线程，将某一个tomcat线程对某个依赖服务的多个command调用合并在一起
- object modeling，基于对象的请求合并，如果有几百个对象，遍历后依次调用每个对象的某个方法，可能导致发起几百次网络请求，基于hystrix可以自动将对多个对象模型的调用合并到一起
- 使用请求合并技术的开销就是导致延迟大幅度增加，因为需要一定的时间将多个请求合并起来



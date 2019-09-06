- [Zookeeper 伪集群安装部署操作](https://blog.csdn.net/u010391342/article/details/81671239) 
- [Java操作Zookeeper实现分布式锁和队列](https://blog.csdn.net/u010391342/article/details/82192933)



### 分布式事物
- 分布式事务是指事务的参与者，支持事务的服务器，资源服务器分别位于分布式系统的不同节点之上，通常一个分布式事物中会涉及到对多个数据源或业务系统的操作。
- 典型的分布式事务场景：跨银行转操作就涉及调用两个异地银行服务

### CAP理论
- CAP理论：一个分布式系统不可能同时满足一致性，可用性和分区容错性这个三个基本需求，最多只能同时满足其中两项
- 一致性：数据在多个副本之间是否能够保持一致的特性。
- 可用性：是指系统提供的服务必须一致处于可用状态，对于每一个用户的请求总是在有限的时间内返回结果，超过时间就认为系统是不可用的
- 分区容错性：分布式系统在遇到任何网络分区故障的时候，仍然需要能够保证对外提供满足一致性和可用性的服务，除非整个网络环境都发生故障。

### CAP定理的应用
- 放弃P：如果希望能够避免系统出现分区容错性问题，一种较为简单的做法就是将所有的数据(或者是与事物先相关的数据)都放在一个分布式节点上，这样索然无法保证100%系统不会出错，但至少不会碰到由于网络分区带来的负面影响
- 放弃A:其做法是一旦系统遇到网络分区或其他故障时，那马受到影响的服务需要等待一定的时间，英雌等待期间系统无法对外提供正常的服务，即不可用
- 放弃C:这里说的放弃一致性，并不是完全不需要数据一致性，是指放弃数据的强一致性，保留数据的最终一致性。

### BASE理论
- BASE是基本可用，软状态，最终一致性。是对CAP中一致性和可用性权限的结果，是基于CAP定理演化而来的，核心思想是即使无法做到强一致性，但每个应用都可以根据自身的业务特定，采用适当的方式来使系统达到最终一致性

### 2PC提交
- 二阶段提交协议是将食物的提交过程分成提交事务请求和执行事务提交两个阶段进行处理。

> 阶段1：提交事物请求

- 事务询问：协调者向所有的参与者发送事物内容，询问是否可以执行事务提交操作，并开始等待各参与者的响应
- 执行事务：各参与者节点执行事物操作，并将Undo和Redo信息记入事务日志中
- 如果参与者成功执事务操作，就反馈给协调者Yes响应，表示事物可以执行，如果没有成功执行事务，就反馈给协调者No响应，表示事务不可以执行
- 二阶段提交一些的阶段一夜被称为投票阶段，即各参与者投票票表明是否可以继续执行接下去的事物提交操作

> 阶段二：执行事物提交

- 假如协调者从所有的参与者或得反馈都是Yes响应，那马就会执行事务提交。
- 发送提交请求：协调者向所有参与者节点发出Commit请求
- 事务提交：参与者接受到Commit请求后，会正式执行事物提交操作，并在完成提交之后放弃整个事务执行期间占用的事务资源
-  反馈事务提交结果:参与者在完成事物提交之后，向协调者发送ACK消息
-  完成事务：协调者接收到所有参与者反馈的ACK消息后，完成事物

> 中断事务

- 假如任何一个参与者向协调者反馈了No响应，或者在等待超市之后，协调者尚无法接收到所有参与者的反馈响应，那么就中断事物。
- 发送回滚请求：协调者向搜优参与者节点发出Rollback请求
- 事物回滚：参与者接收到Rollback请求后，会利用其在阶段一种记录的Undo信息执行事物回滚操作，并在完成回滚之后释放事务执行期间占用的资源。
- 反馈事务回滚结果：参与则在完成事务回滚之后，向协调者发送ACK消息
- 中断事务：协调者接收到所有参与者反馈的ACk消息后，完成事务中断、

> 优缺点

- 原理简单，实现方便
- 缺点是同步阻塞，单点问题，脑裂，保守

### 3PC提交
- 三阶段提，也叫三阶段提交协议，是二阶段提交（2PC）的改进版本。
- 与两阶段提交不同的是，三阶段提交有两个改动点。引入超时机制。同时在协调者和参与者中都引入超时机制。在第一阶段和第二阶段中插入一个准备阶段。保证了在最后提交阶段之前各参与节点的状态是一致的。
- 阶段提交就有CanCommit、PreCommit、DoCommit三个阶段。

### zookeeper集群的角色
- zk中共有三种角色：leader,follower,observer。
- leader可以为客户端提供读写服务。follower和observer只能提供读服务，并且observer不参与leader选择过程，也不参与’过半写成功‘的策略。

### ZAB协议的核心思想

> ZAB协议的核心是定义了对于那些会改变Zookeeper服务器数据状态的事务请求的处理方式即：

- 所有事务请求必须由一个全局唯一的服务器来协调处理，这样的服务器被称为leader服务器，而余下的其它服务则称为follower服务。leader服务器负责将客户端事务请求转换成一个事务提议，并将提议分发给集群中所有的ollower服务，之后leader服务器需要等待所有follower服务反馈，一旦超过半数的follower服务进行了正确的反馈后，那么leader服务器机会再次向所有的follower服务分发commit消息，要求将前一个的提议进行提交。

### ZAB协议两种模式
- ZAB协议包括两种基本模式：崩溃恢复和原子广播。
- 当整个服务框架子啊启动过程中，或是当leader服务器出现网络故障，崩溃退出与重启等异常情况时，ZAB协议就会进入恢复模式并选举产生新的Leader服务器。
- 当选择产生了新的leader服务器，同时集群中已经有过半的机器与该leader服务器完成了同步状态之后，ZAB协议就会退出恢复模式。所谓的状态同步是指数据同步，用来保证集群中存在过半的机器能够和Leader服务器的数据状态保持一致。

### ZAB协议消息广播流程图

![ZAB协议消息广播](https://imgconvert.csdnimg.cn/aHR0cDovL3d4My5zaW5haW1nLmNuL2xhcmdlLzAwNjhRZUdIZ3kxZzZnemdhOTR6OGozMGtwMGRuZGkxLmpwZw?x-oss-process=image/format,png)

- ZAB协议和二阶段提交有所不同，移除了中断逻辑，所有Follower服务的正常反馈Leader的提议，要吗就丢弃
- 同时过半Follower服务反馈ACK后就可以开始提交事务的提议Proposal,而不需要等待集群中所有的Follower都反馈ACK
- 但是这种模式无法解决Leader服务器崩溃退出而带来的数据不一致性问题。
- 在消息广播的过程中，Leader会为每一个事务Proposal分配一个全局递增唯一的ID。
- 每一个Follower在接收到这个事务的Proposal之后，会将其以事务日志的形式写入到磁盘中去，并向Leader反馈ACK。
- 当Leader收到半数节点的ACK时，会广播一个commit消息通知其他节点进行事务提交，同时自己也完成事务提交

### ZAB协议奔溃恢复
- 当leader服务出现故障或过半的follower与leader服务失去联系就会进入崩溃恢复模式
- Leader选举算法应该保证：已经在Leader上提交的事务最终也被其他节点都提交，即使出现了Leader挂掉，Commit消息没发出去这种情况。
- 确保丢弃只在Leader上被提出的事务。Leader提出一个事务后挂了，集群中别的节点都没收到，当挂掉的节点恢复后，要确保丢弃那个事务。
- 让Leader选举算法能够保证新选举出来的Leader拥有最大的事务ID的Proposal。

### SpringBoot集成Zookeeper实战

> pom.xml引入zk依赖

```java
 <dependency>
     <groupId>org.apache.zookeeper</groupId>
     <artifactId>zookeeper</artifactId>
     <version>3.5.5</version>
 </dependency>
```
> application.yml配置

```java
zookeeper:
  address: 127.0.0.1:2181
  timeout: 4000
```

> ZookeeperConfig配置类

```java

@Configuration
public class ZookeeperConfig {
    private static final Logger logger = LoggerFactory.getLogger(ZookeeperConfig.class);

    @Value("${zookeeper.address}")
    private    String connectString;

    @Value("${zookeeper.timeout}")
    private  int timeout;


    @Bean(name = "zkClient")
    public ZooKeeper zkClient(){
        ZooKeeper zooKeeper=null;
        try {
            final CountDownLatch countDownLatch = new CountDownLatch(1);
            //连接成功后，会回调watcher监听，此连接操作是异步的，执行完new语句后，直接调用后续代码
            //  可指定多台服务地址 127.0.0.1:2181,127.0.0.1:2182,127.0.0.1:2183
             zooKeeper = new ZooKeeper(connectString, timeout, new Watcher() {
                @Override
                public void process(WatchedEvent event) {
                    if(Event.KeeperState.SyncConnected==event.getState()){
                        //如果收到了服务端的响应事件,连接成功
                        countDownLatch.countDown();
                    }
                }
            });
            countDownLatch.await();
            logger.info("【初始化ZooKeeper连接状态....】={}",zooKeeper.getState());

        }catch (Exception e){
            logger.error("初始化ZooKeeper连接异常....】={}",e);
        }
         return  zooKeeper;
    }


}

```

> zk客户端zpi封装工具类

```java 
@Component
public class ZkApi {

    private static final Logger logger = LoggerFactory.getLogger(ZkApi.class);

    @Autowired
    private ZooKeeper zkClient;


    /**
     * 判断指定节点是否存在
     * @param path
     * @param needWatch  指定是否复用zookeeper中默认的Watcher
     * @return
     */
    public Stat exists(String path, boolean needWatch){
        try {
            return zkClient.exists(path,needWatch);
        } catch (Exception e) {
            logger.error("【断指定节点是否存在异常】{},{}",path,e);
            return null;
        }
    }

    /**
     *  检测结点是否存在 并设置监听事件
     *      三种监听类型： 创建，删除，更新
     *
     * @param path
     * @param watcher  传入指定的监听类
     * @return
     */
    public Stat exists(String path,Watcher watcher ){
        try {
            return zkClient.exists(path,watcher);
        } catch (Exception e) {
            logger.error("【断指定节点是否存在异常】{},{}",path,e);
            return null;
        }
    }

    /**
     * 创建持久化节点
     * @param path
     * @param data
     */
    public boolean createNode(String path, String data){
        try {
            zkClient.create(path,data.getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE,CreateMode.PERSISTENT);
            return true;
        } catch (Exception e) {
            logger.error("【创建持久化节点异常】{},{},{}",path,data,e);
            return false;
        }
    }


    /**
     * 修改持久化节点
     * @param path
     * @param data
     */
    public boolean updateNode(String path, String data){
        try {
            //zk的数据版本是从0开始计数的。如果客户端传入的是-1，则表示zk服务器需要基于最新的数据进行更新。如果对zk的数据节点的更新操作没有原子性要求则可以使用-1.
            //version参数指定要更新的数据的版本, 如果version和真实的版本不同, 更新操作将失败. 指定version为-1则忽略版本检查
            zkClient.setData(path,data.getBytes(),-1);
            return true;
        } catch (Exception e) {
            logger.error("【修改持久化节点异常】{},{},{}",path,data,e);
            return false;
        }
    }

    /**
     * 删除持久化节点
     * @param path
     */
    public boolean deleteNode(String path){
        try {
            //version参数指定要更新的数据的版本, 如果version和真实的版本不同, 更新操作将失败. 指定version为-1则忽略版本检查
            zkClient.delete(path,-1);
            return true;
        } catch (Exception e) {
            logger.error("【删除持久化节点异常】{},{}",path,e);
            return false;
        }
    }

    /**
      * 获取当前节点的子节点(不包含孙子节点)
      * @param path 父节点path
      */
    public List<String> getChildren(String path) throws KeeperException, InterruptedException{
        List<String> list = zkClient.getChildren(path, false);
        return list;
    }

    /**
     * 获取指定节点的值
     * @param path
     * @return
     */
    public  String getData(String path,Watcher watcher){
        try {
            Stat stat=new Stat();
            byte[] bytes=zkClient.getData(path,watcher,stat);
            return  new String(bytes);
        }catch (Exception e){
            e.printStackTrace();
            return  null;
        }
    }


    /**
     * 测试方法  初始化
     */
    @PostConstruct
    public  void init(){
        String path="/zk-watcher-2";
        logger.info("【执行初始化测试方法。。。。。。。。。。。。】");
        createNode(path,"测试");
        String value=getData(path,new WatcherApi());
        logger.info("【执行初始化测试方法getData返回值。。。。。。。。。。。。】={}",value);

        // 删除节点出发 监听事件
        deleteNode(path);

    }

}

```

> 实现Watcher监听

```java
public class WatcherApi implements Watcher {

    private static final Logger logger = LoggerFactory.getLogger(WatcherApi.class);
    @Override
    public void process(WatchedEvent event) {
        logger.info("【Watcher监听事件】={}",event.getState());
        logger.info("【监听路径为】={}",event.getPath());
        logger.info("【监听的类型为】={}",event.getType()); //  三种监听类型： 创建，删除，更新
    }
}

```

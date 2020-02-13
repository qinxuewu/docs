[TOC]

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


### Paxos算法的原理
- 在Paxos算法中，有三种角色：`Proposer,Acceptor,Learners`
- 一个进程可能既是Proposer又是Acceptor又是Learner。Proposer负责提出提案，Acceptor负责对提案作出裁决（accept与否），learner负责学习提案结果。

![Paxos](http://tva3.sinaimg.cn/large/0068QeGHgy1gbtjqcirrjj30yg0jewi2.jpg)



#### 阶段一（prepare阶段）
- Proposer选择一个提案编号N，然后向半数以上的Acceptor发送编号为N的Prepare请求。Pareper（N）
- 如果一个Acceptor收到一个编号为N的Prepare请求，如果小于它已经响应过的请求，则拒绝
- 若N大于该Acceptor已经响应过的所有Prepare请求的编号（maxN），那么它就会将它已经接受过（已经经过第二阶段accept的提案）的编号最大的提案作为响应反馈给Proposer，同时该Acceptor承诺不再接受任何编号小于N的提案。

#### Paxos算法的活锁问题
![Paxos活锁](http://tvax1.sinaimg.cn/large/0068QeGHgy1gbtk2u66ccj30m809u40m.jpg)

- 在算法运行过程中，可能还会存在一种极端情况，当有两个proposer依次提出一系列编号递增的议案，那么会陷入死循环，无法完成第二阶段，也就是无法选定一个提案
- 通过选取主Proposer，就可以保证Paxos算法的活性。选择一个主Proposer，并规定只有主Proposer才能提出议案。这样一来，只要主Proposer和过半的Acceptor能够正常进行网络通信，那么肯定会有一个提案被批准（第二阶段的accept），则可以解决死循环导致的活锁问题。



#### 阶段二（accept阶段）
- 如果一个Proposer收到半数以上Acceptor对其发出的编号为N的Prepare请求的响应，那么它就会发送一个针对[N,V]提案的Accept请求给半数以上的Acceptor
- 如果Acceptor收到一个针对编号为N的提案的Accept请求，只要该Acceptor没有对编号大于N的Prepare请求做出过响应，它就接受该提案。如果N小于Acceptor以及响应的prepare请求，则拒绝


### raft共识算法详解
- `Raft`是一个用于管理日志一致性的协议。它将分布式一致性分解为多个子问题：Leader选举、日志复制（Log-replication）、安全性（Safety）、日志压缩（Log compaction）等
- Raft将系统中的角色分为领导者`（Leader）`、跟从者`（Follower）`和候选者`（Candidate）`
- Raft算法将时间分为一个个的任期`（term`），每一个`term`的开始都是Leader选举。在成功选举Leader之后，Leader会在整个term内管理整个集群。如果Leader选举失败，该term就会因为没有Leader而结束
- 每一个任期的开始都是一次选举，一个或多个候选人会试图成为领导人。如果一个候选人赢得了选举，它就会在该任期的剩余时间担任领导人。在某些情况下，选票会被瓜分，有可能没有选出领导人，那么，将会开始另一个任期，并且立刻开始下一次选举。Raft算法保证在给定的一个任期最多只有一个领导人

#### Leader选举
- Raft 使用心跳触发Leader选举,当服务器启动时，初始化为`Follower`,如果服务器中已有`Leader`就向所有Followers周期性发送`heartbeat`。如果`Follower`在选举超时时间内没有收到Leader的heartbeat，就会等待一段随机的时间后发起一次Leader选举。
- 每一个`follower`都有一个时钟，是一个随机的值，表示的是follower等待成为leader的时间，谁的时钟先跑完，则发起leader选举
- Follower将其当前`term`加一然后转换为`Candidate`。它首先给自己投票并且给集群中的其他服务器发送RPC,赢得了多数的选票，成功选举为Leader




### ZAB协议的核心思想

> ZAB协议的核心是定义了对于那些会改变Zookeeper服务器数据状态的事务请求的处理方式即：

- 所有事务请求必须由一个全局唯一的服务器来协调处理，这样的服务器被称为leader服务器，而余下的其它服务则称为follower服务。leader服务器负责将客户端事务请求转换成一个事务提议，并将提议分发给集群中所有的ollower服务，之后leader服务器需要等待所有follower服务反馈，一旦超过半数的follower服务进行了正确的反馈后，那么leader服务器机会再次向所有的follower服务分发commit消息，要求将前一个的提议进行提交。

### ZAB协议两种模式
- ZAB协议包括两种基本模式：崩溃恢复和原子广播。
- 当整个服务框架子啊启动过程中，或是当leader服务器出现网络故障，崩溃退出与重启等异常情况时，ZAB协议就会进入恢复模式并选举产生新的Leader服务器。
- 当选择产生了新的leader服务器，同时集群中已经有过半的机器与该leader服务器完成了同步状态之后，ZAB协议就会退出恢复模式。所谓的状态同步是指数据同步，用来保证集群中存在过半的机器能够和Leader服务器的数据状态保持一致。

### ZAB协议消息广播流程图

![ZAB协议消息广播](http://wx3.sinaimg.cn/large/0068QeGHgy1g6gzga94z8j30kp0dndi1.jpg)

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


### ZooKeeper的典型应用场景

#### 数据发布订阅
- 发布订阅系统一般有两种设计模式：分别死Push和Pull。ZooKeeper是采用两种相结合的方式，客户端向服务端注册自己需要关注的节点，一旦该节点数据发生变更，服务端就会向相应的客户端发送Watcher事件通知，客户端收到通知后，需要主动到服务端获取最新的数据。

#### 分布式协调通知
- 分布式协调通知是将不同的分布式组件有机结合起来的关键所在，ZooKeeper中特有的Watcher注册与异步通知机制，能够很好的实现分布式环境下不同机器，甚至不同系统之间的协调与通知
- 通常的做法是不同的客户端都对ZooKeeper上同一个数据节点进行Watcher注册,监听数据节点的变化（包括节点本身和其子节点），入股数据节点发生变化，那所有订阅的客户端都够接收到对应的Watcher通知，并做出相应的处理。

#### Master选举
- 利用ZooKeeper的强一致性，能够很好地保证分布式高并发情况下节点的创建一定能够保证全局唯一性，ZooKeeper会保证客户端无法重复创建一个已经存在的节点，如果同时多个客户端创建同一个节点，最终只有一个客户端请求能创建成功，利用这个特性，能够很容易地在分布式环境中进行Master选举。
- 客户端集群每天都会定时往ZooKeeper上创建临时节点，比如`/master_election/2019-09-03/binding`，这个过程中，只有一个客户端成功创建这个节点，那么客户端所在的机器称为Master,同时其他没有成功创建的客户端，都会在结点`/master_election/2019-09-03`上注册一个子节点变更的Watcher，用于监控当前Master机器是否存活，一旦发现Master挂了，那其余的客户端将会重新进行Master选择

#### 分布式锁 
- 在需要获取排它锁时，所有客户端都会试图通过调用`create()`接口，在`/exclusiver_lock`节点下创建临时子节点`/exclusiver_lock/lock`,创建成功的客户端就表示成获取锁，同时没有获取到锁的客户端需要在`/exclusiver_lock`节点上注册一个节点变更的Watcher监听,以便实时监听到lock节点的变更情况
- 当获取或的客户单发生死机时，这个临时节点就会被删除，锁就释放了，并通知其他客户端去后去锁
- 正式执行业务逻辑完成后，客户端主动删除自己创建的临时节点释放锁

![ZooKeeper分布式锁创建流程](http://wx3.sinaimg.cn/large/0068QeGHgy1g6m6raeg5ij30ck0dxwfw.jpg)

#### Kafak中的应用
- 在ZooKeeper上会有一个专门哟该进行Broker服务器列表记录的结点，路径为`/brokers/ids`。每个Broker服务器在启动时都会进行注册,Broker id是一个全局唯一的ID。Broker创建的节点是一个临时节点，一旦这个Broker服务器死机或是下线，对应的Broker节点也就被删除
- 在Kafka中，会将同一个Topic的消息分成多个分区并将其分布式到多个Broker上，这些分区信息以及与Broker对应的关系也也都由ZooKeeper维护，由专门的节点记录，路径为`/brokers/tipics`,Broker服务器在启动后，会到对应的Topic节点下注册自己的BrokerID，并写入针对该Topic的分组总数，比如`/brokers/topics/login/3`

### 服务器启动时期的Leader选举
- 每个server会发出一个投票，由于是初始情况，因此对于server1和server2来说，都会将自己作为leader服务器来投票，每次投票包含的最基本的元素为：所推举的服务器的myid和zxid，我们以(myid,zxid)的形式来表示。因为是初始化阶段，因此无论是server1和是server2都会投给自己，即server1的投票为(1, 0)，server2的投票为(2, 0)，然后各自将这个投票发给集群中其它所有机器。
- 每个服务器都会接收来自其它服务器的投票，接收到后会判断该投票的有效性，包括检查是否是本轮投票，是否来自looking状态的服务器
- 在接收到来自其它服务器的投票后，针对每一个投票，服务器都需要将别人的投票和自己的投票进行pk，pk的规则如下：优先检查zxid，zxid大的服务器优先作为leader。如果zxid相同，那么比较myid，myid大的服务器作为leader服务器。
- 现在我们来看server1和server2实际是如何进行投票的，对于server1来说，他自己的投票是(1, 0)，而接收到的投票为(2, 0)。首先会对比两者的zxid，因为都是0，所以接下来会比较两者的myid，server1发现接收到的投票中的myid是2，大于自己，于是就会更新自己的投票为(2, 0)，然后重新将投票发出去，而对于server2，不需要更新自己的投票信息，只是再一次向集群中的所有机器发出上一次投票信息即可。
- 每次投票后，服务器都会统计所有投票，判断是否已经有过半的机器接收到相同的投票信息，对于server1和server2来说，都统计出集群中已经有两台机器接受了(2, 0)这个投票信息。这里过半的概念是指大于集群机器数量的一半，即大于或等于(n/2+1)
- 一旦确定了leader，每个服务器就会更新自己的状态，如果是follower，那么就变更为following，如果是leader，就变更为leading。

### 服务器运行时期的Leader选举
- 当leader挂了之后，余下的非observer服务器都会将自己的状态变为looking，然后开始进行leader选举流程。
- 在这个过程中，需要生成投票信息(myid, zxid)，因为是运行期间，因此每个服务器上的zxid可能不同，我们假定server1的zxid为123，而server3的zxid为122.在第一轮投票中，server1和server3都会投给自己，即分别产生投票(1, 123)和(3, 122)，然后各自将这个投票发给集群中的所有机器。
- 对于投票的处理，和上面提到的服务器启动期间的处理规则是一致的，在这个例子中，由于server1的zxid是123，server3的zxid是122，显然server1会成为leader。
- 统计投票,改变服务器状态


### zookeeper运维
- 使用有两种方式：1. 使用telnet命令登录zk的对外服务端口，直接使用四字命令；2.使用nc命令：echo conf | nc localhost 2181。
- conf，输出zk服务器运行时的基本配置信息，如clientPort，dataDir，ticjTime；
- cons，输出当前服务器上所有的客户端连接详细信息，client IP，Session ID，最近一次与服务器交互的操作类型；
- crst，重置所有的客户端连接统计信息；
- dump，输出当前集群所有的会话信息；
- envi，输出zk所在服务器的运行时环境信息；
- ruok，输出当前zk服务器是否在运行
- stat，输出zk服务器运行时状态信息；
- srvr，和stat类似，区别是仅仅输出服务器自身信息；
- srst，重置所有服务端的统计信息；
- schs，输出当前服务器管理的watcher的概要信息；
- wchc，输出当前服务器管理的watcher的详细信息，以会话为单位进行归组，同时列出被该会话注册watcher的节点路径；
- wchp，类似wchc，不同在于以节点路径为单位进行归组；
- mntr，输出信息比stat更详细，服务器的统计信息，k-v键值对，可以进行监控；



### SpringBoot集成Zookeeper实战

> pom.xml引入zk依赖

``` java
 <dependency>
     <groupId>org.apache.zookeeper</groupId>
     <artifactId>zookeeper</artifactId>
     <version>3.5.5</version>
 </dependency>
```
> application.yml配置

``` java
zookeeper:
  address: 127.0.0.1:2181
  timeout: 4000
```

> ZookeeperConfig配置类

``` java

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

``` java 
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

``` java
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

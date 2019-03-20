#### Zookeeper是什么框架
- 分布式的、开源的分布式应用程序协调服务，原本是Hadoop、HBase的一个重要组件。它为分布式应用提供一致性服务的软件，包括：配置维护、域名服务、分布式同步、组服务等。

#### 应用场景
- zookeeper的功能很强大，应用场景很多，结合我实际工作中使用Dubbo框架的情况，Zookeeper主要是做注册中心用。基于Dubbo框架开发的提供者、消费者都向Zookeeper注册自己的URL，消费者还能拿到并订阅提供者的注册URL，以便在后续程序的执行中去调用提供者。而提供者发生了变动，也会通过Zookeeper向订阅的消费者发送通知。

#### Paxos算法& Zookeeper使用协议
- Paxos算法是分布式选举算法，Zookeeper使用的 ZAB协议（Zookeeper原子广播），二者有相同的地方，比如都有一个Leader，用来协调N个Follower的运行；Leader要等待超半数的Follower做出正确反馈之后才进行提案；二者都有一个值来代表Leader的周期。
- 不同的地方在于：
- ZAB用来构建高可用的分布式数据主备系统（Zookeeper），Paxos是用来构建分布式一致性状态机系统。

Paxos算法、ZAB协议要想讲清楚可不是一时半会的事儿，自1990年莱斯利·兰伯特提出Paxos算法以来，因为晦涩难懂并没有受到重视。后续几年，兰伯特通过好几篇论文对其进行更进一步地解释，也直到06年谷歌发表了三篇论文，选择Paxos作为chubby cell的一致性算法，Paxos才真正流行起来。

对于普通开发者来说，尤其是学习使用Zookeeper的开发者明确一点就好：分布式Zookeeper选举Leader服务器的算法与Paxos有很深的关系。

#### ZooKeeper提供的常见服务
- 命名服务 - 按名称标识集群中的节点。它类似于DNS，但仅对于节点。
- 配置管理 - 加入节点的最近的和最新的系统配置信息。
- 集群管理 - 实时地在集群和节点状态中加入/离开节点。
- 选举算法 - 选举一个节点作为协调目的的leader。
- 高度可靠的数据注册表 - 即使在一个或几个节点关闭时也可以获得数据。
- 锁定和同步服务 - 在修改数据的同时锁定数据。

#### Zookeeper有哪几种节点类型
- 持久节点：创建之后一直存在，除非有删除操作，创建节点的客户端会话失效也不影响此节点。
- 持久顺序节点 ：跟持久一样，就是父节点在创建下一级子节点的时候，记录每个子节点创建的先后顺序，会给每个子节点名加上一个数字后缀。
- 临时节点：创建客户端会话失效（注意是会话失效，不是连接断了），节点也就没了。不能建子节点。
- 临时顺序节点

#### Zookeeper对节点的watch监听通知是永久的吗？
- 不是。官方声明：一个Watch事件是一个一次性的触发器，当被设置了Watch的数据发生了改变的时候，则服务器将这个改变发送给设置了Watch的客户端，以便通知它们。

#### 为什么不是watch监听通知不是永久的？
- 如果服务端变动频繁，而监听的客户端很多情况下，每次变动都要通知到所有的客户端，这太消耗性能了。
- 一般是客户端执行getData(“/节点A”,true)，如果节点A发生了变更或删除，客户端会得到它的watch事件，但是在之后节点A又发生了变更，而客户端又没有设置watch事件，就不再给客户端发送。

#### 部署方式？集群中的机器角色都有哪些？集群最少要几台机器
- 单机，集群。Leader、Follower。集群最低3（2N+1）台，保证奇数，主要是为了选举算法。
- 集群如果有3台机器，挂掉一台集群还能工作吗？挂掉两台呢？
- 记住一个原则：过半存活即可用。

#### 集群支持动态添加机器吗
- 其实就是水平扩容了，Zookeeper在这方面不太好。两种方式：
- 全部重启：关闭所有Zookeeper服务，修改配置之后启动。不影响之前客户端的会话。
- 逐个重启：顾名思义。这是比较常用的方式。 

#### zookeeper是如何保证事务的顺序一致性的
- zookeeper采用了递增的事务Id来标识，所有的proposal都在被提出的时候加上了zxid，zxid实际上是一个64位的数字，高32位是epoch用来标识leader是否发生改变，如果有新的leader产生出来，epoch会自增，低32位用来递增计数。当新产生proposal的时候，会依据数据库的两阶段过程，首先会向其他的server发出事务执行请求，如果超过半数的机器都能执行并且能够成功，那么就会开始执行

#### zookeeper是如何选取主leader的？
- 所有节点创建具有相同路径 /app/leader_election/guid_ 的顺序、临时节点。
- ZooKeeper集合将附加10位序列号到路径，创建的znode将是 /app/leader_election/guid_0000000001，/app/leader_election/guid_0000000002等。
- 对于给定的实例，在znode中创建最小数字的节点成为leader，而所有其他节点是follower。
- 每个follower节点监视下一个具有最小数字的znode。例如，创建znode/app/leader_election/guid_0000000008的节点将监视znode/app/leader_election/guid_0000000007，创建znode/app/leader_election/guid_0000000007的节点将监视znode/app/leader_election/guid_0000000006。
- 如果leader关闭，则其相应的znode/app/leader_electionN会被删除。
- 下一个在线follower节点将通过监视器获得关于leader移除的通知。
- 下一个在线follower节点将检查是否存在其他具有最小数字的znode。如果没有，那么它将承担leader的角色。否则，它找到的创建具有最小数字的znode的节点将作为leader。
- 类似地，所有其他follower节点选举创建具有最小数字的znode的节点作为leader。

#### 机器中为什么会有master；
- 在分布式环境中，有些业务逻辑只需要集群中的某一台机器进行执行，其他的机器可以共享这个结果，这样可以大大减少重复计算，提高性能，于是就需要进行master选举。

#### ZooKeeper集群中服务器之间是怎样通信的？
- Leader服务器会和每一个Follower/Observer服务器都建立TCP连接，同时为每个F/O都创建一个叫做LearnerHandler的实体。LearnerHandler主要负责Leader和F/O之间的网络通讯，包括数据同步，请求转发和Proposal提议的投票等。Leader服务器保存了所有F/O的LearnerHandler。

#### zookeeper是否会自动进行日志清理？如何进行日志清理？
- zk自己不会进行日志清理，需要运维人员进行日志清理

#### ZK选举过程
- 当leader崩溃或者leader失去大多数的follower，这时候zk进入恢复模式，恢复模式需要重新选举出一个新的leader，让所有的Server都恢复到一个正确的状态。Zk的选举算法使用ZAB协议：
- ①　选举线程由当前Server发起选举的线程担任，其主要功能是对投票结果进行统计，并选出推荐的Server；
- ②　选举线程首先向所有Server发起一次询问(包括自己)；
- ③　选举线程收到回复后，验证是否是自己发起的询问(验证zxid是否一致)，然后获取对方的id(myid)，并存储到当前询问对象列表中，最后获取对方提议的leader相关信息(id,zxid)，并将这些信息存储到当次选举的投票记录表中；
- ④　收到所有Server回复以后，就计算出zxid最大的那个Server，并将这个Server相关信息设置成下一次要投票的Server；
- ⑤　线程将当前zxid最大的Server设置为当前Server要推荐的Leader，如果此时获胜的Server获得n/2 + 1的Server票数， 设置当前推荐的leader为获胜的Server，将根据获胜的Server相关信息设置自己的状态，否则，继续这个过程，直到leader被选举出来。
- 通过流程分析我们可以得出：要使Leader获得多数Server的支持，则Server总数最好是奇数2n+1，且存活的Server的数目不得少于n+1

#### 客户端对ServerList的轮询机制是什么
- 随机，客户端在初始化( new ZooKeeper(String connectString, int sessionTimeout, Watcher watcher) )的过程中，将所有Server保存在一个List中，然后随机打散，形成一个环。之后从0号位开始一个一个使用。
- 两个注意点：
- ①　Server地址能够重复配置，这样能够弥补客户端无法设置Server权重的缺陷，但是也会加大风险。（比如: 192.168.1.1:2181,192.168.1.1:2181,192.168.1.2:2181).
- ②　如果客户端在进行Server切换过程中耗时过长，那么将会收到SESSION_EXPIRED. 这也是上面第1点中的加大风险之处

##### 客户端如何正确处理CONNECTIONLOSS(连接断开) 和 SESSIONEXPIRED(Session 过期)两类连接异常** 
- 在ZooKeeper中，服务器和客户端之间维持的是一个长连接，在 SESSION_TIMEOUT 时间内，服务器会确定客户端是否正常连接(客户端会定时向服务器发送heart_beat),服务器重置下次SESSION_TIMEOUT时间。因此，在正常情况下，Session一直有效，并且zk集群所有机器上都保存这个Session信息。在出现问题情况下，客户端与服务器之间连接断了（客户端所连接的那台zk机器挂了，或是其它原因的网络闪断），这个时候客户端会主动在地址列表（初始化的时候传入构造方法的那个参数connectString）中选择新的地址进行连接。

####  一个客户端修改了某个节点的数据，其它客户端能够马上获取到这个最新数据吗
ZooKeeper不能确保任何客户端能够获取（即Read Request）到一样的数据，除非客户端自己要求：方法是客户端在获取数据之前调用org.apache.zookeeper.AsyncCallback.VoidCallback, java.lang.Object) sync.

通常情况下（这里所说的通常情况满足：1. 对获取的数据是否是最新版本不敏感，2. 一个客户端修改了数据，其它客户端是否需要立即能够获取最新），可以不关心这点。

在其它情况下，最清晰的场景是这样：ZK客户端A对 /my_test 的内容从 v1->v2, 但是ZK客户端B对 /my_test 的内容获取，依然得到的是 v1. 请注意，这个是实际存在的现象，当然延时很短。解决的方法是客户端B先调用 sync(), 再调用 getData().

#### ZK为什么不提供一个永久性的Watcher注册机制
不支持用持久Watcher的原因很简单，ZK无法保证性能。

使用watch需要注意的几点

①　Watches通知是一次性的，必须重复注册.

②　发生CONNECTIONLOSS之后，只要在session_timeout之内再次连接上（即不发生SESSIONEXPIRED），那么这个连接注册的watches依然在。

③　节点数据的版本变化会触发NodeDataChanged，注意，这里特意说明了是版本变化。存在这样的情况，只要成功执行了setData()方法，无论内容是否和之前一致，都会触发NodeDataChanged。

④　对某个节点注册了watch，但是节点被删除了，那么注册在这个节点上的watches都会被移除。

⑤　同一个zk客户端对某一个节点注册相同的watch，只会收到一次通知。

⑥　Watcher对象只会保存在客户端，不会传递到服务端。

#### 我能否收到每次节点变化的通知
如果节点数据的更新频率很高的话，不能。

原因在于：当一次数据修改，通知客户端，客户端再次注册watch，在这个过程中，可能数据已经发生了许多次数据修改，因此，千万不要做这样的测试：”数据被修改了n次，一定会收到n次通知”来测试server是否正常工作。（我曾经就做过这样的傻事，发现Server一直工作不正常？其实不是）。即使你使用了GitHub上这个客户端也一样。

 
#### 是否可以拒绝单个IP对ZK的访问,操作
ZK本身不提供这样的功能，它仅仅提供了对单个IP的连接数的限制。你可以通过修改iptables来实现对单个ip的限制，当然，你也可以通过这样的方式来解决。https://issues.apache.org/jira/browse/ZOOKEEPER-1320

####  在getChildren(String path, boolean watch)是注册了对节点子节点的变化，那么子节点的子节点变化能通知吗
不能

#### 创建的临时节点什么时候会被删除，是连接一断就删除吗？延时是多少？
连接断了之后，ZK不会马上移除临时数据，只有当SESSIONEXPIRED之后，才会把这个会话建立的临时数据移除。因此，用户需要谨慎设置Session_TimeOut

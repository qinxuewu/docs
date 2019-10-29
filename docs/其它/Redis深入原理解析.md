[TOC]

### Redis的线程模型?为什么这吗快
- `redis` 内部使用文件事件处理器 这个文件事件处理器是单线程的，所以 redis 才叫做单线程的模型；它采用 `IO`多路复用机制同时监听多`ocket`，将产生事件的 socket 压入内存队列中，事件分派器根据socket上的事件类型来选择对应的事件处理器进行处理
- 文件事件处理器的结构包含 4 个部分：多个 socket；IO 多路复用程序；文件事件分派器；事件处理器（连接应答处理器、命令请求处理器、命令回复处理器）
- 多个 socket 可能会并发产生不同的操作，每个操作对应不同的文件事件，但是 IO 多路复用程序会监听多个 socket，会将产生事件的 socket 放入队列中排队，事件分派器每次从队列中取出一个 socket，根据 socket 的事件类型交给对应的事件处理器进行处理。

### Redis有哪些数据结构？
- 字符串`String`、字典`Hash`、列表`List`、集合`Set`、有序集合`SortedSet`。
- 如果你是Redis中高级用户，还需要加上下面几种数据结构`HyperLogLog、Geo、Pub/Sub`。
- 如果你说还玩过`Redis Module`，像`BloomFilter，RedisSearch，Redis-ML`，面试官得眼睛就开始发亮了。


### Redis内部数据结构String如何存储的
- 在Redis内部，String类型通过`int`、`SDS`作为结构存储,int用来存放整型数据，`sds`存放字 节/字符串和浮点型数据。
- redis3.2分支引入了五种`sdshdr`类型，目的是为了满足不同长度字符串可以使用不同大小的`Header`，从而节省内 存，每次在创建一个`sds`时根据sds的实际长度判断应该选择什么类型的sdshdr，不同类型的`sdshdr`占用的内存空 间不同。

### Redis内部数据结构List如何存储的
- 列表类型`(list)`可以存储一个有序的字符串列表，常用的操作是向列表两端添加元素或者获得列表的某一个片段。
- 列表类型内部使用双向链表实现，所以向列表两端添加元素的时间复杂度为O(1), 获取越接近两端的元素速度就越 快
- redis3.2之前，List类型的value对象内部以`linkedlist`或者`ziplist`来实现,当list的元素个数和单个元素的长度比较小的时候，Redis会采用`ziplist(压缩列表)`来实现来减少内存占用。否则就会采用`linkedlist(双向链表)`结构。
- Redis3.2之后，采用的一种叫`quicklist`的数据结构来存储`list`，列表的底层都由`quicklist`实现。
- 这两种存储方式都有优缺点，双向链表在链表两端进行`push`和`pop`操作，在插入节点上复杂度比较低，但是内存开 销比较大; `ziplist`存储在一段连续的内存上，所以存储效率很高，但是插入和删除都需要频繁申请和释放内存;
- `quicklist`仍然是一个双向链表，只是列表的每个节点都是一个ziplist，其实就是linkedlist和ziplist的结合，quicklist 中每个节点ziplist都能够存储多个数据元素

### Redis内部数据结构map如何存储的
- map提供两种结构来存储，一种是hashtable、另一种是前面讲的ziplist，数据量小的时候用ziplist.

### 使用过Redis分布式锁么，它是什么回事？
先拿`setnx`来争抢锁，抢到之后，再用`expire`给锁加一个过期时间防止锁忘记了释放

### redis 分布式锁有什么缺陷？
* 在redis主从架构部署时，在`redis-master`实例宕机的时候，可能导致多个客户端同时完成加锁。极端情况下不能得到保证。作者都是这吗说的

### 如果在setnx之后执行expire之前进程意外crash或者要重启维护了，那会怎么样？
- 按照逻辑来说这个锁就永远得不到释放了
- 我记得set指令有非常复杂的参数，这个应该是可以同时把setnx和expire合成一条指令来用的

### 假如Redis里面有1亿个key，其中有10w个key是以某个固定的已知的前缀开头的，如果将它们全部找出来？
使用keys指令可以扫出指定模式的key列表。

### 如果这个redis正在给线上的业务提供服务，那使用keys指令会有什么问题？
- 这个时候你要回答redis关键的一个特性：redis的单线程的。keys指令会导致线程阻塞一段时间，线上服务会停顿，直到指令执行完毕，服务才能恢复。这个时候可以使用`scan`指令，scan指令可以无阻塞的提取出指定模式的`key`列表，但是会有一定的重复概率，在客户端做一次去重就可以了，但是整体所花费的时间会比直接用keys指令长。

### 使用过Redis做异步队列么，你是怎么用的？
一般使用`list`结构作为队列，`rpush`生产消息，`lpop`消费消息。当lpop没有消息的时候，要适当sleep一会再重试。

### 可不可以不用sleep呢？
`list`还有个指令叫`blpop`，在没有消息的时候，它会阻塞住直到消息到来。

### 能不能生产一次消费多次呢？
使用`pub/sub`主题订阅者模式，可以实现1:N的消息队列。

### pub/sub有什么缺点？
在消费者下线的情况下，生产的消息会丢失，得使用专业的消息队列如rabbitmq,kafka等。

### redis如何实现延时队列？
使用`sortedset`，拿时间戳作为`score`，消息内容作为key调用zadd来生产消息，消费者用zrangebyscore指令获取N秒之前的数据轮询进行处理。

### 如果有大量的key需要设置同一时间过期，一般需要注意什么？
- 如果大量的key过期时间设置的过于集中，到过期的那个时间点，redis可能会出现短暂的卡顿现象。一般需要在时间上加一个随机值，使得过期时间分散一些。

### Redis如何做持久化的？
- `bgsave`做镜像全量持久化，`aof`做增量持久化。因为bgsave会耗费较长时间，不够实时，在停机的时候会导致大量丢失数据，所以需要aof来配合使用。在redis实例重启时，会使用bgsave持久化文件重新构建内存，再使用aof重放近期的操作指令来实现完整恢复重启之前的状态。

### RDB持久化方式
- 当符合一定条件时，Redis会单独创建`(fork)`一个子进程来进行持久化，会先将数据写入到一个临时文件中，等 到持久化过程都结束了，再用这个临时文件替换上次持久化好的文件。
- 整个过程中，主进程是不进行任何IO操作 的，这就确保了极高的性能。如果需要进行大规模数据的恢复，且对于数据恢复的完整性不是非常敏感，那RDB方 式要比AOF方式更加的高效。RDB的缺点是最后一次持久化后的数据可能丢失

> -fork的作用是复制一个与当前进程一样的进程。新进程的所有数据(变量、环境变量、程序计数器等)数值都和 原进程一致，但是是一个全新的进程，并作为原进程的子进程

> Redis会在以下几种情况下对数据进行快照

- 根据配置规则进行自动快照
- 用户执行`SAVE`或者`GBSAVE`命令(`save`会阻塞所有来自客户端的请求,`bgsave`命令可以在后台异步地进行快照操作)
- 执行`FLUSHALL命令`清除redis在内存中的所有数据,redis就会执行一次快照操作
- 执行复制(`replication`),该操作主要是在主从模式下，redis会在复制初始化时进行自动快照

> 配置规则进行自动快照

```
save 900 1
save 300 10
save 60 10000
```
- 第一个参数是时间窗口，第二个是键的个数，也就是说，在第一个时间参数配置范围内被更改的键的个数大于后面 的changes时，即符合快照条件。redis默认配置了三个规则
- 每条快照规则占一行，每条规则之间是“或”的关系。 在900秒(15分)内有一个以上的键被更改则进行快照。


### AOF持久化方式
- `AOF`可以将Redis执行的每一条写命令追加到硬盘文件中，这一过程会降低Redis的性能，但大部分情况下这个影响是能够接受的
- 默认情况下Redis没有开启`AOF(append only file)`方式的持久化，可以通过appendonly参数启用，在redis.conf 中找到 appendonly yes
- AOF文件以纯文本的形式记录Redis执行的写命令

> AOF的重写原理

- Redis 可以在 AOF 文件体积变得过大时，自动地在后台对 AOF 进行重写: 重写后的新 AOF 文件包含了恢复当前
数据集所需的最小命令集合
- 重写的流程是这样，主进程会`fork`一个子进程出来进行AOF重写，这个重写过程并不是基于原有的aof文件来做 的，而是有点类似于快照的方式，全量遍历内存中的数据，然后逐个序列到aof文件中
- 这个过程中，主进程的数据更新操作，会缓存到`aof_rewrite_buf`中，也就是单独开辟一块缓存来存储重写期间 收到的命令，当子进程重写完以后再把缓存中的数据追加到新的aof文件


### 如果突然机器掉电会怎样？
- 取决于aof日志sync属性的配置，如果不要求性能，在每条写指令时都sync一下磁盘，就不会丢失数据。但是在高性能的要求下每次都sync是不现实的，一般都使用定时sync，比如1s1次，这个时候最多就会丢失1s的数据。

### bgsave的原理是什么？
- fork和cow。fork是指redis通过创建子进程来进行bgsave操作，cow指的是copy on write，子进程创建后，父子进程共享数据段，父进程继续提供读写服务，写脏的页面数据会逐渐和子进程分离开来。

### Pipeline有什么好处，为什么要用pipeline？
- 可以将多次IO往返的时间缩减为一次，前提是pipeline执行的指令之间没有因果相关性。使用redis-benchmark进行压测的时候可以发现影响redis的QPS峰值的一个重要因素是pipeline批次指令的数目。

### Redis的同步机制了解么？
- Redis可以使用主从同步，从从同步。第一次同步时，主节点做一次bgsave，并同时将后续修改操作记录到内存buffer，待完成后将rdb文件全量同步到复制节点，复制节点接受完成后将rdb镜像加载到内存。加载完成后，再通知主节点将期间修改的操作记录同步到复制节点进行重放就完成了同步过程。

### 是否使用过Redis集群，集群的原理是什么？
- `Redis Sentinal`着眼于高可用，在master宕机时会自动将slave提升为master，继续提供服务。
- `Redis Cluster`着眼于扩展性，在单个redis内存不足时，使用Cluster进行分片存储。

### 使用Redis有哪些好处？
- (1) 速度快，因为数据存在内存中，类似于HashMap，HashMap的优势就是查找和操作的时间复杂度都是O(1)
- (2) 支持丰富数据类型，支持string，list，set，sorted set，hash
- (3) 支持事务，操作都是原子性，所谓的原子性就是对数据的更改要么全部执行，要么全部不执行
- (4) 丰富的特性：可用于缓存，消息，按key设置过期时间，过期后将会自动删除

### redis相比memcached有哪些优势？
- memcached所有的值均是简单的字符串，redis作为其替代者，支持更为丰富的数据类型
- redis的速度比memcached快很多
- redis可以持久化其数据

### Redis过期策略
  * redis 会将每个设置了过期时间的 key 放入到一个独立的字典中,每秒进行十次过期扫描，过期扫描不会遍历过期字典中所有的 key，而是采用了一种简单的贪心策略.从过期字典中随机 20 个 key;删除这 20 个 key 中已经过期的 key;如果过期的 key 比率超过 1/4，那就重复步骤 1;
  * 同时，为了保证过期扫描不会出现循环过度，导致线程卡死现象，算法还增加了扫描时间的上限，默认不会超过 25ms。

### 从库的过期策略
  * 从库不会进行过期扫描，从库对过期的处理是被动的。主库在 key 到期时，会在 AOF 文件里增加一条 del 指令，同步到所有的从库，从库通过执行这条 del 指令 来删除过期的 key
  * 因为指令同步是异步进行的，所以主库过期的 key 的 del 指令没有及时同步到从库的话，会出现主从数据的不一致，主库没有的数据在从库里还存在



### 什么是缓存穿透？怎么解决？
*  缓存穿透是指查询一个一定不存在的数据，由于缓存是不命中时被动写的，并且出于容错考虑，如果从数据中查不到数据，则不写入缓存，这将导致这个不存在的数据每次请求都要到数据库去查询，失去了缓存的意义。在流量大时，可能DB就挂掉了，要是有人利用不存在的key频繁攻击我们的应用，这就是漏洞。
* 解决方式：布隆过滤，当一个查询请求来临的时候，先经过布隆过滤器进行检查，如果请求存在这个条件中，那么继续执行，如果不在，直接丢弃。
* 缓存空对象将 null变成一个值，针对这类数据设置一个较短的过期时间，让其自动剔除。

### 什么是缓存击穿,怎么解决？
- 缓存击穿，就是说某个key非常热点，访问非常频繁，处于集中式高并发访问的情况，当这个 key 在失效的瞬间，大量的请求就击穿了缓存，直接请求数据库，就像是在一道屏障上凿开了一个洞。
- 解决方式也很简单，可以将热点数据设置为永远不过期；或者基于 redis or zookeeper 实现互斥锁，等待第一个请求构建完缓存之后，再释放锁，进而其它请求才能通过该 key 访问数据

### 缓存雪崩的事前事中事后的解决方案如下
- 事前：redis 高可用，主从+哨兵，`redis cluster`，避免全盘崩溃。
- 事中：本地 ehcache 缓存 + hystrix 限流&降级，避免 MySQL 被打死。
- 事后：redis 持久化，一旦重启，自动从磁盘上加载数据，快速恢复缓存数据

### Redis的6种内存淘汰机制
- `noeviction`: 当内存不足以容纳新写入数据时，新写入操作会报错，这个一般没人用吧，实在是太恶心了
- `allkeys-lru`：当内存不足以容纳新写入数据时，在键空间中，移除最近最少使用的 key（这个是最常用的
- `allkeys-random`：当内存不足以容纳新写入数据时，在键空间中，随机移除某个 key，这个一般没人用吧，为啥要随机，肯定是把最近最少使用的 key 给干掉啊。
- `volatile-lru`：当内存不足以容纳新写入数据时，在设置了过期时间的键空间中，移除最近最少使用的 key（这个一般不太合适）。
- `volatile-random`：当内存不足以容纳新写入数据时，在设置了过期时间的键空间中，随机移除某个 key。
- `volatile-ttl`：当内存不足以容纳新写入数据时，在设置了过期时间的键空间中，有更早过期时间的 key 优先移除。



### 如何保证缓存与数据库的双写一致性？
- 如果你的系统不是严格要求“缓存+数据库”必须保持一致性的话，最好不要做这个方案，即：读请求和写请求串行化，串到一个内存队列里去。串行化可以保证一定不会出现不一致的情况，但是它也会导致系统的吞吐量大幅度降低
- 最经典的缓存+数据库读写的模式，就是:读的时候，先读缓存，缓存没有的话，就读数据库，然后取出数据后放入缓存，同时返回响应。更新的时候，先更新数据库，然后再删除缓存。
- 问题：先更新数据库，再删除缓存。如果删除缓存失败了，那么会导致数据库中是新数据，缓存中是旧数据，数据就出现了不一致。解决思路：先删除缓存，再更新数据库。如果数据库更新失败了，那么数据库中是旧数据，缓存中是空的，那么数据不会不一致。因为读的时候缓存没有，所以去读了数据库中的旧数据，然后更新到缓存中。

### 并发导致的缓存和数据库不一致性
- 数据发生了变更，先删除了缓存，然后要去修改数据库，此时还没修改。一个请求过来，去读缓存，发现缓存空了，去查询数据库，查到了修改前的旧数据，放到了缓存中。随后数据变更的程序完成了数据库的修改。完了，数据库和缓存中的数据不一样了
- 解决方案如下：更新数据的时候，根据数据的唯一标识，将操作路由之后，发送到一个 jvm 内部队列中。读取数据的时候，如果发现数据不在缓存中，那么将重新读取数据+更新缓存的操作，根据唯一标识路由之后，也发送同一个jvm内部队列中
- 一个队列对应一个工作线程，每个工作线程串行拿到对应的操作，然后一条一条的执行。这样的话，一个数据变更的操作，先删除缓存，然后再去更新数据库，但是还没完成更新。此时如果一个读请求过来，没有读到缓存，那么可以先将缓存更新的请求发送到队列中，此时会在队列中积压，然后同步等待缓存更新完成。
- 这里有一个优化点，一个队列中，其实多个更新缓存请求串在一起是没意义的，因此可以做过滤，如果发现队列中已经有一个更新缓存的请求了，那么就不用再放个更新请求操作进去了，直接等待前面的更新操作请求完成即可。
- 待那个队列对应的工作线程完成了上一个操作的数据库的修改之后，才会去执行下一个操作，也就是缓存更新的操作，此时会从数据库中读取最新的值，然后写入缓存中。

### Redis 分布式锁，真的万无一失吗
- 从 Redis 2.6.12版本开始，SET命令的行为可以通过一系列参数来修;
- EX seconds ：将键的过期时间设置为 seconds 秒。执行 SET key value EX seconds 的效果等同于执行 SETEX key seconds value 
- PX milliseconds ：将键的过期时间设置为 milliseconds 毫秒。执行 SET key value PX milliseconds 的效果等同于执行 PSETEX key milliseconds value 
- NX ：只在键不存在时， 才对键进行设置操作。执行 SET key value NX 的效果等同于执行 SETNX key value
- XX ：只在键已经存在时， 才对键进行设置操作。
- 注意EX和PX不能同时使用，否则会报错：ERR syntax error。
- 为了避免某个线程在在处理业务很长的时间情况，锁自动释放，然后变其它线程获取到锁，这个时候线程A业务处理完进行释放锁就不是自己的锁，这里需要给锁的value设置为一个唯一值uniqueValue(随机值、UUID、或者机器号+线程号的组合);
- 解锁时，也就是删除key的时候先判断一下key对应的value是否等于先前设置的值;如果相等才能删除key；但是GET和DEL是两个分开的操作,执行之前的间隙是可能会发生异常的。为了保证原子性 使用LUA脚本进行解锁

```
if redis.call("get",KEYS[1]) == ARGV[1] then
    return redis.call("del",KEYS[1])
else
    return 0
end
```
- 由于Lua脚本的原子性，在Redis执行该脚本的过程中，其他客户端的命令都需要等待该Lua脚本执行完才能执行。 此方案只适合单机的redis部署。
- 表面来看，这个方法似乎很管用，但是这里存在一个问题：在我们的系统架构里存在一个单点故障，如果Redis的master节点宕机了怎么办呢
- Redis的作者提出了Redlock算法;主要思想是：假设我们有N个Redis master节点，这些节点都是完全独立的，我们可以运用前面的方案来对前面单个的Redis master节点来获取锁和解锁;如果我们总体上能在合理的范围内或者N/2+1个锁，那么我们就可以认为成功获得了锁，反之则没有获取锁
- 具体内容可以参考：https://redis.io/topics/distlock。


### 说说Redis哈希槽的概念？
- Redis集群没有使用一致性hash,而是引入了哈希槽的概念，Redis集群有16384个哈希槽，每个key通过CRC16校验后对16384取模来决定放置哪个槽，集群的每个节点负责一部分hash槽。

### 你知道有哪些Redis分区实现方案？
- 客户端分区就是在客户端就已经决定数据会被存储到哪个redis节点或者从哪个redis节点读取。大多数客户端已经实现了客户端分区
- 代理分区 意味着客户端将请求发送给代理，然后代理决定去哪个节点写数据或者读数据。代理根据分区规则决定请求哪些Redis实例，然后根据Redis的响应结果返回给客户端。

### Redis分区有什么缺点？
- 涉及多个key的操作通常不会被支持。例如你不能对两个集合求交集，因为他们可能被存储到不同的Redis实例
- 当使用分区的时候，数据处理会非常复杂，例如为了备份你必须从不同的Redis实例和主机同时收集RDB / AOF文件。

### Redis事物具有如下特点
- 如果开始执行事物出错，则所有命令都不执行
- 一旦开始，则保证所有命令一次性顺序执行完而不被打断
- 如果执行过程中遇到错误，会继续执行下去，不会停止的
- 对于执行过程中遇到的错误，是不会进行回滚



# Rdis企业级生产级别部署

##  分析redis的RDB和AOF两种持久化机制的工作原理
### RDB和AOF两种持久化机制的介绍
- RDB持久化机制，对redis中的数据执行周期性的持久化
- AOF机制对每条写入命令作为日志，以`append-only`的模式写入一个日志文件中，在redis重启的时候，可以通过回放AOF日志中的写入指令来重新构建整个数据集
- 如果我们想要redis仅仅作为纯内存的缓存来用，那么可以禁止RDB和AOF所有的持久化机制
- 通过RDB或AOF，都可以将redis内存中的数据给持久化到磁盘上面来，然后可以将这些数据备份到别的地方去，比如说阿里云，云服务
- 如果redis挂了，服务器上的内存和磁盘上的数据都丢了，可以从云服务上拷贝回来之前的数据，放到指定的目录中，然后重新启动redis，redis就会自动根据持久化数据文件中的数据，去恢复内存中的数据，继续对外提供服务
- 如果同时使用RDB和AOF两种持久化机制，那么在redis重启的时候，会使用AOF来重新构建数据，因为AOF中的数据更加完整

### RDB持久化机制的优点
![Redis生成RDB快照](http://tvax1.sinaimg.cn/large/0068QeGHgy1g83h7wvn9pj30cw07n0tn.jpg)

- 1）`RDB`会生成多个数据文件，每个数据文件都代表了某一个时刻中redis的数据，这种多个数据文件的方式，非常适合做冷备，可以将这种完整的数据文件发送到一些远程的安全存储上去，比如说Amazon的S3云服务上去，在国内可以是阿里云的ODPS分布式存储上，以预定好的备份策略来定期备份redis中的数据
- 2）`RDB`对redis对外提供的读写服务，影响非常小，可以让redis保持高性能，因为redis主进程只需要fork一个子进程，让子进程执行磁盘IO操作来进行RDB持久化即可
- 3）相对于AOF持久化机制来说，直接基于RDB数据文件来重启和恢复redis进程，更加快速

```
#redis.conf配置RDB的执行时间
save 900 1  #15分钟之内至少有一个建被更改则进行快照
save 300 10  #5分钟之内至少有10个建被更改则进行快照
save 60 10000  #1分钟之内至少有1000个建被更改则进行快照
```

### RDB持久化机制的缺点
- 1）如果想要在redis故障时，尽可能少的丢失数据，那么RDB没有AOF好。一般来说，RDB数据快照文件，都是每隔5分钟，或者更长时间生成一次，这个时候就得接受一旦redis进程宕机，那么会丢失最近5分钟的数据
- 2）RDB每次在fork子进程来执行RDB快照数据文件生成的时候，如果数据文件特别大，可能会导致对客户端提供的服务暂停数毫秒，或者甚至数秒

### AOF持久化机制的优点
- 1）AOF可以更好的保护数据不丢失，一般AOF会每隔1秒，通过一个后台线程执行一次fsync操作，最多丢失1秒钟的数据
- 2）AOF日志文件以`append-only`模式写入，所以没有任何磁盘寻址的开销，写入性能非常高，而且文件不容易破损，即使文件尾部破损，也很容易修复(比如修改aop文件尾巴的记录命令完整性，随意删除一个命令，他会自动忽略错误不完整的)
- 4）`AOF`日志文件的命令通过非常可读的方式进行记录，这个特性非常适合做灾难性的误删除的紧急恢复。比如某人不小心用flushall命令清空了所有数据，只要这个时候后台`rewrite`还没有发生，那么就可以立即拷贝AOF文件，将最后一条`flushall命`令给删了，然后再将该AOF文件放回去，就可以通过恢复机制，自动恢复所有数据

### AOF持久化机制的缺点
- 1）对于同一份数据来说，AOF日志文件通常比RDB数据快照文件更大
- 2）AOF开启后，支持的写QPS会比RDB支持的写QPS低，因为AOF一般会配置成每秒fsync一次日志文件，当然，每秒一次fsync，性能也还是很高的
- 3）以前AOF发生过bug，就是通过AOF记录的日志，进行数据恢复的时候，没有恢复一模一样的数据出来。所以说，类似AOF这种较为复杂的基于命令日志`/merge/`回放的方式，比基于RDB每次持久化一份完整的数据快照文件的方式，更加脆弱一些，容易有bug。不过AOF就是为了避免`rewrite`过程导致的bug，因此每次rewrite并不是基于旧的指令日志进行`merge`的，而是基于当时内存中的数据进行指令的重新构建，这样健壮性会好很多。

### RDB和AOF到底该如何选择
- 1）不要仅仅使用RDB，因为那样会导致你丢失很多数据
- 2）也不要仅仅使用AOF，因为那样有两个问题，第一，你通过AOF做冷备，没有RDB做冷备，来的恢复速度更快; 第二，RDB每次简单粗暴生成数据快照，更加健壮，可以避免AOF这种复杂的备份和恢复机制的bug
- 3）综合使用AOF和RDB两种持久化机制，用AOF来保证数据不丢失，作为数据恢复的第一选择;用RDB来做不同程度的冷备，在AOF文件都丢失或损坏不可用的时候，还可以使用RDB来进行快速的数据恢复

### RDB持久化配置以及数据恢复实验

#### 如何配置RDB持久化机制

- redis.conf文件，也就是`/etc/redis/6379.conf`，去配置持久化`save 60 1000`每隔60s，如果有超过`1000`个key发生了变更;那么就生成一个新的`dump.rdb`文件，就是当前redis内存中完整数据快照，这个操作也被称之为`snapshotting`，快照也可以手动调用`save`或者`bgsave`命令，同步或异步执行rdb快照生成
save可以设置多个，就是多个snapshotting检查点，每到一个检查点，就会去check一下，是否有指定的key数量发生了变更，如果有，就生成一个新的dump.rdb文件

#### RDB持久化机制的工作流程

- 1）redis根据配置自己尝试去生成rdb快照文件
- 2）fork一个子进程出来
- 3）子进程尝试将数据dump到临时的rdb快照文件中
- 4）完成rdb快照文件的生成之后，就替换之前的旧的快照文件。dump.rdb，每次生成一个新的快照，都会覆盖之前的老快照

#### 基于RDB持久化机制的数据恢复实验

- 1）在redis中保存几条数据，立即停掉redis进程，然后重启redis，看看刚才插入的数据还在不在
- 数据还在，为什么？带出来一个知识点，通过`redis-cli,SHUTDOWN`这种方式去停掉redis，其实是一种安全退出的模式，redis在退出的时候会将内存中的数据立即生成一份完整的rdb快照
- 2）在redis中再保存几条新的数据，用`kill-9`粗暴杀死redis进程，模拟redis故障异常退出，导致内存数据丢失的场景;这次就发现，redis进程异常被杀掉，数据没有进dump文件，几条最新的数据就丢失了
- 2）手动设置一个save检查点，save 5 1
- 3）写入几条数据，等待5秒钟，会发现自动进行了一次dump.rdb快照，在dump.rdb中发现了数据
- （4）异常停掉redis进程，再重新启动redis，看刚才插入的数据还在

### AOF持久化深入讲解各种操作和相关实验

#### AOF持久化的配置

- AOF持久化，默认是关闭的，默认是打开RDB持久化
- `appendonly yes`，可以打开AOF持久化机制，在生产环境里面，一般来说AOF都是要打开的，除非你说随便丢个几分钟的数据也无所谓
- 打开AOF持久化机制之后，redis每次接收到一条写命令，就会写入日志文件中，当然是先写入`os-cache`的，然后每隔一定时间再`fsync`一下
- 而且即使AOF和RDB都开启了，redis重启的时候，也是优先通过AOF进行数据恢复的，因为aof数据比较完整
- 可以配置AOF的fsync策略，有三种策略可以选择，一种是每次写入一条数据就执行一次fsync;一种是每隔一秒执行一次fsync;一种是不主动执行fsync

```
# redis.conf
appendfsync always
appendfsync everysec
appendfsync no
# 如果没有生成aof文件 则执行 redis-cli config set appendonly yes
```
- always: 每次写入一条数据，立即将这个数据对应的写日志fsync到磁盘上去，性能非常非常差，吞吐量很低;确保说redis里的数据一条都不丢，那就只能这样了
- everysec: 每秒将`os-cache`中的数据fsync到磁盘，这个最常用的，生产环境一般都这么配置，性能很高，QPS还是可以上万的
- no: 仅仅redis负责将数据写入os-cache就撒手不管了，然后后面os自己会时不时有自己的策略将数据刷入磁盘，不可控了

#### AOF持久化的数据恢复实验

- 1）先仅仅打开RDB，写入一些数据，然后kill -9杀掉redis进程，接着重启redis，发现数据没了，因为RDB快照还没生成
- 2）打开AOF的开关，启用AOF持久化
- 3）写入一些数据，观察AOF文件中的日志内容;其实你在appendonly.aof文件中，可以看到刚写的日志，它们其实就是先写入os cache的，然后1秒后才fsync到磁盘中，只有fsync到磁盘中了，才是安全的，要不然光是在os-cache中，机器只要重启，就什么都没了
- 4）kill -9杀掉redis进程，重新启动redis进程，发现数据被恢复回来了，就是从AOF文件中恢复回来的;redis进程启动的时候，直接就会从appendonly.aof中加载所有的日志，把内存中的数据恢复回来

#### AOF rewrite机制
- redis中的数据其实有限的，很多数据可能会自动过期，可能会被用户删除，可能会被redis用缓存清除的算法清理掉
- redis中的数据会不断淘汰掉旧的，就一部分常用的数据会被自动保留在redis内存中；所以可能很多之前的已经被清理掉的数据，对应的写日志还停留在AOF中，AOF日志文件就一个，会不断的膨胀，到很大很大
- 所以AOF会自动在后台每隔一定时间做rewrite操作，比如日志里已经存放了针对100w数据的写日志了; redis内存只剩下10万; 基于内存中当前的10万数据构建一套最新的日志，到AOF中; 覆盖之前的老日志;确保AOF日志文件不会过大，保持跟redis内存数据量一致

```
# 在redis.conf中，可以配置rewrite策略
auto-aof-rewrite-percentage 100 #指当前aof文件比上次重写的增长比例大小
auto-aof-rewrite-min-size 64mb #aof文件重写最小的文件大小
```
比如说上一次AOF rewrite之后，是128mb

然后就会接着128mb继续写AOF的日志，如果发现增长的比例，超过了之前的100%，256mb，就可能会去触发一次rewrite

但是此时还要去跟min-size，64mb去比较，256mb>64mb，才会去触发rewrite

![AOF文件重写](http://tva4.sinaimg.cn/large/0068QeGHgy1g83jyv35f7j30ht0a9q4n.jpg)


- 1）redis fork一个子进程
- 2）子进程基于当前内存中的数据，构建日志，开始往一个新的临时的AOF文件中写入日志
- 3）redis主进程，接收到client新的写操作之后，在内存中写入日志，同时新的日志也继续写入旧的AOF文件
- 4）子进程写完新的日志文件之后，redis主进程将内存中的新日志再次追加到新的AOF文件中
- 5）用新的日志文件替换掉旧的日志文件

#### AOF破损文件的修复
- 如果redis在append数据到AOF文件时，机器宕机了，可能会导致AOF文件破损
- 用redis-check-aof --fix命令来修复破损的AOF文件

#### AOF和RDB同时工作
- 1）如果RDB在执行snapshotting操作，那么redis不会执行AOF rewrite; 如果redis再执行AOF rewrite，那么就不会执行RDB snapshotting
- 2）如果RDB在执行snapshotting，此时用户执行BGREWRITEAOF命令，那么等RDB快照生成之后，才会去执行AOF rewrite
- 3）同时有RDB snapshot文件和AOF日志文件，那么redis重启的时候，会优先使用AOF进行数据恢复，因为其中的日志更完整

### reids replication以及master持久化对主从架构的安全意义
#### replication的核心机制
- 1）redis采用异步方式复制数据到slave节点，不过redis 2.8开始，slave node会周期性地确认自己每次复制的数据量
- 2）一个master node是可以配置多个slave node的
- 3）slave node也可以连接其他的slave node
- 4）slave node做复制的时候，是不会blockmaster-node的正常工作的
- 5）slave node在做复制的时候，也不会block对自己的查询操作，它会用旧的数据集来提供服务;但是复制完成的时候，需要删除旧数据集，加载新数据集，这个时候就会暂停对外服务了
- 6）slave node主要用来进行横向扩容，做读写分离，扩容的slave node可以提高读的吞吐量

#### master持久化对于主从架构的安全保障的意义
- 如果采用了主从架构，那么建议必须开启`master-node`的持久化
- 不建议用`slave-node`作为`master-node`的数据热备，因为那样的话，如果你关掉master的持久化，可能在master宕机重启的时候数据是空的，然后可能一经过复制，salve node数据也丢了

### 主从复制原理、断点续传、无磁盘化复制、过期key处理
#### 主从架构的核心原理

![主从架构的核心原理](http://tvax1.sinaimg.cn/large/0068QeGHgy1g84fsh71psj30ga07uwfi.jpg)

- 当启动一个`slave-node`的时候，它会发送一个PSYNC命令给master node
- 如果这是`slave-node`重新连接master-node，那么master-node仅仅会复制给slave部分缺少的数据;
- 否则如果是slave-node第一次连接master-node，那么会触发一次全量复制
- 开始全量复制的时候，`master`会启动一个后台线程，开始生成一份`RDB`快照文件，同时还会将从客户端收到的所有写命令缓存在内存中。RDB文件生成完毕之后，master会将这个RDB发送给`slave`，slave会先写入本地磁盘，然后再从本地磁盘加载到内存中。然后master会将内存中缓存的写命令发送给slave，slave也会同步这些数据。
- `slave node`如果跟`master-node`有网络故障，断开了连接，会自动重连。master如果发现有多个`slave-node`都来重新连接，仅仅会启动一个rdb save操作，用一份数据服务所有slave node。

#### 主从复制的断点续传
- 从redis 2.8开始，就支持主从复制的断点续传，如果主从复制过程中，网络连接断掉了，那么可以接着上次复制的地方，继续复制下去，而不是从头开始复制一份
- `master node`会在内存中常见一个`backlog`，`master`和`slave`都会保存一个`replica offset`还有一个`master id`，`offset`就是保存在backlog中的。如果master和slave网络连接断掉了，slave会让master从上次的`replica offset`开始继续复制；但是如果没有找到对应的offset，那么就会执行一次`resynchronization(重新同步)`

#### 无磁盘化复制
- master在内存中直接创建rdb，然后发送给slave，不会在自己本地落地磁盘了

```
repl-diskless-sync yes  #无硬盘复制功能

#等待一定时长再开始复制，因为要等更多slave重新连接过来
repl-diskless-sync-delay 5 
```
#### 过期key处理
- `slave`不会过期key，只会等待`master`过期key。如果master过期了一个key，或者通过LRU淘汰了一个key，那么会模拟一条del命令发送给slave。

### replication的完整流运行程和原理的再次深入剖析
#### 复制的完整流程

![Redis复制的完整流程](http://tvax3.sinaimg.cn/large/0068QeGHgy1g84gtxzslbj30n3098q4v.jpg)

- 1）slave node启动，仅仅保存master node的信息，包括master node的host和ip，但是复制流程没开始;master host和ip是从哪儿来的，redis.conf里面的slaveof配置的
- 2）slave node内部有个定时任务，每秒检查是否有新的master node要连接和复制，如果发现，就跟master node建立socket网络连接
- 3）slave node发送ping命令给master node
- 4）口令认证，如果master设置了requirepass，那么salve node必须发送masterauth的口令过去进行认证
- 5）master node第一次执行全量复制，将所有数据发给slave node
- 6）master node后续持续将写命令，异步复制给slave node

#### 数据同步相关的核心机制
- 指的就是第一次slave连接msater的时候，执行的全量复制，那个过程里面的一些细节的机制

> master和slave都会维护一个offset

- master会在自身不断累加offset，slave也会在自身不断累加offset
- slave每秒都会上报自己的offset给master，同时master也会保存每个slave的offset
- 这个倒不是说特定就用在全量复制的，主要是master和slave都要知道各自的数据的offset，才能知道互相之间的数据不一致的情况

> backlog

- master node有一个backlog，默认是1MB大小
- master node给slave node复制数据时，也会将数据在backlog中同步写一份
- backlog主要是用来做全量复制中断候的增量复制的

> master run id

- 执行`info server`命令，可以看到master run id
- 如果根据`host+ip`定位master node，是不靠谱的，如果master node重启或者数据出现了变化，那么slave-node应该根据不同的`run id`区分，`run id`不同就做全量复制,如果需要不更改run id重启redis，可以使用`redis-cli debug reload`命令

> psync

- 从节点使用psync从master node进行复制，psync runid offset
master node会根据自身的情况返回响应信息，可能是FULLRESYNC runid offset触发全量复制，可能是CONTINUE触发增量复制

> 全量复制

- 1）master执行bgsave，在本地生成一份rdb快照文件
- 2）master node将rdb快照文件发送给salve node，如果rdb复制时间超过60秒（repl-timeout），那么slave node就会认为复制失败，可以适当调节大这个参数
- 3）对于千兆网卡的机器，一般每秒传输100MB，6G文件，很可能超过60s
- 4）master node在生成rdb时，会将所有新的写命令缓存在内存中，在salve node保存了rdb之后，再将新的写命令复制给salve node
- 5）`client-output-buffer-limit slave 256MB 64MB 60`，如果在复制期间，内存缓冲区持续消耗超过64MB，或者一次性超过256MB，那么停止复制，复制失败
- 6）slave node接收到rdb之后，清空自己的旧数据，然后重新加载rdb到自己的内存中，同时基于旧的数据版本对外提供服务
- （7）如果slave-node开启了AOF，那么会立即执行BGREWRITEAOF，重写AOF

> 增量复制

- 1）如果全量复制过程中，master-slave网络连接断掉，那么salve重新连接master时，会触发增量复制
- 2）master直接从自己的backlog中获取部分丢失的数据，发送给slave node，默认backlog就是1MB
- 3）msater就是根据slave发送的psync中的offset来从backlog中获取数据的

> heartbeat

- 主从节点互相都会发送`heartbeat`信息`master`默认每隔10秒发送一次heartbeat，`salve node`每隔1秒发送一个heartbeat

> 异步复制

- master每次接收到写命令之后，现在内部写入数据，然后异步发送给slave node

### 部署redis的读写分离架构
- 修改redis.conf中的部分配置为生产环境
- redis slave node只读，默认开启，slave-read-only
```
#让redis以daemon进程运行
daemonize	yes				
#设置redis的pid文件位置
pidfile		/var/run/redis_6379.pid 
port		6379						
dir 		/var/redis/6379				
#master上启用安全认证，requirepass
masterauth  123456
bind 192.168.1.1

#在slave node上配置
slaveof 192.168.1.2 6379
```

### redis主从架构的压测QPS
- redis自己提供的redis-benchmark压测工具，是最快捷最方便的，当然啦，这个工具比较简单，用一些简单的操作和场景去压测

```
./redis-benchmark -h 127.0.0.1

-c <clients>   客户端总数 (默认 50)
-n <requests>  请求总数(默认 100000)
-d <size>      SET / GET值的数据大小（以字节为单位,默认2字节）

./redis-benchmark -h 127.0.0.1  -c 100000，-n 10000000，-d 50
```

###  哨兵架构的相关基础知识
#### 哨兵的主要功能
- 1）集群监控，负责监控redis master和slave进程是否正常工作
- 2）消息通知，如果某个redis实例有故障，那么哨兵负责发送消息作为报警通知给管理员
- 3）故障转移，如果master node挂掉了，会自动转移到slave node上
- 4）配置中心，如果故障转移发生了，通知client客户端新的master地址
- 哨兵至少需要3个实例，来保证自己的健壮性
- 哨兵 + redis主从的部署架构，是不会保证数据零丢失的，只能保证redis集群的高可用性

#### 哨兵集群只有2个节点无法正常工作的原因

哨兵集群必须部署2个以上节点

如果哨兵集群仅仅部署了个2个哨兵实例，quorum=1

```
+----+         +----+
| M1 |---------| R1 |
| S1 |         | S2 |
+----+         +----+

Configuration: quorum = 1
```
- master宕机，s1和s2中只要有1个哨兵认为master宕机就可以还行切换，同时s1和s2中会选举出一个哨兵来执行故障转移
- 同时这个时候，需要majority，也就是大多数哨兵都是运行的，2个哨兵的majority就是2（2的majority=2，3的majority=2，5的majority=3，4的majority=2），2个哨兵都运行着，就可以允许执行故障转移
- 但是如果整个M1和S1运行的机器宕机了，那么哨兵只有1个了，此时就没有majority来允许执行故障转移，虽然另外一台机器还有一个R1，但是故障转移不会执行

#### 经典的3节点哨兵集群
```
       +----+
       | M1 |
       | S1 |
       +----+
          |
+----+    |    +----+
| R2 |----+----| R3 |
| S2 |         | S3 |
+----+         +----+

Configuration: quorum = 2，majority

```

- 如果M1所在机器宕机了，那么三个哨兵还剩下2个，S2和S3可以一致认为master宕机，然后选举出一个来执行故障转移
- 同时3个哨兵的majority是2，所以还剩下的2个哨兵运行着，就可以允许执行故障转移

### 哨兵主备切换的数据丢失问题
#### 异步复制导致的数据丢失

![Redis异步复制导致的数据丢失](http://tva4.sinaimg.cn/large/0068QeGHgy1g8792pwv9zj30ex08it9q.jpg)

- 因为`master ->slave`的复制是异步的，所以可能有部分数据还没复制到slave，master就宕机了，此时这些部分数据就丢失了

#### 脑裂导致的数据丢失
- 脑裂，也就是说，某个master所在机器突然脱离了正常的网络，跟其他slave机器不能连接，但是实际上master还运行着
- 此时哨兵可能就会认为master宕机了，然后开启选举，将其他slave切换成了master,这个时候，集群里就会有两个master，也就是所谓的脑裂
- 此时虽然某个slave被切换成了master，但是可能client还没来得及切换到新的master，还继续写向旧master的数据可能也丢失了
- 因此旧master再次恢复的时候，会被作为一个slave挂到新的master上去，自己的数据会清空，重新从新的master复制数据

#### 解决异步复制和脑裂导致的数据丢失

```
min-slaves-to-write 1
min-slaves-max-lag 10
```
- 上面两个配置可以减少异步复制和脑裂导致的数据丢失
- 要求至少有1个slave，数据复制和同步的延迟不能超过10秒
- 如果说一旦所有的slave，数据复制和同步的延迟都超过了10秒钟，那么这个时候，master就不会再接收任何请求了
- 有了`min-slaves-max-lag`这个配置，就可以确保说，一旦slave复制数据和`ack`延时太长，就认为可能master宕机后损失的数据太多了，那么就拒绝写请求，这样可以把master宕机时由于部分数据未同步到slave导致的数据丢失降低的可控范围内
- 如果一个master出现了脑裂，跟其他slave丢了连接，那么上面两个配置可以确保说，如果不能继续给指定数量的slave发送数据，而且slave超过10秒没有给自己ack消息，那么就直接拒绝客户端的写请求
- 这样脑裂后的旧master就不会接受client的新数据，也就避免了数据丢失;因此在脑裂场景下，最多就丢失10秒的数据

### 哨兵的多个核心底层原理的深入解析
#### sdown和odown转换机制
- sdown是主观宕机，就一个哨兵如果自己觉得一个master宕机了，那么就是主观宕机
- odown是客观宕机，如果quorum数量的哨兵都觉得一个master宕机了，那么就是客观宕机
- sdown达成的条件很简单，如果一个哨兵ping一个master，超过了`is-master-down-after-milliseconds`指定的毫秒数之后，就主观认为master宕机
- sdown到odown转换的条件很简单，如果一个哨兵在指定时间内，收到了quorum指定数量的其他哨兵也认为那个master是sdown了，那么就认为是odown了，客观认为master宕机

#### 哨兵集群的自动发现机制
- 哨兵互相之间的发现，是通过redis的pub/sub系统实现的，每个哨兵都会往`__sentinel__:hello`这个`channel`里发送一个消息，这时候所有其他哨兵都可以消费到这个消息，并感知到其他的哨兵的存在
- 每隔两秒钟，每个哨兵都会往自己监控的某个master+slaves对应的`__sentinel__:hello`,`channel`里发送一个消息，内容是自己的`host、ip`和`runid`还有对这个master的监控配置,然后去感知到同样在监听这个master+slaves的其他哨兵的存在
- 每个哨兵还会跟其他哨兵交换对master的监控配置，互相进行监控配置的同步

#### slave配置的自动纠正
- 哨兵会负责自动纠正slave的一些配置，比如slave如果要成为潜在的master候选人，哨兵会确保slave在复制现有master的数据; 如果slave连接到了一个错误的master上，比如故障转移之后，那么哨兵会确保它们连接到正确的master上

#### slave->master选举算法
如果一个master被认为odown了，而且majority哨兵都允许了主备切换，那么某个哨兵就会执行主备切换操作，此时首先要选举一个slave来,会考虑slave的一些信息

- 1）跟master断开连接的时长
- 2）slave优先级
- 3）复制offset
- 4）run id

如果一个slave跟master断开连接已经超过了down-after-milliseconds的10倍，外加master宕机的时长，那么slave就被认为不适合选举为master

```
(down-after-milliseconds * 10) + milliseconds_since_master_is_in_SDOWN_state
```

接下来会对slave进行排序

- 1）按照slave优先级进行排序，slave priority越低，优先级就越高
- 2）如果slave priority相同，那么看replica offset，哪个slave复制了越多的数据，offset越靠后，优先级就越高
- 3）如果上面两个条件都相同，那么选择一个run id比较小的那个slave

#### quorum和majority
- 每次一个哨兵要做主备切换，首先需要`quorum`数量的哨兵认为`odown`，然后选举出一个哨兵来做切换，这个哨兵还得得到`majority`哨兵的授权，才能正式执行切换
- 如果`quorum <majority`，比如5个哨兵，`majority`就是3，`quorum`设置为2，那么就3个哨兵授权就可以执行切换
- 但是如果`quorum>=majority`，那么必须`quorum`数量的哨兵都授权，比如5个哨兵，quorum是5，那么必须5个哨兵都同意授权，才能执行切换

#### configuration epoch
- 哨兵会对一套redis-master+slave进行监控，有相应的监控的配置
- 执行切换的那个哨兵，会从要切换到的新master（salve->master）那里得到一个`configuration:epoch`，这就是一个`version`号，每次切换的version号都必须是唯一的
- 如果第一个选举出的哨兵切换失败了，那么其他哨兵，会等待`failover-timeout`时间，然后接替继续执行切换，此时会重新获取一个新的`configuration epoch`，作为新的`version`号

#### configuraiton传播
- 哨兵完成切换之后，会在自己本地更新生成最新的master配置，然后同步给其他的哨兵，就是通过之前说的pub/sub消息机制
- 这里之前的version号就很重要了，因为各种消息都是通过一个channel去发布和监听的，所以一个哨兵完成一次新的切换之后，新的master配置是跟着新的version号的
- 其他的哨兵都是根据版本号的大小来更新自己的master配置的

#### 经典的三节点方式部署哨兵集群
- 哨兵的配置文件: `sentinel.conf`
- 最小的配置:每一个哨兵都可以去监控多个maser-slaves的主从架构

> sentinel monitor master-group-name hostname port quorum

- 1）至少多少个哨兵要一致同意，master进程挂掉了，或者slave进程挂掉了，或者要启动一个故障转移操作
- 2）quorum是用来识别故障的，真正执行故障转移的时候，还是要在哨兵集群执行选举，选举一个哨兵进程出来执行故障转移操作
- 3）假设有5个哨兵，quorum设置了2，那么如果5个哨兵中的2个都认为master挂掉了; 2个哨兵中的一个就会做一个选举，选举一个哨兵出来，执行故障转移; 如果5个哨兵中有3个哨兵都是运行的，那么故障转移就会被允许执行
```
port 5000
bind 192.168.31.187
dir /var/sentinal/5000
sentinel monitor mymaster 192.168.31.187 6379 2
sentinel down-after-milliseconds mymaster 30000
sentinel failover-timeout mymaster 60000
sentinel parallel-syncs mymaster 1

redis-sentinel /etc/sentinal/5000.conf
redis-server /etc/sentinal/5000.conf --sentinel

日志里会显示出来，每个哨兵都能去监控到对应的redis master，并能够自动发现对应的slave

哨兵之间，互相会自动进行发现，用的就是之前说的pub/sub，消息发布和订阅channel消息系统和机制

4、检查哨兵状态

redis-cli -h 192.168.31.187 -p 5000

sentinel master mymaster
SENTINEL slaves mymaster
SENTINEL sentinels mymaster

SENTINEL get-master-addr-by-name mymaster

```

### redis cluster
- 自动将数据进行分片，每个master上放一部分数据
- 提供内置的高可用支持，部分master不可用时，还是可以继续工作的
- 在redis cluster架构下，每个redis要放开两个端口号，比如一个是6379，另外一个就是加10000的端口号，比如16379
- 16379端口号是用来进行节点间通信的，也就是cluster bus的东西，集群总线。cluster bus的通信，用来进行故障检测，配置更新，故障转移授权

#### redis cluster的hash slot算法
- `redis cluster`有固定的`16384个hash slot`,对每个key计算`CRC16`值，然后对16384取模，可以获取key对应的hash slot
- redis cluster中每个master都会持有部分slot，比如有3个master，那么可能每个master持有5000多个hash slot
- hash slot让node的增加和移除很简单，增加一个master，就将其他master的hash,slot移动部分过去，减少一个master，就将它的hash slot移动到其他master上去
- 客户端的api，可以对指定的数据，让他们走同一个hash slot，通过`hash tag`来实现

#### redis cluster的重要配置
```
cluster-enabled <yes/no>
cluster-config-file <filename>
cluster-node-timeout <milliseconds>
```
- 是否开启集群
- 这是指定一个文件，供cluster模式下的redis实例将集群状态保存在那里，包括集群中其他机器的信息，比如节点的上线和下限，故障转移，不是我们去维护的，给它指定一个文件，让redis自己去维护的
- 节点存活超时时长，超过一定时长，认为节点宕机，master宕机的话就会触发主备切换，slave宕机就不会提供服务
- redis cluster集群，要求至少3个master，去组成一个高可用，健壮的分布式的集群，每个master都建议至少给一个slave，3个master，3个slave，最少的要求

```
port 7001
cluster-enabled yes
cluster-config-file /etc/redis-cluster/node-7001.conf
cluster-node-timeout 15000
daemonize	yes							
pidfile		/var/run/redis_7001.pid 						
dir 		/var/redis/7001		
logfile /var/log/redis/7001.log
bind 192.168.31.187		
appendonly yes
```
- 检查命令： redis-trib.rb check 192.168.31.187:7001
- 你在`redis cluster`写入数据的时候，其实是你可以将请求发送到任意一个master上去执行
- 但是，每个master都会计算这个key对应的`CRC16`值，然后对16384个hashslot取模，找到key对应的`hashslot`，找到hashslot对应的`master`
- 如果对应的master就在自己本地的话，`set mykey1 v1`，mykey1这个key对应的hashslot就在自己本地，那么自己就处理掉了
- 但是如果计算出来的`hashslot`在其他master上，那么就会给客户端返回一个`moved..error`，告诉你，你得到哪个master上去执行这条写入的命令
- 在这个`redis cluster`中，如果你要在`slave`读取数据，那么需要带上`readonly`指令，`get mykey1 redis-cli -c`启动，就会自动进行各种底层的重定向的操作

#### gossip通信和jedis smart定位以及主备切换

> 节点间的内部通信机制

- redis cluster节点间采取`gossip`协议进行通信,跟集中式不同，不是将集群元数据（节点信息，故障，等等）集中存储在某个节点上，而是互相之间不断通信，保持整个集群所有节点的数据是完整的,维护集群的元数据用得，集中式，一种叫做gossip
- 集中式：好处在于，元数据的更新和读取，时效性非常好，一旦元数据出现了变更，立即就更新到集中式的存储中，其他节点读取的时候立即就可以感知到; 不好在于，所有的元数据的跟新压力全部集中在一个地方，可能会导致元数据的存储有压力
- gossip：好处在于，元数据的更新比较分散，不是集中在一个地方，更新请求会陆陆续续，打到所有节点上去更新，有一定的延时，降低了压力; 缺点，元数据更新有延时，可能导致集群的一些操作会有一些滞后
- 每个节点都有一个专门用于节点间通信的端口，就是自己提供服务的端口号+10000，比如7001，那么用于节点间通信的就是17001端口
- 每隔节点每隔一段时间都会往另外几个节点发送`ping`消息，同时其他几点接收到ping之后返回`pong`
- 交换的信息:故障信息，节点的增加和移除，`hash slot`信息，等等
- `gossip`协议包含多种消息，包括ping，pong，meet，fail，等等
- meet: 某个节点发送`meet`给新加入的节点，让新节点加入集群中，然后新节点就会开始与其他节点进行通信。`redis-trib.rb add-node`其实内部就是发送了一个`gossip meet`消息，给新加入的节点，通知那个节点去加入我们的集群
- `ping:` 每个节点都会频繁给其他节点发送1ping1，其中包含自己的状态还有自己维护的集群元数据，互相通过ping交换元数据
- `pong`: 返回ping和meet，包含自己的状态和其他信息，也可以用于信息广播和更新
- `fail`: 某个节点判断另一个节点fail之后，就发送fail给其他节点，通知其他节点，指定的节点宕机了

#### ping消息深入
- ping很频繁，而且要携带一些元数据，所以可能会加重网络负担
- 每个节点每秒会执行10次ping，每次会选择5个最久没有通信的其他节点
- 当然如果发现某个节点通信延时达到了`cluster_node_timeout / 2`，那么立即发送ping，避免数据交换延时过长，落后的时间太长了
- 每次ping，一个是带上自己节点的信息，还有就是带上1/10其他节点的信息，发送出去，进行数据交换

#### 面向集群的jedis内部实现原理
- 基于重定向的客户端，很消耗网络IO，因为大部分情况下，可能都会出现一次请求重定向，才能找到正确的节点
- 所以大部分的客户端，比如java redis客户端，就是jedis，都是smart的
- 本地维护一份`hashslot -> node`的映射表，缓存，大部分情况下，直接走本地缓存就可以找到`hashslot -> node`，不需要通过节点进行`moved`重定向
- 在`JedisCluster`初始化的时候，就会随机选择一个node，初始化`hashslot -> node`映射表，同时为每个节点创建一个JedisPool连接池
- 每次基于JedisCluster执行操作，首先JedisCluster都会在本地计算key的hashslot，然后在本地映射表找到对应的节点
- 如果那个node正好还是持有那个hashslot，那么就ok;如果说进行了`reshard`这样的操作，可能`hashslot`已经不在那个node上了，就会返回`moved`
- 如果JedisCluter API发现对应的节点返回moved，那么利用该节点的元数据，更新本地的hashslot -> node映射表缓存
- 重复上面几个步骤，直到找到对应的节点，如果重试超过5次，那么就报错，JedisClusterMaxRedirectionException

#### hashslot迁移和ask重定向
- 如果hash slot正在迁移，那么会返回ask重定向给jedis
- jedis接收到ask重定向之后，会重新定位到目标节点去执行，但是因为ask发生在hash slot迁移过程中，所以JedisCluster API收到ask是不会更新hashslot本地缓存
- 已经可以确定说，hashslot已经迁移完了，moved是会更新本地hashslot->node映射表缓存的

#### 高可用性与主备切换原理
- redis cluster的高可用的原理，几乎跟哨兵是类似的
- 如果一个节点认为另外一个节点宕机，那么就是pfail，主观宕机
- 如果多个节点都认为另外一个节点宕机了，那么就是fail，客观宕机，跟哨兵的原理几乎一样，sdown，odown
- 在cluster-node-timeout内，某个节点一直没有返回pong，那么就被认为pfail
- 如果一个节点认为某个节点pfail了，那么会在gossip ping消息中，ping给其他节点，如果超过半数的节点都认为pfail了，那么就会变成fail
- 对宕机的master node，从其所有的slave node中，选择一个切换成master node
- 检查每个slave node与master node断开连接的时间，如果超过了`cluster-node-timeout *cluster-slave-validity-factor`，那么就没有资格切换成master,这个也是跟哨兵是一样的，从节点超时过滤的步骤
- 哨兵：对所有从节点进行排序，slave priority，offset，run id
- 每个从节点，都根据自己对master复制数据的offset，来设置一个选举时间，offset越大（复制数据越多）的从节点，选举时间越靠前，优先进行选举
- 所有的master node开始slave选举投票，给要进行选举的slave进行投票，如果大部分`master...node（N/2+1）`都投票给了某个从节点，那么选举通过，那个从节点可以切换成master,
- 整个流程跟哨兵相比，非常类似，所以说，redis cluster功能强大，直接集成了replication和sentinal的功能

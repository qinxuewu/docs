[TOC]

# Kafka 概念
* Kafka 是一种高吞吐量、分布式、基于发布/订阅的消息系统，最初由 LinkedIn 公司开发，使用
Scala 语言编写，目前是 Apache 的开源项目
* 一个典型的Kafka体系架构包括若干个Producer,若干个Broker,若干个Consumer,一集一个Zookeeper集群
* Producer ： 生产者，也就是发送消息的一方。生产者负责创建消息，然后将其投递到Kafka 中
* Consumer：消费者，也就是接收消息的一方。消费者连接到Kafka上并接收消息，进而进行相应的业务逻辑处理
* Broker：服务代理节点。对于Kafka而言，Broker可以简单地看作一个独立的Kafka服务节点或 Kafka 服务实例。一个或多个 Broker 组成了 一个 Kafka 集群
* 在 Kafka 中还有两个特别重要的概念主题（ Topic ）与分区（ Partition ）
* Kafka 中的消息以主题为单位进行归类，生产者负责将消息发送到特定的主题，消费者负责订阅主题并进行消费。
* 主题是一个逻辑上的概念，它还可以细分为多个分区，一个分区只属于单个主题
* 同一主题下的不同分区包含的消息是不同的，分区在存储层面可以看作一个可追加的日志（ Log ）文件。消息在被追加到分区日志、文件的时候都会分配一个特定的偏移量（ offset ）
* offset 是消息在分区中的唯一标识Kafka通过它来保证消息在分区内的顺序性，不过 offset 并不跨越分区，也就是说， Kafka 保证的是分区有序而不是主题有序。
* Kafka 为分区引入了多副本 （ Replica ） 机制， 通过增加副本数量可以提升容灾能力。同一分区的不同副本中保存的是相同的消息
* 副本之间是一主多从的关系，leader副本负责处理读写请求,follower副本只负责与leader副本的消息同步，副本处于不同的broker中。
* 当leader副本出现故障时,从follower副本中重新选择新的leader副本提供服务.
* Kafka 通过多副本机制实现了故障的自动转移，当 Kafka 集群中某个 broker 失效时仍然能保证服务可用

```
broker： Kafka 服务器，负责消息存储和转发
topic：消息类别， Kafka 按照 topic 来分类消息
partition： topic 的分区，一个topic可以包含多个partition，topic消息保存在各个partition 上
offset：消息在日志中的位置，可以理解是消息在partition上的偏移量，也是代表该消息的唯一序号
Producer：消息生产者
Consumer：消息消费者
Consumer Group：消费者分组，每个 Consumer 必须属于一个 group
Zookeeper：保存着集群 broker、 topic、 partition 等 meta数据；另外，还负责 broker 故障发现， partition leader 选举，负载均衡等功能
```
# Kafka 数据存储设计
* `partition` 中的每条 `Message` 包含了以下三个属性： `offset`， `MessageSize`， `data`， 其中 offset表示 Message 在这个partition中的偏移量，offset不是该Message在partition数据文件中的实际存储位置，而是逻辑上一个值，它唯一确定了 partition 中的一条 Message，可以认为 offset 是partition 中Message的id;MessageSize表示消息内容 data 的大小； data 为 Message 的具体内容

> 数据文件分段 segment（顺序读写、分段命令、二分查找)

* partition 物理上由多个 segment 文件组成，每个 segment 大小相等，顺序读写。每个 segment数据文件以该段中最小的 offset 命名，文件扩展名为.log。这样在查找指定 offset 的 Message 的时候，用二分查找就可以定位到该 Message 在哪个 segment 数据文件中。

> 数据文件索引（分段索引、 稀疏存储）

* Kafka 为每个分段后的数据文件建立了索引文件，文件名与数据文件的名字是一样的，只是文件扩展名为.index。 index 文件中并没有为数据文件中的每条 Message 建立索引，而是采用了稀疏存储的方式，每隔一定字节的数据建立一条索引。这样避免了索引文件占用过多的空间，从而可以将索引文件保留在内存中。

> 负载均衡（partition 会均衡分布到不同 broker 上）

* 由于消息 topic 由多个 partition 组成， 且 partition 会均衡分布到不同 broker 上，因此，为了有效利用 broker 集群的性能，提高消息的吞吐量， producer 可以通过随机或者 hash 等方式，将消息平均发送到多个 partition 上，以实现负载均衡

> 批量发送

* 是提高消息吞吐量重要的方式， Producer 端可以在内存中合并多条消息后， 以一次请求的方式发送了批量的消息给 broker，从而大大减少 broker 存储消息的 IO 操作次数。但也一定程度上影响了消息的实时性，相当于以时延代价，换取更好的吞吐量

> 压缩（GZIP 或 Snappy）

* Producer 端可以通过 GZIP 或 Snappy 格式对消息集合进行压缩。Producer端进行压缩之后，在Consumer端需进行解压。压缩的好处就是减少传输的数据量，减轻对网络传输的压力，在对大数据处理上，瓶颈往往体现在网络上而不是 CPU（压缩和解压会耗掉部分 CPU 资源）

> Consumer Group

* 同一 Consumer Group 中的多个 Consumer 实例，不同时消费同一个 partition，等效于队列模式。 partition 内消息是有序的， Consumer 通过 pull 方式消费消息。 Kafka 不删除已消费的消息
* 对于 partition，顺序读写磁盘数据，以时间复杂度 O(1)方式提供消息持久化能力。

# Kafka如何通过精妙的架构设计优化JVM GC问题
* 客户端发送消息给kafka服务器的时候，一定是有一个内存缓冲机制的。也就是说，消息会先写入一个内存缓冲中，然后直到多条消息组成了一个Batch，才会一次网络通信把Batch发送过去
* 那么这种内存缓冲机制的本意，其实就是把多条消息组成一个Batch，一次网络请求就是一个Batch或者多个Batch。这样每次网络请求都可以发送很多数据过去，避免了一条消息一次网络请求。从而提升了吞吐量，即单位时间内发送的数据量
* 这个Batch里的数据都发送过去了，现在Batch里的数据应该怎么处理？在Kafka客户端内部，对这个问题实现了一个非常优秀的机制，就是缓冲池的机制
* 每个Batch底层都对应一块内存空间，这个内存空间就是专门用来存放写入进去的消息的。当一个Batch被发送到了kafka服务器，这个Batch的数据不再需要了，就意味着这个Batch的内存空间不再使用了
* 这个Batch底层的内存空间不要交给JVM去垃圾回收，而是把这块内存空间给放入一个缓冲池里。缓冲池里放了很多块内存空间，下次如果你又有一个新的Batch了，那么不就可以直接从这个缓冲池里获取一块内存空间就ok了。如果一个Batch发送出去了之后，再把内存空间给人家还回来
* 一旦使用了这个缓冲池机制之后，就不涉及到频繁的大量内存的GC问题了。因为他可以上来就占用固定的内存，比如32MB。然后把32MB划分为N多个内存块，比如说一个内存块是16KB，这样的话这个缓冲池里就会有很多的内存块。
* 如果我现在把一个缓冲池里的内存资源都占满了，现在缓冲池里暂时没有内存块了，阻塞你的写入操作，不让你继续写入消息了。把你给阻塞住，不停的等待，直到有内存块释放出来，然后再继续让你写入消息。
* 


# 为什么使用消息队列啊？
* 先说一下消息队列的常见使用场景吧，其实场景有很多，但是比较核心的有3个：解耦、异步、削峰
* 面试技巧：你需要去考虑一下你负责的系统中是否有类似的场景，就是一个系统或者一个模块，调用了多个系统或者模块，互相之间的调用很复杂，维护起来很麻烦。但是其实这个调用是不需要直接同步调用接口的，如果用MQ给他异步化解耦，也是可以的，你就需要去考虑在你的项目里，是不是可以运用这个MQ去进行系统的解耦。在简历中体现出来这块东西，用MQ作解耦。

# 消息队列有什么优点和缺点啊？
* 优点上面已经说了，就是在特殊场景下有其对应的好处，解耦、异步、削峰
* 缺点: 系统可用性降低：系统引入的外部依赖越多，越容易挂掉，本来你就是A系统调用BCD三个系统的接口就好了，人ABCD四个系统好好的，没啥问题，你偏加个MQ进来，万一MQ挂了咋整？MQ挂了，整套系统崩溃了，你不就完了么。
* 系统复杂性提;一致性问题

# 如何保证消息队列的高可用啊？
* kafka一个最基本的架构认识：多个broker组成，每个broker是一个节点；你创建一个topic，这个topic可以划分为多个partition，每个partition可以存在于不同的broker上，每个partition就放一部分数据。这就是天然的分布式消息队列，就是说一个topic的数据，是分散放在多个机器上的，每个机器就放一部分数据。
* kafka 0.8以前，是没有HA机制的，就是任何一个broker宕机了，那个broker上的partition就废了，没法写也没法读，没有什么高可用性可言。
* kafka 0.8以后，提供了HA机制，就是replica副本机制。每个partition的数据都会同步到其他机器上，形成自己的多个replica副本。然后所有replica会选举一个leader出来，那么生产和消费都跟这个leader打交道，然后其他replica就是follower
* 写的时候，leader会负责把数据同步到所有follower上去，读的时候就直接读leader上数据即可。
* 只能读写leader？很简单，要是你可以随意读写每个follower，那么就要care数据一致性的问题，系统复杂度太高，很容易出问题。kafka会均匀的将一个partition的所有replica分布在不同的机器上，这样才可以提高容错性。
* 这么搞，就有所谓的高可用性了，因为如果某个broker宕机了，没事儿，那个broker上面的partition在其他机器上都有副本的，如果这上面有某个partition的leader，那么此时会重新选举一个新的leader出来，大家继续读写那个新的leader即可。这就有所谓的高可用性了。
* 写数据的时候，生产者就写leader，然后leader将数据落地写本地磁盘，接着其他follower自己主动从leader来pull数据。一旦所有follower同步好数据了，就会发送ack给leader，leader收到所有follower的ack之后，就会返回写成功的消息给生产者。
* 消费的时候，只会从leader去读，但是只有一个消息已经被所有follower都同步成功返回ack的时候，这个消息才会被消费者读到。

# 如何保证消息不被重复消费啊（如何保证消息消费时的幂等性）？
* kafka实际上有个offset的概念，就是每个消息写进去，都有一个offset，代表他的序号，然后consumer消费了数据之后，每隔一段时间，会把自己消费过的消息的offset提交一下，代表我已经消费过了，下次我要是重启啥的，你就让我继续从上次消费到的offset来继续消费吧。
* 但是凡事总有意外，比如我们之前生产经常遇到的，就是你有时候重启系统，看你怎么重启了，如果碰到点着急的，直接kill进程了，再重启。这会导致consumer有些消息处理了，但是没来得及提交offset，尴尬了。重启之后，少数消息会再次消费一次。
* 其实还是得结合业务来思考：比如你拿个数据要写库，你先根据主键查一下，如果这数据都有了，你就别插入了，update一下好吧；比如你是写redis，那没问题了，反正每次都是set，天然幂等性。还有比如基于数据库的唯一键来保证重复数据不会重复插入多条

# 如何保证消息的可靠性传输（如何处理消息丢失的问题）？
* 这个丢数据，mq一般分为两种，要么是mq自己弄丢了，要么是我们消费的时候弄丢了。
* 唯一可能导致消费者弄丢数据的情况，就是说，你那个消费到了这个消息，然后消费者那边自动提交了offset，让kafka以为你已经消费好了这个消息，其实你刚准备处理这个消息，你还没处理，你自己就挂了，此时这条消息就丢咯。
* 默认kafka会自动提交offset，那么只要关闭自动提交offset，在处理完之后自己手动提交offset，就可以保证数据不会丢。但是此时确实还是会重复消费，比如你刚处理完，还没提交offset，结果自己挂了，此时肯定会重复消费一次，自己保证幂等性就好了、
* kafka弄丢了数据,就是kafka某个broker宕机，然后重新选举partiton的leader时。是此时其他的follower刚好还有些数据没有同步，结果此时leader挂了，然后选举某个follower成leader之后，他不就少了一些数据
* 所以此时一般是要求起码设置如下4个参数:给这个topic设置replication.factor参数：这个值必须大于1，要求每个partition必须有至少2个副本
* 在kafka服务端设置min.insync.replicas参数：这个值必须大于1，这个是要求一个leader至少感知到有至少一个follower还跟自己保持联系，没掉队，这样才能确保leader挂了还有一个follower吧
* 在kafka服务端设置min.insync.replicas参数：这个值必须大于1，这个是要求一个leader至少感知到有至少一个follower还跟自己保持联系，没掉队，这样才能确保leader挂了还有一个follower吧
* 在producer端设置acks=all：这个是要求每条数据，必须是写入所有replica之后，才能认为是写成功了
* 在producer端设置retries=MAX（很大很大的一个值，无限次重试的意思）：这个是要求一旦写入失败，就无限重试，卡在这里了
* 这样配置之后，至少在kafka broker端就可以保证在leader所在broker发生故障，进行leader切换时，数据不会丢失

# 如何保证消息的顺序性？
* 你在mysql里增删改一条数据，对应出来了增删改3条binlog，接着这三条binlog发送到MQ里面，到消费出来依次执行，起码得保证人家是按照顺序来的吧？不然本来是：增加、修改、删除；你楞是换了顺序给执行成删除、修改、增加，不全错了么。
* kafka：一个 topic，一个 partition，一个 consumer，内部单线程消费，单线程吞吐量太低，一般不会用这个
* 写 N 个内存 queue，具有相同 key 的数据都到同一个内存 queue；然后对于 N 个线程，每个线程分别消费一个内存 queue 即可，这样就能保证顺序性。


# 有几百万消息持续积压几小时，说说怎么解决？
* 一般这个时候，只能操作临时紧急扩容了,先修复consumer的问题，确保其恢复消费速度，然后将现有cnosumer都停掉
* 新建一个topic，partition是原来的10倍，临时建立好原先10倍或者20倍的queue数量
* 然后写一个临时的分发数据的consumer程序，这个程序部署上去消费积压的数据，消费之后不做耗时的处理，直接均匀轮询写入临时建立好的10倍数量的queue
* 这种做法相当于是临时将queue资源和consumer资源扩大10倍，以正常的10倍速度来消费数据
* 等快速消费完积压数据之后，得恢复原先部署架构，重新用原先的consumer机器来消费消息






# Kafka中的ISR、AR又代表什么？ISR的伸缩又指什么
* AR：分区中的所有副本统称为AR
* ISR：所有与leader副本保持一定程度同步的副本（包括Leader）组成ISR
* ISR的伸缩：Kafka在启动的时候会开启两个与ISR相关的定时任务,任务会周期性的检测每个分区是否需要缩减其ISR集合.默认值为5000ms，当检测到ISR中有是失效的副本的时候，就会缩减ISR集合

# Kafka中的HW、LEO、LSO、LW等分别代表什么？
* 每个Kafka副本对象都有两个重要的属性：LEO和HW。注意是所有的副本，而不只是leader副本
* HW： High Watermark/高水位。 是已备份消息位置，HW之前的消息均可被consumer消费
* LEO: Log End Offset/日志末端偏移。是下一条消息写入位置(LEO=10 有9条消息)
* LSO:last stable offset/稳定偏移 。 LSO之前的消息状态都已确认
* LW:Low Watermark 的缩写，俗称“低水位”，

# Kafka中是怎么体现消息顺序性的？
* kafka每个partition中的消息在写入时都是有序的，消费时，每个partition只能被每一个group中的一个消费者消费，保证了消费时也是有序的。整个topic不保证有序

# Kafka中的分区器、序列化器、拦截器是否了解？它们之间的处理顺序是什么？
* 分区器:根据键值确定消息应该处于哪个分区中，默认情况下使用轮询分区，可以自行实现分区器接口自定义分区逻辑
* 序列化器:键序列化器和值序列化器，将键和值都转为二进制流 还有反序列化器 将二进制流转为指定类型数据
* 拦截器:两个方法 doSend()方法会在序列化之前完成 ; onAcknowledgement()方法在消息确认或失败时调用, 可以添加多个拦截器按顺序执行 调用顺序: 拦截器doSend() -> 序列化器 -> 分区器



# Kafka生产者客户端中使用了几个线程来处理？分别是什么？
* 2个，主线程和Sender线程。主线程负责创建消息，然后通过分区器、序列化器、拦截器作用之后缓存到累加器RecordAccumulator中
* Sender线程负责将RecordAccumulator中消息发送到kafka中



# 消费组中的消费者个数如果超过topic的分区，那么就会有消费者消费不到数据”这句话是否正确？如果不正确，那么有没有什么hack的手段？
* 不正确，通过自定义分区分配策略，可以将一个consumer指定消费所有partition


# 消费者提交消费位移时提交的是当前消费到的最新消息的offset还是offset+1?
* offset+1

# 有哪些情形会造成重复消费？
* 消费者消费后没有commit offset(程序崩溃/强行kill/消费耗时/自动提交偏移情况下unscrible)

# 那些情景下会造成消息漏消费？
* 消费者没有处理完消息 提交offset(自动提交偏移 未处理情况下程序异常结束)


# KafkaConsumer是非线程安全的，那么怎么样实现多线程消费？
* 在每个线程中新建一个KafkaConsumer
* 单线程创建KafkaConsumer，多个处理线程处理消息（难点在于是否要考虑消息顺序性，offset的提交方式）

# 简述消费者与消费组之间的关系
* 消费者从属与消费组，消费偏移以消费组为单位。每个消费组可以独立消费主题的所有数据，同一消费组内消费者共同消费主题数据，每个分区只能被同一消费组内一个消费者消费

# 当你使用kafka-topics.sh创建（删除）了一个topic之后，Kafka背后会执行什么逻辑？
* 创建:在zk上/brokers/topics/下节点 kafkabroker会监听节点变化创建主题
* 删除:调用脚本删除topic会在zk上将topic设置待删除标志，kafka后台有定时的线程会扫描所有需要删除的topic进行删除

# Kafka控制器的选举
- 在Kafka集群中会有一个或多个broker，其中有一个broker会被选举为控制器（KafkaController），它负责管理整个集群中所有分区和副本的状态等工作。
- 比如当某个分区的leader副本出现故障时，由控制器负责为该分区选举新的leader副本。再比如当检测到某个分区的ISR集合发生变化时，由控制器负责通知所有broker更新其元数据信息
- Kafka Controller的选举是依赖Zookeeper来实现的，在Kafka集群中哪个broker能够成功创建/controller这个临时节点他就可以成为Kafka Controller。

# Kafka配置信息分析

> 发送端的可选配置信息分析

- `acks` 配置表示 producer 发送消息到broker上以后的确认值`0`:表示producer不需要等待broker的消息确认。`1`:表示producer只需要获得kafka集群中的leader节点确认即可。`all(-1)`:需要ISR中所有的`Replica`给予接收确认，速度最慢，安全性最高
- `batch.size`：生产者发送多个消息到`broker`上的同一个分区时，为了减少网络请求带来的性能开销，通过批量的方式来提交消息，可以通过这个参数来控制批量提交的 字节数大小，默认大小是 `16384byte`,也就是 `16kb`，意味着当一批消息大小达到指定的 `batch.size` 的时候会统一发送
- `linger.ms`:Producer 默认会把两次发送时间间隔内收集到的所有`Requests`进行一次聚合然后再发送，以此提高吞吐量，而`linger.ms`就是为每次发送到 broker 的请求 增加一些 delay，以此来聚合更多的 Message 请求。
- `max.request.size`:设置请求的数据的最大字节数，为了防止发生较大的数据包影响到吞吐量，默认值为1MB

> 消费端的可选配置分析

- `group.id`:consumer group 是 kafka提供的可扩展且具有容错性的消费者机制.组内的所有消费者协调在一起来消费订阅主题的所有分区,每个分区只能由同一 个消费组内的一个 consumer 来消费
- `enable.auto.commit`:消费者消费消息以后自动提交，只有当消息提交以后，该消息才不会被再次接收到，还可以配合`auto.commit.interval.ms`控制自动提交的频率
- `auto.offset.reset`:这个参数是针对新的 groupid 中的消费者而言的,当有新 groupid 的消费者来 消费指定的topic时.`auto.offset.reset=latest` 情况下，新的消费者将会从其他消费者最后消费的`offset`处开始消费`Topic`下的消息。`auto.offset.reset=earliest`情况下，新的消费者会从该 topic 最早的消息开始消费;`auto.offset.reset=none`情况下，新的消费者加入以后，由于之前不存在offset，则会直接抛出异常
- `max.poll.records`:此设置限制每次调用 poll 返回的消息数，这样可以更容易的预测每次 poll 间隔 要处理的最大值。通过调整此值，可以减少 poll 间隔

# kafka 消息分发策略
- 默认情况下，`kafka`采用的是`hash`取模的分区算法.如果`Key`为`null`，则会随机分配一个分区。这个随机是在这个参数`”metadata.max.age.ms”`的时间范围内随机选择一个.对于这个时间段内，如果key为null，则只会发送到唯一的分区。这个值值哦默认情况下是10分钟更新一次。
- 在 kafka中存在两种分区分配策略，一种是`Range(默认范围分区)`、另一种另一种还是`RoundRobin(轮询)`。通过`partition.assignment.strategy`这个参数来设置。
- Range 策略是对每个主题而言的，首先对同一个主题里面 的分区按照序号进行排序，并对消费者按照字母顺序进行排序.假设我们有 10 个分区，3 个消费者，排完序的分区 将会是 0, 1, 2, 3, 4, 5, 6, 7, 8, 9;消费者线程排完序将会是 C1-0, C2-0, C3-0。然后将`partitions`的个数除于消费者线 程的总数来决定每个消费者线程消费几个分区.如果除不尽，那么前面几个消费者线程将会多消费一个分区.
- 轮询分区策略是把所有`partition` 和所有`consumer`线程都列出来，然后按照`hashcode`进行排序。最后通过轮询算法分配partition给消费线程。如果所有consumer实例的订阅是相同的，那么partition会均匀分布。使用轮询分区策略必须满足两个条件:每个主题的消费者实例具有相同数量的流,每个消费者订阅的主题必须是相同的.
- 当出现以下几种情况时，kafka会进行一次分区分配操作，也就是`kafka-consumer`的rebalance:同一个consumergroup内新增了消费者;消费者离开当前所属的`consumer-group`比如主动停机或者宕机;topic新增了分区(也就是分区数量发生了变化)

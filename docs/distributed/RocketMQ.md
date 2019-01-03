### 简介
 **RocketMQ 是一款分布式、队列模型的消息中间件，具有以下特点：** 
- 能够保证严格的消息顺序
- 提供丰富的消息拉取模式
- 高效的订阅者水平扩展能力
- 实时的消息订阅机制
- 亿级消息堆积能力

 **优点** 
- 强调集群无单点，可扩展，任意一点高可用，水平可扩展
- 海量消息堆积能力，消息堆积后，写入低延迟
- 支持上万个队列
- 消息失败重试机制
- 消息可查询

### windos简单RocketMQ 安装部署及运行
下载地址：http://rocketmq.apache.org/release_notes/release-notes-4.3.0/（二进制版本）
![输入图片说明](https://images.gitee.com/uploads/images/2018/0826/163530_2ee8df9d_1478371.png "屏幕截图.png")

 **设置系统环境变量** 
-  ROCKETMQ_HOME 指向 RocketMQ 的安装目录 此步非常重要，否则无法启动 NameServer 
![输入图片说明](https://images.gitee.com/uploads/images/2018/0826/163607_7b12f8e9_1478371.png "屏幕截图.png")

为了方便后续在命令提示符（cmd）窗口快速使用 RocketMQ 的命令，还需要将 %ROCKETMQ_HOME%\bin 添加到系统环境变量 Path 中。

 **启动 NameServer** 
- 在命令提示符（cmd）窗口中执行命令 mqnamesrv.cmd 启动日志如果有 The Name Server boot success 打印则表示NameServer 启动成功

 **启动 Broker** 
- 重新开启一个命令提示符（cmd）窗口，执行命令 mqbroker.cmd -n localhost:9876，注意只要没有报错日志应该就是启动成功了，如果启动成功则不会打印任何日志，不要关闭命令提示符（cmd）窗口。需要注意的是必须先启动 NameServer 再启动 Broker，Broker 要在 NameServer 上注册。

 **验证 RocketMQ 是否正常运行** 
- 首先，重新开启一个命令提示符（cmd）窗口，执行命令 set NAMESRV_ADDR=localhost:9876 设置环境变量，也可以像第 2 步一样将 NAMESRV_ADDR 添加到系统环境变量中；
- 其次，执行命令 tools.cmd org.apache.rocketmq.example.quickstart.Producer，运行官方示例中的消息生产者，可以看到消息全部成功发送
- 最后，执行命令 tools.cmd org.apache.rocketmq.example.quickstart.Consumer，运行官方示例中的消息消费者，可以看到消息全部成功消费

 **关闭 Broker 和 NameServer** 
- 首先，执行命令 mqshutdown.cmd broker 关闭 Broker，如果有 Broker 运行则会打印关闭的 Broker 所在线程
- 其次，执行命令 `` 关闭 NameServer，如果有 NameServer 运行则会打印关闭的 NameServer 所在线程

### RocketMQ Console安装（视化管理控制台）
- 下载 rocketmq-externals https://github.com/apache/rocketmq-externals
- 修改配置文件 rocketmq-externals-master/rocketmq-console/src/main/resources/application.propertis

```
rocketmq.config.namesrvAddr=localhost:9876
```
- 运行rocketmq-console项目
- 打开浏览器，输入 localhost:8080，可以看到如下界面

### 专业术语
 **Producer** 
- 消息生产者，负责产生消息，一般由业务系统负责产生消息。

 **Consumer** 
- 消息消费者，负责消费消息，一般是后台系统负责异步消费。

 **Push Consumer** 
- Consumer 的一种，应用通常吐 Consumer 对象注册一个 Listener 接口，一旦收到消息， Consumer 对象立刻回调 Listener 接口方法。

 **Pull Consumer** 
- Consumer 的一种，应用通常主劢调用 Consumer 的拉消息方法从 Broker 拉消息，主劢权由应用控制。
 **Producer Group** 
- 一类 Producer 的集合名称，返类 Producer 通常収送一类消息，丏収送逡辑一致。

 **Consumer Group** 
- 一类 Consumer 的集合名称，返类 Consumer 通常消费一类消息，丏消费逡辑一致。

- Broker
- 消息中转角色，负责存储消息，转収消息，一般也称为 Server。在 JMS 规范中称为 Provider。

 **广播消费** 
- 一条消息被多个 Consumer 消费，即使返些 Consumer 属亍同一个 Consumer Group，消息也会被 Consumer
- Group 中的每个 Consumer 都消费一次，广播消费中的 Consumer Group 概念可以讣为在消息划分方面无意丿。
- 在 CORBA Notification 规范中，消费方式都属亍广播消费。


集群消费
- 一个 Consumer Group 中的 Consumer 实例平均分摊消费消息。例如某个 Topic 有 9 条消息，其中一个
Consumer Group 有 3 个实例（可能是 3 个迕程，戒者 3 台机器），那举每个实例只消费其中的 3 条消息。
在 CORBA Notification 规范中，无此消费方式。
在 JMS 规范中， JMS point-to-point model 不乀类似，但是 RocketMQ 的集群消费功能大等亍 PTP 模型。
因为 RocketMQ 单个 Consumer Group 内的消费者类似亍 PTP，但是一个 Topic/Queue 可以被多个 Consumer
Group 消费。

**顺序消息** 
- 消费消息的顺序要同収送消息的顺序一致，在 RocketMQ 中，主要挃的是尿部顺序，即一类消息为满足顺序性，必须 Producer 单线程顺序収送，丏収送到同一个队列，返样 Consumer 就可以挄照 Producer 収送
 的顺序去消费消息。

 **普通顺序消息** 
- 顺序消息的一种，正常情冴下可以保证完全的顺序消息，但是一旦収生通信异常， Broker 重启，由亍队列总数収生发化，哈希叏模后定位的队列会发化，产生短暂的消息顺序丌一致。
- 如果业务能容忍在集群异常情冴（如某个 Broker 宕机戒者重启）下，消息短暂的乱序，使用普通顺序方式比较合适。

 **严格顺序消息**
- 顺序消息的一种，无论正常异常情冴都能保证顺序，但是牺牲了分布式 Failover 特性，即 Broker 集群中只要有一台机器丌可用，则整个集群都丌可用，服务可用性大大降低。
- 如果服务器部署为同步双写模式，此缺陷可通过备机自劢切换为主避免，丌过仍然会存在几分钟的服务丌可用。（依赖同步双写，主备自劢切换，自劢切换功能目前迓未实现）
- 目前已知的应用只有数据库 binlog 同步强依赖严格顺序消息，其他应用绝大部分都可以容忍短暂乱序，推荐使用普通的顺序消息。

 **Message Queue** 
- 在 RocketMQ 中，所有消息队列都是持丽化，长度无限的数据结构，所谓长度无限是挃队列中的每个存储
单元都是定长，访问其中的存储单元使用 Offset 来访问， offset 为 java long 类型， 64 位，理论上在 100
年内丌会溢出，所以讣为是长度无限，另外队列中只保存最近几天的数据，乀前的数据会挄照过期时间来
删除。也可以讣为 Message Queue 是一个长度无限的数组， offset 就是下标。

### sringBoot集成RocketMQ
pom.xml配置
```
 <!-- RocketMq客户端相关依赖 -->
        <dependency>
            <groupId>org.apache.rocketmq</groupId>
            <artifactId>rocketmq-client</artifactId>
            <version>4.3.0</version>
        </dependency>

        <dependency>
            <groupId>org.apache.rocketmq</groupId>
            <artifactId>rocketmq-common</artifactId>
            <version>4.3.0</version>
        </dependency>
```
application.properties配置
```
server.servlet.context-path=/rocketmqDemo
server.port=80

# 消费者的组名
apache.rocketmq.consumer.PushConsumer=PushConsumer
# 生产者的组名
apache.rocketmq.producer.producerGroup=Producer
# NameServer地址
apache.rocketmq.namesrvAddr=127.0.0.1:9876
```
代码片段

```
/**
 * 消息生产者
 */
@Component
public class Producer {

    /**
     * 生产者的组名
     */
    @Value("${apache.rocketmq.producer.producerGroup}")
    private String producerGroup;

    /**
     * NameServer 地址
     */
    @Value("${apache.rocketmq.namesrvAddr}")
    private String namesrvAddr;

    /**
     * @PostContruct是spring框架的注解，在方法上加该注解会在项目启动的时候执行该方法，也可以理解为在spring容器初始化的时候执行该方法。
     */



    @PostConstruct
    public void defaultMQProducer() {

        //生产者的组名
        DefaultMQProducer producer = new DefaultMQProducer(producerGroup);

        //指定NameServer地址，多个地址以 ; 隔开
        producer.setNamesrvAddr(namesrvAddr);

        try {

            /**
             * Producer对象在使用之前必须要调用start初始化，初始化一次即可
             * 注意：切记不可以在每次发送消息时，都调用start方法
             */
            producer.start();

            for (int i = 0; i < 100; i++) {

                String messageBody = "我是消息内容:" + i;

                String message = new String(messageBody.getBytes(), "utf-8");

                //构建消息
                Message msg = new Message("PushTopic" /* PushTopic */, "push"/* Tag  */, "key_" + i /* Keys */, message.getBytes());

                //发送消息
                SendResult result = producer.send(msg);


                System.out.println("发送响应：MsgId:" + result.getMsgId() + "，发送状态:" + result.getSendStatus());

            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            producer.shutdown();
        }

    }
}



@Component
public class Consumer {


    /**
     * 消费者的组名
     */
    @Value("${apache.rocketmq.consumer.PushConsumer}")
    private String consumerGroup;

    /**
     * NameServer地址
     */
    @Value("${apache.rocketmq.namesrvAddr}")
    private String namesrvAddr;

    /**
     * @PostContruct是spring框架的注解，在方法上加该注解会在项目启动的时候执行该方法，也可以理解为在spring容器初始化的时候执行该方法。
     */
    @PostConstruct
    public void defaultMQPushConsumer() {

        //消费者的组名
        DefaultMQPushConsumer consumer = new DefaultMQPushConsumer(consumerGroup);

        //指定NameServer地址，多个地址以 ; 隔开
        consumer.setNamesrvAddr(namesrvAddr);
        try {
            //订阅PushTopic下Tag为push的消息
            consumer.subscribe("PushTopic", "push");

            //设置Consumer第一次启动是从队列头部开始消费还是队列尾部开始消费
            //如果非第一次启动，那么按照上次消费的位置继续消费
            consumer.setConsumeFromWhere(ConsumeFromWhere.CONSUME_FROM_FIRST_OFFSET);
            consumer.registerMessageListener(new MessageListenerConcurrently() {

                @Override
                public ConsumeConcurrentlyStatus consumeMessage(List<MessageExt> list, ConsumeConcurrentlyContext context) {
                    try {
                        for (MessageExt messageExt : list) {

                            System.out.println("messageExt: " + messageExt);//输出消息内容

                            String messageBody = new String(messageExt.getBody(), "utf-8");

                            System.out.println("消费响应：Msg: " + messageExt.getMsgId() + ",msgBody: " + messageBody);//输出消息内容

                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                        return ConsumeConcurrentlyStatus.RECONSUME_LATER; //稍后再试
                    }
                    return ConsumeConcurrentlyStatus.CONSUME_SUCCESS; //消费成功
                }


            });
            consumer.start();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

```
### RocketMQ Linux单机部署 
下载源码版本 执行以下命令来解压缩4.3.0源代码版本并构建二进制
```
unzip rocketmq-all-4.3.0-source-release.zip
cd rocketmq-all-4.3.0/
mvn -Prelease-all -DskipTests clean install -U
cd distribution/target/apache-rocketmq

#启动  Name Server
nohup sh bin/mqnamesrv &
tail -f ~/logs/rocketmqlogs/namesrv.log

#启动Broker
nohup sh bin/mqbroker -n localhost:9876 &
tail -f ~/logs/rocketmqlogs/broker.log 

#如果启动失败 可能是默认设置内存太大（默认设置JVM都是2g,4g,6g） 本机内存不足
runbroker.sh runserver.sh tools.sh 三个文件jvm设置参数

#如果没用启用自动创建topic 需要执行如下命令
nohup sh mqbroker -n localhost:9876 autoCreateTopicEnable=true &

#关闭Servers
bin/mqshutdown broker
bin/mqshutdown namesrv


#默认配置修改（服务器多网关下 最好指定地址）
brokerClusterName = DefaultCluster
brokerName = broker-a
brokerId = 0
deleteWhen = 04
fileReservedTime = 48
brokerRole = ASYNC_MASTER
flushDiskType = ASYNC_FLUSH
namesrvAddr=10.10.0.10:9876
# 是否允许Broker 自动创建Topic，建议线下开启，线上关闭
autoCreateTopicEnable=true
# 是否允许Broker自动创建订阅组，建议线下开启，线上关闭
autoCreateSubscriptionGroup=true
# 刷盘方式
# - ASYNC_FLUSH 异步刷盘
# - SYNC_FLUSH 同步刷盘
flushDiskType=ASYNC_FLUSH
```
![输入图片说明](https://images.gitee.com/uploads/images/2018/1018/145520_8a7c0791_1478371.png "屏幕截图.png")



### RocketMQ——顺序消息和重复消息
- 消息有序指的是可以按照消息的发送顺序来消费。例如：一笔订单产生了 3 条消息，分别是订单创建、订单付款、订单完成。消费时，要按照顺序依次消费才有意义。与此同时多笔订单之间又是可以并行消费的。

 **1.普通顺序消费** 
- 顺序消费的一种，正常情况下可以保证完全的顺序消息，但是一旦发生通信异常，Broker重启，由于队列总数法还是能变化，哈希取模后定位的队列会变化，产生短暂的消息顺序不一致。

 **2.严格顺序消息** 
- 顺序消息的一种，无论正常异常情况都能保证顺序，但是牺牲了分布式failover特性，即broker集群中要有一台机器不可用，则整个集群都不可用，服务可用性大大降低。如果服务器部署为同步双写模式，此缺陷可通过备机自动切换为主避免，不过仍然会存在几分钟的服务不可用。


### RocketMQ集群方式部署（双Master方式）
![输入图片说明](https://images.gitee.com/uploads/images/2018/0828/110335_13b3e4f6_1478371.png "屏幕截图.png")

**上传解压【 两台机器】** 

```
#上传alibaba-rocketmq-3.2.6.tar.gz文件至/usr/local
# tar -zxvf alibaba-rocketmq-3.2.6.tar.gz -C /usr/local
# mv alibaba-rocketmq alibaba-rocketmq-3.2.6
# ln -s alibaba-rocketmq-3.2.6 rocketmq
ll /usr/local
```
**创建存储路径【 两台机器】** 

```
# mkdir /usr/local/rocketmq/store
# mkdir /usr/local/rocketmq/store/commitlog
# mkdir /usr/local/rocketmq/store/consumequeue
# mkdir /usr/local/rocketmq/store/index
```
**RocketMQ配置文件【 两台机器】** 

```
vim /usr/local/rocketmq/conf/2m-noslave/broker-a.properties
vim /usr/local/rocketmq/conf/2m-noslave/broker-b.properties


#所属集群名字
brokerClusterName=rocketmq-cluster
#broker名字，注意此处不同的配置文件填写的不一样
brokerName=broker-a|broker-b
#0 表示 Master， >0 表示 Slave
brokerId=0
#nameServer地址，分号分割
namesrvAddr=rocketmq-nameserver1:9876;rocketmq-nameserver2:9876
#在发送消息时，自动创建服务器不存在的topic，默认创建的队列数
defaultTopicQueueNums=4
#是否允许 Broker 自动创建Topic，建议线下开启，线上关闭
autoCreateTopicEnable=true
#是否允许 Broker 自动创建订阅组，建议线下开启，线上关闭
autoCreateSubscriptionGroup=true
#Broker 对外服务的监听端口
listenPort=10911
#删除文件时间点，默认凌晨 4点
deleteWhen=04
#文件保留时间，默认 48 小时
fileReservedTime=120
#commitLog每个文件的大小默认1G
mapedFileSizeCommitLog=1073741824
#ConsumeQueue每个文件默认存30W条，根据业务情况调整
mapedFileSizeConsumeQueue=300000
#destroyMapedFileIntervalForcibly=120000
#redeleteHangedFileInterval=120000
#检测物理文件磁盘空间
diskMaxUsedSpaceRatio=88
#存储路径
storePathRootDir=/usr/local/rocketmq/store
#commitLog 存储路径
storePathCommitLog=/usr/local/rocketmq/store/commitlog
#消费队列存储路径存储路径
storePathConsumeQueue=/usr/local/rocketmq/store/consumequeue
#消息索引存储路径
storePathIndex=/usr/local/rocketmq/store/index
#checkpoint 文件存储路径
storeCheckpoint=/usr/local/rocketmq/store/checkpoint
#abort 文件存储路径
abortFile=/usr/local/rocketmq/store/abort
#限制的消息大小
maxMessageSize=65536
#flushCommitLogLeastPages=4
#flushConsumeQueueLeastPages=2
#flushCommitLogThoroughInterval=10000
#flushConsumeQueueThoroughInterval=60000
#Broker 的角色
#- ASYNC_MASTER 异步复制Master
#- SYNC_MASTER 同步双写Master
#- SLAVE
brokerRole=ASYNC_MASTER
#刷盘方式
#- ASYNC_FLUSH 异步刷盘
#- SYNC_FLUSH 同步刷盘
flushDiskType=ASYNC_FLUSH
#checkTransactionMessageEnable=false
#发消息线程池数量
#sendMessageThreadPoolNums=128
#拉消息线程池数量
#pullMessageThreadPoolNums=128
```
**修改日志配置文件【 两台机器】** 
```
# mkdir -p /usr/local/rocketmq/logs
# cd /usr/local/rocketmq/conf && sed -i 's#${user.home}#/usr/local/rocketmq#g'*.xml
```
**修改启动脚本参数【 两台机器】** 
```
#vim /usr/local/rocketmq/bin/runbroker.sh

# 开发环境JVM Configuration
JAVA_OPT="${JAVA_OPT} -server -Xms1g -Xmx1g -Xmn512m -
XX:PermSize=128m -XX:MaxPermSize=320m


#vim /usr/local/rocketmq/bin/runserver.sh

JAVA_OPT="${JAVA_OPT} -server -Xms1g -Xmx1g -Xmn512m -
XX:PermSize=128m -XX:MaxPermSize=320m"
```
**启动NameServer【 两台机器】**
```
# cd /usr/local/rocketmq/bin
# nohup sh mqnamesrv &
```
**启动BrokerServer A【 192.168.100.24】** 

```
# cd /usr/local/rocketmq/bin
# nohup sh mqbroker -c /usr/local/rocketmq/conf/2m-noslave/broker-a.properties >/dev/null 2>&1 &
# netstat -ntlp
# jps
# tail -f -n 500 /usr/local/rocketmq/logs/rocketmqlogs/broker.log
# tail -f -n 500 /usr/local/rocketmq/logs/rocketmqlogs/namesrv.log
```
**启动BrokerServer B【 192.168.100.25】** 

```
# cd /usr/local/rocketmq/bin
# nohup sh mqbroker -c /usr/local/rocketmq/conf/2m-noslave/broker-b.properties >/dev/null 2>&1 &
# netstat -ntlp
# jps
# tail -f -n 500 /usr/local/rocketmq/logs/rocketmqlogs/broker.log
# tail -f -n 500 /usr/local/rocketmq/logs/rocketmqlogs/namesrv.log
```

**数据清理** 

```
# cd /usr/local/rocketmq/bin
# sh mqshutdown broker
# sh mqshutdown namesrv
# --等待停止
# rm -rf /usr/local/rocketmq/store
# mkdir /usr/local/rocketmq/store
# mkdir /usr/local/rocketmq/store/commitlog
# mkdir /usr/local/rocketmq/store/consumequeue
# mkdir /usr/local/rocketmq/store/index
# --按照上面步骤重启NameServer与BrokerServer
```

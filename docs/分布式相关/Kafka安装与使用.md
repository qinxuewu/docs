### kafka介绍
根据官网的介绍，ApacheKafka®是一个分布式流媒体平台，它主要有3种功能：
- 发布和订阅消息流，这个功能类似于消息队列，这也是kafka归类为消息队列框架的原因
- 以容错的方式记录消息流，kafka以文件的方式来存储消息流
- 可以再消息发布的时候进行处理

### 使用场景
- 在系统或应用程序之间构建可靠的用于传输实时数据的管道，消息队列功能
- 建实时的流数据处理程序来变换或处理数据流，数据处理功能


### Kafka所使用的基本术语：

Topic
- Kafka将消息种子(Feed)分门别类，每一类的消息称之为一个主题(Topic)

Producer
- 发布消息的对象称之为主题生产者(Kafka topic producer)

Consumer
- 订阅消息并处理发布的消息的种子的对象称之为主题消费者(consumers)

Broker
- 已发布的消息保存在一组服务器中，称之为Kafka集群。集群中的每一个服务器都是一个代理(Broker).消费者可以订阅一个或多个主题（topic），并从Broker拉数据，从而消费这些已发布的消息。

 **Kafka目前主要作为一个分布式的发布订阅式的消息系统使用  下图为消息传输流程** 

![输入图片说明](https://images.gitee.com/uploads/images/2018/0803/172529_eb95e4cd_1478371.png "屏幕截图.png")

- Producer即生产者，向Kafka集群发送消息，在发送消息之前，会对消息进行分类，即Topic，上图展示了两个producer发送了分类为topic1的消息，另外一个发送了topic2的消息。
- Topic即主题，通过对消息指定主题可以将消息分类，消费者可以只关注自己需要的Topic中的消息
- Consumer即消费者，消费者通过与kafka集群建立长连接的方式，不断地从集群中拉取消息，然后可以对这些消息进行处理。

### 下载
在kafka官网 http://kafka.apache.org/downloads下载到最新的kafka安装包，选择下载二进制版本的tgz文件

### 安装
- 首先确保你的机器上安装了jdk，kafka需要java运行环境，以前的kafka还需要zookeeper，新版的kafka已经内置了一个zookeeper环境，所以我们可以直接使用。
- 如果只需要进行最简单的尝试的话我们只需要解压到任意目录即可，这里我们将kafka压缩包解压到/home目录
![输入图片说明](https://images.gitee.com/uploads/images/2018/0803/174343_e2ae8023_1478371.png "屏幕截图.png")

kafka解压目录下下有一个config的文件夹，里面放置的是我们的配置文件

consumer.properites 消费者配置

producer.properties 生产者配置


 **server.properties kafka服务器的配置，此配置文件用来配置kafka服务器 目前仅介绍几个最基础的配置** 
- broker.id 申明当前kafka服务器在集群中的唯一ID，需配置为integer,并且集群中的每一个kafka服务器的id都应是唯一的，我们这里采用默认配置即可
- listeners 申明此kafka服务器需要监听的端口号，如果是在本机上跑虚拟机运行可以不用配置本项，默认会使用localhost的地址，如果是在远程服务器上运行则必须配置，例如：　`listeners=PLAINTEXT:// 192.168.180.128:9092`。并确保服务器的9092端口能够访问（或配置 advertised.listeners=PLAINTEXT:// 192.168.180.128:9092）
- zookeeper.connect 申明kafka所连接的zookeeper的地址 ，需配置为zookeeper的地址，由于本次使用的是kafka高版本中自带zookeeper，使用默认配置即可 `zookeeper.connect=localhost:2181`

### 运行
启动zookeeper
windows启动方式 `.\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties`
```
#前台启动
[root@CentOS124 home]# cd kafka2.11/
[root@CentOS124 kafka2.11]# bin/zookeeper-server-start.sh config/zookeeper.properties

#后台启动
[root@CentOS124 kafka2.11]# bin/zookeeper-server-start.sh config/zookeeper.properties 1>/dev/null 2>&1 &
[1] 18466

#查看是否启动成功
[root@CentOS124 ~]#  ps -ef|grep kafka
```
启动kafka
windows启动方式 `.\bin\windows\kafka-server-start.bat .\config\server.properties`
```
[root@CentOS124 kafka2.11]# bin/kafka-server-start.sh config/server.properties



#后台启动
[root@CentOS124 kafka2.11]# bin/kafka-server-start.sh config/server.properties 1>/dev/null 2>&1 &

#创建 topic
[root@CentOS124 kafka2.11]# bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic test



#查看Kafka 中的 topic 列表
bin/kafka-topics.sh --list --zookeeper localhost:2181
```

### 配置kafka集群 
- 条件有限，在同一个机器上启动三个broker来模拟kafka集群，三个broker使用另外安装的同一个zookeeper服务（实际集群中，每个broker通常在不同的机器上，也会使用不同host的zookeeper）

```
#复制server.properties配置文件为三份，分别起名为server.properties，server-2.properties，server-3.properties

三份配置中都要修改以下
#三个配置中分别修改为0,2,3
broker.id=0

#三个配置中分别修改为9092,9093,9094
port=9092

#kafka-logs，kafka-logs-2，kafka-logs-3
log.dirs=/tmp/kafka-logs

#都设置为3，即每个topic默认三个partition
num.partitions=3

#zookeeper集群地址，外部可以配置，这里环境有限  使用默认既可
zookeeper.connect=localhost:2181

#分别进入kafka目录下 执行如下命令启动服务控制台输出日子完成了
bin/kafka-server-start.sh config/server.properties
bin/kafka-server-start.sh config/server-2.properties
bin/kafka-server-start.sh config/server-3.properties
```


### springBoot中如何使用kafka
首先创建一个springBoot项目 引入spring-kafka
![输入图片说明](https://images.gitee.com/uploads/images/2018/0805/121233_6d03045f_1478371.png "屏幕截图.png")

 **application.properties 配置** 

```
server.port=8080

#kafka地址 brokers集群地址用,隔开
spring.kafka.bootstrap-servers=127.0.0.1:9092,127.0.0.1:9093,127.0.0.1:9094

#生产者的配置，大部分我们可以使用默认的，这里列出几个比较重要的属性
#每批次发送消息的数量
spring.kafka.producer.batch-size=16
#发送失败重试次数
spring.kafka.producer.retries=0
#即32MB的批处理缓冲区
spring.kafka.producer.buffer-memory=33554432
#key序列化方式
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.apache.kafka.common.serialization.StringSerializer

#消费者的配置
##Kafka中没有初始偏移或如果当前偏移在服务器上不再存在时,默认区最新 ，有三个选项 【latest, earliest, none】
spring.kafka.consumer.auto-offset-reset=latest
#是否开启自动提交
spring.kafka.consumer.enable-auto-commit=true
#自动提交的时间间隔
spring.kafka.consumer.auto-commit-interval=100
#key的解码方式
spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer
#value的解码方式
spring.kafka.consumer.value-deserializer=org.apache.kafka.common.serialization.StringDeserializer
#在kafka/config文件的consumer.properties中有配置
spring.kafka.consumer.group-id=test-consumer-group
```
 **创建Producer生产者** 

```
package com.example.modules;
import com.alibaba.fastjson.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import java.util.Date;
/**
 * 〈生产者〉
 * @author qinxuewu
 * @create 18/8/4下午11:56
 * @since 1.0.0
 */
@Component
public class Producer {
    @Autowired
    private KafkaTemplate kafkaTemplate;
    //发送消息方法
    public void send() {
        JSONObject obj=new JSONObject();
        obj.put("id",System.currentTimeMillis());
        obj.put("name","生产者发送消息");
        obj.put("date",new Date());
        //这个 topic 在 Java 程序中是不需要提前在 Kafka 中设置的，因为它会在发送的时候自动创建你设置的 topic
        kafkaTemplate.send("qxw",obj.toString());
    }
}

```
 **创建消费者** 

```
@Component
public class Consumer {
    private static final Logger logger = LoggerFactory.getLogger(Consumer.class);
    /**
     *  同时监听两个 topic 的消息了，可同时监听多个topic
     * @param record
     * @throws Exception
     */
    @KafkaListener(topics = {"test","qxw"})
    public void listen (ConsumerRecord<?, ?> record) throws Exception {
        Optional<?> kafkaMessage = Optional.ofNullable(record.value());
        if (kafkaMessage.isPresent()) {
            Object message = kafkaMessage.get();
            logger.info("消费者开始消费message：" + message);
        }
    }
}
```
 **运行后就可以看到控制台输出了** 
```
@RunWith(SpringRunner.class)                  
@SpringBootTest                               
public class KafkaDemoApplicationTests {      
    @Autowired                                
    private Producer producer;                
    @Test                                     
    public void contextLoads() {              
        for (int i = 0; i <3 ; i++) {         
            producer.send();                  
            try {                             
                Thread.sleep(1000);           
            } catch (InterruptedException e) {
                e.printStackTrace();          
            }                                 
        }                                     
    }                                         
}                                             
```

http://orchome.com/5

### kafka 配置文件参数详解
https://www.cnblogs.com/alan319/p/8651434.html

kafka的配置分为 broker、producter、consumer三个不同的配置

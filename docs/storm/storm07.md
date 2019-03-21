## 使用kafka-client jar进行Storm Apache Kafka集成
这包括新的Apache Kafka消费者API。兼容性 Apache Kafka版本0.10起
引入jar包
```java
    <dependency>
      <groupId>org.apache.storm</groupId>
      <artifactId>storm-kafka-client</artifactId>
      <version>1.2.0</version>
    </dependency>
```

## 从kafka中订阅消息读取
通过使用KafkaSpoutConfig类来配置spout实现。此类使用Builder模式，可以通过调用其中一个Builders构造函数或通过调用KafkaSpoutConfig类中的静态方法构建器来启动。

## 用法示例
创建一个简单的不kafka数据源
以下将使用发布到“topic”的所有事件，并将它们发送到MyBolt，其中包含“topic”，“partition”，“offset”，“key”，“value”字段。

```java
  TopologyBuilder tp = new TopologyBuilder();
            tp.setSpout("kafka_spout", new KafkaSpout(KafkaSpoutConfig.builder("localhost:9092" , "qxw").build()), 1);
            tp.setBolt("bolt", new MyBolt()).shuffleGrouping("kafka_spout");
            Config cfg=new Config();
            cfg.setNumWorkers(1);//指定工作进程数  （jvm数量，分布式环境下可用，本地模式设置无意义）
            cfg.setDebug(true);
            LocalCluster locl=new LocalCluster();
             locl.submitTopology("kkafka-topo",cfg,tp.createTopology());
```

```java
 public static  class MyBolt extends BaseBasicBolt{
            public void execute(Tuple tuple, BasicOutputCollector basicOutputCollector) {
                System.err.println("接受订阅kafka消息：  "+tuple.getStringByField("topic"));
                System.err.println("接受订阅kafka消息：  "+tuple.getStringByField("value"));
            }
            public void declareOutputFields(OutputFieldsDeclarer outputFieldsDeclarer) {
            }
        }
```

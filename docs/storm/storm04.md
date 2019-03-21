## 并行度(parallelism)概念
------------------

 - 一个运行中的拓扑是由什么构成的：工作进程（worker processes），执行器（executors）和任务（tasks）
 - 在 Worker 中运行的是拓扑的一个子集。一个 worker 进程是从属于某一个特定的拓扑的，在 worker
   进程中会运行一个或者多个与拓扑中的组件相关联的 executor。一个运行中的拓扑就是由这些运行于 Storm集群中的很多机器上的进程组成的。
 - 一个 executor 是由 worker 进程生成的一个线程。在 executor 中可能会有一个或者多个 task，这些 task
   都是为同一个组件（spout 或者 bolt）服务的。
 - task 是实际执行数据处理的最小工作单元（注意，task 并不是线程） —— 在你的代码中实现的每个 spout 或者 bolt 都会在集群中运行很多个 task。在拓扑的整个生命周期中每个组件的 task 数量都是保持不变的，不过每个组件的 executor数量却是有可能会随着时间变化。在默认情况下 task 的数量是和 executor 的数量一样的，也就是说，默认情况下 Storm会在每个线程上运行一个 task。


## Storm的流分组策略
-----------
 - Storm的分组策略对结果有着直接的影响，不同的分组的结果一定是不一样的。其次，不同的分组策略对资源的利用也是有着非常大的不同
 - 拓扑定义的一部分就是为每个Bolt指定输入的数据流，而数据流分组则定义了在Bolt的task之间如何分配数据流。


## 八种流分组定义
-------

### Shuffle grouping:
 - 随机分组：随机的将tuple分发给bolt的各个task，每个bolt实例接收到相同数量的tuple。

### Fields grouping
 - 按字段分组：根据指定的字段的值进行分组，举个栗子，流按照“user-id”进行分组，那么具有相同的“user-id”的tuple会发到同一个task，而具有不同“user-id”值的tuple可能会发到不同的task上。这种情况常常用在单词计数，而实际情况是很少用到，因为如果某个字段的某个值太多，就会导致task不均衡的问题。

### Partial Key grouping
 - 部分字段分组：流由分组中指定的字段分区，如“字段”分组，但是在两个下游Bolt之间进行负载平衡，当输入数据歪斜时，可以更好地利用资源。优点。有了这个分组就完全可以不用Fields grouping了

### All grouping
 - 广播分组：将所有的tuple都复制之后再分发给Bolt所有的task，每一个订阅数据流的task都会接收到一份相同的完全的tuple的拷贝。

### Global grouping
 - 全局分组：这种分组会将所有的tuple都发到一个taskid最小的task上。由于所有的tuple都发到唯一一个task上，势必在数据量大的时候会造成资源不够用的情况。

### None grouping
 - 不分组：不指定分组就表示你不关心数据流如何分组。目前来说不分组和随机分组效果是一样的，但是最终，Storm可能会使用与其订阅的bolt或spout在相同进程的bolt来执行这些tuple

### Direct grouping
 - 指向分组：这是一种特殊的分组策略。以这种方式分组的流意味着将由元组的生成者决定消费者的哪个task能接收该元组。指向分组只能在已经声明为指向数据流的数据流中声明。tuple的发射必须使用emitDirect种的一种方法。Bolt可以通过使用TopologyContext或通过在OutputCollector（返回元组发送到的taskID）中跟踪emit方法的输出来获取其消费者的taskID。

### Local or shuffle grouping:
本地或随机分组：和随机分组类似，但是如果目标Bolt在同一个工作进程中有一个或多个任务，那么元组将被随机分配到那些进程内task。简而言之就是如果发送者和接受者在同一个worker则会减少网络传输，从而提高整个拓扑的性能。有了此分组就完全可以不用shuffle grouping了。


## 示例
----
修改上一章节的Topology
[Storm(三)Java编写第一个本地模式demo](storm/storm03.md)
```java
package com.qxw.topology;
import org.apache.storm.Config;
import org.apache.storm.LocalCluster;
import org.apache.storm.topology.TopologyBuilder;
import org.apache.storm.tuple.Fields;

import com.qxw.bolt.OutBolt;
import com.qxw.bolt.OutBolt2;
import com.qxw.spout.DataSource;

/**
 * 拓扑的并行性
 * @author qxw
 * @data 2018年9月17日下午2:49:09
 */
public class TopologyTest2 {

	public static void main(String[] args) throws Exception {
		//配置
		Config cfg = new Config();
		cfg.setNumWorkers(2);//指定工作进程数  （jvm数量，分布式环境下可用，本地模式设置无意义）
		cfg.setDebug(false);
		
		//构造拓扑流程图
		TopologyBuilder builder = new TopologyBuilder();
		//设置数据源（产生2个执行器和俩个任务）
		builder.setSpout("dataSource", new DataSource(),2).setNumTasks(2);
		//设置数据建流处理组件（产生2个执行器和4个任务）
		builder.setBolt("out-bolt", new OutBolt(),2).shuffleGrouping("dataSource").setNumTasks(4); //随机分组
		//设置bolt的并行度和任务数:（产生6个执行器和6个任务）
//		builder.setBolt("out-bol2", new OutBolt2(),6).shuffleGrouping("out-bolt").setNumTasks(6); //随机分组
		
		//设置字段分组（产生8个执行器和8个任务）字段分组 
		builder.setBolt("out-bol2", new OutBolt2(),8).fieldsGrouping("out-bolt", new Fields("outdata")).setNumTasks(8);
		//设置广播分组
		//builder.setBolt("write-bolt", new OutBolt2(), 4).allGrouping("print-bolt");
		//设置全局分组
		//builder.setBolt("write-bolt", new OutBolt2(), 4).globalGrouping("print-bolt");
		
		//1 本地模式
		LocalCluster cluster = new LocalCluster();
		
		//提交拓扑图  会一直轮询执行
		cluster.submitTopology("topo", cfg, builder.createTopology());

		
		//2 集群模式
//		StormSubmitter.submitTopology("topo", cfg, builder.createTopology());
		
	}
}

}


```
本地模式
----
在本地模式下，Storm拓扑结构运行在本地计算机的单一JVM进程上。这个模式用于开发、测试以及调试，因为这是观察所有组件如何协同工作的最简单方法。在这种模式下，我们可以调整参数，观察我们的拓扑结构如何在不同的Storm配置环境下运行。要在本地模式下运行，我们要下载Storm开发依赖，以便用来开发并测试我们的拓扑结构。我们创建了第一个Storm工程以后，很快就会明白如何使用本地模式了。 
NOTE: 在本地模式下，跟在集群环境运行很像。不过很有必要确认一下所有组件都是线程安全的，因为当把它们部署到远程模式时它们可能会运行在不同的JVM进程甚至不同的物理机上，这个时候它们之间没有直接的通讯或共享内存。 


远程模式
----
在远程模式下，我们向Storm集群提交拓扑，它通常由许多运行在不同机器上的流程组成。远程模式不会出现调试信息， 因此它也称作生产模式。不过在单一开发机上建立一个Storm集群是一个好主意，可以在部署到生产环境之前，用来确认拓扑在集群环境下没有任何问题。

## 常用Java api
### 1）基本接口

```java
   （1）IComponent接口
   （2）ISpout接口
   （3）IRichSpout接口
   （4）IStateSpout接口
   （5）IRichStateSpout接口
   （6）IBolt接口
   （7）IRichBolt接口
   （8）IBasicBolt接口
```

### 2）基本抽象类

    （1）BaseComponent抽象类
    （2）BaseRichSpout抽象类
    （3）BaseRichBolt抽象类
    （4）BaseTransactionalBolt抽象类
    （5）BaseBasicBolt抽象类

### 创建数据源（Spouts )

```java
package com.qxw.spout;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import org.apache.storm.spout.SpoutOutputCollector;
import org.apache.storm.task.TopologyContext;
import org.apache.storm.topology.OutputFieldsDeclarer;
import org.apache.storm.topology.base.BaseRichSpout;
import org.apache.storm.tuple.Fields;
import org.apache.storm.tuple.Values;




/**
 * 数据源 spout
 * @author qxw
 * @data 2018年9月17日上午11:21:00
 * 
 * 申明数据源的方式：继承BaseRichSpout类 ， 重写需要的方法。实现IRichSpout接口 重写所有的方法
 */
public class DataSource  extends BaseRichSpout {

	private static final long serialVersionUID = 1L;
    private SpoutOutputCollector collector;
	
	private static final Map<Integer, String> map = new HashMap<Integer, String>();
	
	static {
		map.put(0, "java");
		map.put(1, "php");
		map.put(2, "groovy");
		map.put(3, "python");
		map.put(4, "ruby");
	}

	/**
	 * 初始化方法
	 */
	@Override
	public void open(Map conf, TopologyContext context, SpoutOutputCollector collector) {
		this.collector = collector;
		
	}
	
	/**
	 * 轮询tuple 发送数据
	 */
	@Override
	public void nextTuple() {
		//这里可以查询数据库 或者读取消息队列中的数据、测试使用map替代
		final Random r = new Random();
		int num = r.nextInt(5);
		try {
			Thread.sleep(500);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		//发送单词到下一个拓扑节点
		this.collector.emit(new Values(map.get(num)));

		
	}



	/**
	 * 声明发送数据的名称
	 */
	@Override
	public void declareOutputFields(OutputFieldsDeclarer declarer) {
		//指定名称 用于下一个节店取值时使用
		declarer.declare(new Fields("data"));
		
	}

	
	
	/**
	 * 在该spout关闭前执行，但是并不能得到保证其一定被执行
	 */
	@Override
	public void close() {
		System.out.println("spout关闭前执行");
		
	}

	/**
	 *  当Spout已经从失效模式中激活时被调用。该Spout的nextTuple()方法很快就会被调用。
	 */
	@Override
	public void activate() {
		System.out.println("当Spout已经从失效模式中激活时被调用");
		
	}

	/**
	 * 当Spout已经失效时被调用。在Spout失效期间，nextTuple不会被调用。Spout将来可能会也可能不会被重新激活。
	 */
	@Override
	public void deactivate() {
		System.out.println("当Spout已经失效时被调用");
		
	}
	
	
	/**
	 * 成功处理tuple回调方法
	 */
	@Override
	public void ack(Object paramObject) {
		System.out.println("成功处理tuple回调方法");
		
	}

	/**
	 * 处理失败tuple回调方法
	 */
	@Override
	public void fail(Object paramObject) {
		System.out.println("paramObject");
		
	}



}

```
### 数据流处理组件

```java
package com.qxw.bolt;
import org.apache.storm.topology.BasicOutputCollector;
import org.apache.storm.topology.OutputFieldsDeclarer;
import org.apache.storm.topology.base.BaseBasicBolt;
import org.apache.storm.tuple.Fields;
import org.apache.storm.tuple.Tuple;
import org.apache.storm.tuple.Values;
/**
 * 数据库流处理组件
 * 
 * 打印出输处理的bolt
 * 实现方式：继承BaseBasicBolt类  或实现IBasicBolt
 * @author qxw
 * @data 2018年9月17日上午11:36:07
 */
public class OutBolt extends BaseBasicBolt {
	private static final long serialVersionUID = 1L;
 
	/**
	 * 接受一个tuple进行处理，也可发送数据到下一级组件
	 */
	@Override
	public void execute(Tuple input, BasicOutputCollector collector) {
		////获取上一个组件所声明的Field
		String value=input.getStringByField("data");
		System.out.println("数据源发送的data: "+value);
		//发送到下一个组件
		collector.emit(new Values(value));
	}

	/**
	 * 声明发送数据的名称
	 */
	@Override
	public void declareOutputFields(OutputFieldsDeclarer declarer) {
		//可同时发送多个Field
		declarer.declare(new Fields("outdata"));
	}
}

```

```java
package com.qxw.bolt;
import org.apache.storm.topology.BasicOutputCollector;
import org.apache.storm.topology.OutputFieldsDeclarer;
import org.apache.storm.topology.base.BaseBasicBolt;
import org.apache.storm.tuple.Tuple;
/**
 * 数据库流处理组件
 * 
 * 打印出输处理的bolt
 * 实现方式：继承BaseBasicBolt类  或实现IBasicBolt
 * @author qxw
 * @data 2018年9月17日上午11:36:07
 */
public class OutBolt2 extends BaseBasicBolt {

	
	private static final long serialVersionUID = 1L;
 
	/**
	 * 接受一个tuple进行处理，也可发送数据到下一级组件
	 */
	@Override
	public void execute(Tuple input, BasicOutputCollector collector) {
		////获取上一个组件所声明的Field
		String value=input.getStringByField("outdata");
		System.out.println("接收OutBolt数据库流处理组件发送的值：   "+value);
		
	}

	/**
	 * 声明发送数据的名称
	 */
	@Override
	public void declareOutputFields(OutputFieldsDeclarer declarer) {
	}

}

```
### 构造拓扑图

```java
package com.qxw.topology;
import org.apache.storm.Config;
import org.apache.storm.LocalCluster;
import org.apache.storm.topology.TopologyBuilder;
import com.qxw.bolt.OutBolt;
import com.qxw.bolt.OutBolt2;
import com.qxw.spout.DataSource;
public class TopologyTest {

	public static void main(String[] args) throws Exception {
		//配置
		Config cfg = new Config();
		cfg.setNumWorkers(2);//指定工作进程数  （jvm数量，分布式环境下可用，本地模式设置无意义）
		cfg.setDebug(true);
		
		//构造拓扑流程图
		TopologyBuilder builder = new TopologyBuilder();
		//设置数据源
		builder.setSpout("dataSource", new DataSource());
		//设置数据建流处理组件
		builder.setBolt("out-bolt", new OutBolt()).shuffleGrouping("dataSource");//随机分组
		builder.setBolt("out-bol2", new OutBolt2()).shuffleGrouping("out-bolt");
		
		
		//1 本地模式
		LocalCluster cluster = new LocalCluster();
		
		//提交拓扑图  会一直轮询执行
		cluster.submitTopology("topo", cfg, builder.createTopology());

		
		//2 集群模式
//		StormSubmitter.submitTopology("topo", cfg, builder.createTopology());
		
	}
}

```

## storm实现单词计数器统计

![在这里插入图片描述](https://img-blog.csdn.net/20180918115939860?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3UwMTAzOTEzNDI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

### 数据源Spout

```java
package com.qxw.wordCount;
import java.util.Map;
import org.apache.storm.spout.SpoutOutputCollector;
import org.apache.storm.task.TopologyContext;
import org.apache.storm.topology.IRichSpout;
import org.apache.storm.topology.OutputFieldsDeclarer;
import org.apache.storm.tuple.Fields;
import org.apache.storm.tuple.Values;
/**
 * 数据源
 * @author qxw
 * @data 2018年9月18日上午11:58:35
 */
public class WordSpout implements IRichSpout{

	private static final long serialVersionUID = 1L;
	private SpoutOutputCollector collector;
	
	private int index=0;
	  private final String[] lines = {
			    "long long ago I like playing with cat",
			    "playing with cat make me happy",
			    "I feel happy to be with you",
			    "you give me courage",
			    "I like to be together with you",
			    "long long ago I like you"
			    };
	//初始化
	@Override
	public void open(Map conf, TopologyContext context,SpoutOutputCollector collector) {
		this.collector=collector;
		
	}

	//发送数据
	@Override
	public void nextTuple() {
		this.collector.emit(new Values(lines[index]));
		index++;
		if(index>=lines.length){
			index=0;
		}
		try {
			Thread.sleep(1000);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}
	

	@Override
	public void declareOutputFields(OutputFieldsDeclarer declarer) {
		declarer.declare(new Fields("line"));
		
	}

	@Override
	public void close() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void activate() {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void deactivate() {
		// TODO Auto-generated method stub
		
	}

	

	@Override
	public void ack(Object msgId) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void fail(Object msgId) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public Map<String, Object> getComponentConfiguration() {
		// TODO Auto-generated method stub
		return null;
	}

}

```
### 切割组件

```java
public class WordSplitBolt implements IRichBolt {

	private static final long serialVersionUID = 1L;
	 private OutputCollector collector;
	 
	@Override
	public void prepare(Map stormConf, TopologyContext context,OutputCollector collector) {
		 this.collector = collector;
		
	}
	 /**
     * 这个函数也会被不断执行，但它的数据来自于上游。
     * 这里将文本行分割为单词，并发送
     * @param tuple
     */
	@Override
	public void execute(Tuple input) {
		 String line = input.getStringByField("line");
	     String[] words = line.split(" ");
	      for(String word : words){
	            this.collector.emit(new Values(word));
	       }
		
	}

	@Override
	public void declareOutputFields(OutputFieldsDeclarer declarer) {
		declarer.declare(new Fields("word"));
		
	}
	
	@Override
	public void cleanup() {
		// TODO Auto-generated method stub
		
	}

	

	@Override
	public Map<String, Object> getComponentConfiguration() {
		// TODO Auto-generated method stub
		return null;
	}

}
```
### 统计组件

```java
public class WordCountBolt implements IRichBolt{

	private static final long serialVersionUID = 1L;
	private OutputCollector collector;
	private HashMap<String, Long> counts=null;
	 
	/**
	 * 初始化放方法
	 */
	@Override
	public void prepare(Map stormConf, TopologyContext context,OutputCollector collector) {
		 this.collector = collector;
		 this.counts=new HashMap<String, Long>();
	}

	/**
	 * 统计单词出现的次数 一般是存储到数据库
	 */
	@Override
	public void execute(Tuple input) {
		String word=input.getStringByField("word");
		 Long count = 1L;
	     if(counts.containsKey(word)){
	    	 count = counts.get(word) + 1;
	      }
	     counts.put(word, count);
	     System.out.println("统计单词："+word+" 出现次数: "+count);
	     this.collector.emit(new Values(word, count));
		
	}


	@Override
	public void declareOutputFields(OutputFieldsDeclarer declarer) {
		declarer.declare(new Fields("word","count"));
		
	}

	@Override
	public void cleanup() {
		// TODO Auto-generated method stub
		
	}

	
	@Override
	public Map<String, Object> getComponentConfiguration() {
		// TODO Auto-generated method stub
		return null;
	}

}

```
### 输出组件

```java
public class WordReportBolt implements IRichBolt {

	
	private static final long serialVersionUID = 1L;


	@Override
	public void prepare(Map stormConf, TopologyContext context,
			OutputCollector collector) {
	

		
	}

	@Override
	public void execute(Tuple input) {
		String word=input.getStringByField("word");
		Long count=input.getLongByField("count");
		
		System.out.printf("实时统计单词出现次数  "+"%s\t%d\n", word, count);


	}

	@Override
	public void declareOutputFields(OutputFieldsDeclarer declarer) {
		// TODO Auto-generated method stub
		
	}
	@Override
	public void cleanup() {
			
	}



	@Override
	public Map<String, Object> getComponentConfiguration() {
		// TODO Auto-generated method stub
		return null;
	}

}

```
### Topology主函数类

```java
public class WordTopology {

	public static void main(String[] args) throws InterruptedException {
	
		// 组建拓扑，并使用流分组
        TopologyBuilder builder = new TopologyBuilder();
        builder.setSpout("WordSpout", new WordSpout());
        builder.setBolt("WordSplitBolt", new WordSplitBolt(),5).shuffleGrouping("WordSpout");
        builder.setBolt("WordCountBolt", new WordCountBolt(),5).fieldsGrouping("WordSplitBolt", new Fields("word"));
        builder.setBolt("WordReportBolt", new WordReportBolt(),10).globalGrouping("WordCountBolt");
        
        
		//配置
		Config cfg = new Config();
		cfg.setDebug(false);
        LocalCluster cluster = new LocalCluster();
      		
      //提交拓扑图  会一直轮询执行
       cluster.submitTopology("wordcount-topo", cfg, builder.createTopology());
	}
}![在这里插入图片描述](https://img-blog.csdn.net/20180918131421260?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3UwMTAzOTEzNDI=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)
```
<img src="_media/storm2.png">
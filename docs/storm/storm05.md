## Trident简介
 - Trident拥有一流的抽象，可以读取和写入有状态的来源。状态可以是拓扑的内部 - 例如，保存在内存中并由HDFS支持 -  或者外部存储在Memcached或Cassandra等数据库中。在任何一种情况下，Trident API都没有区别。
 - Trident以容错的方式管理状态，以便状态更新在重试和失败时是幂等的。这使您可以推理Trident拓扑，就好像每条消息都是精确处理一次一样。
 - 在进行状态更新时，可以实现各种级别的容错

## 例子说明
假设您正在对流进行计数聚合，并希望将运行计数存储在数据库中。现在假设您在数据库中存储了一个表示计数的值，并且每次处理新元组时都会增加计数。

发生故障时，将重发送元组。这会在执行状态更新（或任何带有副作用的事物）时出现问题 - 您不知道以前是否曾基于此元组成功更新状态。也许你以前从未处理过元组，在这种情况下你应该增加计数。也许你已经处理了元组并成功递增了计数，但是元组在另一个步骤中处理失败。在这种情况下，您不应增加计数。或许您之前看过元组但在更新数据库时出错。在这种情况下，您应该更新数据库。

只需将计数存储在数据库中，您就不知道之前是否已经处理过这个元组。因此，您需要更多信息才能做出正确的决定。Trident提供以下语义，足以实现一次性处理语义：
 1. 元组作为小批量处理
 2. 每批元组都有一个称为“事务ID”（txid）的唯一ID。如果批量重播，则给出完全相同的txid
 3. 批次之间订购状态更新。也就是说，在批处理2的状态更新成功之前，不会应用批处理3的状态更新。

使用这些原语，您的State实现可以检测之前是否已经处理了一批元组，并采取适当的操作以一致的方式更新状态。您采取的操作取决于输入splot提供的确切语义，即每批中的内容。在容错方面有三种可能的splot：“非事务性”，“事务性”和“不透明事务性”。同样，在容错方面有三种可能的状态：“非事务性”，“事务性”和“不透明事务性”。让我们来看看每个splot类型，看看每种喷口可以达到什么样的容错能力。

## Transactional spout(事物性spouts)
请记住，Trident将元组作为小批量处理，每个批次都被赋予唯一的事务ID。spout的属性根据它们可以提供的关于每批中的含量的保证而变化。事务性spout具有以下属性：
 1. 给定txid的批次始终相同。对txid进行批量重放将与第一次为该txid发出批次完全相同的元组集。
 2. 批处理元组之间没有重叠（元组是一批或另一批，从不多元组）。
 3. 每个元组都是一个批处理（没有跳过元组）
这是一个非常容易理解的事物性spout，将流分为不变的固定批次。Storm 为Kafka 实施了一个事务spout。

## 为什么不总是使用事务性spout？
它们简单易懂。您可能不使用它的一个原因是因为它们不一定非常容错。例如，TransactionalTridentKafkaSpout的工作方式是txid的批处理将包含来自主题的所有Kafka分区的元组。一旦批次被发出，那么在将来重新发出批次的任何时候都必须发出完全相同的元组集合以满足事务性喷口的语义。现在假设从TransactionalTridentKafkaSpout发出批处理，批处理无法处理，同时其中一个Kafka节点发生故障。您现在无法重播与之前相同的批次（因为节点已关闭且主题的某些分区不可用），

这就是存在“不透明事务”spout的原因 - 它们对丢失源节点具有容错能力，同时仍允许您实现一次性处理语义。

（一方面注意 - 一旦Kafka支持复制，就有可能拥有对节点故障具有容错能力的事务性spout，但该功能尚不存在。）


假设您的拓扑计算字数，并且您希望将字数存储在键/值数据库中。键将是单词，值将包含计数。您已经看到只存储计数，因为该值不足以知道您之前是否处理过一批元组。相反，您可以做的是将事务id与数据库中的count一起存储为原子值。然后，在更新计数时，您只需将数据库中的事务ID与当前批次的事务ID进行比较。如果它们是相同的，则跳过更新 - 由于强大的排序，您确定数据库中的值包含当前批次。如果它们不同，则增加计数。这个逻辑有效，因为txid的批处理永远不会改变，

假设您正在处理由以下一批元组组成的txid 3：
```
["man"]
["man"]
["dog"]
```
假设数据库当前包含以下键/值对：
```
man => [count=3, txid=1]
dog => [count=4, txid=3]
apple => [count=10, txid=2]
```
与“man”关联的txid为txid 1.由于当前txid为3，因此您确定该批次中未表示此批元组。因此，您可以继续将计数增加2并更新txid。另一方面，“dog”的txid与当前的txid相同。因此，您确定已知当前批次的增量已在数据库中表示为“dog”键。所以你可以跳过更新。完成更新后，数据库如下所示：
```
man => [count=5, txid=3]
dog => [count=4, txid=3]
apple => [count=10, txid=2]
```

## 不透明事务性(模糊事务型)
模糊事务型spout不能保证txid的一批元组保持不变。不透明的事务性spout具有以下属性：
 1. 每个元组只需一批成功处理。但是，元组可能无法在一个批处理中处理，然后在稍后的批处理中成功处理。
 2. 对于不透明的事务性spout，如果数据库中的事务id与当前批处理的事务id相同，则不再可能使用跳过状态更新的技巧。这是因为批次可能在状态更新之间发生了变化。

## 非事务型 spout
非事务型 spout不对每批中的物品提供任何保证。因此它可能最多只进行一次处理，在这种情况下，在批次失败后不会重试元组。或者它可能具有至少一次处理，其中元组可以通过多个批次成功处理。对于这种spout，没有办法实现完全一次的语义。

## 不同类型的 Spout 与 State 的总结

模糊事务型 state 具有最好的容错性特征，不过这是以在数据库中存储更多的内容为代价的（一个 txid 和两个 value）。事务型 state 要求的存储空间相对较小，但是它的缺点是只对事务型 spout 有效。相对的，非事务型要求的存储空间最少，但是它也不能提供任何的恰好一次的消息执行语义。

你选择 state 与 spout 的时候必须在容错性与存储空间占用之间权衡。可以根据你的应用的需求来确定哪种组合最适合你。

## Trident代码实例 
简单输出数据
```java
public class TridentTopology1 {
	
	/**
	 * 接受一组输入字段并发出零个或多个元组作为输出 （类似storm bolt数据流处理组件）
	 * @author qxw
	 * @data 2018年9月19日下午6:17:14
	 */
	public static class MyFunction extends BaseFunction {
		private static final long serialVersionUID = 1L;
		public void execute(TridentTuple tuple, TridentCollector collector) {
			 System.out.println("a:  "+tuple.getIntegerByField("a"));
			 System.out.println("b:  "+tuple.getIntegerByField("b"));
			 System.out.println("c:  "+tuple.getIntegerByField("c"));
			 System.out.println("d:  "+tuple.getIntegerByField("d"));
	    }
	}
	
	@SuppressWarnings("unchecked")
	public static void main(String[] args) {
		//固定批处理数据源（类似storm原生的spout） 声明2个输入的字段
		FixedBatchSpout spout =new FixedBatchSpout(new Fields("a","b","c","d"),4,//设置批处理大小
				new Values(1,4,7,10),
				new Values(2,3,5,7),
				new Values(6,9,7,2),
				new Values(9,1,6,8)  //设置数据内容
		);
		//是否循环发送
		spout.setCycle(false);
		
		//创建topology
		TridentTopology topology =new TridentTopology();
		//指定数据源
		 Stream input=topology.newStream("spout", spout);
		//要实现storm原生spolt--bolt的模式在Trident中用each实现
		 input.each(new Fields("a","b","c","d"), 
				 new MyFunction(),//执行函数 类似bolt
				 new Fields() //为空不向下发送
		 );
		 
		Config conf = new Config();
		conf.setNumWorkers(1);
		conf.setMaxSpoutPending(20);
	    LocalCluster cluster = new LocalCluster();
	    cluster.submitTopology("TridentTopology1", conf, topology.build());

	}
}
```

## Trident操作 - flters海量数据过滤
通过要继承BaseFilter，重写isKeep方法

```java
public class TridentTopology2 {
	
	/**
	 * 可以海量数据进行过滤，需要继承BaseFilter，重写isKeep方法
	 * @author qxw
	 * @data 2018年9月21日上午10:57:00
	 */
	public static  class MyFilter extends BaseFilter {
		private static final long serialVersionUID = 1L;
		public boolean isKeep(TridentTuple tuple) {
				//能够被2对第1个和第2个值进行相加.然后除2，为0则发射，不为零则不发射射
			   	return tuple.getInteger(1) % 2 == 0;
		   }
	}
	
	/**
	 * 类似原生storm bolt数据流处理组件
	 * @author qxw
	 * @data 2018年9月21日下午3:31:12
	 */
   public static class MyFunction extends BaseFunction{
	private static final long serialVersionUID = 1L;

	@Override
	public void execute(TridentTuple tuple, TridentCollector collector) {
		//获取tuple输入内容
		Integer a = tuple.getIntegerByField("a");
		Integer b = tuple.getIntegerByField("b");
		Integer c = tuple.getIntegerByField("c");
		Integer d = tuple.getIntegerByField("d");
		System.out.println("a: "+ a + ", b: " + b + ", c: " + c + ", d: " + d);

	}
	   
   }
	@SuppressWarnings("unchecked")
	public static void main(String[] args) {
		//固定批处理数据源（类似storm原生的spout） 声明a,b,c,d四个字段
		FixedBatchSpout spout =new FixedBatchSpout(new Fields("a","b","c","d"),4,//设置批处理大小
						new Values(1,4,7,10),
						new Values(2,3,5,7),
						new Values(6,9,7,2),
						new Values(9,1,6,8)  //设置数据内容
		 );
		 //是否循环发送
		 spout.setCycle(false);

		//创建topology
		 TridentTopology topology =new TridentTopology();
		//指定数据源
		 Stream input=topology.newStream("spout", spout);
		//要实现storm原生spolt--bolt的模式在Trident中用each实现 (随机分组)
		 input.shuffle().each(new Fields("a","b","c","d"),new MyFilter()).each(new Fields("a","b","c","d"), new MyFunction(),new Fields()); 
		 //本地模式
		 Config conf = new Config();
		 conf.setNumWorkers(1);
		 conf.setMaxSpoutPending(20);
		 LocalCluster cluster = new LocalCluster();
		 cluster.submitTopology("TridentTopology2", conf, topology.build());		
		 
		 //集群模式
//		 StormSubmitter.submitTopology("TridentTopology1", conf, buildTopology());
	}
```

## Triden 实现单词计数统计

```java
public class TridentWordCount {
	public static class MyFunction extends BaseFunction {
		private static final long serialVersionUID = 1L;
		public void execute(TridentTuple tuple, TridentCollector collector) {
					String word=tuple.getStringByField("word");
					Long count=tuple.getLongByField("count");
					System.out.println(word+"   :  "+count);	
	    }
	}
	@SuppressWarnings("unchecked")
	public static void main(String[] args) {
		/* 创建spout */
        FixedBatchSpout spout = new FixedBatchSpout(new Fields("sentence"), 4,
                new Values("java php asd java"),
                new Values("php css js html"),
                new Values("js php java java"),
                new Values("a a b c d"));
      //是否循环发送
        spout.setCycle(false);
        /* 创建topology */
        TridentTopology topology = new TridentTopology();
        /* 创建Stream spout1, 分词、统计 */
        topology.newStream("spout", spout)
                		//先切割
                        .each(new Fields("sentence"), new Split(), new Fields("word"))
                        //分组
                        .groupBy(new Fields("word"))
                         //聚合统计
                        .aggregate(new Count(), new Fields("count"))
                        //输出函数
                        .each(new Fields("word","count"), new MyFunction(),new Fields())
                        //设置并行度
                        .parallelismHint(1);
		Config conf = new Config();
		conf.setNumWorkers(1);
		conf.setMaxSpoutPending(20);
	    LocalCluster cluster = new LocalCluster();
	    cluster.submitTopology("TridentWordCount", conf, topology.build());

	}
}
```

## Trident 实现Drpc

```java
public class TridentDrpc {
    private  static class MyFunction extends BaseFunction{
        public void execute(TridentTuple tridentTuple, TridentCollector tridentCollector) {
            String sentence = tridentTuple.getString(0);
            for (String word : sentence.split(" ")) {
                tridentCollector.emit(new Values(word));
            }
        }
    }
    public static void main(String[] args) throws InvalidTopologyException, AuthorizationException, AlreadyAliveException {
        TridentTopology topology=new TridentTopology();
        Config conf = new Config();
        conf.setMaxSpoutPending(20);
        //本地模式
        if (args.length==0){
            LocalCluster cluster = new LocalCluster();
            LocalDRPC drpc = new LocalDRPC();

            Stream input=topology.newDRPCStream("data",drpc);
            input.each(new Fields("args"),new MyFunction(),new Fields("result")).project(new Fields("result"));
            cluster.submitTopology("wordCount", conf, topology.build());
            //调用
            System.err.println("DRPC RESULT: " + drpc.execute("data", "cat the dog jumped"));
            drpc.shutdown();
            cluster.shutdown();
        }else{
            //集群模式
            conf.setNumWorkers(2);
            StormSubmitter.submitTopology(args[0], conf, topology.build());
        }
    }
}

```

官方文档：https://github.com/apache/storm/blob/master/docs/Trident-state.md

## DRPC简介
Storm里面引入DRPC主要是利用storm的实时计算能力来并行化CPU intensive的计算。DRPC的storm topology以函数的参数流作为输入，而把这些函数调用的返回值作为topology的输出流。

DRPC其实不能算是storm本身的一个特性， 它是通过组合storm的原语spout，bolt， topology而成的一种模式(pattern)。

## DRPC服务调用过程
 - 接收一个RPC请求。
 - 发送请求到storm topology
 - 从storm topology接收结果
 - 把结果发回给等待的客户端。从客户端的角度来看一个DRPC调用跟一个普通的RPC调用没有任何区别

<img src="_media/storm6.png">

## 要使用DRPC首先要修改storm配置文件

apache-storm-1.2.2/conf/storm.yaml
```bash
storm.zookeeper.servers:
      - "192.168.1.191"
storm.zookeeper.port: 2181
storm.local.dir: "/usr/local/apache-storm-1.2.2/data"
nimbus.seeds: ["192.168.1.191"]
supervisor.slots.ports:
    - 6700
    - 6701
    - 6702
    - 6703
storm.health.check.dir: "healthchecks"
storm.health.check.timeout.ms: 5000
#配置drpc
drpc.servers:
    - "192.168.1.191"
```
## 启动drpc服务
```
bin/storm drpc &
```
## 编写drpc服务代码

```java
public class DrpcTopology {
	public static class ExclaimBolt extends BaseBasicBolt {
	    public void execute(Tuple tuple, BasicOutputCollector collector) {
	        String input = tuple.getString(1);
	        collector.emit(new Values(tuple.getValue(0), input + "1"));
	    }
	 
	    public void declareOutputFields(OutputFieldsDeclarer declarer) {
	        declarer.declare(new Fields("id", "result"));
	    }
	}
	
	 /**
	  * Distributed RPC是由一个”DPRC Server”协调的(storm自带了一个实现)。
	  * DRPC服务调用过程：
	  *  	接收一个RPC请求。
	  *  	发送请求到storm topology 
	  *  	从storm topology接收结果
	  *  	把结果发回给等待的客户端。从客户端的角度来看一个DRPC调用跟一个普通的RPC调用没有任何区别
	  * @param args
	  * @throws Exception
	  */
	public static void main(String[] args) throws Exception {
		LinearDRPCTopologyBuilder builder = new LinearDRPCTopologyBuilder("exclamation");
	    builder.addBolt(new ExclaimBolt(), 3);	    
	    Config conf = new Config();
	    conf.setDebug(true);
	    conf.setNumWorkers(2);
		try {
//			LocalDRPC drpc = new LocalDRPC();
//			LocalCluster cluster = new LocalCluster();
//			cluster.submitTopology("drpc-demo", conf, builder.createLocalTopology(drpc)); 
//		    System.out.println("DRPC测试  'hello':" + drpc.execute("exclamation", "hello"));
//		    
//		    cluster.shutdown();
//		    drpc.shutdown();
		 //集群模式
		 conf.setNumWorkers(3);
		 StormSubmitter.submitTopology("exclamation", conf,builder.createRemoteTopology());
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
```
## 打包提交到storm集群
语法：bin/storm jar  (jar包名) | 主函数路径 | Topology名称
```
bin/storm jar stom-demo-1.0.jar com.qxw.drpc.DrpcTopology exclamation
```

## 访问UI查看是否提交成功
http://192.168.1.191:8080
<img src="_media/storm7.png">

**linux查看正在运行的Topology**
```bash
[root@web1 apache-storm-1.2.2]# bin/storm list
3893 [main] INFO  o.a.s.u.NimbusClient - Found leader nimbus : web1:6627
Topology_name        Status     Num_tasks  Num_workers  Uptime_secs
-------------------------------------------------------------------
exclamation          ACTIVE     0          0            1020   
```
## 调用集群的drpc
```java
public class DrpcTest {
	public static void main(String[] args) {
		try {
			Config conf = new Config();
	        conf.setDebug(false);
	        Map config = Utils.readDefaultConfig();
			DRPCClient	client = new DRPCClient(config,"192.168.1.191", 3772); //drpc服务
			String result = client.execute("exclamation", "hello");/// 调用drpcTest函数，传递参数为hello
			System.out.println(result);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
}
```


参考链接：https://blog.csdn.net/qq403977698/article/details/49025345
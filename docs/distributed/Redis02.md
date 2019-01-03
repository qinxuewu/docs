### [分布锁框架Redisson](https://github.com/redisson/redisson/wiki/1.-%E6%A6%82%E8%BF%B0)
- Redisson是一个在Redis的基础上实现的Java驻内存数据网格（In-Memory Data Grid）。它不仅提供了一系列的分布式的Java常用对象，还提供了许多分布式服务。其中包括(BitSet, Set, Multimap, SortedSet, Map, List, Queue, BlockingQueue, Deque, BlockingDeque, Semaphore, Lock, AtomicLong, CountDownLatch, Publish / Subscribe, Bloom filter, Remote service, Spring cache, Executor service, Live Object service, Scheduler service) Redisson提供了使用Redis的最简单和最便捷的方法。Redisson的宗旨是促进使用者对Redis的关注分离（Separation of Concern），从而让使用者能够将精力更集中地放在处理业务逻辑上。


### 程序化配置方法
Redisson程序化的配置方法是通过构建Config对象实例来实现的。例如

```
Config config = new Config();
config.setTransportMode(TransportMode.EPOLL);
//可以用"rediss://"来启用SSL连接
config.useClusterServers().addNodeAddress("redis://127.0.0.1:7181");
```

### 文件方式配置
Redisson既可以通过用户提供的JSON或YAML格式的文本文件来配置，也可以通过含有Redisson专有命名空间的，Spring框架格式的XML文本文件来配置。

```
Config config = Config.fromJSON(new File("config-file.json"));
RedissonClient redisson = Redisson.create(config);
```
也通过调用config.fromYAML方法并指定一个File实例来实现读取YAML格式的配置：

```
Config config = Config.fromYAML(new File("config-file.yaml"));
RedissonClient redisson = Redisson.create(config);
```

### 集群模式
集群模式除了适用于Redis集群环境，也适用于任何云计算服务商提供的集群模式，例如AWS ElastiCache集群版、Azure Redis Cache和阿里云（Aliyun）的云数据库Redis版。

程序化配置集群的用法:

```
Config config = new Config();
config.useClusterServers()
    .setScanInterval(2000) // 集群状态扫描间隔时间，单位是毫秒
    //可以用"rediss://"来启用SSL连接
    .addNodeAddress("redis://127.0.0.1:7000", "redis://127.0.0.1:7001")
    .addNodeAddress("redis://127.0.0.1:7002");

RedissonClient redisson = Redisson.create(config);
```
### 主从模式

```
Config config = new Config();
config.useMasterSlaveServers()
    //可以用"rediss://"来启用SSL连接
    .setMasterAddress("redis://127.0.0.1:6379")
    .addSlaveAddress("redis://127.0.0.1:6389", "redis://127.0.0.1:6332", "redis://127.0.0.1:6419")
    .addSlaveAddress("redis://127.0.0.1:6399");

RedissonClient redisson = Redisson.create(config);
```

### RedissonLock分布式锁的代码

```
public class RedissonLock {
		private static RedissonClient redissonClient;
		static{
			Config config = new Config();
			config.useSingleServer().setAddress("redis://127.0.0.1:6379").setPassword(null);
//			config.useSingleServer().setAddress("redis://192.168.188.4:6380").setPassword("ty3foGTrNiKi");
			redissonClient = Redisson.create(config);
		}
		
		public static RedissonClient getRedisson(){
			return redissonClient;
		}
		
		
	public static void main(String[] args) throws InterruptedException{
	
		RLock fairLock = getRedisson().getLock("TEST_KEY");
		System.out.println(fairLock.toString());
//		fairLock.lock(); 
		// 尝试加锁，最多等待10秒，上锁以后10秒自动解锁
		boolean res = fairLock.tryLock(10, 10, TimeUnit.SECONDS);
		System.out.println(res);
		fairLock.unlock();
		
		//有界阻塞队列
		RBoundedBlockingQueue<JSONObject> queue = getRedisson().getBoundedBlockingQueue("anyQueue");
		// 如果初始容量（边界）设定成功则返回`真（true）`，
		// 如果初始容量（边界）已近存在则返回`假（false）`。
		System.out.println(queue.trySetCapacity(10));
		JSONObject o=new JSONObject();
		o.put("name", 1);
		if(!queue.contains(o)){
			queue.offer(o);
		}
		
		JSONObject o2=new JSONObject();
		o2.put("name", 2);
		// 此时容量已满，下面代码将会被阻塞，直到有空闲为止。
		
		if(!queue.contains(o2)){
			queue.offer(o2);
		}
		
		//  获取但不移除此队列的头；如果此队列为空，则返回 null。
		JSONObject obj = queue.peek();
		//获取并移除此队列的头部，在指定的等待时间前等待可用的元素（如果有必要）。
		JSONObject ob = queue.poll(10, TimeUnit.MINUTES);                                                    
		
		//获取并移除此队列的头，如果此队列为空，则返回 null。
		 Iterator<JSONObject> iterator=queue.iterator();
		 while (iterator.hasNext()){
			  JSONObject i =iterator.next();
		      System.out.println(i.toJSONString());
		      iterator.remove();
		    
		  }
			while(queue.size()>0){
				JSONObject obs = queue.poll();     
				System.out.println(obs.toJSONString());
			}
		
		JSONObject someObj = queue.poll();
		System.out.println(someObj.toJSONString());
	}
}

```
**[Table of Content](./Table-of-Content)** | [目录](./目录)

1. **[Overview](./1.-Overview)**<br/>
   [概述](./1.-概述)
2. **[Configuration](./2.-Configuration)**<br/>
   [配置方法](./2.-配置方法)
3. **[Operations execution](./3.-operations-execution)**<br/>
   [程序接口调用方式](./3.-程序接口调用方式)
4. **[Data serialization](./4.-data-serialization)**<br/>
   [数据序列化](./4.-数据序列化)
5. **[Data partitioning (sharding)](./5.-data-partitioning-(sharding))**<br/>
   [单个集合数据分片（Sharding）](./5.-单个集合数据分片（Sharding）)
6. **[Distributed objects](./6.-distributed-objects)**<br/>
   [分布式对象](./6.-分布式对象)
7. **[Distributed collections](./7.-distributed-collections)**<br/>
   [分布式集合](./7.-分布式集合)
8. **[Distributed locks and synchronizers](./8.-distributed-locks-and-synchronizers)**<br/>
   [分布式锁和同步器](./8.-分布式锁和同步器)
9. **[Distributed services](./9.-distributed-services)**<br/>
   [分布式服务](./9.-分布式服务)
10. **[Additional features](./10.-additional-features)**<br/>
    [额外功能](./10.-额外功能)
11. **[Redis commands mapping](./11.-Redis-commands-mapping)**<br/>
    [Redis命令和Redisson对象匹配列表](./11.-Redis命令和Redisson对象匹配列表)
12. **[Standalone node](./12.-Standalone-node)**<br/>
    [独立节点模式](./12.-独立节点模式)
13. **[Tools](./13.-Tools)**<br/>
    [工具](./13.-工具)
14. **[Integration with frameworks](./14.-Integration-with-frameworks)**<br/>
    [第三方框架整合](./14.-第三方框架整合)
15. **[Dependency list](./15.-Dependency-list)**<br/>
    [项目依赖列表](./15.-项目依赖列表)
16. **[FAQ](./16.-FAQ)**<br/>
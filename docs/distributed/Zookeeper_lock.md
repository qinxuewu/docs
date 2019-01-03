### Zookeeper 概述
ZooKeeper是一种分布式协调服务，用于管理大型主机。在分布式环境中协调和管理服务是一个复杂的过程。ZooKeeper通过其简单的架构和API解决了这个问题。ZooKeeper允许开发人员专注于核心应用程序逻辑，而不必担心应用程序的分布式特性。

 **分布式应用的优点**
- 可靠性 - 单个或几个系统的故障不会使整个系统出现故障。
- 可扩展性 - 可以在需要时增加性能，通过添加更多机器，在应用程序配置中进行微小的更改，而不会有停机时间。
- 透明性 - 隐藏系统的复杂性，并将其显示为单个实体/应用程序。

 **分布式应用的挑战** 
- 竞争条件 - 两个或多个机器尝试执行特定任务，实际上只需在任意给定时间由单个机器完成。例如，共享资源只能在任意给定时间由单个机器修改。
- 死锁 - 两个或多个操作等待彼此无限期完成。
- 不一致 - 数据的部分失败。

### 什么是Apache ZooKeeper？
Apache ZooKeeper是由集群（节点组）使用的一种服务，用于在自身之间协调，并通过稳健的同步技术维护共享数据。ZooKeeper本身是一个分布式应用程序，为写入分布式应用程序提供服务。

 **ZooKeeper提供的常见服务如下 :** 
- 命名服务 - 按名称标识集群中的节点。它类似于DNS，但仅对于节点。
- 配置管理 - 加入节点的最近的和最新的系统配置信息。
- 集群管理 - 实时地在集群和节点状态中加入/离开节点。
- 选举算法 - 选举一个节点作为协调目的的leader。
- 锁定和同步服务 - 在修改数据的同时锁定数据。此机制可帮助你在连接其他分布式应用程序（如Apache HBase）时进行自动故障恢复。
- 高度可靠的数据注册表 - 即使在一个或几个节点关闭时也可以获得数据。

### ZooKeeper的好处
- 简单的分布式协调过程
- 同步 - 服务器进程之间的相互排斥和协作。此过程有助于Apache HBase进行配置管理。
- 有序的消息
- 序列化 - 根据特定规则对数据进行编码。确保应用程序运行一致。这种方法可以在MapReduce中用来协调队列以执行运行的线程。
- 可靠性
- 原子性 - 数据转移完全成功或完全失败，但没有事务是部分的。

### ZooKeeper的架构
![输入图片说明](https://images.gitee.com/uploads/images/2018/0814/101416_846e1938_1478371.png "屏幕截图.png")

 **Client（客户端）** 
- 客户端，我们的分布式应用集群中的一个节点，从服务器访问信息。对于特定的时间间隔，每个客户端向服务器发送消息以使服务器知道客户端是活跃的。类似地，当客户端连接时，服务器发送确认码。如果连接的服务器没有响应，客户端会自动将消息重定向到另一个服务器。

 **Server（服务器）** 
- 服务器，我们的ZooKeeper总体中的一个节点，为客户端提供所有的服务。向客户端发送确认码以告知服务器是活跃的。

 **Ensemble**
- ZooKeeper服务器组。形成ensemble所需的最小节点数为3。 

 **Leader:** 
- 服务器节点，如果任何连接的节点失败，则执行自动恢复。Leader在服务启动时被选举。

 **Follower** 
- 跟随leader指令的服务器节点。

### 层次命名空间
ZooKeeper节点称为 znode 。每个znode由一个名称标识，并用路径(/)序列分隔。
![输入图片说明](https://images.gitee.com/uploads/images/2018/0814/102203_5491c3c9_1478371.png "屏幕截图.png")

- config 命名空间用于集中式配置管理，workers 命名空间用于命名。
- 在 config 命名空间下，每个znode最多可存储1MB的数据。这与UNIX文件系统相类似，除了父znode也可以存储数据。这种结构的主要目的是存储同步数据并描述znode的元数据。此结构称为 ZooKeeper数据模型。
- ZooKeeper数据模型中的每个znode都维护着一个 stat 结构。一个stat仅提供一个znode的元数据。它由版本号，操作控制列表(ACL)，时间戳和数据长度组成。

1. 版本号 - 每个znode都有版本号，这意味着每当与znode相关联的数据发生变化时，其对应的版本号也会增加。当多个zookeeper客户端尝试在同一znode上执行操作时，版本号的使用就很重要。
1. 操作控制列表(ACL) - ACL基本上是访问znode的认证机制。它管理所有znode读取和写入操作。
1. 时间戳 - 时间戳表示创建和修改znode所经过的时间。它通常以毫秒为单位。ZooKeeper从“事务ID"(zxid)标识znode的每个更改。Zxid是唯一的，并且为每个事务保留时间，以便你可以轻松地确定从一个请求到另一个请求所经过的时间。
1. 数据长度 - 存储在znode中的数据总量是数据长度。你最多可以存储1MB的数据。


### Znode的类型
Znode被分为持久（persistent）节点，顺序（sequential）节点和临时（ephemeral）节点。

- 持久节点  - 即使在创建该特定znode的客户端断开连接后，持久节点仍然存在。默认情况下，除非另有说明，否则所有znode都是持久的。
- 临时节点 - 客户端活跃时，临时节点就是有效的。当客户端与ZooKeeper集合断开连接时，临时节点会自动删除。因此，只有临时节点不允许有子节点。如果临时节点被删除，则下一个合适的节点将填充其位置。临时节点在leader选举中起着重要作用。
- 顺序节点 - 顺序节点可以是持久的或临时的。当一个新的znode被创建为一个顺序节点时，ZooKeeper通过将10位的序列号附加到原始名称来设置znode的路径。例如，如果将具有路径 /myapp 的znode创建为顺序节点，则ZooKeeper会将路径更改为 /myapp0000000001 ，并将下一个序列号设置为0000000002。如果两个顺序节点是同时创建的，那么ZooKeeper不会对每个znode使用相同的数字。顺序节点在锁定和同步中起重要作用。

### Sessions（会话）
- 会话对于ZooKeeper的操作非常重要。会话中的请求按FIFO顺序执行。一旦客户端连接到服务器，将建立会话并向客户端分配会话ID 。
- 客户端以特定的时间间隔发送心跳以保持会话有效。如果ZooKeeper集合在超过服务器开启时指定的期间（会话超时）都没有从客户端接收到心跳，则它会判定客户端死机。
- 会话超时通常以毫秒为单位。当会话由于任何原因结束时，在该会话期间创建的临时节点也会被删除。

### Watches（监视）
- 监视是一种简单的机制，使客户端收到关于ZooKeeper集合中的更改的通知。客户端可以在读取特定znode时设置Watches。Watches会向注册的客户端发送任何znode（客户端注册表）更改的通知。
- Znode更改是与znode相关的数据的修改或znode的子项中的更改。只触发一次watches。如果客户端想要再次通知，则必须通过另一个读取操作来完成。当连接会话过期时，客户端将与服务器断开连接，相关的watches也将被删除。

### Zookeeper 工作流
一旦ZooKeeper集合启动，它将等待客户端连接。客户端将连接到ZooKeeper集合中的一个节点。它可以是leader或follower节点。一旦客户端被连接，节点将向特定客户端分配会话ID并向该客户端发送确认。如果客户端没有收到确认，它将尝试连接ZooKeeper集合中的另一个节点。 一旦连接到节点，客户端将以有规律的间隔向节点发送心跳，以确保连接不会丢失。

- 如果客户端想要读取特定的znode，它将会向具有znode路径的节点发送读取请求，并且节点通过从其自己的数据库获取来返回所请求的znode。为此，在ZooKeeper集合中读取速度很快。
- 如果客户端想要将数据存储在ZooKeeper集合中，则会将znode路径和数据发送到服务器。连接的服务器将该请求转发给leader，然后leader将向所有的follower重新发出写入请求。如果只有大部分节点成功响应，而写入请求成功，则成功返回代码将被发送到客户端。 否则，写入请求失败。绝大多数节点被称为 Quorum 。

### ZooKeeper集合中的节点
- 如果我们有单个节点，则当该节点故障时，ZooKeeper集合将故障。它有助于“单点故障"，不建议在生产环境中使用。
- 如果我们有两个节点而一个节点故障，我们没有占多数，因为两个中的一个不是多数。
- 如果我们有三个节点而一个节点故障，那么我们有大多数，因此，这是最低要求。ZooKeeper集合在实际生产环境中必须至少有三个节点。
- 如果我们有四个节点而两个节点故障，它将再次故障。类似于有三个节点，额外节点不用于任何目的，因此，最好添加奇数的节点，例如3，5，7。
- 写入过程比ZooKeeper集合中的读取过程要贵，因为所有节点都需要在数据库中写入相同的数据

![输入图片说明](https://images.gitee.com/uploads/images/2018/0814/103642_05637252_1478371.png "屏幕截图.png")

 **写入（write）** 
- 写入过程由leader节点处理。leader将写入请求转发到所有znode，并等待znode的回复。如果一半的znode回复，则写入过程完成。

 **读取（read）** 
- 读取由特定连接的znode在内部执行，因此不需要与集群进行交互。

 **复制数据库（replicated database）** 
- 它用于在zookeeper中存储数据。每个znode都有自己的数据库，每个znode在一致性的帮助下每次都有相同的数据。

 **Leader负责处理写入请求的Znode。** 

 **Follower:从客户端接收写入请求，并将它们转发到leader znode。** 

 **请求处理器（request processor）:只存在于leader节点。它管理来自follower节点的写入请求。** 

 **原子广播（atomic broadcasts）:负责广播从leader节点到follower节点的变化。** 

### Zookeeper leader选举
分析如何在ZooKeeper集合中选举leader节点。考虑一个集群中有N个节点。leader选举的过程如下：

- 所有节点创建具有相同路径 /app/leader_election/guid_ 的顺序、临时节点。
- ZooKeeper集合将附加10位序列号到路径，创建的znode将是 /app/leader_election/guid_0000000001，/app/leader_election/guid_0000000002等。
- 对于给定的实例，在znode中创建最小数字的节点成为leader，而所有其他节点是follower。
- 每个follower节点监视下一个具有最小数字的znode。例如，创建znode/app/leader_election/guid_0000000008的节点将监视znode/app/leader_election/guid_0000000007，创建znode/app/leader_election/guid_0000000007的节点将监视znode/app/leader_election/guid_0000000006。
- 如果leader关闭，则其相应的znode/app/leader_electionN会被删除。
- 下一个在线follower节点将通过监视器获得关于leader移除的通知。
- 下一个在线follower节点将检查是否存在其他具有最小数字的znode。如果没有，那么它将承担leader的角色。否则，它找到的创建具有最小数字的znode的节点将作为leader。
- 类似地，所有其他follower节点选举创建具有最小数字的znode的节点作为leader。

Zookeeper集群安装
 **安装:** 
```
wget http://www.apache.org/dist//zookeeper/zookeeper-3.3.3/zookeeper-3.3.3.tar.gz
tar zxvf zookeeper-3.3.3.tar.gz
cd zookeeper-3.3.3
cp conf/zoo_sample.cfg conf/zoo.cfg
```
 **zookeeper-3.4.10/conf新建立zoo.cfg，zoo2.cfg，zoo3.cfg三个文件，配置如下，** 

```
#心跳间隔 毫秒每次
tickTime = 2000
##日志位置 伪集群设置不同目录
dataDir = /home/zookeeper-3.4.10/data/data1
#监听客户端连接的端口 伪集群设置不同端口
clientPort = 2181
#多少个心跳时间内，允许其他server连接并初始化数据，如果ZooKeeper管理的数据较大，则应相应增大这个值
initLimit = 10
#多少个tickTime内，允许follower同步，如果follower落后太多，则会被丢弃
syncLimit = 5

#伪集群配置 不需要集群去掉（vim /etc/host 映射ip的hostname的关系）
server.1=CentOS124:2886:3886
server.2=CentOS124:2888:3888
server.3=CentOS124:2889:3889
```

并在zookeeper-3.4.10/data的 data1,data2,data3 目录下放置myid文件，文件内容为1,2,3：
![输入图片说明](https://images.gitee.com/uploads/images/2018/0814/120437_6d3bce6c_1478371.png "屏幕截图.png")
![输入图片说明](https://images.gitee.com/uploads/images/2018/0814/120452_6e45d2ad_1478371.png "屏幕截图.png")

### 进入bi目录 启动

```
./zkServer.sh start zoo.cfg
./zkServer.sh start zoo2.cfg
./zkServer.sh start zoo3.cfg
```

### 查看服务状态

```
./zkServer.sh status zoo.cfg
./zkServer.sh status zoo2.cfg
./zkServer.sh status zoo3.cfg
```
### 使用Zookeeper的客户端来连接并测试了

```
[root@CentOS124 bin]# ./zkCli.sh

#查看根节点
[zk: localhost:2181(CONNECTED) 0] ls /
[firstNode, SecodeZnode, firstNode0000000002, hbase, zookeeper]
[zk: localhost:2181(CONNECTED) 0] create /mykey1 myvalue1  #创建一个新节点mykey1 
Created /mykey1
[zk: localhost:2181(CONNECTED) 1] get /mykey1   #获取mykey1节点  

#要创建顺序节点
create -s /FirstZnode second-data

#要创建临时节点
create -e /SecondZnode “Ephemeral-data"
```

### Zookeeper客户端（Apache Curator）
 **ZooKeeper常用客户端** 
- zookeeper自带的客户端是官方提供的，比较底层、使用起来写代码麻烦、不够直接。
- Apache Curator是Apache的开源项目，封装了zookeeper自带的客户端，使用相对简便，易于使用。
- zkclient是另一个开源的ZooKeeper客户端，其地址：https://github.com/adyliu/zkclient生产环境不推荐使用。 

 **Curator主要解决了三类问题** 
- 封装ZooKeeper client与ZooKeeper server之间的连接处理
- 提供了一套Fluent风格的操作API
- 提供ZooKeeper各种应用场景(recipe, 比如共享锁服务, 集群领导选举机制)的抽象封装

### Java操作api
```
package com.qxw.controller;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.apache.commons.lang.StringUtils;
import org.apache.curator.framework.CuratorFramework;
import org.apache.curator.framework.CuratorFrameworkFactory;
import org.apache.curator.framework.recipes.locks.InterProcessMutex;
import org.apache.curator.retry.ExponentialBackoffRetry;
import org.apache.zookeeper.CreateMode;
import org.apache.zookeeper.data.Stat;
/**
 *  Curator主要解决了三类问题
	1.封装ZooKeeper client与ZooKeeper server之间的连接处理
	2.提供了一套Fluent风格的操作API
	3.提供ZooKeeper各种应用场景(recipe, 比如共享锁服务, 集群领导选举机制)的抽象封装
 * @author qxw
 * @data 2018年8月14日下午2:08:51
 */
public class CuratorAp {
	/**
	 * Curator客户端
	 */
    public static CuratorFramework client = null;
    /**
     * 集群模式则是多个ip
     */
//    private static final String zkServerIps = "192.168.10.124:2182,192.168.10.124:2183,192.168.10.124:2184";
    private static final String zkServerIps = "127.0.0.1:2181";

	public static CuratorFramework getConnection(){
	        if(client==null){
	             synchronized (CuratorAp.class){
	               if(client==null){
	            		//通过工程创建连接
	           		client= CuratorFrameworkFactory.builder()
	           				.connectString(zkServerIps)
	           				.connectionTimeoutMs(5000) ///连接超时时间
	           				.sessionTimeoutMs(5000)  // 设定会话时间
	           				.retryPolicy(new ExponentialBackoffRetry(1000, 10))   // 重试策略：初试时间为1s 重试10次
//	           				.namespace("super")  // 设置命名空间以及开始建立连接
	           				.build();
	           		
	           		 //开启连接
	           		  client.start();
	           		  //分布锁
	           		 
		        	  System.out.println(client.getState());
	                }
	            }
	        }
			return client;
	  }
	
	/**
	 * 创建节点   不加withMode默认为持久类型节点
	 * @param path  节点路径
	 * @param value  值
	 */
	public static String create(String path,String value){
		try {
			//若创建节点的父节点不存在会先创建父节点再创建子节点
			return getConnection().create().creatingParentsIfNeeded().forPath("/super"+path,value.getBytes());
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	/**
	 * 创建节点 
	 * @param path  节点路径
	 * @param value  值
	 * @param modeType 节点类型
	 */
	public static String create(String path,String value,String modeType){
		try {
			if(StringUtils.isEmpty(modeType)){
				return null;
			}
			//持久型节点
			if(CreateMode.PERSISTENT.equals(modeType)){
				//若创建节点的父节点不存在会先创建父节点再创建子节点
				return getConnection().create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT).forPath("/super"+path,value.getBytes());
			}
			//临时节点
			if(CreateMode.EPHEMERAL.equals(modeType)){
				//若创建节点的父节点不存在会先创建父节点再创建子节点
				return getConnection().create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL).forPath("/super"+path,value.getBytes());
			}
			
			//持久类型顺序性节点
			if(CreateMode.PERSISTENT_SEQUENTIAL.equals(modeType)){
				//若创建节点的父节点不存在会先创建父节点再创建子节点
				return getConnection().create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT_SEQUENTIAL).forPath("/super"+path,value.getBytes());
			}
			
			//临时类型顺序性节点
			if(CreateMode.EPHEMERAL_SEQUENTIAL.equals(modeType)){
				//若创建节点的父节点不存在会先创建父节点再创建子节点
				return getConnection().create().creatingParentsIfNeeded().withMode(CreateMode.EPHEMERAL_SEQUENTIAL).forPath("/super"+path,value.getBytes());
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	
	
	
	
	/**
	 * 获取单个节点
	 * @param path
	 * @return
	 */
	public static String getData(String path){
		try {
			String str = new String(getConnection().getData().forPath("/super"+path));
			return str;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	/**
	 *获取字节点
	 * @param path
	 * @return
	 */
	public static List<String> getChildren(String path){
		try {
			List<String> list = getConnection().getChildren().forPath("/super"+path);
			return list;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	
	/**
	 * 修改节点值
	 * @param path
	 * @param valu
	 * @return
	 */
	public static String setData(String path,String valu){
		try {
			getConnection().setData().forPath("/super"+path,valu.getBytes());
			String str = new String(getConnection().getData().forPath("/super"+path));
			return str;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}

	/**
	 * 删除节点
	 * @param path
	 */
	public static void  delete(String path){
		try {
			getConnection().delete().guaranteed().deletingChildrenIfNeeded().forPath("/super"+path);
		} catch (Exception e) {
			e.printStackTrace();
		}
		
	}
	/**
	 * 检测节点是否存在
	 * @param path
	 * @return
	 */
	public static boolean  checkExists(String path){
		try {
			Stat s=getConnection().checkExists().forPath("/super"+path);
			return s==null? false:true;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return false;
		
	}
	
	/**
	 * 分布式锁 对象
	 * @param path
	 * @return
	 */
	public static InterProcessMutex getLock(String path){
		InterProcessMutex lock=null;
		try {
			lock=new InterProcessMutex(getConnection(), "/super"+path);
			 return  lock;
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	
	
	public static void main(String[] args) throws Exception {
//		if(checkExists("/qxw")){
//			delete("/qxw");
//		}
//		System.out.println("创建节点："+create("/qxw/q1", "苏打水法萨芬撒"));
//		System.out.println("创建节点："+create("/qxw/q2", "苏打水法萨芬撒"));
//		System.out.println("创建节点："+create("/qxw/q3", "苏打水法萨芬撒"));
//		
//
//		
//		ExecutorService pool = Executors.newCachedThreadPool();
//		getConnection().create().creatingParentsIfNeeded().withMode(CreateMode.PERSISTENT).inBackground(new BackgroundCallback() {
//			public void processResult(CuratorFramework cf, CuratorEvent ce) throws Exception {
//				System.out.println("code:" + ce.getResultCode());
//				System.out.println("type:" + ce.getType());
//				System.out.println("线程为:" + Thread.currentThread().getName());
//			}
//		}, pool)
//		.forPath("/super/qxw/q4","q4内容".getBytes());
//		
//		System.out.println("读取节点： "+getData("/qxw"));
//		System.out.println("读取字节点："+getChildren("/qxw").toString());
		
		test();
		
	}
	
	/***
	 * 分布锁演示
	 */
	private static int count=0;
	public  static void test() throws InterruptedException{
		final InterProcessMutex lock=getLock("/lock");
		final CountDownLatch c=new CountDownLatch(10);
		ExecutorService pool = Executors.newCachedThreadPool();
		for (int i = 0; i <10; i++) {
			pool.execute(new Runnable() {
				public void run() {
					try {		
						c.countDown();
						Thread.sleep(1000);
						//加锁
						lock.acquire();
						System.out.println(System.currentTimeMillis()+"___"+(++count));
					} catch (Exception e) {
						e.printStackTrace();
					}finally{
						try {
							lock.release();
						} catch (Exception e) {
							e.printStackTrace();
						}
					}
					
				}
			});
		}
		pool.shutdown();
		c.await();
		System.out.println("CountDownLatch执行完");
	}
}

```

### zookeeper 集群的 监控图形化页面
https://gitee.com/crystony/zookeeper-web

如果你是gradle用户(2.0以上),请直接执行以下命令运行项目：
```
gradle jettyRun
```
如果你没使用gralde,执行项目跟路径下的脚本,linux/windows用户执行

```
gradlew/gradlew.bat jettyRun
```
自动下载gralde完成后,会自动使用jetty启动项目

如果想将项目导入IDE调试,eclipse用户执行

```
 gradlew/gradlew.bat eclipse
```
idea用户执行

```
gradlew/gradlew.bat idea
```

### zookeeper分布式锁原理
分布式锁主要用于在分布式环境中保护跨进程、跨主机、跨网络的共享资源实现互斥访问，以达到保证数据的一致性。
![输入图片说明](https://images.gitee.com/uploads/images/2018/0815/212252_831ce4eb_1478371.png "屏幕截图.png")

左边的整个区域表示一个Zookeeper集群，locker是Zookeeper的一个持久节点，node_1、node_2、node_3是locker这个持久节点下面的临时顺序节点。client_1、client_2、client_n表示多个客户端，Service表示需要互斥访问的共享资源。

 **分布式锁获取思路** 
1. 在获取分布式锁的时候在locker节点下创建临时顺序节点，释放锁的时候删除该临时节点。
1. 客户端调用createNode方法在locker下创建临时顺序节点，然后调用getChildren(“locker”)来获取locker下面的所有子节点，注意此时不用设置任何Watcher。
1. 客户端获取到所有的子节点path之后，如果发现自己创建的子节点序号最小，那么就认为该客户端获取到了锁。
1. 如果发现自己创建的节点并非locker所有子节点中最小的，说明自己还没有获取到锁，此时客户端需要找到比自己小的那个节点，然后对其调用exist()方法，同时对其注册事件监听器。
1. 之后，等待它释放锁，也就是等待获取到锁的那个客户端B把自己创建的那个节点删除。，则客户端A的Watcher会收到相应通知，此时再次判断自己创建的节点是否是locker子节点中序号最小的，如果是则获取到了锁，如果不是则重复以上步骤继续获取到比自己小的一个节点并注册监听。


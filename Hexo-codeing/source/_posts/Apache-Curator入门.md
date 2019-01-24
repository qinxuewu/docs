---
title: Apache Curator入门
date: 2019-02-03 17:53:27
tags: zookeeper
categories:  springboot
---

### Zookeeper客户端（Apache Curator）
- zookeeper自带的客户端是官方提供的，比较底层、使用起来写代码麻烦、不够直接。
- Apache Curator是Apache的开源项目，封装了zookeeper自带的客户端，使用相对简便，易于使用。
- zkclient是另一个开源的ZooKeeper客户端，其地址：https://github.com/adyliu/zkclient生产环境不推荐使用。 
    <!-- more -->
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
![输入图片说明](https://user-gold-cdn.xitu.io/2019/1/16/1685474a530c21c5?w=607&h=481&f=png&s=33332 "屏幕截图.png")

左边的整个区域表示一个Zookeeper集群，locker是Zookeeper的一个持久节点，node_1、node_2、node_3是locker这个持久节点下面的临时顺序节点。client_1、client_2、client_n表示多个客户端，Service表示需要互斥访问的共享资源。

 **分布式锁获取思路** 
1. 在获取分布式锁的时候在locker节点下创建临时顺序节点，释放锁的时候删除该临时节点。
1. 客户端调用createNode方法在locker下创建临时顺序节点，然后调用getChildren(“locker”)来获取locker下面的所有子节点，注意此时不用设置任何Watcher。
1. 客户端获取到所有的子节点path之后，如果发现自己创建的子节点序号最小，那么就认为该客户端获取到了锁。
1. 如果发现自己创建的节点并非locker所有子节点中最小的，说明自己还没有获取到锁，此时客户端需要找到比自己小的那个节点，然后对其调用exist()方法，同时对其注册事件监听器。
1. 之后，等待它释放锁，也就是等待获取到锁的那个客户端B把自己创建的那个节点删除。，则客户端A的Watcher会收到相应通知，此时再次判断自己创建的节点是否是locker子节点中序号最小的，如果是则获取到了锁，如果不是则重复以上步骤继续获取到比自己小的一个节点并注册监听。


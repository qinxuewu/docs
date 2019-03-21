## 什么是Apache Storm
Apache Storm是一个分布式实时大数据处理系统。Storm设计用于在容错和水平可扩展方法中处理大量数据。它是一个流数据框架，具有最高的摄取率。虽然Storm是无状态的，它通过Apache ZooKeeper管理分布式环境和集群状态。它很简单，您可以并行地对实时数据执行各种操作。

## Apache Storm 和 Hadoop对比
<img src="_media/storm1.png">

## Apache Storm优势
- storm是开源的，强大的，用户友好的。它可以用于小公司和大公司。
- Storm是容错的，灵活的，可靠的，并且支持任何编程语言。
- 允许实时流处理。
- Storm是令人难以置信的快，因为它具有巨大的处理数据的力量。
- Storm可以通过线性增加资源来保持性能，即使在负载增加的情况下。它是高度可扩展的。
- Storm在几秒钟或几分钟内执行数据刷新和端到端传送响应取决于问题。它具有非常低的延迟。
- Storm有操作智能。
- Storm提供保证的数据处理，即使群集中的任何连接的节点死或消息丢失。

## Storm 系统中包含以下几个基本概念：
--------------------
* 拓扑（Topologies）
* 流（Streams）
* 数据源（Spouts)
* 数据流处理组件（Bolts)
* 数据流分组（Stream groupings)
* 可靠性（Reliability)
* 任务（Tasks
* 工作进程（Workers


## Apache Storm的组件
 **Tuple** 
- Tuple是Storm中的主要数据结构。它是有序元素的列表。默认情况下，Tuple支持所有数据类型。通常，它被建模为一组逗号分隔的值，并传递到Storm集群。

 **Stream** 
- 流是元组的无序序列。

 **Spouts** 
- 流的源。通常，Storm从原始数据源（如Twitter Streaming API，Apache Kafka队列，Kestrel队列等）接受输入数据。否则，您可以编写spouts以从数据源读取数据。“ISpout”是实现spouts的核心接口，一些特定的接口是IRichSpout，BaseRichSpout，KafkaSpout等。

 **Bolts** 
- Bolts是逻辑处理单元。Spouts将数据传递到Bolts和Bolts过程，并产生新的输出流。Bolts可以执行过滤，聚合，加入，与数据源和数据库交互的操作。Bolts接收数据并发射到一个或多个Bolts。 “IBolt”是实现Bolts的核心接口。一些常见的接口是IRichBolt，IBasicBolt等。

## Storm工作流程
一个工作的Storm集群应该有一个Nimbus和一个或多个supervisors。另一个重要的节点是Apache ZooKeeper，它将用于nimbus和supervisors之间的协调。

 **现在让我们仔细看看Apache Storm的工作流程 −** 
- 最初，nimbus将等待“Storm拓扑”提交给它。
- 一旦提交拓扑，它将处理拓扑并收集要执行的所有任务和任务将被执行的顺序。
- 然后，nimbus将任务均匀分配给所有可用的supervisors。
- 在特定的时间间隔，所有supervisor将向nimbus发送心跳以通知它们仍然运行着。
- 当supervisor终止并且不向心跳发送心跳时，则nimbus将任务分配给另一个supervisor。
- 当nimbus本身终止时，supervisor将在没有任何问题的情况下对已经分配的任务进行工作。
- 一旦所有的任务都完成后，supervisor将等待新的任务进去。
- 同时，终止nimbus将由服务监控工具自动重新启动。
- 重新启动的网络将从停止的地方继续。同样，终止supervisor也可以自动重新启动。由于网络管理程序和supervisor都可以自动重新启动，并且两者将像以前一样继续，因此Storm保证至少处理所有任务一次。
- 一旦处理了所有拓扑，则网络管理器等待新的拓扑到达，并且类似地，管理器等待新的任务。

 **默认情况下，Storm集群中有两种模式：** 
- 本地模式 -此模式用于开发，测试和调试，因为它是查看所有拓扑组件协同工作的最简单方法。在这种模式下，我们可以调整参数，使我们能够看到我们的拓扑如何在不同的Storm配置环境中运行。在本地模式下，storm拓扑在本地机器上在单个JVM中运行。
- 生产模式 -在这种模式下，我们将拓扑提交到工作Storm集群，该集群由许多进程组成，通常运行在不同的机器上。如在storm的工作流中所讨论的，工作集群将无限地运行，直到它被关闭。

## Storm安装（首先安装jdk和zookeeper）

https://www.apache.org/dyn/closer.lua/storm/apache-storm-1.2.2/apache-storm-1.2.2.tar.gz
下载解压，编辑conf/storm.yaml文件
```bash
##填写zookeeper集群的ip地址或者主机名
########### These MUST be filled in for a storm configuration
storm.zookeeper.servers:
     - "192.168.2.149"
     - "192.168.2.150"
     - "192.168.2.151"

nimbus.seeds: ["192.168.2.149"]
#配置数据存储路径
storm.local.dir: "/data/ms/storm-1.1.1/data"

##配置节点健康检测
storm.health.check.dir: "healthchecks"
storm.health.check.timeout.ms: 5000

storm.local.hostname: "192.168.2.150"

#配置supervisor： 开启几个端口插槽，就开启几个对应的worker进程
supervisor.slots.ports:
    - 6700
    - 6701
    - 6702
    - 6703
```
配置详解 http://xstarcd.github.io/wiki/Cloud/storm_config_detail.html

## 启动
最后一步是启动所有的Storm守护进程。 在监督下运行这些守护进程是非常重要的。 Storm是一个快速失败(fail-fast)系统，意味着只要遇到意外错误，进程就会停止。 Storm的设计可以在任何时候安全停止，并在重新启动过程时正确恢复。 这就是为什么Storm在进程中不保持状态 - 如果Nimbus或Supervisors重新启动，运行的拓扑结构不受影响。 以下是如何运行Storm守护进程：

```bash
Nimbus：在Storm主控节点上运行命令bin/storm nimbus &，启动Nimbus后台程序，并放到后台执行。

Supervisor：在Storm各个工作节点上运行命令bin/storm supervisor &。

UI： 在Storm主控节点上运行命令bin/storm ui &，启动UI后台程序，并放到后台执行
```
访问http://192.168.1.191:8080  成功

参考链接：https://github.com/weyo/Storm-Documents/blob/master/Manual/zh/Concepts.md

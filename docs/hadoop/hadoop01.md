### 伪分布模式安装
hadoop 的安装分为本地模式、伪分布模式、集群模式。本地模式是运行在本地，只负
责存储，没有计算功能，本书不讲述。伪分布模式是在一台机器上模拟分布式部署，方便学
习和调试。集群模式是在多个机器上配置 hadoop，是真正的“分布式”。

 

### 下载
- http://mirrors.hust.edu.cn/apache/hadoop/common/hadoop-2.7.7
- 解压缩文件，并重命名为 hadoop，方便使用。重命名后这时，hadoop 目录的完整路径
- 是“/usr/local/hadoop”。

### 配置 hadoop 的环境变量
```bash
修改文件 vi /etc/profile

JAVA_HOME=/usr/local/java/jdk1.8.0_181
CLASSPATH=$JAVA_HOME/lib/
PATH=$PATH:$JAVA_HOME/bin:$HADOOP_HOME/bin
export PATH JAVA_HOME CLASSPATH

export HADOOP_HOME=/usr/local/hadoop-2.7.7

然后输入如下命令保存生效：
source /etc/profile
```
在任意目录下，输入 hadoop，出现如下信息即配置成功

```bash
[root@web1 hadoop-2.7.7]# hadoop
Usage: hadoop [--config confdir] [COMMAND | CLASSNAME]
  CLASSNAME            run the class named CLASSNAME
 or
  where COMMAND is one of:
  fs                   run a generic filesystem user client
  version              print the version
  jar <jar>            run a jar file
                       note: please use "yarn jar" to launch
                             YARN applications, not this command.
  checknative [-a|-h]  check native hadoop and compression libraries availability
  distcp <srcurl> <desturl> copy file or directories recursively
  archive -archiveName NAME -p <parent path> <src>* <dest> create a hadoop archive
  classpath            prints the class path needed to get the
  credential           interact with credential providers
                       Hadoop jar and the required libraries
  daemonlog            get/set the log level for each daemon
  trace                view and modify Hadoop tracing settings

Most commands print help when invoked w/o parameters.
```

### 修改配置文件
hadoop 配置文件默认是本地模式，我们修改四个配置文件，这些文件都位于/usr/local/hadoop-2.7.7/etc/hadoop 目录下。
```bash
#第一个是 hadoop 环境变量脚本文件 hadoop-env.sh
export JAVA_HOME=/usr/local/java/jdk1.8.0_181

#第二个是 hadoop 核心配置文件 core-site.xml
<configuration>
<property>
        <name>fs.defaultFS</name>
        <value>hdfs://192.168.1.191:9000</value>
        <description>HDFS 的访问路径</description>
    </property>
    <property>
        <name>hadoop.tmp.dir</name>
        <value>/usr/local/hadoop-2.7.7/tmp</value>
        <description>hadoop 的运行临时文件的主目录</description>
    </property>
</configuration>


#第三个是 hdfs 配置文件 hdfs-site.xml
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>1</value>
    </property>
    <description>存储副本数</description>
</configuration>

#第四个是 MapReduce 配置文件 mapred-site.xml
<configuration>
    <property>
	<name>mapred.job.tracker</name>
	<value>192.168.1.191:9001</value>
	<description>JobTracker 的访问路径</description>
    </property>
</configuration>
```
这是安装伪分布模式的最小化配置。目前的任务是把 hadoop 跑起来

### 格式化文件系统
hdfs 是 文 件 系 统 ， 所 以 在 第 一 次 使 用 之 前 需 要 进 行 格 式 化

```bash
bin/hdfs namenode -format
```
### 启动 hdfs 
hadoop 启动的三种方式：

```bash
#第一种，一次性全部启动
执行 start-all.sh 启动 hadoop

#第二种，分别启动 HDFS 和 MapReduce
执行命令 start-dfs.sh，是单独启动 hdfs（sbin/start-dfs.sh）
执行命令 start-mapred.sh，可以单独启动 MapReduce 的两个进程。
#那么我们就可以 通过 http://192.168.1.191:50070 来访问 NameNode


#第三种，分别启动各个进程：
[root@book0 bin]# hadoop-daemon.sh start namenode
[root@book0 bin]# hadoop-daemon.sh start datanode
[root@book0 bin]# hadoop-daemon.sh start secondarynamenode
[root@book0 bin]# hadoop-daemon.sh start jobtracker
[root@book0 bin]# hadoop-daemon.sh start tasktracker
[root@book0 bin]# jps
14855 NameNode
14946 DataNode
15043 SecondaryNameNode
15196 TaskTracker
15115 JobTracker
15303 Jps
```
### 解决hadoop启动总是提示输入密码

```bash
#配置本机的免秘钥登录 第二步一直回车
cd ~/.ssh
ssh-keygen -t rsa  
cat id_rsa.pub >> authorized_keys 

#修改hadoop-env.sh，将JAVA_HOME改为绝对路径
export HADOOP_COMMON_LIB_NATIVE_DIR="/usr/local/hadoop-2.7.7/lib/native"
export HADOOP_OPTS="$HADOOP_OPTS -Djava.library.path=/usr/local/hadoop-2.7.7/lib/native"
export JAVA_HOME=/usr/local/jdk1.7.0_79

#再次启动
sbin/start-all.sh 

#查看 jps
[root@web1 hadoop-2.7.7]# jps
4388 DataNode
4889 Jps
4748 NodeManager
4542 SecondaryNameNode
4270 NameNode
3871 ResourceManager
```
- 执行 start-all.sh 启动 hadoop，观察控制台的输出，见图 3-5,可以看到正在启动进程，分
别是 namenode、datanode、secondarynamenode、jobtracker、tasktracker，一共 5 个，待执行
完毕后，并不意味着这 5 个进程成功启动，上面仅仅表示系统正在启动进程而已

 **访问 http://192.168.1.191:50070 查看hadoop服务** 
 **访问集群中的所有应用程序的默认端口号为8088。使用以下URL访问该服务  http://192.168.1.191:8088** 

<img src="_media/hadoop1.png">

解决hadoop启动时报错
-------------
当启动hadoop时，出现警告：“util.NativeCodeLoader: Unable to load native-hadoop library for your platform”，这个警告导致hadoop fs -ls /与hadoop fs -mkdir /dir1等都无法成功。下载此文件 覆盖hadoop/lib/native/中的所有文件即可

hadoop-native-64-2.7.0.tar下载地址
https://gitee.com/qinxuewu/basic_induction_of_java/attach_files
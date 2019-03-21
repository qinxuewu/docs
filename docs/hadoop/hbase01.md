### Apache HBase
- Apache HBase™是Hadoop数据库，是一个分布式，可扩展的大数据存储。
- 当您需要对大数据进行随机，实时读/写访问时，请使用Apache HBase™。该项目的目标是托管非常大的表 - 数十亿行X百万列 - 在商品硬件集群上。Apache HBase是一个开源的，分布式的，版本化的非关系数据库

### 特征
- 线性和模块化可扩展性。
- 严格一致的读写操作。
- 表的自动和可配置分片
- RegionServers之间的自动故障转移支持。
- 方便的基类，用于使用Apache HBase表支持Hadoop MapReduce作业。
- 易于使用的Java API，用于客户端访问。
- 阻止缓存和布隆过滤器以进行实时查询。
- 查询谓词通过服务器端过滤器下推
- Thrift网关和REST-ful Web服务，支持XML，Protobuf和二进制数据编码选项
- 可扩展的基于jruby（JIRB）的外壳
- 支持通过Hadoop指标子系统将指标导出到文件或Ganglia; 或通过JMX

### 安装  独立HBase
HBase要求安装JDK。有关支持的JDK版本的信息
<img src="_media/hbase01.png">

从此Apache下载镜像列表中选择一个下载站点。单击建议的顶部链接。这将带您进入HBase版本的镜像。单击名为stable的文件夹，然后将以.tar.gz结尾的二进制文件下载到本地文件系统。暂时不要下载以src.tar.gz结尾的文件。


解压缩下载的文件，然后切换到新创建的目录。

```
$ tar -xzvf hbase-1.2.6.1-bin.tar.gz
```
为HBase设置Java目录，并从conf文件夹打开hbase-env.sh文件。编辑JAVA_HOME环境变量，改变路径到当前JAVA_HOME变量

```
#编辑/home/hbase-1.2.6.1/conf/hbase-env.sh
#配置hbase-env.sh文件：把29行的注释取消，配置虚拟机上面的Java地址
export JAVA_HOME=/usr/local/java/jdk1.7.0_79
```
编辑conf/hbase-site.xml，这是主要的HBase配置文件

```bash
<configuration>
  <property>
  <!--  配置hbase存在位置-->
      <name>hbase.rootdir</name>
      <value>file:///home/pflm/HBase/HFiles</value>
    </property>
    <property>
      <!--  配置hbase文件保存路径-->
      <name>hbase.zookeeper.property.dataDir</name>
      <value>/home/pflm/HBase/zookeeper</value>
    </property>
</configuration>
```
到此 HBase 的安装配置已成功完成。可以通过使用 HBase 的 bin 文件夹中提供 start-hbase.sh 脚本启动 HBase

```bash
$ ./bin/start-hbase.sh
```
运行HBase启动脚本，它会提示一条消息：HBase has started

```bash
starting master, logging to /usr/local/HBase/bin/../logs/hbase-tpmaster-localhost.localdomain.out
```
- 该./start-hbase.sh脚本是作为启动HBase的一种便捷方式。发出命令，如果一切顺利，将在标准输出中记录一条消息，显示HBase已成功启动。您可以使用该jps命令验证是否有一个正在运行的进程HMaster。在独立模式下，HBase运行此单个JVM中的所有守护程序，即HMaster，单个HRegionServer和ZooKeeper守护程序。转到`http：// localhost：16010`以查看HBase Web UI。

### HBase Shell
要访问HBase shell，必须导航进入到HBase的主文件夹。

```bash
#进入shell
/bin/hbase shell

#列出HBase的所有表。
hbase(main):001:0> list
TABLE
```
 **通用命令** 

```bash
status: 提供HBase的状态，例如，服务器的数量。
version: 提供正在使用HBase版本。
table_help: 表引用命令提供帮助
whoami: 提供有关用户的信息。
```
 **HBase在表中操作的命令。** 
```
create: 创建一个表。
list: 列出HBase的所有表。
disable: 禁用表。
is_disabled: 验证表是否被禁用。
enable: 启用一个表。
is_enabled: 验证表是否已启用。
describe: 提供了一个表的描述。
alter: 改变一个表。
exists: 验证表是否存在。
drop: 从HBase中删除表。
drop_all: 丢弃在命令中给出匹配“regex”的表
```
 **数据操纵语言** 

```
put: 把指定列在指定的行中单元格的值在一个特定的表。
get: 取行或单元格的内容。
delete: 删除表中的单元格值。
deleteall: 删除给定行的所有单元格。
scan: 扫描并返回表数据。
count: 计数并返回表中的行的数目。
truncate: 禁用，删除和重新创建一个指定的表。
```

### 解决Java API不能远程访问HBase的问题
 **1、配置Linux的hostname** 

```
[root@CentOS124 hbase-1.2.6.1]# vie /etc/sysconfig/network
NETWORKING=yes
HOSTNAME=CentOS124   #名字随便
```
这里配置的hostname要Linux重启才生效，为了不重启就生效，我们可以执行：hostname CentOS124命令，暂时设置hostname

 **2、配置Linux的hosts，映射ip的hostname的关系** 

```
#映射ip的hostname的关系
[root@CentOS124 hbase-1.2.6.1]# vim /etc/host

#查看hbase ip绑定是否成功
[root@CentOS124 hbase-1.2.6.1]# netstat -anp|grep 16010
```
<img src="_media/hbase02.png">

 **3、配置访问windows的hosts** 
```
#hbase
192.168.10.124  CentOS124
```


# Java 操作远程hbase
```java
public class HbaseTest {
  public static  Connection connection;
  public static Configuration configuration; 
    static { 
 
        configuration = HBaseConfiguration.create(); 
        // 设置连接参数：HBase数据库使用的端口
        configuration.set("hbase.zookeeper.property.clientPort", "2181"); 
        // 设置连接参数：HBase数据库所在的主机IP
        configuration.set("hbase.zookeeper.quorum", "192.168.10.124"); 
        // configuration.addResource("hbase-site.xml");
        try {
           // 取得一个数据库连接对象
      connection = ConnectionFactory.createConnection(configuration);
    } catch (IOException e) {
      e.printStackTrace();
    }
        
    } 
    public static void main(String[] args) throws Exception {
      createTable("gazw", "id","name");
//      deleteTable("gazw");
  }
    
    public static void createTable(String tableName,String... cf1) throws IOException { 
      Admin admin = connection.getAdmin();
        //HTD需要TableName类型的tableName，创建TableName类型的tableName
        TableName tbName = TableName.valueOf(tableName);
        //判断表述否已存在，不存在则创建表
        if(admin.tableExists(tbName)){
            System.err.println("表" + tableName + "已存在！");
            return;
        }
        //通过HTableDescriptor创建一个HTableDescriptor将表的描述传到createTable参数中
        HTableDescriptor HTD = new HTableDescriptor(tbName);
        //为描述器添加表的详细参数
        for(String cf : cf1){
            // 创建HColumnDescriptor对象添加表的详细的描述
            HColumnDescriptor HCD =new HColumnDescriptor(cf);
            HTD.addFamily(HCD);
        }
        //调用createtable方法创建表
        admin.createTable(HTD);
        System.out.println("创建成功");
    } 
}
```


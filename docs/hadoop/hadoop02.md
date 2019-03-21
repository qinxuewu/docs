HDFS简介
------

 - 数据量越来越大，在一个操作系统管辖的范围存不下了，那么就分配到更多的操作系统
   管理的磁盘中，但是不方便管理和维护，迫切需要一种系统来管理多台机器上的文件，这就 是分布式文件管理系统 。
 - 分布式文件系统是一种允许文件通过网络在多台主机上分享的文件系统，可让多机器上的多用户分享文件和存储空间
 - 分布式文件管理系统很多，HDFS 只是其中一种。适用于一次写入、多次查询的情
况，不支持并发写情况，小文件不合适

HDFS的特点
-------

 - 它适用于在分布式存储和处理。
 -  Hadoop提供的命令接口与HDFS进行交互。
 - 流式访问文件系统数据
 - HDFS提供了文件的权限和验证。

HDFS 的 shell 操作(Hadoop2.7版本)
---------------
**hadoop fs,hadoop dfs以及hdfs dfs区别**
 - hadoop fs: 说该命令可以用于其他文件系统，不止是hdfs文件系统内，也就是说该命令的使用范围更广
 - hadoop dfs 专门针对hdfs分布式文件系统
 - hdfs dfs 和上面的命令作用相同，相比于上面的命令更为推荐，并且当使用hadoop dfs时内部会被转为hdfs dfs命令

**查看hdfs帮助命令**
```bash
[root@web1 bin]# hdfs dfs
 Usage: hadoop fs [generic options]
  [-appendToFile <localsrc> ... <dst>]  #将本地文件或标准输入（stdin）追加到目标文件系统
  [-cat [-ignoreCrc] <src> ...]     # 用法和linux一致，将源输出到标准输出
  [-checksum <src> ...]     #返回文件的checksum信息
  [-chgrp [-R] GROUP PATH...]#改变文件所属的group，操作者需要是文件的拥有者或者超级用户
  [-chmod [-R] <MODE[,MODE]... | OCTALMODE> PATH...]#用于授权
  [-chown [-R] [OWNER][:[GROUP]] PATH...]#改变文件的拥有者，操作者需要是超级用户
  [-copyFromLocal [-f] [-p] [-l] <localsrc> ... <dst>]#类似于put命令，源文件必须是本地的
  [-copyToLocal [-p] [-ignoreCrc] [-crc] <src> ... <localdst>]#类似于get命令，目标必须是本地的
  [-count [-q] [-h] <path> ...]# 输出指定路径的目录数,文件数,内容大小,路径名
  [-cp [-f] [-p | -p[topax]] <src> ... <dst>]#用于复制
  [-createSnapshot <snapshotDir> [<snapshotName>]]# 用于创建快照
  [-deleteSnapshot <snapshotDir> <snapshotName>]#用于删除快照
  [-df [-h] [<path> ...]]# 展示剩余空间
  [-du [-s] [-h] <path> ...]# 展示文件和目录的大小
  [-expunge]#从垃圾目录（trash dir）的检查点中永久删除时间久于阈值（由core-site.xml中的fs.trash.checkpoint.interval指定，这个值需要小于fs.trash.interval）的文件，并创建新的检查点。
  [-find <path> ... <expression> ...]# 查找文件并对他们执行某操作
  [-get [-p] [-ignoreCrc] [-crc] <src> ... <localdst>]#将文件复制到本地文件系统。未通过CRC检查的文件将会自带-ignorecrc参数，其他将会自带-crc参数。
  [-getfacl [-R] <path>]#展示所有文件和目录的访问控制列表
  [-getfattr [-R] {-n name | -d} [-e en] <path>]#展示文件或目录的extended attribute name and value
  [-getmerge [-nl] <src> <localdst>]# 将源目录的文件融合到一个目标文件中
  [-help [cmd ...]]# 返回使用方法
  [-ls [-d] [-h] [-R] [<path> ...]]#同linux类似，展示目录或文件的某些信息
  [-mkdir [-p] <path> ...]#创建目录
  [-moveFromLocal <localsrc> ... <dst>]#put类似，但是源文件会被删除
  [-moveToLocal <src> <localdst>]
  [-mv <src> ... <dst>]#移动文件
  [-put [-f] [-p] [-l] <localsrc> ... <dst>]#将文件从本地提交到目标文件系统，也可以从stdin写入到目标文件系统
  [-renameSnapshot <snapshotDir> <oldName> <newName>]# 重命名快照
  [-rm [-f] [-r|-R] [-skipTrash] <src> ...]#删除特定文件
  [-rmdir [--ignore-fail-on-non-empty] <dir> ...]# 删除特定目录
  [-setfacl [-R] [{-b|-k} {-m|-x <acl_spec>} <path>]|[--set <acl_spec> <path>]]# 设置文件或目录的访问控制列表
  [-setfattr {-n name [-v value] | -x name} <path>]
  [-setrep [-R] [-w] <rep> <path> ...]# 修改文件的复制因子。
  [-stat [format] <path> ...]#用自定义的格式打印文件或目录的一些信息，包括文件大小、类型、所属group、文件名、block大小、复制因子、拥有者和修改时间
  [-tail [-f] <file>]#显示文件最后的1000byte
  [-test -[defsz] <path>]#测试路径是否是有效的文件或目录
  [-text [-ignoreCrc] <src> ...]#将输入文件以文本格式输出，允许的格式包括zip和TextRecordInputStream
  [-touchz <path> ...]# 创建一个长度为0的文件
  [-truncate [-w] <length> <path> ...]#将所有匹配的文件截断到指定的长度
  [-usage [cmd ...]]#返回某个特定命令的使用方法
```
**创建一个目录**
功能：在 hdfs 上创建目录，-p 表示会创建路径中的各级父目录。
```bash
[root@web1 bin]# hdfs dfs -mkdir -p /usr/local/input
```
**显示目录结构**
```bash
[root@web1 bin]# hdfs dfs -ls -help
-ls: Illegal option -help
Usage: hadoop fs [generic options] -ls [-d] [-h] [-R] [<path> ...]
[root@web1 bin]# hdfs dfs -ls /usr/local/
Found 2 items
drwxr-xr-x   - root supergroup          0 2018-09-12 19:45 /usr/local/hduser
drwxr-xr-x   - root supergroup          0 2018-09-12 19:42 /usr/local/input
[root@web1 bin]# hdfs dfs -lsr /usr/local/
lsr: DEPRECATED: Please use 'ls -R' instead.
drwxr-xr-x   - root supergroup          0 2018-09-12 19:45 /usr/local/hduser
drwxr-xr-x   - root supergroup          0 2018-09-12 19:42 /usr/local/input
[root@web1 bin]# 
```
**展示文件和目录的大小**

```bash
[root@web1 bin]# hdfs dfs -du /usr/local/
0  /usr/local/hduser
0  /usr/local/input
[root@web1 bin]# 
```
**-count 统计文件(夹)数量**
```bash
hdfs dfs -count /usr/local/
```
-put 上传文件
该命令选项表示把 linux 上的文件复制到 hdfs 中
```bash
[root@web1 bin]# hdfs dfs -put /usr/local/redis-3.2.12.tar.gz  /usr/local/hduser
[root@web1 bin]# hdfs dfs -ls /usr/local/hduser
Found 1 items
-rw-r--r--   3 root supergroup    1551468 2018-09-12 20:41 /usr/local/hduser/redis-3.2.12.tar.gz
[root@web1 bin]# 
```

-mv 移动
该命令选项表示移动 hdfs 的文件到指定的 hdfs 目录中。后面跟两个路径，第一个
表示源文件，第二个表示目的目录
```bash
[root@web1 bin]# hdfs dfs -mv /usr/local/hduser/redis-3.2.12.tar.gz /usr/local/input
[root@web1 bin]# hdfs dfs -ls /usr/local/input
Found 1 items
-rw-r--r--   3 root supergroup    1551468 2018-09-12 20:41 /usr/local/input/redis-3.2.12.tar.gz
[root@web1 bin]# 
```
-cp 复制
该命令选项表示复制 hdfs 指定的文件到指定的 hdfs 目录中。后面跟两个路径，第一个是被复制的文件，第二个是目的地

```bash
[root@web1 bin]# hdfs dfs -cp /usr/local/input/redis-3.2.12.tar.gz /usr/local/hduser
[root@web1 bin]# hdfs dfs -ls /usr/local/hduser
Found 1 items
-rw-r--r--   3 root supergroup    1551468 2018-09-12 20:48 /usr/local/hduser/redis-3.2.12.tar.gz
```

-get
使用方法：hadoop fs -get [-ignorecrc] [-crc] [-p] [-f] <src> <localdst>
-ignorecrc：跳过对下载文件的 CRC 检查。
-crc：为下载的文件写 CRC 校验和。
功能：将文件复制到本地文件系统。
```bash
[root@web1 bin]# hdfs dfs -get hdfs://192.168.1.191:9000/usr/local/hduser/redis-3.2.12.tar.gz /usr
```
<img src="_media/hadoop2.png">

参考：https://blog.csdn.net/qq_35379598/article/details/80925458

#### HDFS 体系结构与基本概念

 - 我们通过 hadoop shell 上传的文件是存放在 DataNode 的 block 中，通过 linux shell 是看
   不到文件的，只能看到 block。
 - 可以一句话描述 HDFS：把客户端的大文件存放在很多节点的数据块中。在这里，出现 了三个关键词：文件、节点、数据块。HDFS就是围绕着这三个关键词设计的

**NameNode**
 - NameNode 的作用是管理文件目录结构，是管理数据节点的。名字节点维护两套数据，
    一套是文件目录与数据块之间的关系，另一套是数据块与节点之间的关系。前一套数据是静 态的，是存放在磁盘上的，通过 fsimage 和edits 文件来维护；后一套数据是动态的，不持 久化到磁盘的，每当集群启动的时候，会自动建立这些信息。

DataNode
--------
 - DataNode 的作用 是 HDFS 中真正存储数据的。 DataNode 在存储数据的时候是按照 block
   为单位读写数据的。block 是 hdfs 读写数据的基本单位。
 - 假设文件大小是 100GB，从字节位置 0 开始，每 64MB 字节划分为一个 block，以依此 类推，可以划分出很多的 block。每个 block 就是 64MB 大小。
 - block 本质上是一个逻辑概念，意味着 block 里面不会真正的存储数据，只是划分文件的

SecondaryNameNode
-----------------
SNN 只有一个职责，就是合并 NameNode 中的 edits 到 fsimage 中

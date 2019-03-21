# jps
输出正字运行的相关进程信息

* `jps -v`    输出传递给jvm参数
* `jps -l`    输出模块名以及包名,如果是jar 则出输jar文件全名
* `jps -m`    输出传递给jvm参数
* `jps -mlv`  输出进程号,包名,虚拟机参数等所有信息

```bash
[root@izadux3fzjykx7z ~]# jps -mlv
12656 sun.tools.jps.Jps -mlv -Dapplication.home=/usr/java/jdk1.8.0_171 -Xms8m
16418 halo-latest.jar -Xms256m -Xmx256m
[root@izadux3fzjykx7z ~]# 
```
# jstat 
监控指定Java进程的性能

* `-class `               显示类的加载信息的相关信息；
* `-compiler `            显示类编译相关信息；
* `-gc `                  显示和gc相关的堆信息
* `-gccapacity `          堆内存统计
* `-gcmetacapacity `      元空间大小
* `-gcnew `               新生代信息
* `-gcnewcapacity `       新生代大小和使用情况
* `-gcold `               显示老年代和永久代的信息；
* `-gcoldcapacity `       老年代的大小
* `-gcutil `              显示垃圾收集信息
* `-gccause `             显示垃圾回收的相关信息
* `-printcompilation `    输出JIT编译的方法信息；


- 类的加载信息 jstat -class pid
```bash
[root@izadux3fzjykx7z ~]# jstat -class 16418
Loaded  Bytes  Unloaded  Bytes     Time   
 13293 23828.4        0     0.0      17.14
 
Loaded： class加载的的总数量
Bytes： 占用空间大小
Unloaded 未加载数量
Bytes   未加载占用空间大小
Time： 加载总耗时  秒
```

- 类编译的统计 jstat -compiler pid
```bash
[root@izadux3fzjykx7z ~]# jstat -compiler  16418
Compiled Failed Invalid   Time   FailedType FailedMethod
   14109      3       0    62.83          1 org/springframework/core/xxxxxx

Compiled：编译数量。
Failed：编译失败数量
Invalid：不可用数量
Time：编译耗时 秒
FailedType：失败类型
FailedMethod：失败的方法

```

- gc回收统计   jstat -gc pid

```bash
[root@izadux3fzjykx7z ~]# jstat -gc  16418
 S0C    S1C    S0U    S1U      EC       EU        OC         OU       MC     MU    CCSC   CCSU   YGC     YGCT    FGC    FGCT     GCT   
8704.0 8704.0  0.0   5466.6 69952.0  29822.5   174784.0   73377.5   75008.0 71393.1 9472.0 8916.8     53    1.199   3      0.293    1.492
[root@izadux3fzjykx7z ~]# 

S0C：第一个幸存区的大小
S1C：第二个幸存区的大小
S0U：第一个幸存区的使用大小
S1U：第二个幸存区的使用大小
EC：伊甸园区的大小
EU：伊甸园区的使用大小
OC：老年代大小
OU：老年代使用大小
MC：方法区大小
MU：方法区使用大小
CCSC:压缩类空间大小
CCSU:压缩类空间使用大小
YGC：年轻代垃圾回收次数
YGCT：年轻代垃圾回收消耗时间
FGC：老年代垃圾回收次数
FGCT：老年代垃圾回收消耗时间
GCT：垃圾回收消耗总时间
```

- 堆内存统计   jstat -gccapacity pid

```bash
[root@izadux3fzjykx7z ~]# jstat -gccapacity  16418
 NGCMN    NGCMX     NGC     S0C   S1C       EC      OGCMN      OGCMX       OGC         OC       MCMN     MCMX      MC     CCSMN    CCSMX     CCSC    YGC    FGC 
 87360.0  87360.0  87360.0 8704.0 8704.0  69952.0   174784.0   174784.0   174784.0   174784.0      0.0 1114112.0  75008.0      0.0 1048576.0   9472.0     53     3

NGCMN：新生代最小容量
NGCMX：新生代最大容量
NGC：当前新生代容量
S0C：第一个幸存区大小
S1C：第二个幸存区的大小
EC：伊甸园区的大小
OGCMN：老年代最小容量
OGCMX：老年代最大容量
OGC：当前老年代大小
OC:当前老年代大小
MCMN:最小元数据容量
MCMX：最大元数据容量
MC：当前元数据空间大小
CCSMN：最小压缩类空间大小
CCSMX：最大压缩类空间大小
CCSC：当前压缩类空间大小
YGC：年轻代gc次数
FGC：老年代GC次数

```


- 新生代gc统计 jstat -gcnew  pid

```bash
[root@izadux3fzjykx7z ~]# jstat -gcnew   16418
 S0C    S1C    S0U    S1U   TT MTT  DSS      EC       EU     YGC     YGCT  
8704.0 8704.0    0.0 5466.6  6  15 4352.0  69952.0  30899.8     53    1.199

S0C：第一个幸存区大小
S1C：第二个幸存区的大小
S0U：第一个幸存区的使用大小
S1U：第二个幸存区的使用大小
TT:对象在新生代存活的次数
MTT:对象在新生代存活的最大次数
DSS:期望的幸存区大小
EC：伊甸园区的大小
EU：伊甸园区的使用大小
YGC：年轻代垃圾回收次数
YGCT：年轻代垃圾回收消耗时间

```

# jmap
以获得运行中的jvm的堆的快照，从而可以离线分析堆，以检查内存泄漏，检查一些严重影响性能的大对象的创建，检查系统中什么对象最多，
各种对象所占内存的大小等等。可以使用jmap生成Heap Dump

* `jmap -heap 16418`   打印heap空间的概要

```bash
[root@izadux3fzjykx7z ~]# jmap -heap 16418
Attaching to process ID 16418, please wait...
Debugger attached successfully.
Server compiler detected.
JVM version is 25.171-b11

using thread-local object allocation.
Mark Sweep Compact GC

Heap Configuration:
   MinHeapFreeRatio         = 40
   MaxHeapFreeRatio         = 70
   MaxHeapSize              = 268435456 (256.0MB)
   NewSize                  = 89456640 (85.3125MB)
   MaxNewSize               = 89456640 (85.3125MB)
   OldSize                  = 178978816 (170.6875MB)
   NewRatio                 = 2
   SurvivorRatio            = 8
   MetaspaceSize            = 21807104 (20.796875MB)
   CompressedClassSpaceSize = 1073741824 (1024.0MB)
   MaxMetaspaceSize         = 17592186044415 MB
   G1HeapRegionSize         = 0 (0.0MB)

Heap Usage:
New Generation (Eden + 1 Survivor Space):         // 新生代区
   capacity = 80543744 (76.8125MB)                //分配的大小
   used     = 44269728 (42.218902587890625MB)     //使用
   free     = 36274016 (34.593597412109375MB)     //剩余
   54.96358351556143% used                        
Eden Space:                                     //伊甸园区
   capacity = 71630848 (68.3125MB)
   used     = 38671896 (36.880393981933594MB)
   free     = 32958952 (31.432106018066406MB)
   53.98776795159538% used
From Space:                                   //年轻代 幸存者1
   capacity = 8912896 (8.5MB)
   used     = 5597832 (5.338508605957031MB)
   free     = 3315064 (3.1614913940429688MB)
   62.80598359949448% used
To Space:                                     /年轻代 幸存者2
   capacity = 8912896 (8.5MB)
   used     = 0 (0.0MB)
   free     = 8912896 (8.5MB)
   0.0% used
tenured generation:                           //老年代
   capacity = 178978816 (170.6875MB)
   used     = 75138528 (71.65768432617188MB)
   free     = 103840288 (99.02981567382812MB)
   41.98179967846027% used

30511 interned Strings occupying 3634816 bytes.

```

* `jmap -dump:live,format=b,file=/home/tess.dump 16418`   产生一个HeapDump文件
* `jmap -histo 16418`  统计各个类的实例数目以及占用内存，并按照内存使用量从多至少的顺序排列。

# jinfo
查看目标 Java 进程的参数，如传递给 Java 虚拟机的参数
*  `jinfo 16418`

# jcmd
可以用来实现前面除了jstat 之外所有命令的功能。








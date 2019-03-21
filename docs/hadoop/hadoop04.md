MapReduce简介
-----------

 - MapReduce 是 Hadoop 的核心组成,是专用于进行数据计算的。如果我们把 MapReduce 拆开看，就是两个单词 map 和
 -  reduce Map采用了一组数据，并将其转换成另一组数据，其中，各个元件被分解成元组(键/值对)。其次，减少任务，这需要从Map 作为输入并组合那些数据元组成的一组小的元组输出。

MapReduce 执行过程
--------------
MapReduce 运行的时候，会通过 Mapper 运行的任务读取 HDFS 中的数据文件，然后调
用自己的方法，处理数据，最后输出。Reducer 任务会接收 Mapper 任务输出的数据，作为
自己的输入数据，调用自己的方法，最后输出到 HDFS 的文件中

<img src="_media/hadoop3.png">

每个 Mapper 任务是一个 java 进程，它会读取 HDFS 中的文件，解析成很多的键值对，
经过我们覆盖的 map 方法处理后，转换为很多的键值对再输出。整个 Mapper 任务的处理过
程又可以分为以下几个阶段

<img src="_media/hadoop4.png">

**把 Mapper 任务的运行过程分为六个阶段**

 - 第一阶段是把输入文件按照一定的标准分片(InputSplit)，每个输入片的大小是固定的。
默认情况下，输入片(InputSplit)的大小与数据块(Block)的大小是相同的。如果数据块(Block) 的大小是默认值64MB，输入文件有两个，一个是 32MB，一个是 72MB。那么小的文件是一个输入片，大文件会分为两个数据块，那么是两个输入片。一共产生三个输入片。每一个输 入片由一个 Mapper进程处理。这里的三个输入片，会有三个 Mapper 进程处理
 - 第二阶段是对输入片中的记录按照一定的规则解析成键值对。有个默认规则是把每一行文本内容解析成键值对。“键”是每一行的起始位置(单位是字节)，“值”是本行的文本内容。
 - 第三阶段是调用 Mapper 类中的 map 方法。第二阶段中解析出来的每一个键值对，调用一次 map 方法。如果有 1000 个键值对，就会调用 1000 次 map 方法。每一次调用 map 方法会输出零个或者多个键值对。
 - 第四阶段是按照一定的规则对第三阶段输出的键值对进行分区。比较是基于键进行的。比如我们的键表示省份(如北京、上海、山东等)，那么就可以按照不同省份进行分区，同一个省份的键值对划分到一个区中。默认是只有一个区。分区的数量就是 Reducer 任务运行的数量。默认只有一个 Reducer 任务
 - 第五阶段是对每个分区中的键值对进行排序。首先，按照键进行排序，对于键相同的键值对，按照值进行排序。比如三个键值对<2,2>、<1,3>、<2,1>，键和值分别是整数。那么排序后的结果是<1,3>、<2,1>、<2,2>。如果有第六阶段，那么进入第六阶段；如果没有，直接输出到本地的 linux 文件中。
 - 第六阶段是对数据进行归约处理，也就是 reduce 处理。键相等的键值对会调用一次reduce 方法。经过这一阶段，数据量会减少。归约后的数据输出到本地的 linxu 文件中。本阶段默认是没有的，需要用户自己增加这一阶段的代码。

java操作MapReduce
---------------
新建maven项目hadoop-demo2
引入相关jar包
```
<dependency>
        <groupId>org.apache.hadoop</groupId>
        <artifactId>hadoop-common</artifactId>
        <version>2.7.7</version>
    </dependency>
    <dependency>
        <groupId>org.apache.hadoop</groupId>
        <artifactId>hadoop-hdfs</artifactId>
        <version>2.7.7</version>
    </dependency>
    
    <dependency>
        <groupId>org.apache.hadoop</groupId>
        <artifactId>hadoop-mapreduce-client-core</artifactId>
        <version>2.7.7</version>
    </dependency>
    
  <dependency>
      <groupId>org.apache.hadoop</groupId>
      <artifactId>hadoop-mapreduce-client-common</artifactId>
      <version>2.7.7</version>
  </dependency>
  <dependency>
        <groupId>jdk.tools</groupId>
        <artifactId>jdk.tools</artifactId>
        <version>1.8</version>
        <scope>system</scope>
        <systemPath>${JAVA_HOME}/lib/tools.jar</systemPath>
    </dependency>
```

**新建测试文本data.txt 内容如下，上传至hdfs**
2014010216
2014010410
2012010609
2012010812
2012011023
2001010212
2001010411
2013010619
2013010812
2013011023
2008010216
2008010414
2007010619
2007010812
2007011023
2010010216
2010010410
2015010649
2015010812
2015011023


编写程序代码
------

```java
package com.example;
import java.io.IOException;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
public class Temperature {
  
  
   /**
    * map
     * 四个泛型类型分别代表：
     * KeyIn        Mapper的输入数据的Key，这里是每行文字的起始位置（0,11,...）
     * ValueIn      Mapper的输入数据的Value，这里是每行文字
     * KeyOut       Mapper的输出数据的Key，这里是每行文字中的“年份”
     * ValueOut     Mapper的输出数据的Value，这里是每行文字中的“气温”
     */
    static class TempMapper extends Mapper<LongWritable, Text, Text, IntWritable> {
        @Override
        public void map(LongWritable key, Text value, Context context) throws IOException, InterruptedException {
            // 打印样本: Before Mapper: 0, 2000010115
            System.out.print("Before Mapper: " + key + ", " + value);
            String line = value.toString();
            String year = line.substring(0, 4);
            int temperature = Integer.parseInt(line.substring(8));
            context.write(new Text(year), new IntWritable(temperature));
            // 打印样本: After Mapper:2000, 15
            System.out.println( "======" +"After Mapper:" + new Text(year) + ", " + new IntWritable(temperature));
        }
    }
    
    
    /**
     * reducer
     * 四个泛型类型分别代表：
     * KeyIn        Reducer的输入数据的Key，这里是每行文字中的“年份”
     * ValueIn      Reducer的输入数据的Value，这里是每行文字中的“气温”
     * KeyOut       Reducer的输出数据的Key，这里是不重复的“年份”
     * ValueOut     Reducer的输出数据的Value，这里是这一年中的“最高气温”
     */
    static class TempReducer extends  Reducer<Text, IntWritable, Text, IntWritable> {
        @Override
        public void reduce(Text key, Iterable<IntWritable> values,Context context) throws IOException, InterruptedException {
            int maxValue = Integer.MIN_VALUE;
            StringBuffer sb = new StringBuffer();
            //取values的最大值
            for (IntWritable value : values) {
                maxValue = Math.max(maxValue, value.get());
                sb.append(value).append(", ");
            }
            // 打印样本： Before Reduce: 2000, 15, 23, 99, 12, 22, 
            System.out.print("Before Reduce: " + key + ", " + sb.toString());
            context.write(key, new IntWritable(maxValue));
            // 打印样本： After Reduce: 2000, 99
            System.out.println("======" + "After Reduce: " + key + ", " + maxValue);
        }
    }
 
    public static void main(String[] args) throws Exception {
        //输入路径
        String dst="hdfs://192.168.1.191:9000/usr/local/api2/data.txt";
        //输出路径，必须是不存在的，空文件加也不行。
        String dstOut="hdfs://192.168.1.191:9000/usr/local/output";
        Configuration hadoopConfig = new Configuration();
         
        hadoopConfig.set("fs.hdfs.impl", org.apache.hadoop.hdfs.DistributedFileSystem.class.getName());
        hadoopConfig.set("fs.file.impl",org.apache.hadoop.fs.LocalFileSystem.class.getName());
        Job job = new Job(hadoopConfig);
         
        //如果需要打成jar运行，需要下面这句
        job.setJarByClass(Temperature.class);
 
        //job执行作业时输入和输出文件的路径
        FileInputFormat.addInputPath(job, new Path(dst));
        FileOutputFormat.setOutputPath(job, new Path(dstOut));
 
        //指定自定义的Mapper和Reducer作为两个阶段的任务处理类
        job.setMapperClass(TempMapper.class);
        job.setReducerClass(TempReducer.class);
         
        //设置最后输出结果的Key和Value的类型
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(IntWritable.class);
         
        //执行job，直到完成
        boolean success = job.waitForCompletion(true);
        System.out.println("Finished：  "+success);
    }
}

```

打包工程为jar包
---------
代码完成后，并不能直接在hadoop中运行，还需要将其打包成jvm所能执行的二进制文件，即打包成.jar文件，才能被hadoop所有。

配置主类
```java
   <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-jar-plugin</artifactId>
        <configuration>
          <archive>
            <manifest>
              <addClasspath>true</addClasspath>
              <mainClass>com.example.Temperature</mainClass> <!-- 你的主类名 -->
            </manifest>
          </archive>
        </configuration>
      </plugin>
    </plugins>
  </build>
```

部署并运行
-----
部署其实就把前面打包生成的jar包放入集群中运行。hadoop一般会有多个节点，一个namenode节点和多个datanode节点，这里只需要把jar放入namenode中，并使用相应的hadoop命令即可，hadoop集群会把任务传送给需要运行任务的节点。这里我上传至`/usr/local/hadoop-2.7.7` 安装目录下

**在hadoop中运行jar任务需要使用的命令：**

```
#hadoop jar [jar文件位置] [jar 主类] [HDFS输入位置] [HDFS输出位置]
hadoop jar [jar文件位置] 

hadoop: hadoop脚本命令，如果要直接使用，必须添加相应bin路径到环境变量PATH中。
jar: 表示要运行的是一个基于Java的任务。
jar文件位置： 提供所要运行任务的jar文件位置，如果在当前操作目录下，可直接使用文件名。
jar主类： 提供入口函数所在的类，格式为[包名.]类名
HDFS输入位置： 指定输入文件在HDFS中的位置。
HDFS输出位置： 执行输出文件在HDFS中的存储位置，该位置必须不存在，否则任务不会运行，该机制就是为了防止文件被覆盖出现意外丢失。
```

运行结果如下
------

```bash
[root@web1 hadoop-2.7.7]# bin/hadoop jar hadoop-demo2.jar 
18/09/14 03:00:29 INFO Configuration.deprecation: session.id is deprecated. Instead, use dfs.metrics.session-id
18/09/14 03:00:29 INFO jvm.JvmMetrics: Initializing JVM Metrics with processName=JobTracker, sessionId=
18/09/14 03:00:31 WARN mapreduce.JobResourceUploader: Hadoop command-line option parsing not performed. Implement the Tool interface and execute your application with ToolRunner to remedy this.
18/09/14 03:00:31 INFO input.FileInputFormat: Total input paths to process : 1
18/09/14 03:00:31 INFO mapreduce.JobSubmitter: number of splits:1
18/09/14 03:00:32 INFO mapreduce.JobSubmitter: Submitting tokens for job: job_local2072621076_0001
18/09/14 03:00:33 INFO mapreduce.Job: The url to track the job: http://localhost:8080/
18/09/14 03:00:33 INFO mapreduce.Job: Running job: job_local2072621076_0001
18/09/14 03:00:33 INFO mapred.LocalJobRunner: OutputCommitter set in config null
18/09/14 03:00:33 INFO output.FileOutputCommitter: File Output Committer Algorithm version is 1
18/09/14 03:00:33 INFO mapred.LocalJobRunner: OutputCommitter is org.apache.hadoop.mapreduce.lib.output.FileOutputCommitter
18/09/14 03:00:34 INFO mapred.LocalJobRunner: Waiting for map tasks
18/09/14 03:00:34 INFO mapred.LocalJobRunner: Starting task: attempt_local2072621076_0001_m_000000_0
18/09/14 03:00:34 INFO mapreduce.Job: Job job_local2072621076_0001 running in uber mode : false
18/09/14 03:00:34 INFO mapreduce.Job:  map 0% reduce 0%
18/09/14 03:00:34 INFO output.FileOutputCommitter: File Output Committer Algorithm version is 1
18/09/14 03:00:34 INFO mapred.Task:  Using ResourceCalculatorProcessTree : [ ]
18/09/14 03:00:34 INFO mapred.MapTask: Processing split: hdfs://192.168.1.191:9000/usr/local/api2/data.txt:0+238
18/09/14 03:00:46 INFO mapred.MapTask: (EQUATOR) 0 kvi 26214396(104857584)
18/09/14 03:00:46 INFO mapred.MapTask: mapreduce.task.io.sort.mb: 100
18/09/14 03:00:46 INFO mapred.MapTask: soft limit at 83886080
18/09/14 03:00:46 INFO mapred.MapTask: bufstart = 0; bufvoid = 104857600
18/09/14 03:00:46 INFO mapred.MapTask: kvstart = 26214396; length = 6553600
18/09/14 03:00:46 INFO mapred.MapTask: Map output collector class = org.apache.hadoop.mapred.MapTask$MapOutputBuffer
Before Mapper: 0, 2014010216======After Mapper:2014, 16
Before Mapper: 12, 2014010410======After Mapper:2014, 10
Before Mapper: 24, 2012010609======After Mapper:2012, 9
Before Mapper: 36, 2012010812======After Mapper:2012, 12
Before Mapper: 48, 2012011023======After Mapper:2012, 23
Before Mapper: 60, 2001010212======After Mapper:2001, 12
Before Mapper: 72, 2001010411======After Mapper:2001, 11
Before Mapper: 84, 2013010619======After Mapper:2013, 19
Before Mapper: 96, 2013010812======After Mapper:2013, 12
Before Mapper: 108, 2013011023======After Mapper:2013, 23
Before Mapper: 120, 2008010216======After Mapper:2008, 16
Before Mapper: 132, 2008010414======After Mapper:2008, 14
Before Mapper: 144, 2007010619======After Mapper:2007, 19
Before Mapper: 156, 2007010812======After Mapper:2007, 12
Before Mapper: 168, 2007011023======After Mapper:2007, 23
Before Mapper: 180, 2010010216======After Mapper:2010, 16
Before Mapper: 192, 2010010410======After Mapper:2010, 10
Before Mapper: 204, 2015010649======After Mapper:2015, 49
Before Mapper: 216, 2015010812======After Mapper:2015, 12
Before Mapper: 228, 2015011023======After Mapper:2015, 23
```

查看结果
----

```bash
[root@web1 hadoop-2.7.7]# bin/hdfs dfs -ls /usr/local/output
Found 2 items
-rw-r--r--   3 root supergroup          0 2018-09-14 03:00 /usr/local/output/_SUCCESS
-rw-r--r--   3 root supergroup         64 2018-09-14 03:00 /usr/local/output/part-r-00000
[root@web1 hadoop-2.7.7]# bin/hdfs dfs -ls /usr/local/output/*
-rw-r--r--   3 root supergroup          0 2018-09-14 03:00 /usr/local/output/_SUCCESS
-rw-r--r--   3 root supergroup         64 2018-09-14 03:00 /usr/local/output/part-r-00000
[root@web1 hadoop-2.7.7]# bin/hdfs dfs -cat /usr/local/output/*
2001  12
2007  23
2008  16
2010  16
2012  23
2013  23
2014  16
2015  49
[root@web1 hadoop-2.7.7]# 
```

参考链接：https://blog.csdn.net/u011026329/article/details/52900628
### ElasticSearch 简介

ElasticSearch是一个高度可扩展的开源搜索引擎并使用REST API，所以您值得拥有。 在本教程中，将介绍开始使用ElasticSearch的一些主要概念。


### 下载并运行ElasticSearch
ElasticSearch可以从elasticsearch.org下载对应的文件格式，如ZIP和TAR.GZ。下载并提取一个运行它的软件包之后不会容易得多，需要提前安装Java运行时环境。
下载链接 https://www.elastic.co/products/elasticsearch

### 在Windows上运行ElasticSearch
- 从命令窗口运行位于bin文件夹中的elasticsearch.bat。这将会启动ElasticSearch在控制台的前台运行，这意味着我们可在控制台中看到运行信息或一些错误信息，并可以使用CTRL + C停止或关闭它。
- 在启动过程中，ElasticSearch的实例运行会占用大量的内存，所以在这一过程中，电脑会变得比较慢，需要耐心等待，启动加载完成后电脑就可以正常使用了
- 当ElasticSearch的实例并运行，您可以使用http://localhost:9200检查是否运行成功

### [Linux安装ElasticSearch](https://blog.csdn.net/weixin_41615494/article/details/79591335)
访问elasticSearch官网地址 https://www.elastic.co/
下载指定版本的安装包：elasticsearch-6.1.1.tar.gz,上传至指定目录/usr/local/elasticsearch

```
#解压
tar -zxvf elasticsearch-6.1.1.tar.gz
#创建数据存储目录
mkdir -p /usr/local/elasticsearch/data
#创建日志存储目录
mkdir -p /usr/local/elasticsearch/logs

#进入到es安装目录下的config文件夹中，修改elasticsearch.yml 文件

#配置es的集群名称，默认是elasticsearch，es会自动发现在同一网段下的es，如果在同一网段下有多个集群，就可以用这个属性来区分不同的集群。
cluster.name: qxw-application
#节点名称
node.name: node-1 
#设置索引数据的存储路径
path.data: /usr/local/elasticsearch/data 
#设置日志的存储路径
path.logs: /usr/local/elasticsearch/logs 
#设置当前的ip地址,通过指定相同网段的其他节点会加入该集群中
network.host: 192.168.1.191
#设置对外服务的http端口
http.port: 9200 
#设置集群中master节点的初始列表，可以通过这些节点来自动发现新加入集群的节点
discovery.zen.ping.unicast.hosts: ["node-1"]
```
**修改host 文件，执行命令 vi /etc/hosts** 
![输入图片说明](https://images.gitee.com/uploads/images/2018/0828/160050_635d8737_1478371.png "屏幕截图.png")

 **因为安全问题elasticsearch 不让用root用户直接运行，所以要创建新用户。** 
```
useradd es
passwd es
再输入两次密码(自定义)

#给新创建用户文件夹执行权限
chown -R es:es /usr/local/elasticsearch

切换es用户：su es

启动集群命令：
cd  /usr/local/elasticsearch
bin/elasticsearch
```
 **在es用户下启动时报错** 
![输入图片说明](https://images.gitee.com/uploads/images/2018/0828/160518_fa36c3de_1478371.png "屏幕截图.png")

```
原因：Centos6不支持SecComp，而ES默认bootstrap.system_call_filter为true进行检测，所以导致检测失败，失败后直接导致ES不能启动

详见 ：https://github.com/elastic/elasticsearch/issues/22899
解决方案：

在elasticsearch.yml中新增配置bootstrap.system_call_filter，设为false。
bootstrap.system_call_filter: false
```
![输入图片说明](https://images.gitee.com/uploads/images/2018/0828/160711_ab8f6f19_1478371.png "屏幕截图.png")

 **第一个问题的原因：** 
```
原因：无法创建本地文件问题,用户最大可创建文件数太小

解决方案：切换到root用户，编辑limits.conf配置文件， 添加类似如下内容：

vi /etc/security/limits.conf

添加如下内容: 注意*不要去掉了

* soft nofile 65536

* hard nofile 131072

备注：* 代表Linux所有用户名称（比如 hadoop）

需要保存、退出、重新登录才可生效。
```
**第二个错误的原因：** 

```
原因：无法创建本地线程问题,用户最大可创建线程数太小

解决方案：切换到root用户，进入limits.d目录下，修改90-nproc.conf 配置文件。

vi /etc/security/limits.d/90-nproc.conf

找到如下内容：

* soft nproc 1024

#修改为

* soft nproc 4096
```
**第三个错误的原因：** 

```
原因：最大虚拟内存太小

每次启动机器都手动执行下。

root用户执行命令：

执行命令：sysctl -w vm.max_map_count=262144

查看修改结果命令：sysctl -a|grep vm.max_map_count  看是否已经修改

永久性修改策略：

echo "vm.max_map_count=262144" >> /etc/sysctl.conf
```
 **切换到es用户执行:bin/elasticsearch** 
访问：http://192.168.1.191:9200/

```
#后台启动
[es@localhost elasticsearch-6.4.0]$ ./bin/elasticsearch -d
[es@localhost elasticsearch-6.4.0]$ jps
27587 Jps
27573 Elasticsearch
```

### elasticsearch 服务安全配置
 **一、目前主要通过插件的形式来控制：** 
1. 常用的插件主要包括：elasticsearch-http-basic，search-guard，shield
1. 由于shield是收费的暂时还未研究（研究后统一补充）
1. search-guard主要用于elasticsearch2.x以后的版本（研究后统一补充）
1. elasticsearch-http-basic主要用于elasticsearch1.x的版本
1. 基于目前我们es集群大部分都是1.5.2版本的，所以主要使用http-basic来控制来自http请求的访问。

 **二、elasticsearch-http-basic安装：** 
1. 下载elasticsearch-http-basic-1.5.1.jar（下载地址：https://github.com/Asquera/elasticsearch-http-basic/releases）
1. 在ES的plugins文件夹下新建http-basic文件夹
1. 把下载的 elasticsearch-http-basic-1.5.1.jar拷贝到新建的http-basic文件夹下
1. 修改ES的配置文件elasticsearch.yml,在文件末尾添加以下配置：

```
配置名                                     默认值                            说明

http.basic.enabled                         true                            开关，开启会接管全部HTTP连接

http.basic.user                          "admin"                          账号

http.basic.password                      "admin_pw"                       密码

http.basic.ipwhitelist            ["localhost", "127.0.0.1"]    白名单内的ip访问不需要通过账号和密码，支持ip和主机名，不支持ip区间或正则

http.basic.trusted_proxy_chains    []                                    信任代理列表

http.basic.log    false                                              把无授权的访问事件添加到ES的日志

http.basic.xforward    ""                                          记载代理路径的header字段名

5.重启ES集群
目前我们主要通过http.basic.ipwhitelist 白名单 + 用户名、密码来控制外部机器对ES集群的http请求，

1.在白名单内的ip列表用户无需验证可直接通过ES节点的ip地址访问ES，白名单外的用户无权访问ES集群

2.由于白名单无法控制通过域名的访问，如果要通过域名访问ES必须要通过用户名和密码来访问
```


### java中使用elastaicsearch(RestHighLevelClient)
官方文档可以得知，现在存在至少三种Java客户端。
1. Transport Client
1. Java High Level REST Client
1. Java Low Level Rest Client
1. 强烈建议ES5及其以后的版本使用Java High Level REST Client

**java High Level REST Client 介绍** 
- Java High Level REST Client 是基于Java Low Level REST Client的，每个方法都可以是同步或者异步的。同步方法返回响应对象，而异步方法名以“async”结尾，并需要传入一个监听参数，来确保提醒是否有错误发生。
- Java High Level REST Client需要Java1.8版本和ES。并且ES的版本要和客户端版本一致。和TransportClient接收的参数和返回值是一样的。

引入maven依赖
```
<dependency>
            <groupId>org.elasticsearch.client</groupId>
            <artifactId>elasticsearch-rest-high-level-client</artifactId>
            <version>6.2.3</version>
        </dependency>
```
Java基础操作

```
public class RestClientTest {

    public static void main(String[] args) {
//        index();
//        bacthIndex();
         queryTest();
    }
    
    /**
     * 插入数据
     */
    public  static  void  index(){
        try {
            //RestHighLevelClient实例需要低级客户端构建器来构建
            RestHighLevelClient client = new RestHighLevelClient(RestClient.builder(new HttpHost("localhost", 9200, "http")));
            IndexRequest indexRequest = new IndexRequest("demo", "demo");
            JSONObject obj=new JSONObject();
            obj.put("title","标题图表题大法师飞洒发顺丰三");
            obj.put("time","2018-08-21 17:43:50");
            indexRequest.source(obj.toJSONString(),XContentType.JSON);
            //添加索引
            client.index(indexRequest);
            client.close();

            //http://localhost:9200/demo/demo/_search  浏览器运行查询数据
        }catch (Exception e){
                e.printStackTrace();
        }
    }

    /**
     * 批量插入数据
     */
   public static  void  bacthIndex(){
       RestHighLevelClient client = new RestHighLevelClient(RestClient.builder(new HttpHost("localhost", 9200, "http")));
       List<IndexRequest> requests = new ArrayList<>();
       requests.add(generateNewsRequest("中印边防军于拉达克举行会晤 强调维护边境和平", "2018-01-27T08:34:00Z"));
       BulkRequest bulkRequest = new BulkRequest();
       for (IndexRequest indexRequest : requests) {
           bulkRequest.add(indexRequest);
       }
       try {
           client.bulk(bulkRequest);
           client.close();
       } catch (Exception e) {
           e.printStackTrace();
       }
   }
    public static IndexRequest generateNewsRequest(String title,String publishTime){
        IndexRequest indexRequest = new IndexRequest("demo", "demo");
        JSONObject obj=new JSONObject();
        obj.put("title",title);
        obj.put("time",publishTime);
        indexRequest.source(obj.toJSONString(),XContentType.JSON);
        return indexRequest;
    }

    /**
     * 查询操作
     * https://blog.csdn.net/paditang/article/details/78802799
     * https://blog.csdn.net/A_Story_Donkey/article/details/79667670
     * https://www.cnblogs.com/wenbronk/p/6432990.html
     */
    public static  void  queryTest(){
        RestHighLevelClient client = new RestHighLevelClient(RestClient.builder(new HttpHost("localhost", 9200, "http")));
        // 这个sourcebuilder就类似于查询语句中最外层的部分。包括查询分页的起始，
        // 查询语句的核心，查询结果的排序，查询结果截取部分返回等一系列配置
        SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
        try {
            // 结果开始处
            sourceBuilder.from(0);
            // 查询结果终止处
            sourceBuilder.size(2);
            // 查询的等待时间
            sourceBuilder.timeout(new TimeValue(60, TimeUnit.SECONDS));

            /**
             * 使用QueryBuilder
             * termQuery("key", obj) 完全匹配
             * termsQuery("key", obj1, obj2..)   一次匹配多个值
             * matchQuery("key", Obj) 单个匹配, field不支持通配符, 前缀具高级特性
             * multiMatchQuery("text", "field1", "field2"..);  匹配多个字段, field有通配符忒行
             * matchAllQuery();         匹配所有文件
             */
            MatchQueryBuilder matchQueryBuilder = QueryBuilders.matchQuery("title", "费德勒");

            //分词精确查询
//            TermQueryBuilder termQueryBuilder = QueryBuilders.termQuery("tag", "体育");


//            // 查询在时间区间范围内的结果  范围查询
//            RangeQueryBuilder rangeQueryBuilder = QueryBuilders.rangeQuery("publishTime");
//            rangeQueryBuilder.gte("2018-01-26T08:00:00Z");
//            rangeQueryBuilder.lte("2018-01-26T20:00:00Z");

            // 等同于bool，将两个查询合并
            BoolQueryBuilder boolBuilder = QueryBuilders.boolQuery();
            boolBuilder.must(matchQueryBuilder);
//            boolBuilder.must(termQueryBuilder);
//            boolBuilder.must(rangeQueryBuilder);
            sourceBuilder.query(boolBuilder);

            // 排序
//            FieldSortBuilder fsb = SortBuilders.fieldSort("date");
//            fsb.order(SortOrder.DESC);
//            sourceBuilder.sort(fsb);


            SearchRequest searchRequest = new SearchRequest("demo");
            searchRequest.types("demo");
            searchRequest.source(sourceBuilder);
            SearchResponse response = client.search(searchRequest);
            System.out.println(response);
            client.close();
        }catch (Exception e){
            e.printStackTrace();
        }
    }
}

```

### Kibana linux下安装
- 下载地址：https://www.elastic.co/downloads/kibana
- 解压：tar zxvf kibana-6.4.0-linux-x64.tar.gz

 **配置** 
https://www.elastic.co/guide/cn/kibana/current/settings.html
```
server.port: 5601
server.host: "192.168.1.191"
elasticsearch.url: "http://192.168.1.191:9200"
```
**启动** 
```
./kibana  //不能关闭终端
nohup  ./kibana > /nohub.out &  //可关闭终端，在nohup.out中查看log
在浏览器中访问：http://192.168.1.191:5601/
```

### FileBeats 与 LogStash 的安装
- LogStash 可以用来对日志进行收集并进行过滤整理后输出到 ES 中，FileBeats 是一个更加轻量级的日志收集工具。 
- 现在最常用的方式是通过 FileBeats 收集目标日志，然后统一输出到 LogStash 做进一步的过滤，在由 LogStash 输出到 ES 中进行存储。

官方提供了压缩包下载， https://www.elastic.co/downloads/logstash 。 下载完成后解压即可。

```
tar zxvf logstash-6.2.2.tar.gz
###  进入目录
cd logstash-6.2.2
```
LogStash 的运行需要指定一个配置文件，来指定数据的流向，我们在当前目录下创建一个 first.conf 文件，其内容如下:

```
###  配置输入为 beats
input {
    beats {
            port => "5044"

    }

}
###  数据过滤
filter {
    grok {
            match => { "message" => "%{COMBINEDAPACHELOG}" }

    }
    geoip {
            source => "clientip"

    }

}
# 输出到本机的 ES
output {
    elasticsearch {
            hosts => [ "192.168.1.191:9200"  ]

    }

}
```
上面配置了 LogStash 输出日志到 ES 中 配置完成后就可以通过如下方式启动 LogStash 了

```
bin/logstash -f first.conf --config.reload.automatic
```

### 安装运行 FileBeats
FileBeats 也提供了下载包，地址为 https://www.elastic.co/downloads/beats/filebeat 。找到系统对应的包下载后解压即可。

```
tar zxvf filebeat-6.2.2-darwin-x86_64.tar.gz
cd filebeat-6.2.2-darwin-x86_64
```
进入目录编辑 filebeat.yml 找到对应的配置项，配置如下

```
- type: log
   # Change to true to enable this prospector configuration.
    enabled: True

    # Paths that should be crawled and fetched. Glob based paths.
    # 读取 Nginx 的日志
    paths:
      - /usr/local/nginx/logs/*.log

# 输出到本机的 LogStash
output.logstash:
  # The Logstash hosts
  hosts: ["localhost:5044"]
```
### 配置完成后执行如下命令，启动 FileBeat 即可

```
# FileBeat 需要以 root 身份启动，因此先更改配置文件的权限
sudo chown root filebeat.yml
sudo ./filebeat -e -c filebeat.yml -d "publish"
```





# 概述
* Thrift是一种接口描述语言和二进制通讯协议，[1]它被用来定义和创建跨语言的服务。[2]它被当作一个远程过程调用（RPC）框架来使用，是由Facebook为“大规模跨语言服务开发”而开发的，支持c++, java, .net, python,php,go等
* Thrift是一个典型的CS结构，客户端和服务端可以使用不同的语言开发，这种语言就是IDL

# Thrift常见几种数据类型
- thrift不支持无符号类型，因为很多编程语言不存在无符号类型，比如java
- byte:有符号字节
- i16:16位有符号整数
- i32:32位有符号整数
- i64:64位有符号整数
- double:64位浮点数
- string: 字符串

# Thrift容器类型
* 集合中的元素可以是除了service之外的任何类型，包括exception
* list: 一系列由T类型的数据组成的有序列表，元素可以重复
* set: 一系列由T类型的数据的无序集合，不可重复
* map :一个字典结构,相当于java中的HashMap

# Thrift工作流程
* 定义thrift文件,由thrift文件(IDL)生成双方语言的接口,model,在生成model以及接口中会有解码编码的代码

# Thrift IDL文件
* struct :结构体 目的是将一些数据聚合在一起，方便传输管理
* enum: 枚举的定义和JAVA类似
* exception:异常

```
namespace java thrift.demo
# 相当于java的类
struct News{
   1:i32 id;
   2:string title;
}

# 枚举
enum Gender{
  MALE,
  FEMALE
}

exception RequestException{
  1:i32 code;
  2:string reason;
}

# 相当于服务结构
service Hello{
    string helloString(1:string para)
}
```
# 类型定义
* 利用typedef关键可以在开始定义类型比如：`typedef i32 int  typedef i64 long` 后面可以直接使用int和long

# 常量
* thrift支持厂里定义  使用const关键字 `const i32 MAX_TIME = 10`,`const string MY_NAME = `

# 命名空间
* thrift使用namespace 关键字定义，相当于JAVA中的package

# 文件包含
* thrift使用include支持文件包含 相当于java中的import  定义：`include "global.thrift" `

# 可选与必选
* thrift支持两个关键字`required,optional` 分别用于表示对应的字段是必填还是可选 比如

```bash
struct People{
  1:required string name;
  2:optional i32 age;
}
```
# Thrift的传输格式
* TBinaryprotocol:二进制格式
* TCompactProtocol:压缩格式
* TJSONNProtocol JSON格式
* TSimpleJSONProtocol: 提供JSON只写协议,生成的文件容易通过脚本语言解析
* TDebugProtocol 使用易懂的可读文本格式 便于debug

# Thrift的数据传输方式
* TSocket:阻塞式socker
* TFramedTransport:以frame为单位进行传输,并非阻塞式服务中使用
* TFileTransport：以文件形式进行传输
* TMeoryTransport：将内存用于IO java实时内部实际使用了简单的ByteArratOutputStream
* TZlibTransport 使用zlib进行压缩,与其他传输方式联合使用

# Thrift支持的服务模型
* TSimpleServer : 简单的单线程模型,常用语测试
* TThreadPoolServer : 多线程服务模型 使用标准的阻塞式IO
* TNonblockingServer: 多线程服务模型,使用非阻塞式IO(需要使用TFramedTransport数据传输方式)
* THsHaServer : THsHa引入了线程池去处理 其模型把读写任务放到线程池去处理 Half-sync/Half-async的处理模式，Half-aysnc是在处理IO事件(accept/read/write io) Half-sync用于hander对rpc的同步处理

# w7 系统安装
- 下载地址： https://thrift.apache.org/download 创建文件夹放入thrift (重新命名 thrift.exe)
- 配置环境变量：系统环境变量Path添加目录： F:\thrift-0.12.0
- 检测安装是否成功：`thrift -version`

# 编写thrift 文件
```bash
namespace java thrift.generated

// 定义类型
typedef i16 short
typedef i32 int
typedef i64 long
typedef bool boolean
typedef string String

struct Person {
    1:optional String username,
    2:optional int age,
    3:optional boolean married
}

exception DataException {
    1:optional String meaages,
    2:optional String callStack,
    3:optional String date
}

service PersonService {
    //  根据名称查询  抛出自定义异常
    Person getPersonByUsername(1:required String username) throws (1:DataException dataEception),
    // 添加
    void savePerson(1:required Person person) throws (1:DataException dataEception)
}
```
# 生成JAVA代码
```
#cmd执行
thrift --gen java src/thrift/data.thrift
```

* 复制到java源码包目录

![目录](https://ws3.sinaimg.cn/large/0068QeGHgy1g53x67r302j30kx08zn4z.jpg)

# 编写服务调用代码

```java
public class PersonServiceImpl implements  PersonService.Iface {
    @Override
    public Person getPersonByUsername(String username) throws DataException, TException {
        System.out.println("查询方法调用： "+username);
        Person person=new Person();
        person.setUsername(username);
        person.setAge(20);
        person.setMarried(false);
        return  person;
    }

    @Override
    public void savePerson(Person person) throws DataException, TException {
        System.out.println("添加方法调用： ");
        System.out.println(person.getUsername());
        System.out.println(person.getAge());
    }
}
```

客户度

```java
public class ThriftClient {
    public static void main(String[] args) {
        TTransport transport=new TFramedTransport(new TSocket("localhost",8899),600);
        TProtocol protocol=new TCompactProtocol(transport);
        PersonService.Client client=new PersonService.Client(protocol);

        try {
            transport.open();
            Person person=client.getPersonByUsername("qx");
            System.out.println(person.getUsername());
            System.out.println(person.getAge());

            Person person1=new Person();
            person1.setUsername("dddddd");
            person1.setAge(111);
            person.setMarried(true);
            client.savePerson(person1);

        }catch (Exception e){
            transport.close();
        }
    }
}
```

服务端

```java
public class ThriftServer {
    public static void main(String[] args) throws Exception {
        // 异步非阻塞
        TNonblockingServerSocket socket=new TNonblockingServerSocket(8899);
        THsHaServer.Args arg=new THsHaServer.Args(socket).minWorkerThreads(2).maxWorkerThreads(4);
        PersonService.Processor<PersonServiceImpl> processor=new PersonService.Processor<>(new PersonServiceImpl());
        arg.protocolFactory(new TCompactProtocol.Factory());
        arg.transportFactory(new TFramedTransport.Factory());
        arg.processorFactory(new TProcessorFactory(processor));

        TServer server=new THsHaServer(arg);

        System.out.println("");

        // 启动  死循环 永远不会退出
        server.serve();

    }
}
```


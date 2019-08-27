# 什么是protobuf
* protobuf全称Google Protocol Buffers，是google开发的的一套用于数据存储，网络通信时用于协议编解码的工具库。它和XML或者JSON差不多，也就是把某种数据结构的信息，以某种格式（XML，JSON）保存起来，protobuf与XML和JSON不同在于，protobuf是基于二进制的。主要用于数据存储、传输协议格式等场合

# 安装配置
- 下载地址：https://github.com/protocolbuffers/protobuf/releases
- 查看命令帮助：进入下载包的解压目录`F:\protoc-3.9.0-win64\bin` cmd运行 `protoc --help`
- 配置系统环境变量path

# 编写.proto文件(src/protobuf/Student.porto)
```
syntax = "proto3";

package com.github.protobuf;

option optimize_for = SPEED;
option java_package = "com.github.protobuf";
option java_outer_classname = "DataInfo";

message Person {
     string name = 1;
     int32 age = 2;
     string address = 3;
}
```
# 生成.java文件
```
# 进入项目录
cd nettytest
# 编译命令
protoc --java_out=src/main/java  src/protobuf/Student.porto
```

# 编写测试类
```java
package com.github.protobuf;
public class ProtoBufTest {
    public static void main(String[] args) throws  Exception{
        // 构造对象 初始化数据
      DataInfo.Person person=  DataInfo.Person.newBuilder()
              .setName("张三").setAge(20).setAddress("广州").build();
        // 转换成字节数组
        byte[] personByteArray=person.toByteArray();

        //
        DataInfo.Person person1=DataInfo.Person.parseFrom(personByteArray);
        System.out.println(person1);
        System.out.println(person1.getName());
        System.out.println(person1.getAge());
        System.out.println(person1.getAddress());
    }
}

```

![测试](http://wx3.sinaimg.cn/thumb300/0068QeGHgy1g51mmtpvyjj30um0h9dz4.jpg)

# 概述
* 在gRPC中，客户端应用程序可以直接调用不同计算机上的服务器应用程序上的方法，就像它是本地对象一样，使您可以更轻松地创建分布式应用程序和服务
* 与许多RPC系统一样，gRPC基于定义服务的思想，指定可以使用其参数和返回类型远程调用的方法。
* 在服务器端，服务器实现此接口并运行gRPC服务器来处理客户端调用。在客户端，客户端有一个存根（在某些语言中称为客户端），它提供与服务器相同的方法

# gRPC具有以下特点
* 基于 HTTP/2， 继而提供了连接多路复用、Body 和 Header 压缩等机制。可以节省带宽、降低TCP链接次数、节省CPU使用和延长电池寿命等。
* 支持主流开发语言（C, C++, Python, PHP, Ruby, NodeJS, C#, Objective-C、Golang、Java）
* IDL (Interface Definition Language) 层使用了 Protocol Buffers, 非常适合团队的接口设计

# 编写GrpcStudend.proto文件
```
syntax = "proto3";

package com.github.proto;


option java_package = "com.github.proto";
option java_outer_classname = "GrpcStudentProto";
option java_multiple_files = true;


message MyRequest {
     string name = 1;
}

message MyResponse {
   string realname = 2;
}

service GrpcStudentProtoService {
    rpc GetName(MyRequest) returns (MyResponse) {  }
}
```
# 生成代码
```
# 进入cmd
F:\ideWork\githubWork\nettytest>

# 生成生成model相关类
protoc --java_out=src/main/java  src/main/proto/GrpcStudend.porto

# 生成service
下载插件：protoc-gen-grpc-java-1.10.0-windows-x86_64.exe
http://central.maven.org/maven2/io/grpc/protoc-gen-grpc-java/1.10.0/protoc-gen-grpc-java-1.10.0-windows-x86_64.exe

然后配置到系统环境变量

#生成service
protoc --grpc-java_out=src/main/java  src/main/proto/GrpcStudend.porto

```
# 编写服务端
``` java
public class GrpcStudentSrviceImpl  extends GrpcStudentProtoServiceGrpc.GrpcStudentProtoServiceImplBase {

    @Override
    public void getName(MyRequest request, StreamObserver<MyResponse> responseObserver) {
        System.out.println("接收客户端的消息："+request.getName());
        // 每次接下来要做的事
        responseObserver.onNext(MyResponse.newBuilder().setRealname("张三11111").build());
        responseObserver.onCompleted(); //结束时调用  返回客户端  只调用一次
    }
}

public class GrpcService {
    private Server server;

    private  void  start() throws IOException {
        this.server= ServerBuilder.forPort(8899).addService(new GrpcStudentSrviceImpl()).build().start();
        System.out.println("server startted!..................");

        // 回调钩子
        Runtime.getRuntime().addShutdownHook(new Thread(()->{
            System.out.println("jvm关闭！");

            GrpcService.this.stop();
        }));

        System.out.println("执行这里。。。。。。。。。。。。。。。");
    }

    private  void  stop(){
        if (null != this.server){
            this.server.shutdown();
        }
    }

    //  等待被调用
    private void   awaitTermination() throws  InterruptedException{
        if (null != this.server){
            this.server.awaitTermination();
        }
    }

    public static void main(String[] args) throws  Exception {
        GrpcService service=new GrpcService();
        service.start();
        service.awaitTermination();
    }
}

```

客户端

``` java
public class GrpcClinet {

    public static void main(String[] args) throws  Exception {
        ManagedChannel managedChannel= ManagedChannelBuilder.forAddress("localhost",8899)
                .usePlaintext().build();
        GrpcStudentProtoServiceGrpc.GrpcStudentProtoServiceBlockingStub blockingStub=GrpcStudentProtoServiceGrpc
                .newBlockingStub(managedChannel);

        MyResponse myResponse=blockingStub.getName(MyRequest.newBuilder().setName("zhangsan").build());
        myResponse=blockingStub.getName(MyRequest.newBuilder().setName("zhangsan").build());
        myResponse=blockingStub.getName(MyRequest.newBuilder().setName("zhangsan").build());myResponse=blockingStub.getName(MyRequest.newBuilder().setName("zhangsan").build());
        myResponse=blockingStub.getName(MyRequest.newBuilder().setName("zhangsan").build());


        System.out.println(myResponse.getRealname());
        managedChannel.shutdown().awaitTermination(1, TimeUnit.SECONDS);
    }
}

```

# MAC系统安装protobuf和grpc
```
下载：https://github.com/protocolbuffers/protobuf/releases
cd  protobuf-3.5.0
./configure --prefix=/usr/local/protobuf /usr/local/protobuf/ # 配置编译安装目录

# 解压的目录下进行
make
make install

# 配置环境变量
sudo  vim .bash_profile

# 配置
export PROTOBUF=/usr/local/protobuf
export PATH=$PROTOBUF/bin:$PATH

# 配置生效
source .bash_profile

# 测试生效
protoc --version

# grpc-java 生成插件安装
下载：https://github.com/grpc/grpc-java/archive/v1.7.1.tar.gz
tar zxvf grpc-java-1.7.1.tar.gz
cd grpc-java/compiler
export CXXFLAGS="-I/usr/local/protobuf/include" LDFLAGS="-L/usr/local/protobuf/lib"
../gradlew java_pluginExecutable

# 生成代码
protoc --java_out=src/main/java --plugin=protoc-gen-grpc-java=/Users/mac/Documents/grpc-java/compiler/build/exe/java_plugin/protoc-gen-grpc-java --grpc-java_out=src/main/java src/main/proto/GrpcStudend.porto

```

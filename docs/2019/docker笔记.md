

## 概述
 - Docker 运行在 CentOS 7 上，要求系统为64位、系统内核版本为 3.10 以上。
 -  Docker 运行在 CentOS-6.5 或更高的版本的 CentOS 上，要求系统为64位、系统内核版本为 2.6.32-431 或者更高版本。

## CentOS7 Docker 安装
Docker 要求 CentOS 系统的内核版本高于 3.10

```bash
# uname -r 命令查看你当前的内核版本
[root@izadux3fzjykx7z ~]# uname -r

安装一些必要的系统工具：
[root@izadux3fzjykx7z ~]# sudo yum install -y yum-utils device-mapper-persistent-data lvm2

添加软件源信息：
[root@izadux3fzjykx7z ~]# sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo

更新 yum 缓存：
[root@izadux3fzjykx7z ~]# sudo yum makecache fast

安装 Docker-ce：
[root@izadux3fzjykx7z ~]# sudo yum -y install docker-ce
```

## 启动 Docker 后台服务
```bash
[root@izadux3fzjykx7z ~]# sudo systemctl start docker

测试运行 hello-world
[root@izadux3fzjykx7z ~]# docker run hello-world
```
![](https://img-blog.csdnimg.cn/2019041017350624.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3UwMTAzOTEzNDI=,size_16,color_FFFFFF,t_70)
本地没有hello-world这个镜像，所以会下载一个hello-world的镜像，并在容器内运行

## 镜像加速
>鉴于国内网络问题，后续拉取 Docker 镜像十分缓慢，我们可以需要配置加速器来解决，我使用的是网易的镜像地址：http://hub-mirror.c.163.com。

新版的 Docker 使用 /etc/docker/daemon.json（Linux） 来配置 Daemon。
请在该配置文件中加入（没有该文件的话，请先建一个）：
```json
{
  "registry-mirrors": ["http://hub-mirror.c.163.com"]
}
```
> 删除 Docker CE

```bash
$ sudo yum remove docker-ce
$ sudo rm -rf /var/lib/docker
```

## Docker常用命令
列出本地镜像: docker images
```bash
docker images -a :列出本地所有的镜像（含中间映像层，默认情况下，过滤掉中间映像层）；
docker images  --digests :显示镜像的摘要信息；
docker images -f :显示满足条件的镜像；
docker images --format :指定返回值的模板文件；
docker images --no-trunc :显示完整的镜像信息；
docker images  -q :只显示镜像ID。
```
docker pull : 从镜像仓库中拉取或者更新指定镜像
```bash
docker pull -a :拉取所有 tagged 镜像
docker pull --disable-content-trust :忽略镜像的校验,默认开启
docker pull java  : 下载java最新版镜像
docker pull -a java

```
docker inspec 获取容器/镜像的详细信息
```bash
docker inspec 94errf55dter
docker inspec 镜像ID  -f :指定返回值的模板文件。
docker inspec 镜像ID -s :显示总的文件大小。
docker inspec 镜像ID  --type :为指定类型返回JSON。
```
docker search : 从Docker Hub查找镜像
```bash
docker search mysql

--automated :只列出 automated build类型的镜像；
--no-trunc :显示完整的镜像描述；
-s :列出收藏数不小于指定值的镜像。
```
docker rmi : 删除本地一个或多少镜像(容器)
```bash
docker rmi mysql

-f :强制删除；
--no-prune :不移除该镜像的过程镜像，默认移除；
```
docker ps : 列出容器
![](https://img-blog.csdnimg.cn/20190419130626584.png)
```bash
-a :显示所有的容器，包括未运行的。
-f :根据条件过滤显示的内容。
--format :指定返回值的模板文件。
-l :显示最近创建的容器。
-n :列出最近创建的n个容器。
--no-trunc :不截断输出。
-q :静默模式，只显示容器编号。
-s :显示总的文件大小。
```


## 如何创建一个镜像
>创建镜像的方法又三种：基于已有镜像的容器创建，基于本地模板导入，基于`Dockerfile`创建

`docker commit` :从容器创建一个新的镜像
```bash
docker commit [OPTIONS] CONTAINER [REPOSITORY[:TAG]]
-a :提交的镜像作者；
-c :使用Dockerfile指令来创建镜像；
-m :提交时的说明文字；
-p :在commit时，将容器暂停。
```

首先启动一个镜像 为容器重新分配一个伪输入终端 以交互模式运行容器
```bash
docker run -ti ubuntu:14.04 /bin/bash
# 运行后启动进入命令 记住容器ID
root@97cc221196d7:/#
# 创建一个test文件 并退出
root@97cc221196d7:/# touch  test
root@97cc221196d7:/# exit
# 此时容易和原来的相比已经发生改变， 可以docker commit提交一个新的镜像，提交时用ID或名称指定容器
docker commit -m "add a new file is name test" -a "qxw" 97cc221196d7 test
#成功返回新的镜像ID
sha256:342175794310960ce0b0932bb05b818fb4abc2bcc5d29824018d7783f83d76a9
# 再次查看镜像列表
[root@izadux3fzjykx7z ~]# docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
test                latest              342175794310        2 minutes ago       188MB
ubuntu              14.04               390582d83ead        5 weeks ago         188MB
hello-world         latest              fce289e99eb9        3 months ago        1.84kB
```

## 存储和载入镜像
> 可以使用`docker save`和`docker load`来存储和载入镜像

`docker save` : 将指定镜像保存成 tar 归档文件
```bash
# 保存咋当前目录下
 docker save -o test.tar test
```
`docker load`: 载入一个镜像
```bash
 docker load --input test.tar
 或
 docker load < test.tar
```
## 上传镜像
docker push : 将本地的镜像上传到镜像仓库,要先登陆到镜像仓库

```bash
# 可以先添加新的标签 user/test:latest 然后用docker push 上传
docker tag test:latest  user/test:latest
docker push  user/test:latest
## 第一次使用会提示登录信息或注册
```

##  容器的基本操作
>容器是镜像的一个实例，所不同的是，它带有额外的可写文件层
### 创建容器
`docker create` ：创建一个新的容器但不启动它

```bash
[root@izadux3fzjykx7z ~]$ docker create -it ubuntu:14.04
1140d5e5a0a6b9d79adc053fc5d359209e860bf474327a52b3a8da5337173c74
```
新建并启动容器
```bash
[root@izadux3fzjykx7z ~]$ docker run ubuntu:14.04 /bin/echo 'hello world'
hello world
```

后台启动一个容器运行
```bash
[root@izadux3fzjykx7z ~]$ docker run -d ubuntu /bin/sh -c "while true;do echo hello word;sleep 1;done"
[root@izadux3fzjykx7z ~]$ docker ps
CONTAINER ID        IMAGE                 
47168308c196        ubuntu  
   
#获取容器的输出信息
[root@izadux3fzjykx7z ~]$ docker logs 471
```
### 终止容器
* `docker stop`  命令来中止一个运行中的容器，它会向容器发送信号，等待一段时间后在发送信号终止器
* `docker kill`   命令会直接中止容器
```bash
[root@izadux3fzjykx7z ~]$ docker stop 471
471
```

查看处于中止状态的容器ID
```bash
[root@izadux3fzjykx7z ~]$ docker ps -a -q
47168308c196
97765732ff5a
```

处于中止的容器 可以用过  `docker start`  重新启动
```bash
[root@izadux3fzjykx7z ~]$ docker start 471
471
```
重启一个容器

```bash
[root@izadux3fzjykx7z ~]$ docker restart 471
471
```
### 如何进入容器
* `docker attach ` :连接到正在运行中的容器。
* 当多个窗口同时attach 到同一个容器时，所有窗口都会同步显示，如果某个窗口操作的命令阻塞了，所有的窗口都会阻塞

```bash
[root@izadux3fzjykx7z ~]$ docker attach 471
hello word
hello word
hello word
```
* `docker exec` ：在运行的容器中执行命令。可以直接进入容器操作命令
```bash
[root@izadux3fzjykx7z ~]$ docker exec -ti 47168308c196  /bin/bash
root@47168308c196:/$ ls -l
drwxr-xr-x  2 root root 4096 Mar  7 21:01 bin
drwxr-xr-x  2 root root 4096 Apr 24  2018 boot
......

```
### 删除容器
* 可以使用`docker rm` 命令删除处于终止状态的容器。命令为 `docker rm`
* -f ,--force=false  强行终止并删除一个运行中的容器
* -l,--link=false  删除容器的链接 但保留容器
* -v,--volumes=false, 删除容器挂载的数据券

```bash
[root@izadux3fzjykx7z ~]$ docker ps -a
CONTAINER ID        IMAGE               COMMAND                  CREATED                      
8714bb6a3cee        hello-world         "/hello"                 4 hours ago        
[root@izadux3fzjykx7z ~]$ docker rm 8714  或  docker rm  -f 8714
8714
```
### 导入和导出容器
* `docker export` :将文件系统作为一个tar归档文件导出。不管这个容器是否处于运行状态

```bash
[root@izadux3fzjykx7z ~]$ docker export 47168 > test_stop.tar
[root@izadux3fzjykx7z ~]$ ls -l
-rw-r--r-- 1 root root  72308736 Apr 19 14:59 test_stop.tar
```
* 导出的容器可以使用`docker  import`导入成为镜像

```bash
[root@izadux3fzjykx7z ~]$ cat test_stop.tar | docker import - test/ubuntu:v1.0
sha256:c6c6209a648fd9520fb3a9b3cfcec5f9e53bf82aeffcc2e9edba01942f7c9100
[root@izadux3fzjykx7z ~]$ docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             SIZE
test/ubuntu         v1.0                c6c6209a648f        5 seconds ago       69.8MB
```
* 既可以使用`docker  load`命令导入一个镜像文件。也可以使用`docker  import`导入一个容器快照到本地镜像库。两者的区别在于：快照文件将丢弃所有的历史记录和元数据信息。而镜像存储文件将保存完整记录。体积也要大。从容器快照文件导入时可以重新指定标签等元数据信息。

## 创建和使用私有仓库
* 官方提供了registry镜像来搭建一套本地私有仓库的环境
*  `-v` 用户指定镜像文件存储的路径 默认路径是容器的 `/tmp/registry`目录下
```bash
# 自动下载并启动一个registry容器 创建一个本地私有仓库
[root@izadux3fzjykx7z ~]$ docker run -d -p 5000:5000 -v /opt/data/registry:/tmp/registry registry
# 此时本地将启动一个私有仓库，监听端口为5000
```
然后在本地电脑上安装一个`docker` 上传镜像到服务器
```bash
#首先使用docker命令标记一个镜像格式为
docker tag hello-world 39.108.144.143:5000/hellp-world
#使用docke  push  上传至服务器
docker push 39.108.144.143:5000/hellp-world
```
* Docker从1.3.X之后，与docker registry交互默认使用的是https，然而此处搭建的私有仓库只提供http服务，所以当与私有仓库交互时就会报上面的错误
![](https://img-blog.csdnimg.cn/20190419162858537.png)
* 这个问题需要在启动docker server时增加启动参数为默认使用http访问。修改`daemon.json`文件

```json
{
  "registry-mirrors": ["http://hub-mirror.c.163.com"],
  "insecure-registries":["39.108.144.143:5000"]
}
```
> 查看镜像推送结果：`curl  http:39.108.144.143:5000/v1/search`
> 下载私有仓库镜像： `docker   pull 39.108.144.143:5000/hellp-world`

## 数据管理
* 容器中管理数据主要有两种方式： 数据卷，数据卷容器

### 数据卷
数据卷是一个可供容器使用的特许目录，它绕过文件系统，可以提供很多有用的特性
* 数据卷可以在容器之间共享和重用
* 对数据卷的修改会立即生效
* 对数据卷的更新，不会影响镜像
* 卷会一直存在，直到没有容器使用。数据卷的使用类似Linux目录下或文件mount操作。

**如何在容器中创建一个数据卷**

```bash
# 使用training/webapp创建一个web容器，并创建一个数据卷挂载到容器的/webapp目录
[root@izadux3fzjykx7z ~]$ docker run -d -P --name web -v /webapp  training/webapp python app.py

- P :只允许外部访问容器需要暴露的端口
-v :也可以指定挂载一个本地的已有目录到容器中去作为数据卷

# 加载主机的src/webapp目录到容器opt/webapp 目录下
docker run -d -P --name web -v /src/webapp:/opt/webapp   training/webapp python app.py

# docker 挂载数据默认权限是读写(rw),可以通过ro 指定为只读
docker run -d -P --name web -v /src/webapp:/opt/webapp  ro  training/webapp python app.py

# 挂载一个本地主机文件作为数据卷，记录在容器中输入过的命令历史
docker run --rm -it -v ~/.bash_history:/.bash_history ubuntu /bin/bash
```


## 使用docker安装ElasticSearch

```bash
#搜索镜像
[root@izadux3fzjykx7z ~]$ docker search elasticsearch

#拉取镜像
[root@izadux3fzjykx7z ~]$ docker pull elasticsearch:6.5.0
```
启动一个ElasticSearch容器d
[root@izadux3fzjykx7z ~] $ docker run --name elasticsearch -d -e ES_JAVA_OPTS="-Xms214m -Xmx214m" -p 9200:9200 -p 9300:9300 elasticsearch:6.5.0
```





## 参考地址
* Docker中文网站 https://www.docker-cn.com/
* Docker安装手册：https://docs.docker-cn.com/engine/installation/
* 网易加速器：http://hub-mirror.c.163.com
* 菜鸟教程：http://www.runoob.com/docker/centos-docker-install.html
* Docker技术入门与实战 

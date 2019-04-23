
## 概述
 - Docker 运行在 CentOS 7 上，要求系统为64位、系统内核版本为 3.10 以上。
 - Docker 运行在 CentOS-6.5 或更高的版本的 CentOS 上，要求系统为64位、系统内核版本为 2.6.32-431 或者更高版本。

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
* docker exec：在运行的容器中执行命令。可以直接进入容器操作命令
```bash
[root@izadux3fzjykx7z ~]$ docker exec -ti 47168308c196  /bin/bash
root@47168308c196:/$ ls -l
drwxr-xr-x  2 root root 4096 Mar  7 21:01 bin
drwxr-xr-x  2 root root 4096 Apr 24  2018 boot
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
* `-v` 用户指定镜像文件存储的路径 默认路径是容器的 `/tmp/registry`目录下
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
### 数据卷容器
* 如果需要在容器之间共享一些持续更新的数据，最简单的方式是使用数据卷容器。
* 数据卷容器其实就是一个普通的容器，专门用它提供数据卷 供其它容器挂载使用

```bash
# 创建数据卷容器 ,并在其中创建一个数据卷挂载到 /dbdat
[root@izadux3fzjykx7z ~]# 
root@3266a5692131:/# ls
bin  boot  dbdata  dev  etc  home  lib  lib64  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var

# 然后,可以在其它容器中使用 --volumes-from来挂载dbdata容器中的数据卷。
# 创建db1和db2两个容器，并从dbdata 容器挂载数据卷

docker run -it --volumes-from dbdata --name db1 ubuntu
docker run -it --volumes-from dbdata --name db2 ubuntu

# 进入dbdata容器 并创建一个文件夹
[root@izadux3fzjykx7z ~]# docker run -it -v /dbdata --name 3266a ubuntu
root@74d186f5896d:/# cd /dbdata/
root@74d186f5896d:/dbdata# touch test
root@74d186f5896d:/dbdata# ls
test

# 在db1容器中查看它
[root@izadux3fzjykx7z ~]# docker run -it --volumes-from dbdata --name d822cd  ubuntu
d186f5896d:/dbdata# ls
```
* 如果删除了挂载的容器，数据卷不会自动删除，如果要删除一个数据卷，必须删除最后一个还挂着它的容器时显示使用docker rm -v命令来指定同时删除关联的容器
* 使用容器卷可以让用户在容器之间自由升级和移动数据卷

## 网络基础配置
* 使用-P标记时，Docker会随机映射一个端口

  
```bash
[root@izadux3fzjykx7z ~]# docker run -d -P --name fe9531 -v /webapp  training/webapp python app.py
4fd207fa931ff015a0c659219d1f7dcc787c353e5ab1f49afaf506472b9e82d2
[root@izadux3fzjykx7z ~]# docker logs -f 4fd20
 * Running on http://0.0.0.0:5000/ (Press CTRL+# 

# 将本地5000端口 映射到容器的5000端口
[root@izadux3fzjykx7z ~]# docker run -d -p 5000:5000 training/webapp python 

# 映射到指定地址的指定端口
[root@izadux3fzjykx7z ~]# docker run -d -p 127.0.0.1:5000:5000 training/webapp python app.py

# 查看端口映射
[root@izadux3fzjykx7z ~]# docker port ea1ecbd4dda4
5000/tcp -> 127.0.0.1:5000
```

##  Dockerfile命令语法
* Dockerfile 是由一行行命令组成，一般二言分为四部分：基础镜像信息，维护者信息，镜像操作指令和容器启动时指令

**FROM**
* 功能为指定基础镜像，并且必须是第一条指令。
* 如果不以任何镜像为基础，那么写法为：FROM scratch。
* 同时意味着接下来所写的指令将作为镜像的第一层开始
```bash
语法：
FROM <image>
FROM <image>:<tag>
FROM <image>:<digest> 
三种写法，其中<tag>和<digest> 是可选项，如果没有选择，那么默认值为latest
```
**MAINTAINER**
* 构建指令，用于将image的制作者相关的信息写入到image中

**RUN**
镜像操作指令。RUN命令有两种格式

```bash
RUN <command>
RUN ["executable", "param1", "param2"]

# 两种写法比对：
RUN /bin/bash -c 'source $HOME/.bashrc; echo $HOME
RUN ["/bin/bash", "-c", "echo hello"]
```
* 第一种后边直接跟shell命令。在linux操作系统上默认 `/bin/sh -c`
* 在windows操作系统上默认 `cmd /S /C`
* 第二种是类似于函数调用。可将`executable`理解成为可执行文件，后面就是两个参数。

**CMD**
* 容器启动时要运行的命令。语法有三种写法：

```bash
CMD ["executable","param1","param2"]
CMD ["param1","param2"]
CMD command param1 param2

# 举例说明两种写法：
CMD [ "sh", "-c", "echo $HOME" 
CMD [ "echo", "$HOME" ]
```

* 第三种比较好理解了，就时shell这种执行方式和写法
* 第一种和第二种其实都是可执行文件加上参数的形式
* 这里边包括参数的一定要用双引号，就是",不能是单引号。千万不能写成单引号。原因是参数传递后，docker解析的是一个JSON array

**LABEL**
* 功能是为镜像指定标签.。LABEL会继承基础镜像种的LABEL，如遇到key相同，则值覆盖

```bash
语法：
LABEL <key>=<value> <key>=<value> <key>=<value> ...

#一个Dockerfile种可以有多个LABEL，如下：
LABEL "com.example.vendor"="ACME Incorporated"
LABEL com.example.label-with-value="foo"
LABEL version="1.0"
LABEL description="This text illustrates \
that label-values can span multiple lines."

#但是并不建议这样写，最好就写成一行，如太长需要换行的话则使用\符号
LABEL multi.label1="value1" \
multi.label2="value2" \
other="value3"
```

## 创建支持SSh的服务镜像
**基于commit 命令创建**

```bash
# 首先创建一个容器
[root@izadux3fzjykx7z ~]# docker run -it ubuntu:14.04 /bin/bash
# 尝试使用SSHD命令 发现没有安装该服务
[root@03e74d026566:/# sshd
bash: sshd: command not found
# 更新软件源信息
root@03e74d026566:/# apt-get update
# 安装和配置SSh服务
root@03e74d026566:/# apt-get install openssh-server
#要正常启动SSH服务 需要手动创建并启动它
root@03e74d026566:/# mkdir -p /var/run/sshd
root@03e74d026566:/# /usr/sbin/sshd -D &
[1] 3848

#查看容器22的端口已经处于监听状态
root@2173083a66ec:/# netstat -tunlp
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      3026/sshd
tcp6       0      0 :::22                   :::*                    LISTEN      3026/sshd

# 修改SSH服务的安全登录配置，取消pam登录限制
root@2173083a66ec:/# sed -ri 's/session required pam_loginuid.so/#session required pam_loginuid.so/g'  /etc/pam.d/sshd
# 在用户目录下创建.ssh目录 并复制需要登录的公匙信息到authorized_keys文件中(一般为本地主机目录用户下的.ssh/id_rsa.pub文件中 可由ssh-keygen -t rsa 命令生成)
root@2173083a66ec:/# mkdir root/.ssh
root@2173083a66ec:/# vi /root/.ssh/authorized_keys
# 创建自动启动SSH服务的可执行文件 并添加可执行权限
root@2173083a66ec:/# vi /run.sh
#!/bin/bash
/usr/sbin/sshd -D

root@2173083a66ec:/# chmod +x run.sh
# 最后退出保存容器
root@2173083a66ec:/# exit
# 保存为一个新镜像
[root@izadux3fzjykx7z ~]# docker commit 217 sshd:ubuntu
sha256:043bbe1d3ca0429fa5e00e1ce35e0f3d666cc303393ca09b2776bef81be3085a
# 使用镜像启动容器 并添加端口映射 10022->22
[root@izadux3fzjykx7z ~]# docker run -p 10022:22 -d sshd:ubuntu /run.sh
0aabe835d56311abdc7ab1febf293a15b5240128a927a8638635b204203deb4b
# 在宿主机上测试连接ssh
[root@izadux3fzjykx7z ~]# ssh 172.18.83.251 -p 10022
```
**使用Dockerfile创建**

首先应创建一个sshd_ ubuntu 工作目录:
```bash
$ mkdir sshd ubuntu
# 在其中，创建Dockerfile和run.sh文件:
$ cd sshd_ ubuntu/
$ touch Dockerfile run. sh 

# 编写run.sh脚本和authorized keys文件
# 文件run.sh的内容与上-小节中致: 
#!/bin/bash
/usr/sbin/sshd -D

# 在宿主主机上生成SSH密钥对，并创建authorized keys 文件:
$ ssh-keygen -t rsa
$ cat ~/.ssh/id_ rsa. pub >authorized keys
```
编写Dockerfile文件

```bash
#设置继承镜像
FROM ubuntu:14.04
#提供一些作者的信息
MAINTAINER from blog.qinxuewu.club by qxw (870439570@qq.com)
# 下面开始运行命令，此处更改ubuntu的源为国内163的源
RUN echo "deb http:/ /mirrors.163. com/ubuntu/ trusty main restricted universe
multiverse" > /etc/apt/ sources.list
RUN echo "deb http://mirrors. 163. com/ubuntu/”trusty-security main restricted
universe multiverse" >> /etc/apt/sources.list
RUN echo
"deb http://mirrors.163. com/ubuntu/ trusty-updates main restricted
universe multiverse" >> /etc/apt/sources.list
RUN echo "deb http://mirrors. 163. com/ubuntu/ trusty-proposed main restricted
universe multiverse" >> /etc/apt/sources.list
RUN echo "deb http: //mirrors.163. com/ubuntu/ trusty-backports main restricted
universe multiverse" >> /etc/apt/sources.list
RUN apt-get update
#安装ssh服务
RUN apt-get install -y openssh-server
RUN mkdir -p /var/ run/sshd
RUN mkdir -P /root/ .ssh
#取消pam限制
RUN sed -ri 's/session required pam loginuid.so/#session required pam_ loginuid.so/g' /etc/pam.d/sshd
# 复制配置文件到相应位置，并赋予脚本可执行权限
ADD authorized keys /root/ .ssh/authorized keys
ADD run.sh /run.sh
RUN chmod 755 /run.sh
#开放端口
EXPOSE 22
普设置自启动命令
CMD ["/run. sh"]
```

创建镜像

```bash
#在sshd_ ubuntu 目录下，使用docker build 命令来创建镜像。注意一下，在最后还有一个“.”，表示使用当前目录中的Dockerfile.
$ cd sshd ubuntu
$ sudo docker build -t sshd:dockerfile .

# 启动测试
$ docker run -d -p 10012:22 sshd:dockerfile
$ ssh 172.18.83.251 -p 10012
```

## Docker 安装 Nginx
```bash
# 查询
$ docker search nginx
# 拉取官方镜像
$ docker pull nginx
# 使用nginx镜像 运行容器
$ docker run -p 80:80 --name mynginx -v $PWD/www:/www -v $PWD/conf/nginx.conf:/etc/nginx/nginx.conf -v $PWD/logs:/wwwlogs  -d nginx  

# 启动参数说明
-p 80:80：将容器的80端口映射到主机的80端口
--name mynginx：将容器命名为mynginx
-v $PWD/www:/www：将主机中当前目录下的www挂载到容器的/www
-v $PWD/conf/nginx.conf:/etc/nginx/nginx.conf：将主机中当前目录下的nginx.conf挂载到容器的/etc/nginx/nginx.conf
-v $PWD/logs:/wwwlogs：将主机中当前目录下的logs挂载到容器的/wwwlogs
```
## Docker 安装 Tomcat
```bash
$ docker pull tomcat
# 拉取最新版本
$ docker pull tomcat
# 使用镜像运行容器
$ docker run --name tomcat -p 8080:8080 -v $PWD/test:/usr/local/tomcat/webapps/test -d tomcat  

# 启动参数说明
-p 8080:8080：将容器的8080端口映射到主机的8080端口
-v $PWD/test:/usr/local/tomcat/webapps/test：将主机中当前目录下的test挂载到容器的/test
```

## 使用docker安装ElasticSearch
```bash
# 使用docker安装ElasticSearch

#搜索镜像
[root@izadux3fzjykx7z ~]$ docker search elasticsearch

#拉取镜像
[root@izadux3fzjykx7z ~]$ docker pull elasticsearch:6.5.0

#启动一个ElasticSearch容器
[root@izadux3fzjykx7z ~] $ docker run --name elasticsearch -d -e ES_JAVA_OPTS="-Xms214m -Xmx214m" -p 9200:9200 -p 9300:9300 elasticsearch:6.5.0
```

## Docker 安装 MySQL
```bash
$ docker search mysql
$ docker pull mysql:5.6
$ docker run -p 3306:3306 --name mymysql -v $PWD/conf:/etc/mysql/conf.d -v $PWD/logs:/logs -v $PWD/data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.6

# 启动参数说明
-p 3306:3306：将容器的 3306 端口映射到主机的 3306 端口。
-v -v $PWD/conf:/etc/mysql/conf.d：将主机当前目录下的 conf/my.cnf 挂载到容器的 /etc/mysql/my.cnf。
-v $PWD/logs:/logs：将主机当前目录下的 logs 目录挂载到容器的 /logs。
-v $PWD/data:/var/lib/mysql ：将主机当前目录下的data目录挂载到容器的 /var/lib/mysql 
-e MYSQL_ROOT_PASSWORD=123456：初始化 root 用户的密码。
```

## Docker 安装 Redis
```bash
$ docker search  redis
$ docker pull  redis:3.2
$ docker run -p 6379:6379 -v $PWD/data:/data  -d redis:3.2 redis-server --appendonly yes

# 参数说明
-p 6379:6379 : 将容器的6379端口映射到主机的6379端口
-v $PWD/data:/data : 将主机中当前目录下的data挂载到容器的/data
redis-server --appendonly yes : 在容器执行redis-server启动命令，并打开redis持久化配置

# 进入redis命令行
$ docker exec -it 容器id redis-cli
```
## Docker三剑客一之 Compose 
* Compose 项目是 Docker 官方的开源项目，负责实现对 Docker 容器集群的快速编排

**Compose 中有两个重要的概念：**
* 服务 (service)：一个应用的容器，实际上可以包括若干运行相同镜像的容器实例。
* 项目 (project)：由一组关联的应用容器组成的一个完整业务单元，在 docker-compose.yml 文件中定义。

**安装与卸载**
* Compose 支持 Linux、macOS、Windows 10 三大平台
* Compose 可以通过 Python 的包管理工具 pip 进行安装，也可以直接下载编译好的二进制文件使用，甚至能够直接在 Docker 容器中运行。

```bash
#  二进制安装
$ sudo curl -L https://github.com/docker/compose/releases/download/1.17.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
$ sudo chmod +x /usr/local/bin/docker-compose
# 卸载命令
$ sudo rm /usr/local/bin/docker-compose

# 容器中执行
$ curl -L https://github.com/docker/compose/releases/download/1.8.0/run.sh > /usr/local/bin/docker-compose
$ chmod +x /usr/local/bin/docker-compose

[root@izadux3fzjykx7z bin]# docker-compose --version
docker-compose version 1.8.0, build f3628c7
```
**常用命令**

```bash
build
格式为 docker-compose build [options] [SERVICE...]。
--force-rm 删除构建过程中的临时容器。
--no-cache 构建镜像过程中不使用 cache（这将加长构建过程）。
--pull 始终尝试通过 pull 来获取更新版本的镜像。

config:验证 Compose 文件格式是否正确，若正确则显示配置，若格式错误显示错误原因。
down:此命令将会停止 up 命令所启动的容器，并移除网络
exec :进入指定的容器
images :列出 Compose 文件中包含的镜像
help:获得一个命令的帮助
images:列出 Compose 文件中包含的镜像
kill:通过发送 SIGKILL 信号来强制停止服务容器
logs: 查看服务容器的输出
pause: 暂停一个服务容器。
port:打印某个容器端口所映射的公共端口。
ps:列出项目中目前的所有容器。
pull:拉取服务依赖的镜像
push:推送服务依赖的镜像到 Docker 镜像仓库
restart: 重启项目中的服务。
rm:删除所有（停止状态的）服务容器。推荐先执行 docker-compose stop 命令来停止容器
run: 在指定服务上执行一个命令。
scale: 设置指定服务运行的容器个数  docker-compose scale web=3 db=2 将启动 3 个容器运行 web 服务，2 个容器运行 db 服务。
start:启动已经存在的服务容器
stop:停止已经处于运行状态的容器
top:查看各个服务容器内运行的进程。
unpause:恢复处于暂停状态中的服务。
up:它将尝试自动完成包括构建镜像，（重新）创建服务，启动服务，并关联服务相关容器的一系列操作。如果使用 docker-compose up -d，将会在后台启动并运行所有的容器。一般推荐生产环境下使用该选项
version:打印版本信息。
```
**Compose 模板文件**

## 参考
* Docker安装手册：https://docs.docker-cn.com/engine/installation/
* 菜鸟教程：http://www.runoob.com/docker/centos-docker-install.html
* [Docker技术入门与实战](https://yeasy.gitbooks.io/docker_practice/content/) 




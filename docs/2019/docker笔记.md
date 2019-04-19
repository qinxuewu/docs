
## 概述
 - Docker 运行在 CentOS 7 上，要求系统为64位、系统内核版本为 3.10 以上。
 -  Docker 运行在 CentOS-6.5 或更高的版本的 CentOS 上，要求系统为64位、系统内核版本为 2.6.32-431 或者更高版本。

## CentOS7 Docker 安装
Docker 要求 CentOS 系统的内核版本高于 3.10
uname -r 命令查看你当前的内核版本
```bash
[root@izadux3fzjykx7z ~]# uname -r
```
>安装Docker 

安装一些必要的系统工具：
```bash
[root@izadux3fzjykx7z ~]# sudo yum install -y yum-utils device-mapper-persistent-data lvm2
```
添加软件源信息：
```bash
[root@izadux3fzjykx7z ~]# sudo yum-config-manager --add-repo http://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
```
更新 yum 缓存：
```bash
[root@izadux3fzjykx7z ~]# sudo yum makecache fast
```
安装 Docker-ce：
```bash
[root@izadux3fzjykx7z ~]# sudo yum -y install docker-ce
```
## 启动 Docker 后台服务
```bash
[root@izadux3fzjykx7z ~]# sudo systemctl start docker
```
测试运行 hello-world
```bash
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

## 使用docker安装ElasticSearch
搜索镜像
```bash
[root@izadux3fzjykx7z ~]$ docker search elasticsearch
```
拉取镜像

```bash
[root@izadux3fzjykx7z ~]$ docker pull elasticsearch:6.5.0
```
查看镜像
```bash
[root@izadux3fzjykx7z ~]$  docker images
```
启动一个ElasticSearch容器

```bash
[root@izadux3fzjykx7z ~] $ docker run --name elasticsearch -d -e ES_JAVA_OPTS="-Xms214m -Xmx214m" -p 9200:9200 -p 9300:9300 elasticsearch:6.5.0
```

## 删除 Docker CE
```
$ sudo yum remove docker-ce
$ sudo rm -rf /var/lib/docker
```
## Docker常用命令

列出本地镜像: docker images
```
docker images -a :列出本地所有的镜像（含中间映像层，默认情况下，过滤掉中间映像层）；
docker images  --digests :显示镜像的摘要信息；
docker images -f :显示满足条件的镜像；
docker images --format :指定返回值的模板文件；
docker images --no-trunc :显示完整的镜像信息；
docker images  -q :只显示镜像ID。
```


## 参考地址
* Docker中文网站 https://www.docker-cn.com/
* Docker安装手册：https://docs.docker-cn.com/engine/installation/
* 网易加速器：http://hub-mirror.c.163.com
* 菜鸟教程：http://www.runoob.com/docker/centos-docker-install.html

### 下载地址
http://redis.io/download
### 安装步骤：
- 首先需要安装  把下载好的redis-3.0.0-rc2.tar.gz 放到linux /usr/local文件夹下
- 进行解压 tar -zxvf redis-3.0.0-rc2.tar.gz
- 进入到redis-3.0.0目录下，进行编译 make
- 编译成功 启动  ./src/redis-server  ./redis.conf 
- 验证启动是否成功：ps -ef | grep redis 查看是否有redis服务 或者 查看端口：netstat -tunpl | grep 6379
- 进入redis客户端  src/redis-cli  执行get set命令验证数据是否插入成功

### 基础配置

```
#注释掉bind 127.0.0.1可以使所有的ip访问redis
bind 127.0.0.1
#远程主机可访问 
protected-mode no
#默认情况，Redis不是在后台运行，我们需要把redis放在后台运行
daemonize yes  
#登录密码
requirepass qxw@940271
pidfile： #pid 文件位置
port： #监听的端口号
timeout： #请求超时时间
loglevel： #log 信息级别， 总共支持四个级别： debug、 verbose、 notice、 warning，
默认为 verbose
logfile： #默认为标准输出（ stdout）， 如果配置为守护进程方式运行， 而这里又配
置为日志记录方式为标准输出，则日志将会发送给/dev/null
databases： #开启数据库的数量。使用“ SELECT 库 ID” 方式切换操作各个数据库
save * *： #保存快照的频率，第一个*表示多长时间，第二个*表示执行多少次写操
作。在一定时间内执行一定数量的写操作时，自动保存快照。可设置多个条件。
rdbcompression： #保存快照是否使用压缩
dbfilename： #数据快照文件名（只是文件名，不包括目录）。 默认值为 dump.rdb
dir： #数据快照的保存目录（这个是目录)
#启用日志追加持久化方式
appendonly yes
```

集群搭建
https://www.cnblogs.com/kangoroo/p/7657616.html
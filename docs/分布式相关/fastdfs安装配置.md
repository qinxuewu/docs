### 安装libevent
FastDFS 内部绑定了 libevent 作为 http 服务器 ，在V2.X版本必须安装 libevent ，本文安装的是V2.2版本，因此必须安装libevent。（官方也推荐使用 http 方式下载 文件 ）

如果已经安装了 libevent，请确认安装路径是 /usr ， 因为 FastDFS 在编译源程序时，需要到此目录下查找一些依赖文件，否则编译 FastDFS 会出错 。如果不是，建议首先卸载 libevent ，然后安装到 /usr 下。Ubuntu10.4默认是安装了libevent，可以到软件中心卸载掉然后按照下面介绍的方式安装。

 **依次执行：** 

```
1> rpm -qa|grep libevent
2> yum remove libevent*
   tar -zxvf libevent-2.0.21-stable.tar.gz
3> cd libevent-2.0.21-stable
4> ./configure --prefix=/usr/local/libevent
5> make && make install
```
注意： 1）执行 make install 时可能需要 root 权限。2）libevent会安装到 /usr/lib 或 /usr/local/lib 下。

 **测试libevent是否安装成功** 
```
ls -al /usr/lib | grep libevent（或 ls -al /usr/local/lib | grep libevent） 
```

### 安装fastdfs
tar命令解压FastDFS_v5.01.tar.gz源代码包,

```
[root@tracker opt]# cd /home/winkey/FastDFS/
[root@tracker src]# tar zxf FastDFS_v5.01.tar.gz
[root@tracker src]# cd FastDFS
```
运行make.sh，确认make成功。期间如果有错误，如果提示错误，可能缺少依赖的软件包(yum install -y gcc gcc-c++)，需先安装依赖包，需安装后再次make。
```
[root@tracker FastDFS]# ./make.sh
```
运行make.sh install，确认install成功。
```
[root@tracker FastDFS]# ./make.sh install
```
编辑配置文件目录下的tracker.conf，设置相关信息并保存。
```
[root@tracker FastDFS]# vim /etc/fdfs/tracker.conf
```
一般只需改动以下几个参数即可：

```
disabled=false            #启用配置文件
bind_addr=192.168.1.149   #设置绑定地址
port=22122                #设置tracker的端口号
base_path=/fdfs/tracker   #设置tracker的数据文件和日志目录（需预先创建）
http.server_port=9900     #设置http端口号
```

编辑配置文件目录下的storage.conf，设置相关信息并保存

```
vim /etc/fdfs/storage.conf


一般只需改动以下几个参数即可：

disabled=false                    #启用配置文件
group_name=group1                 #组名，根据实际情况修改
bind_addr=192.168.1.149           #设置绑定地址
port=23000                        #设置storage的端口号
base_path=/fdfs/storage           #设置storage的日志目录（需预先创建）
store_path_count=1                #存储路径个数，需要和store_path个数匹配
store_path0=/fdfs/storage         #存储路径
tracker_server=192.168.1.149:22122 #tracker服务器的IP地址和端口号
http.server_port=9901     #设置http端口号
```

### 运行
运行tracker之前，先要把防火墙中对应的端口打开（本例中为22122）

```
[root@tracker FastDFS]# iptables -I INPUT -p tcp -m state --state NEW -m tcp --dport 22122 -j ACCEPT
[root@tracker FastDFS]# /etc/init.d/iptables save

iptables：将防火墙规则保存到 /etc/sysconfig/iptables：[确定]
```

启动tracker，确认启动是否成功。（查看是否对应端口22122是否开始监听
```
[root@tracker FastDFS]# /usr/local/bin/fdfs_trackerd /etc/fdfs/tracker.conf restart
[root@tracker FastDFS]# netstat -unltp | grep fdfs
tcp    0    0.0.0.0:22122       0.0.0.0:*           LISTEN      1766/fdfs_trackerd
```
注意：这里的fdfs_trackerd文件也可以从你安装的Fastdfs目录下拷过来的（如果已经存在则不需要拷贝）
![输入图片说明](https://images.gitee.com/uploads/images/2018/0803/165737_e2f869f8_1478371.png "屏幕截图.png")

也可查看tracker的日志是否启动成功或是否有错误。
```
[root@tracker FastDFS]# cat /fdfs/tracker/logs/trackerd.log
```

确认启动成功后，可以运行fdfs_monitor查看storage服务器是否已经登记到tracker服务器。
运行tracker之前，先要把防火墙中对应的端口打开（本例中为22122）。

```
[root@tracker FastDFS]# iptables -I INPUT -p tcp -m state --state NEW -m tcp --dport 23000  -j ACCEPT
[root@tracker FastDFS]# /etc/init.d/iptables save
iptables：将防火墙规则保存到 /etc/sysconfig/iptables：[确定]


[root@storage1 FastDFS]# /usr/local/bin/fdfs_monitor /etc/fdfs/storage.conf
```

### 安装nginx
使用nginx-1.5.12.tar.gz源代码包以及FastDFS的nginx插件fastdfs-nginx-module_v1.16.tar.gz。

首先将代码包和插件复制到系统的/home/winkey/FastDFS内（可选），然后使用tar命令解压

```
[root@storage1 opt]# cd /home/winkey/FastDFS/
[root@storage1 src]# tar zxf nginx-1.5.12.tar.gz
[root@storage1 src]# tar zxf fastdfs-nginx-module_v1.16.tar.gz
[root@storage1 src]# tar zxf pcre-8.35.tar.gz
[root@storage1 src]# tar zxf zlib-1.2.8.tar.gz
[root@storage1 src]# cd nginx-1.5.12
```
运行./configure进行安装前的设置，主要设置安装路径、FastDFS插件模块目录、pcre库目录、zlib库目录。如果提示错误，可能缺少依赖的软件包(yum install -y gcc gcc-c++)，需先安装依赖包

```
yum -y install openssl openssl-devel

再次运行./configure

./configure --prefix=/usr/local/nginx --with-http_stub_status_module --add-module=../fastdfs-nginx-module/src --with-pcre=../pcre-8.35 --with-zlib=../zlib-1.2.8
```
![输入图片说明](https://images.gitee.com/uploads/images/2018/0803/170307_dd1e83f6_1478371.png "屏幕截图.png")

运行make进行编译，确保编译成功。

```
[root@storage1 nginx-1.5.12]# make
```
运行make install进行安装。

```
[root@storage1 nginx-1.5.12]# make install
```
将FastDFS的nginx插件模块的配置文件copy到FastDFS配置文件目录。

```
root@storage1 nginx-1.5.12]# cp /home/winkey/FastDFS/fastdfs-nginx-module/src/mod_fastdfs.conf /etc/fdfs/
```
编辑/usr/local/nginx/conf配置文件目录下的nginx.conf，设置添加storage信息并保存。

```
vim /usr/local/nginx/conf/nginx.conf
```
建立M00至存储目录的符号连接。


```
worker_processes  4;                  #根据CPU核心数而定
events {
    worker_connections  1024;        #最大链接数
}
http {
    #设置缓存参数
    server_names_hash_bucket_size 128;
    client_header_buffer_size 32k;
    large_client_header_buffers 4 32k;
    client_max_body_size 300m;
    tcp_nopush      on;
    proxy_redirect off;
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_connect_timeout 90;
    proxy_send_timeout 90;
    proxy_read_timeout 90;
    proxy_buffer_size 16k;
    proxy_buffers 4 64k;
    proxy_busy_buffers_size 128k;
    proxy_temp_file_write_size 128k;
   #设置缓存存储路径、存储方式、分配内存大小、磁盘最大空间、缓存期限
   proxy_cache_path /var/cache/nginx/proxy_cache levels=1:2 keys_zone=http-cache:500m max_size=10g inactive=30d;  
   proxy_temp_path /var/cache/nginx/proxy_cache/tmp;  
   #(创建目录：nginx/proxy_cache/tmp)
   #设置group1的服务器
   upstream fdfs_group1 { #设置group1的服务器  
      server 192.168.1.149:9901 weight=1 max_fails=2 fail_timeout=30s;  
    }  
#设置storage代理
server {
        listen       9901;
        server_name  localhost;

        #charset koi8-r;

        #access_log  logs/host.access.log  main;
        location ~/group[1]/M00 {
          root /fdfs/storage/data;
          ngx_fastdfs_module;
        }

        location / {
            root   html;
            index  index.html index.htm;
        }
}
 #设置tracker代理配置
 server {
        listen       9900;
       server_name  somename  alias  another.alias;

       location / {
           root   html;
           index  index.html index.htm;
        }
      location /group1/M00 {    #设置group1的负载均衡参数  
       proxy_next_upstream http_502 http_504 error timeout invalid_header;  
       proxy_cache http-cache;  
       proxy_cache_valid 200 304 12h;  
       proxy_cache_key $uri$is_args$args;  
       proxy_pass http://fdfs_group1;  
       expires 30d;  
      } 
    }

```
 编辑/etc/fdfs配置文件目录下的mod_fastdfs.conf，设置storage信息并保存。
```
[root@storage1 nginx-1.5.12]# vim /etc/fdfs/mod_fastdfs.conf
```
一般只需改动以下几个参数即可

```
base_path=/fdfs/storage           #保存日志目录
tracker_server=192.168.1.149:22122 #tracker服务器的IP地址以及端口号
storage_server_port=23000         #storage服务器的端口号
group_name=group1                 #当前服务器的group名
url_have_group_name = true        #文件url中是否有group名
store_path_count=1                #存储路径个数，需要和store_path个数匹配
store_path0=/fdfs/storage         #存储路径
http.need_find_content_type=true  #从文件扩展名查找文件类型（nginx时为true）
group_count = 1                   #设置组的个数

在末尾增加3个组的具体信息：
[group1]
group_name=group1
storage_server_port=23000
store_path_count=1
store_path0=/fdfs/storage
```

```
[root@storage1 nginx-1.5.12]# ln -s /fdfs/storage/data /fdfs/storage/data/M00
[root@storage1 nginx-1.5.12]# ll /fdfs/storage/data/M00
lrwxrwxrwx. 1 root root 19 3月  26 03:44 /fdfs/storage/data/M00 -> /fdfs/storage/data/
```
运行nginx之前，先要把防火墙中对应的端口打开（本例中为9900）。

```
[root@storage1 nginx-1.5.12]# iptables -I INPUT -p tcp -m state --state NEW -m tcp --dport 9900 -j ACCEPT
[root@storage1 nginx-1.5.12]# /etc/init.d/iptables save
iptables：将防火墙规则保存到 /etc/sysconfig/iptables：[确定]
```
运行nginx之前，先要把防火墙中对应的端口打开（本例中为9901）

```
[root@storage1 nginx-1.5.12]# iptables -I INPUT -p tcp -m state --state NEW -m tcp --dport 9901 -j ACCEPT
[root@storage1 nginx-1.5.12]# /etc/init.d/iptables save
iptables：将防火墙规则保存到 /etc/sysconfig/iptables：[确定]
```
启动nginx，确认启动是否成功。（查看是否对应端口9900是否开始监听）

```
[root@storage1 nginx-1.5.12]# /usr/local/nginx/sbin/nginx 

ngx_http_fastdfs_set pid=40638

[root@storage1 nginx-1.5.12]# netstat -unltp | grep nginx
tcp    0    0.0.0.0:9900            0.0.0.0:*              LISTEN      40639/nginx
```
![输入图片说明](https://images.gitee.com/uploads/images/2018/0803/171154_674a0d16_1478371.png "屏幕截图.png")


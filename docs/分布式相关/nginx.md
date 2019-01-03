### 利用nginx实现负载均衡
安装了两个tomcat，端口分别是42000和42001。第二个tomcat的首页随便加了些代码区分

### nginx配置

```
#这里的域名要和下面proxy_pass的一样
#设定负载均衡的服务器列表  weigth参数表示权值，权值越高被分配到的几率越大
upstream  fengzp.com {   
    server    192.168.99.100:42000  weight=1; 
    server    192.168.99.100:42001  weight=2;  
}     

server {  
    listen       80; 
    server_name  192.168.99.100;  

location / {  
        proxy_pass http://fengzp.com;  
        proxy_redirect default;  
    }  

    error_page   500 502 503 504  /50x.html;  
    location = /50x.html {  
        root   html;  
    }  
}
```

### 测试
![输入图片说明](https://images.gitee.com/uploads/images/2018/0809/135913_b18bb260_1478371.png "屏幕截图.png")
![输入图片说明](https://images.gitee.com/uploads/images/2018/0809/135927_f72d1eae_1478371.png "屏幕截图.png")

刷新页面发现页面会发生变化，证明负载配置成功。因为我配的权重第二个是第一个的两倍，所以第二个出现的概率会是第一个的两倍。



如果关了tomcat1，再多次刷新页面，接下来出现的就会都是tomcat2的页面，但是时而快时而慢。这其中原因是当如果nginx将请求转发到tomcat2时，服务器会马上跳转成功，但是如果是转到tomcat1，因为tomcat1已经关闭了，所以会出现一段等待响应过程的过程，要等它失败后才会转到tomcat2。
而这个等待响应的时间我们是可以配置的。


这个时间由以下3个参数控制：
proxy_connect_timeout：与服务器连接的超时时间，默认60s
fail_timeout：当该时间内服务器没响应，则认为服务器失效，默认10s
max_fails：允许连接失败次数，默认为1

等待时间 = proxy_connect_timeout + fail_timeout * max_fails

![输入图片说明](https://images.gitee.com/uploads/images/2018/0809/140043_fd0da26f_1478371.png "屏幕截图.png")

如果我这样配置的话，只需等待6秒就可以了。


### 负载均衡策略
 **1、轮询** 

```
#这种是默认的策略，把每个请求按顺序逐一分配到不同的server，如果server挂掉，能自动剔除

upstream  fengzp.com {   
    server   192.168.99.100:42000; 
    server   192.168.99.100:42001;  
}
```
 **2、最少连接** 

```
#把请求分配到连接数最少的server

upstream  fengzp.com {   
    least_conn;
    server   192.168.99.100:42000; 
    server   192.168.99.100:42001;  
}
```
 **3、权重** 

```
#使用weight来指定server访问比率，weight默认是1。以下配置会是server2访问的比例是server1的两倍

upstream  fengzp.com {   
    server   192.168.99.100:42000 weight=1; 
    server   192.168.99.100:42001 weight=2;  
}
```

 **4、ip_hash** 
 **每个请求会按照访问ip的hash值分配，这样同一客户端连续的Web请求都会被分发到同一server进行处理，可以解决session的问题。如果server挂掉，能自动剔除。** 
```
upstream  fengzp.com {   
    ip_hash;
    server   192.168.99.100:42000; 
    server   192.168.99.100:42001;  
}
```
ip_hash可以和weight结合使用。

### nginx实现请求的负载均衡 + keepalived实现nginx的高可用
https://www.cnblogs.com/youzhibing/p/7327342.html



### 一个域名配置多项目访问

```

#user  nobody;
worker_processes  1;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

pid        logs/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       mime.types;
    default_type  application/octet-stream;

    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout  65;

    #gzip  on;

	upstream rongdaitianxia {
		#表示在10s(fail_timeout)之内，有1(max_fails)个请求打到这台挂了的服务器，nginx就会把这台upstream server设为down机的状态，时长是10s，
		#在这10s内如果又有请求进来，就不会被转到这台server上，过了10s重新认为这台server又恢复了	
		server 127.0.0.1:8080 max_fails=2 fail_timeout=10s;
		server 127.0.0.1:8082 max_fails=2 fail_timeout=10s;
	}
	
	 
     
	
	server {
        listen       443;
        server_name  填你的域名;
        ssl                  on;
        ssl_certificate      /home/nginx/certs/1_www.rongdaitianxia.com_bundle.crt;
        ssl_certificate_key  /home/nginx/certs/2_www.rongdaitianxia.com.key;
        ssl_session_timeout  5m;
        ssl_protocols TLSv1.2;
        ssl_ciphers  HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers   on;

         #location / {
              #client_max_body_size    16m;
              #client_body_buffer_size 128k;
              #proxy_pass                          http://rongdaitianxia/;
			  #proxy_set_header Upgrade $http_upgrade;
			  #proxy_set_header Connection "upgrade";
              #proxy_set_header        Host $host;
              #proxy_set_header        X-Real-IP $remote_addr;
              #proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
			  #proxy_set_header        X-Forwarded-Proto https;
              #proxy_next_upstream   off;
              #proxy_connect_timeout   30;
              #proxy_read_timeout      300;
              #proxy_send_timeout      300;
        #}
		
		
		location /wxloan {
              client_max_body_size    16m;
              client_body_buffer_size 128k;
              proxy_pass                          http://127.0.0.1:8080/wxloan;
			  proxy_set_header Upgrade $http_upgrade;
			  proxy_set_header Connection "upgrade";
              proxy_set_header        Host $host;
              proxy_set_header        X-Real-IP $remote_addr;
              proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
			  proxy_set_header        X-Forwarded-Proto https;
              proxy_next_upstream   off;
              proxy_connect_timeout   30;
              proxy_read_timeout      300;
              proxy_send_timeout      300;
        }
		
		
		location /loan-master {
              client_max_body_size    16m;
              client_body_buffer_size 128k;
              proxy_pass                          http://127.0.0.1:8081/loan-master;
			  proxy_set_header Upgrade $http_upgrade;
			  proxy_set_header Connection "upgrade";
              proxy_set_header        Host $host;
              proxy_set_header        X-Real-IP $remote_addr;
              proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
			  proxy_set_header           X-Forwarded-Proto https;
              proxy_next_upstream   off;
              proxy_connect_timeout   30;
              proxy_read_timeout      300;
              proxy_send_timeout      300;
        }
		
		
		location /wxmp {
              client_max_body_size    16m;
              client_body_buffer_size 128k;
              proxy_pass                          http://127.0.0.1:8081/wxmp;
			  proxy_set_header Upgrade $http_upgrade;
			  proxy_set_header Connection "upgrade";
              proxy_set_header        Host $host;
              proxy_set_header        X-Real-IP $remote_addr;
              proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
			  proxy_set_header           X-Forwarded-Proto https;
              proxy_next_upstream   off;
              proxy_connect_timeout   30;
              proxy_read_timeout      300;
              proxy_send_timeout      300;
        }
		
		location /wechat {
              client_max_body_size    16m;
              client_body_buffer_size 128k;
              proxy_pass                          http://127.0.0.1:8084/wechat;
			  proxy_set_header Upgrade $http_upgrade;
			  proxy_set_header Connection "upgrade";
              proxy_set_header        Host $host;
              proxy_set_header        X-Real-IP $remote_addr;
              proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
			  proxy_set_header           X-Forwarded-Proto https;
              proxy_next_upstream   off;
              proxy_connect_timeout   30;
              proxy_read_timeout      600;
              proxy_send_timeout      300;
        }
		
	

    }
	
	
	
	 
	
	 

}

```


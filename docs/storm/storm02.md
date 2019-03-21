# 官方文档
http://storm.apache.org/releases/1.2.2/Command-line-client.html
```bash
[root@web1 apache-storm-1.2.2]# bin/storm help
Commands:
	activate
	blobstore
	classpath
	deactivate
	dev-zookeeper
	drpc
	get-errors
	heartbeats
	help
	jar
	kill
	kill_workers
	list
	localconfvalue
	logviewer
	monitor
	nimbus
	node-health-check
	pacemaker
	rebalance
	remoteconfvalue
	repl
	set_log_level
	shell
	sql
	supervisor
	ui
	upload-credentials
	version

Help: 
	help 
	help <command>

Documentation for the storm client can be found at http://storm.apache.org/documentation/Command-line-client.html

Configs can be overridden using one or more -c flags, e.g. "storm list -c nimbus.host=nimbus.mycompany.com"

```

## activate 激活指定拓扑的spouts
```bash
语法：storm activate topology-name
```
## classpath 在运行命令时打印storm客户端使用的类路径
```bash
storm classpath
```
## deactivate 停用指定拓扑的spouts
```
storm deactivate topology-name
```
## drpc 启动DRPC守护程序
```
storm drpc
```
## get-errors
从正在运行的拓扑中获取最新错误。返回的结果包含组件名称的键值对和错误组件的组件错误。结果以json格式返回
```
storm get-errors topology-name
```
## jar 
使用指定的参数运行类的主要方法。提交拓扑使用
```
storm jar topology-jar-path class ...
```
## kill 
使用名称终止拓扑topology-name 您可以使用-w标志覆盖Storm在停用和关闭之间等待的时间长度
```
storm kill topology-name [-w wait-time-secs]
```
## list 
列出正在运行的拓扑及其状态
```
storm list
```
## localconfvalue
打印出本地Storm配置的conf-name的值
```
storm localconfvalue conf-name
```
## logviewer 
启动Logviewer守护进程
```
storm logviewe
```
## nimbus 
启动Nimbus守护进程
```
storm nimbus
```
## supervisor 
```
storm supervisor
```
## version
```
storm version

```

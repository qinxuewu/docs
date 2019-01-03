### 下载地址
http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html

下载解压到指定的目录  用ftp上传至服务器（usr/local/java目录）即可


### 编辑配置文件，配置环境变量

```
vim /etc/profile

#添加如下内容：JAVA_HOME根据实际目录来
JAVA_HOME=/usr/java/jdk1.8.0_60
CLASSPATH=$JAVA_HOME/lib/
PATH=$PATH:$JAVA_HOME/bin
export PATH JAVA_HOME CLASSPATH

输入i 执行 wq  退出保存
执行命令 ：source /etc/profile

查看安装情况 java -version


可能出现的错误信息：
bash: ./java: cannot execute binary file

出现这个错误的原因可能是在32位的操作系统上安装了64位的jdk，
查看jdk版本和Linux版本位数是否一致。
sudo uname --m
```



### Linux系统查看公网IP地址
curl members.3322.org/dyndns/getip

### 查看tomact日志
tail -f catalina.out 

### 查看Tomcat是否以关闭
ps -ef|grep java

### 杀死Tomcat进程
kill -9 8080

### Tomcat关闭命令
./shutdown.sh
### 启动Tomcat
./startup.sh
### linux中怎么清理catalina.out
echo "">catalina.out

### 服务器内存使用情况

```
free -m

            total（总）   used(使用) free(剩余)     shared    buffers     cached
Mem:          1526        182       1344          0         16         99
-/+ buffers/cache:         65       1460
Swap:         3071          0       3071

top命令
top命令中的显示结果中有这样两行：
Mem:   1563088k total,   186784k used,  1376304k free,    17444k buffers
Swap:  3145720k total,        0k used,  3145720k free,   101980k cached

vmstat命令
procs -----------memory---------- ---swap-- -----io---- --system-- -----cpu-----
r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
0  0      0 1376320  17452 101980    0    0     1     1    4    5  0  0 100  0  0
```


### Linux grep 命令
```
1.作用
Linux系统中grep命令是一种强大的文本搜索工具，它能使用正则表达式搜索文本，并把匹 配的行打印出来。grep全称是Global Regular Expression Print，表示全局正则表达式版本，它的使用权限是所有用户。
2.格式
grep [options]
3.主要参数
[options]主要参数：
－c：只输出匹配行的计数。
－I：不区分大 小写(只适用于单字符)。
－h：查询多文件时不显示文件名。
－l：查询多文件时只输出包含匹配字符的文件名。
－n：显示匹配行及 行号。
－s：不显示不存在或无匹配文本的错误信息。
－v：显示不包含匹配文本的所有行。
pattern正则表达式主要参数：
\： 忽略正则表达式中特殊字符的原有含义。
^：匹配正则表达式的开始行。
$: 匹配正则表达式的结束行。
\<：从匹配正则表达 式的行开始。
\>：到匹配正则表达式的行结束。
[ ]：单个字符，如[A]即A符合要求 。
[ - ]：范围，如[A-Z]，即A、B、C一直到Z都符合要求 。
。：所有的单个字符。
* ：有字符，长度可以为0。
```

```
4.grep命令使用简单实例
$ grep ‘test’ d*
显示所有以d开头的文件中包含 test的行。
$ grep ‘test’ aa bb cc
显示在aa，bb，cc文件中匹配test的行。
$ grep ‘[a-z]\{5\}’ aa
显示所有包含每个字符串至少有5个连续小写字符的字符串的行。
$ grep ‘w\(es\)t.*\1′ aa
如果west被匹配，则es就被存储到内存中，并标记为1，然后搜索任意个字符(.*)，这些字符后面紧跟着 另外一个es(\1)，找到就显示该行。如果用egrep或grep -E，就不用”\”号进行转义，直接写成’w(es)t.*\1′就可以了。
```

Linux的chmod命令，对一个目录及其子目录所有文件添加权限

```
chmod 777 -R ./html
```

### 查看线程的堆栈信息
```
#使用top命令，查找pid
$ top

# 通过TOP -H -p 进程ID，找到具体的线程占用情况
$ top -H -p 21564

#通过命令pstack 进程ID显示线程堆栈\
$ pstack 24714
```

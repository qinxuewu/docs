## 简介
* Redis虽然是一个内存数据库，但也可以将数据持久化到硬盘，有两种持久化方式：RDB和AOF。 
* RDB持久化方式定时将数据快照写入磁盘。这种方式并不是非常可靠，因为可能丢失数据，但非常快速。 
* AOF持久化方式更加可靠，将服务端收到的每个写操作都写入磁盘。在服务器重启时，这些写操作被重新执行来重新构建数据集
* Redis支持五种数据类型：string（字符串），hash（哈希）
* list（列表），set（集合）及zset(sorted set：有序集合)。


## String类型
* string是redis最基本的类型，你可以理解成与Memcached一模一样的类型，一个key对应一个value。
* string类型是二进制安全的。意思是redis的string可以包含任何数据。比如jpg图片或者序列化的对象 。
* string类型是最基本的数据类型，一个键最大能存储512MB。

```
set name 1
get name 

#只有在 key 不存在时设置 key 的值。
setnx   

#设置有效期 
setex color 10  red

#从第六个开始字符替换
setrange  name 6 qcw.com 

#批量设置  不会覆盖已经存在到key 
mset key1 v1 key2  v2   

#获取旧值并设置新值
getset name  123    

#获取0-4之间字符
getrange name 0 4    

#批量获取
mget key1 key2  key3  

#对值递增加1 返回新值 
incr  key1   

#不存在自动创建,初始值默认为0自增自减少数自定义
incrby  key1 5

#自减少
decr  keyy

#正数自增 负数 自减少
decrby key   -3

#给指定的字符串增加，返回长度
append  naem .net 

#取指定字符串的长度, 返回长度
strken name 
```

## hashes(哈希)类型
* Redis hash是一个string类型的field和value的映射表，hash特别适合用于存储对象。

```
# 设置hash field 为指定值 如果key不存在创建
hset user:001 name qxw   
hget user:001 name
hsetnx  user:002 name lamp (返回1,失败 0)

# 批量设置值
hmset  user:003 name 333 age 20 sex 1 

# 批量获取value 
hmget user:003 name  age  sex 

# 指定自增
hincrby  user:003 age 5 

# 测试值是否存在
hexists user:003 age

# 返回hash的数量
hlen user:003 

# 删除
hdel user:003 age 

# 返回hash 表所有key
hkeys  user:003 ()

# 返回所有 value
hvals user:003

# 返回所有的key和value
hgetall user:003 

```

## list(列表)
* Redis 列表是简单的字符串列表，按照插入顺序排序。你可以添加一个元素到列表的头部（左边）或者尾部（右边）。
* 是一个链表结构push pop 获取一个范围的所有值


```
#从头部压入一个元素
lpush list1 “hello” 

#从尾部压入一个元素)
rpush list1 “word” 

#取值
lrange list1 0 -1

#在特定的元素前或后添加元素
linsert list1 before “word” “hello”

#删除n个和value相同的元素 n=0全部删粗  n<0 从尾部删除
lrem list 3 “hello”

#保留指定key的范围内的数据,下表从0开始 -1代表一直到结束
ltrim list1 1 -1 

#从头部删除元素，并返回删除元素
lpop list1 

#从尾部删除元素，并返回删除的元素
rpop list1

#从第一个list的尾部移除元素并添加到第二个list的头部
rpoplpush list1  list2 

#返回key的list中index位置的元素
lindex list1 0

#返回key对应list的长度
llen list1 

```

## Set（集合）
* Redis的Set是string类型的无序集合。集合是通过哈希表实现的，所以添加，删除，查找的复杂度都是O(1)

```
#向集合成添加一个或多个成员
sadd myset key hello key2  hollo2 

#获取集合成员的个数
scard myset

#返回给定所有集合的差集
sdiff myset myset2

#返回给定集合的所有差集并存储在detis中
sdiff detis myset myset2

#返回集合的交集
sinter myset myset2

#返回交集 并存储在detis中
sinterstore detis myset myset2

#判断元素是否是myset集合中的成员
sismember myset "hello"

#返回集合中所有的成员
smembers myset

#将元素移动到detis中
smove myset detis hello

#移除并返回集合中的一个随机元素
spop myset

#返回集合中一个或多个随机数
srandmember myset 2

#移除集合中一个或多个成员
srem myset [member2] [member2]

#返回集合并集
sunion  myset myset2

#将指定的集合存储在detis中
sunionstore detis  myset myset2

```

## 有序集合(sorted set)
* Redis 有序集合和集合一样也是string类型元素的集合,且不允许重复的成员。
* 不同的是每个元素都会关联一个double类型的分数。redis正是通过分数来为集合中的成员进行从小到大的排序。
* 有序集合的成员是唯一的,但分数(score)却可以重复。
* 集合是通过哈希表实现的，所以添加，删除，查找的复杂度都是O(1)。 
* 集合中最大的成员数为232-1(4294967295,每个集合可存储40多亿个成员)。


```
#添加一个或多个成员，或者更新已存在成员的分数
zadd myset 1"hello" 

#获取集合中的所有元素和分数
zrange myzset 0-1 WITHSCORES
zrange salary 1 2 WITHSCORE

#获取有序集合的成员数
zcard myset4

#返回指定区间分数的成员个数
zcount myset4 1 4

#将集合中指定的成员的分数加2
zincrby myset4 2 "hello"()

#取交集，分数相加，存储到 sumpoint
zinterstore sumpoint 2 myset4 myset3

#计算有序集合中指定字典区间的成员数量
zlexcount myset4 - +

#Redis Zrangebylex 通过字典区间返回有序集合的成员。
redis 127.0.0.1:6379> ZADD myzset 0 a 0 b 0 c 0 d 0 e 0 f 0 g
(integer)7
redis 127.0.0.1:6379> ZRANGEBYLEX myzset -[c
1)"a"2)"b"3)"c"
redis 127.0.0.1:6379> ZRANGEBYLEX myzset -(c
1)"a"2)"b"
redis 127.0.0.1:6379> ZRANGEBYLEX myzset [aaa (g
1)"b"2)"c"3)"d"4)"e"5)"f"
redis>
```

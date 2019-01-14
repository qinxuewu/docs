## 简介

1. Map接口下的实现类：HashMap, LinkedHashMap, TreeMap, WeakHashMap, EnumMap;
1. 散列图HashMap效率高 不保证元素顺序
1. 链式散列图LinkedHashMap按照添加顺序存储，可以按添加顺序取出
1. 树形图TreeHashMap可以对元素进行排序性 使用compareTo()方法使内容按照key有序


## HashMap

对于 HashMap 及其子类而言，它们采用 Hash 算法来决定集合中元素的存储位置。当系统开始初始化 HashMap 时，系统会创建一个长度为 capacity 的 Entry 数组，这个数组里可以存储元素的位置被称为“桶（bucket）”，每个 bucket 都有其指定索引，系统可以根据其索引快速访问该 bucket 里存储的元素。 


```
在HashMap中有两个很重要的参数，容量(Capacity)和负载因子(Load factor)。 
Capacity的默认值为16： 
static final int DEFAULT_INITIAL_CAPACITY = 1 << 4; 
负载因子的默认值为0.75： 
static final float DEFAULT_LOAD_FACTOR = 0.75f; 
```

 **如果HashMap的大小超过了负载因子(load factor)定义的容量，怎么办？** 


- 如果超过了负载因子(默认0.75)，则会重新resize（扩充）一个原来长度两倍的HashMap，并且重新调用hash方法。
- 可以设置初始容量Capacity，但是在HashMap处理过程中，是会把Capacity扩充成2的倍数，怎么理解？比如你设置的初始值17，但是17不是2的整数倍，会扩容成32，再比如你初始设置的是15，会扩容成16

 **工作原理** 
- HashMap基于hashing原理，我们通过put()和get()方法储存和获取对象。
- 当我们将键值对传递给put()方法时，它调用键对象的hashCode()方法生成key所对应的hash值，根据hash值和数组的长度找到位置来储存值对象。
- 当获取对象时，通过键对象的equals()方法找到正确的键值对，然后返回值对象。
- HashMap使用链表来解决碰撞问题，当发生碰撞了，对象将会储存在链表的下一个节点中。HashMap在每个链表节点中储存键值对对象。

 **当两个不同的键对象的hashcode相同时会发生什么** 
- 对象相等则hashCode一定相等，hashCode相等对象未必相等。
- 因为hashcode相同，所以它们的bucket位置相同，‘碰撞’会发生。因为HashMap使用链表存储对象，它们会储存在同一个bucket位置的链表中。
- 所以就算当key的hashCode一样时，当我们找到bucket中存储的链表，遍历这个链表的时候通过调用key.equals()方法来找到正确的节点。

 **put方法存储过程:** 

![输入图片说明](https://gitee.com/uploads/images/2018/0701/130652_b846afcd_1478371.png "clipboard.png")

## HashMap和Hashtable的区别
- `HashMap`几乎可以等价于`Hashtable`，除了HashMap是非synchronized的，并可以接受null(HashMap可以接受为null的键值(key)和值(value)，而Hashtable则不行)。
- `HashMap`是非`synchronized`，而`Hashtable`是`synchronized`，这意味着Hashtable是线程安全的，多个线程可以共享一个Hashtable；而如果没有正确的同步的话，多个线程是不能共享HashMap的。Java 5提供了ConcurrentHashMap，它是HashTable的替代，比HashTable的扩展性更好。
- 另一个区别是HashMap的迭代器(Iterator)是fail-fast迭代器，而Hashtable的enumerator迭代器不是fail-fast的。所以当有其它线程改变了HashMap的结构（增加或者移除元素），将会抛出ConcurrentModificationException，但迭代器本身的remove()方法移除元素则不会抛出ConcurrentModificationException异常。但这并不是一个一定发生的行为，要看JVM。这条同样也是Enumeration和Iterator的区别
- HashMap不能保证随着时间的推移Map中的元素次序是不变的。
- HashMap可以通过下面的语句进行同步：Map m = Collections.synchronizeMap(hashMap);
- Hashtable和HashMap有几个主要的不同：线程安全以及速度。仅在你需要完全的线程安全的时候使用Hashtable，而如果你使用Java 5或以上的话，请使用ConcurrentHashMap吧。


## LinkedHashMap 概述
LinkedHashMap 是 HashMap 的一个子类，它保留插入的顺序，如果需要输出的顺序和输入时的相同，那么就选用 LinkedHashMap。LinkedHashMap也可以选择按照访问顺序进行排序
![输入图片说明](https://gitee.com/uploads/images/2018/0702/124336_35931c8b_1478371.png "clipboard.png")

## LinkedHashMap 的实现
对于 `LinkedHashMap `而言，它继承与 `HashMap(public class LinkedHashMap<K,V> extends HashMap<K,V>` implements Map<K,V>)、底层使用哈希表与双向链表来保存所有元素。其基本操作与父类 HashMap 相似，它通过重写父类相关的方法，来实现自己的链接列表特性。

`LinkedHashMap `采用的 hash 算法和 HashMap 相同，但是它重新定义了数组中保存的元素 `Entry`，该 Entry 除了保存当前对象的引用外，还保存了其上一个元素 before 和下一个元素 `after `的引用，从而在哈希表的基础上又构成了双向链接列表

`LinkedHashMap `几乎和 `HashMap `一样：从技术上来说，不同的是它定义了一个 Entry<K,V> header，这个 header 不是放在 Table 里，它是额外独立出来的。LinkedHashMap 通过继承 hashMap 中的 Entry<K,V>,并添加两个属性 Entry<K,V> before,after,和 header 结合起来组成一个双向链表，来实现按插入顺序或访问顺序排序。

## TreeMap
1. TreeMap 是一个有序的key-value集合，它是通过红黑树实现的。
1. TreeMap 继承于AbstractMap，所以它是一个Map，即一个key-value集合。
1. TreeMap 实现了NavigableMap接口，意味着它支持一系列的导航方法。比如返回有序的key集合。
1. TreeMap 实现了Cloneable接口，意味着它能被克隆。
1. TreeMap 实现了java.io.Serializable接口，意味着它支持序列化。
1. TreeMap基于红黑树（Red-Black tree）实现。该映射根据其键的自然顺序进行排序，或者根据创建映射时提供的 Comparator 进行排序，具体取决于使用的构造方法。
1. TreeMap的基本操作 containsKey、get、put 和 remove 的时间复杂度是 log(n) 。
1. 另外，TreeMap是非同步的。 它的iterator 方法返回的迭代器是fail-fastl的。

![输入图片说明](https://gitee.com/uploads/images/2018/0702/124603_bc408d4b_1478371.png "clipboard.png")


## WeakHashMap 
WeakHashMap 是HashMap弱引用的一种实现方式，它对key实验“弱引用”，若是一个key不再被外部所引用，那么该key可以被GC收受接管。
1. WeakHashMap 是存储键值对(key-value)的非同步且无序的散列表，键和值都允许为null，基本跟 HashMap一致
1. 特殊之处在于 WeakHashMap 里的entry可能会被GC自动删除，即使没有主动调用 remove() 或者 clear() 方法

## 补充:Java引用的相关知识

 **1. 强引用** 
- 强引用是Java 默认实现 的引用，JVM会尽可能长时间的保留强引用的存在（直到内存溢出）
- 当内存空间不足，Java虚拟机宁愿抛出OutOfMemoryError错误，使程序异常终止，也不会靠随意回收具有强引用的对象来解决内存不足的问题：只有当没有任何对象指向它时JVM将会回收

 **2. 软引用** 
- 软引用只会在虚拟机 内存不足 的时候才会被回收

 **3. 弱引用** 
- 弱引用是指当对象没有任何的强引用存在，在 下次GC回收 的时候它将会被回收
- 在垃圾回收器线程扫描它所管辖的内存区域的过程中，一旦发现了只具有弱引用的对象，不管当前内存空间足够与否，都会回收它的内存

 **4.虚引用** 
- 顾名思义，就是形同虚设，如果一个对象仅持有虚引用，那么它相当于没有引用，在任何时候都可能被垃圾回收器回收。
- 虚引用和前面的软引用、弱引用不同，它并不影响对象的生命周期。
- 一个对象是都有虚引用的存在都不会对生存时间都构成影响，也无法通过虚引用来获取对一个对象的真实引用。唯一的用处：能在对象被GC时收到系统通知。


## EnumMap
- 1.`EnumMap`是一个与枚举类一起使用的Map实现，`EnumMap`中所有`key`都必须是单个枚举类的枚举值。创建时必须显式或隐式指定它对应的枚举类。
- 2.`EnumMap`在内部以数组形式保存，所以这种实现形式非常紧凑、高效
- 3.`EnumMap`根据key的自然顺序（即枚举值在枚举类中的定义顺序）来维护来维护key-value对的次序。当程序通过keySet()、entrySet()、values()等方法来遍历EnumMap时即可看到这种顺序。
- 4.EnumMap不允许使用null作为key值，但允许使用null作为value。如果试图使用null作为key将抛出NullPointerException异常。如果仅仅只是查询是否包含值为null的key、或者仅仅只是使用删除值为null的key，都不会抛出异常。


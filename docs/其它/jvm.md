### JVM
 **类的实例化顺序** 
- 父类静态成员和静态初始化块 ，按在代码中出现的顺序依次执行
- 子类静态成员和静态初始化块 ，按在代码中出现的顺序依次执行
- 父类实例成员和实例初始化块 ，按在代码中出现的顺序依次执行
- 父类构造方法
- 子类实例成员和实例初始化块 ，按在代码中出现的顺序依次执行
- 子类构造方法
- 结论：对象初始化的顺序，先静态方法，再构造方法，每个又是先基类后子类。

 **内存溢出常见的哪几种？导致溢出的常见场景、用过哪些分析工具排查** 
- JVM Heap（堆）溢出：java.lang.OutOfMemoryError: Java heap space
- JVM在启动的时候会自动设置JVM Heap的值， 可以利用JVM提供的-Xmn -Xms -Xmx等选项可进行设置。Heap的大小是Young Generation 和Tenured Generaion 之和。在JVM中如果98%的时间是用于GC,且可用的Heap size 不足2%的时候将抛出此异常信息。 解决方法：手动设置JVM Heap（堆）的大小。
- PermGen space溢出： java.lang.OutOfMemoryError: PermGen space是指内存的永久保存区域。为什么会内存溢出，这是由于这块内存主要是被JVM存放Class和Meta信息的，Class在被Load的时候被放入PermGen space区域，它和存放Instance的Heap区域不同，sun的 GC不会在主程序运行期对PermGen space进行清理，所以如果你的APP会载入很多CLASS的话，就很可能出现PermGen space溢出。一般发生在程序的启动阶段。 解决方法： 通过-XX:PermSize和-XX:MaxPermSize设置永久代大小即可。
- 栈溢出： java.lang.StackOverflowError : Thread Stack space 解决方法：1：修改程序。2：通过 -Xss: 来设置每个线程的Stack大小即可。

 **JVM基本参数** 

```
-Xms：java Heap初始大小， 默认是物理内存的1/64。
-Xmx：ava Heap最大值，不可超过物理内存。
-Xmn：young generation的heap大小，一般设置为Xmx的3、4分之一 。增大年轻代后,将会减小年老代大小，可以根据监控合理设置。
-Xss：每个线程的Stack大小，而最佳值应该是128K,默认值好像是512k。
-XX:PermSize：设定内存的永久保存区初始大小，缺省值为64M。
-XX:MaxPermSize：设定内存的永久保存区最大大小，缺省值为64M。
-XX:SurvivorRatio：Eden区与Survivor区的大小比值,设置为8,则两个Survivor区与一个Eden区的比值为2:8,一个Survivor区占整个年轻代的1/10
-XX:+UseParallelGC：F年轻代使用并发收集,而年老代仍旧使用串行收集.
-XX:+UseParNewGC：设置年轻代为并行收集,JDK5.0以上,JVM会根据系统配置自行设置,所无需再设置此值。
-XX:ParallelGCThreads：并行收集器的线程数，值最好配置与处理器数目相等 同样适用于CMS。
-XX:+UseParallelOldGC：年老代垃圾收集方式为并行收集(Parallel Compacting)。
-XX:MaxGCPauseMillis：每次年轻代垃圾回收的最长时间(最大暂停时间)，如果无法满足此时间,JVM会自动调整年轻代大小,以满足此值。
-XX:+ScavengeBeforeFullGC：Full GC前调用YGC,默认是true。
实例如：JAVA_OPTS=”-Xms4g -Xmx4g -Xmn1024m -XX:PermSize=320M -XX:MaxPermSize=320m -XX:SurvivorRatio=6″
```



 **Java类加载器包括⼏种？它们之间的⽗⼦关系是怎么样的？双亲委派机制是什么意思？有什么好处？**  
```
启动Bootstrap类加载、扩展Extension类加载、系统System类加载。
父子关系如下：

  ● 启动类加载器 ，由C++ 实现，没有父类；
  ● 扩展类加载器，由Java语言实现，父类加载器为null；
  ● 系统类加载器，由Java语言实现，父类加载器为扩展类加载器；
  ● 自定义类加载器，父类加载器肯定为AppClassLoader。

双亲委派机制：类加载器收到类加载请求，自己不加载，向上委托给父类加载，父类加载不了，再自己加载。

优势避免Java核心API篡改。详细查看：深入理解Java类加载器(ClassLoader)

https://blog.csdn.net/javazejian/article/details/73413292/
```
5. 如何⾃定义⼀个类加载器？你使⽤过哪些或者你在什么场景下需要⼀个⾃定义的类加载器吗？

```
自定义类加载的意义：

  1. 加载特定路径的class文件
  2. 加载一个加密的网络class文件
  3. 热部署加载class文件
```
6. 堆内存设置的参数是什么？

```
  1. -Xmx 设置堆的最大空间大小
  2. -Xms 设置堆的最小空间大小
```
7. Perm Space中保存什么数据？会引起OutOfMemory吗？

```
加载class文件。

会引起，出现异常可以设置 -XX:PermSize 的大小。JDK 1.8后，字符串常量不存放在永久带，而是在堆内存中，JDK8以后没有永久代概念，而是用元空间替代，元空间不存在虚拟机中，二是使用本地内存。

详细查看Java8内存模型—永久代(PermGen)和元空间(Metaspace)

https://www.cnblogs.com/paddix/p/5309550.html/
```
8. 做GC时，⼀个对象在内存各个Space中被移动的顺序是什么？

```
标记清除法，复制算法，标记整理、分代算法。

新生代一般采用复制算法 GC，老年代使用标记整理算法。

垃圾收集器：串行新生代收集器、串行老生代收集器、并行新生代收集器、并行老年代收集器。

CMS（Current Mark Sweep）收集器是一种以获取最短回收停顿时间为目标的收集器，它是一种并发收集器，采用的是Mark-Sweep算法。

详见 Java GC机制。

http://www.cnblogs.com/dolphin0520/p/3783345.htmll/
```
9. 你有没有遇到过OutOfMemory问题？你是怎么来处理这个问题的？处理 过程中有哪些收获？

```
permgen space、heap space 错误。

常见的原因

  1. 内存加载的数据量太大：一次性从数据库取太多数据；
  2. 集合类中有对对象的引用，使用后未清空，GC不能进行回收；
  3. 代码中存在循环产生过多的重复对象；
  4. 启动参数堆内存值小。

详见 Java 内存溢出（java.lang.OutOfMemoryError）的常见情况和处理方式总结。

http://outofmemory.cn/c/java-outOfMemoryError/
```
10. JDK 1.8之后Perm Space有哪些变动? MetaSpace⼤⼩默认是⽆限的么? 还是你们会通过什么⽅式来指定⼤⼩?

```
JDK 1.8后用元空间替代了 Perm Space；字符串常量存放到堆内存中。
MetaSpace大小默认没有限制，一般根据系统内存的大小。JVM会动态改变此值。

  ● -XX:MetaspaceSize：分配给类元数据空间（以字节计）的初始大小（Oracle逻辑存储上的初始高水位，the initial high-water-mark）。此值为估计值，MetaspaceSize的值设置的过大会延长垃圾回收时间。垃圾回收过后，引起下一次垃圾回收的类元数据空间的大小可能会变大。
  ● -XX:MaxMetaspaceSize：分配给类元数据空间的最大值，超过此值就会触发Full GC，此值默认没有限制，但应取决于系统内存的大小。JVM会动态地改变此值。
```
11. jstack 是干什么的? jstat 呢？如果线上程序周期性地出现卡顿，你怀疑可 能是 GC 导致的，你会怎么来排查这个问题？线程⽇志⼀般你会看其中的什么 部分？

```
jstack 用来查询 Java 进程的堆栈信息。

jvisualvm 监控内存泄露，跟踪垃圾回收、执行时内存、cpu分析、线程分析。

详见Java jvisualvm简要说明，可参考 线上FullGC频繁的排查。

Java jvisualvm简要说明
https://blog.csdn.net/a19881029/article/details/8432368/

线上FullGC频繁的排查
https://blog.csdn.net/wilsonpeng3/article/details/70064336/
```
12. StackOverflow异常有没有遇到过？⼀般你猜测会在什么情况下被触发？如何指定⼀个线程的堆栈⼤⼩？⼀般你们写多少？

```
栈内存溢出，一般由栈内存的局部变量过爆了，导致内存溢出。出现在递归方法，参数个数过多，递归过深，递归没有出口。
```

 **Java堆的结构是什么样子的？什么是堆中的永久代(Perm Gen space)?** 
- JVM的堆是运行时数据区，所有类的实例和数组都是在堆上分配内存。它在JVM启动的时 候被创建。对象所占的堆内存是由自动内存管理系统也就是垃圾收集器回收。
- 堆内存是由存活和死亡的对象组成的。存活的对象是应用可以访问的，不会被垃圾回收。死亡的对象是应用不可访问尚且还没有被垃圾收集器回收掉的对象。一直到垃圾收集器把这些 对象回收掉之前，他们会一直占据堆内存空间。

 **串行(serial)收集器和吞吐量(throughput)收集器的区别是什么？** 
- 吞吐量收集器使用并行版本的新生代垃圾收集器，它用于中等规模和大规模数据的应用程序。 而串行收集器对大多数的小应用(在现代处理器上需要大概100M左右的内存)就足够了。

 **在Java中，对象什么时候可以被垃圾回收？** 
- 当一个对象到GC Roots不可达时，在下一个垃圾回收周期中尝试回收该对象，如果该对象重写了finalize()方法，并在这个方法中成功自救(将自身赋予某个引用)，那么这个对象不会被回收。但如果这个对象没有重写finalize()方法或者已经执行过这个方法，也自救失败，该对象将会被回收。

 **JVM的永久代中会发生垃圾回收么？** 
- 垃圾回收不会发生在永久代，如果永久代满了或者是超过了临界值，会触发完全垃圾回收(Full GC)。如果你仔细查看垃圾收集器的输出信息，就会发现永久代也是被回收的。这就是为什么正确的永久代大小对避免Full GC是非常重要的原因。请参考下Java8：从永久代 到元数据区
- (注：Java8中已经移除了永久代，新加了一个叫做元数据区的native内存区)

**GC ROOT的真实含义？** 
- 所谓“GC roots”，或者说tracing GC的“根集合”，就是一组必须活跃的引用。
这些引用可能包括：当前所有正在被调用的方法的引用类型的参数/局部变量/临时值。所有当前被加载的Java类，java类的引用类型静态变量,Java类的运行时常量池里的引用类型常量（String或Class类型）,String常量池（StringTable）里的引用

**可作为GC Root的对象？** 
- 虚拟机栈中的引用对象
- 方法区中类静态属性引用的对象
- 方法区中常量引用对象
- 本地方法栈中JNI引用对象


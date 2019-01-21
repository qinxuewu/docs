## 1. Synchronize关键字原理

众所周知 `Synchronize` 关键字是解决并发问题常用解决方案，有以下三种使用方式:

- 同步普通方法，锁的是当前对象。
- 同步静态方法，锁的是当前 `Class` 对象。
- 同步块，锁的是 `{}` 中的对象。


 **实现原理：** 
`JVM` 是通过进入、退出对象监视器( `Monitor` )来实现对方法、同步块的同步的。

具体实现是在编译之后在同步方法调用前加入一个 `monitor.enter` 指令，在退出方法和异常处插入 `monitor.exit` 的指令。

其本质就是对一个对象监视器( `Monitor` )进行获取，而这个获取过程具有排他性从而达到了同一时刻只能一个线程访问的目的。

而对于没有获取到锁的线程将会阻塞到方法入口处，直到获取锁的线程 `monitor.exit` 之后才能尝试继续获取锁。

流程图如下:

![](https://images.gitee.com/uploads/images/2019/0121/094206_13b9dc67_1478371.jpeg)


通过一段代码来演示:

```java
    public static void main(String[] args) {
        synchronized (Synchronize.class){
            System.out.println("Synchronize");
        }
    }
```

使用 `javap -c Synchronize` 可以查看编译之后的具体信息。

```
public class com.crossoverjie.synchronize.Synchronize {
  public com.crossoverjie.synchronize.Synchronize();
    Code:
       0: aload_0
       1: invokespecial #1                  // Method java/lang/Object."<init>":()V
       4: return

  public static void main(java.lang.String[]);
    Code:
       0: ldc           #2                  // class com/crossoverjie/synchronize/Synchronize
       2: dup
       3: astore_1
       **4: monitorenter**
       5: getstatic     #3                  // Field java/lang/System.out:Ljava/io/PrintStream;
       8: ldc           #4                  // String Synchronize
      10: invokevirtual #5                  // Method java/io/PrintStream.println:(Ljava/lang/String;)V
      13: aload_1
      **14: monitorexit**
      15: goto          23
      18: astore_2
      19: aload_1
      20: monitorexit
      21: aload_2
      22: athrow
      23: return
    Exception table:
       from    to  target type
           5    15    18   any
          18    21    18   any
}
```

可以看到在同步块的入口和出口分别有 `monitorenter,monitorexit`
指令。


 **Java对象头和monitor是实现synchronized的基础** 

### Java对象头
- synchronized用的锁是存在Java对象头里的，那么什么是Java对象头呢？Hotspot虚拟机的对象头主要包括两部分数据：Mark Word（标记字段）、Klass Pointer（类型指针）。其中Klass Point是是对象指向它的类元数据的指针，虚拟机通过这个指针来确定这个对象是哪个类的实例，Mark Word用于存储对象自身的运行时数据，它是实现轻量级锁和偏向锁的关键

### Mark Word
- Mark Word用于存储对象自身的运行时数据，如哈希码（HashCode）、GC分代年龄、锁状态标志、线程持有的锁、偏向线程 ID、偏向时间戳等等。Java对象头一般占有两个机器码,但是如果对象是数组类型，则需要三个机器码，因为JVM虚拟机可以通过Java对象的元数据信息确定Java对象的大小，但是无法从数组的元数据来确认数组的大小，所以用一块来记录数组长度。
![输入图片说明](http://cmsblogs.qiniudn.com/wp-content/uploads/2017/02/222222_2-1.jpg "在这里输入图片标题")
- 对象头信息是与对象自身定义的数据无关的额外存储成本，但是考虑到虚拟机的空间效率，Mark Word被设计成一个非固定的数据结构以便在极小的空间内存存储尽量多的数据，它会根据对象的状态复用自己的存储空间，也就是说，Mark Word会随着程序的运行发生变化，变化状态如下（32位虚拟机）：
![输入图片说明](https://images.gitee.com/uploads/images/2019/0121/094206_09228ac9_1478371.jpeg "在这里输入图片标题")

### Monitor
- 什么是Monitor？我们可以把它理解为一个同步工具，也可以描述为一种同步机制，它通常被描述为一个对象。
- 与一切皆对象一样，所有的Java对象是天生的Monitor，每一个Java对象都有成为Monitor的潜质，因为在Java的设计中 ，每一个Java对象自打娘胎里出来就带了一把看不见的锁，它叫做内部锁或者Monitor锁。
- Monitor 是线程私有的数据结构，每一个线程都有一个可用monitor record列表，同时还有一个全局的可用列表。
- 每一个被锁住的对象都会和一个monitor关联（对象头的MarkWord中的LockWord指向monitor的起始地址），同时monitor中有一个Owner字段存放拥有该锁的线程的唯一标识，表示该锁被这个线程占用。

![输入图片说明](https://images.gitee.com/uploads/images/2019/0121/094206_14c72ca4_1478371.png "在这里输入图片标题")

1. Owner：初始时为NULL表示当前没有任何线程拥有该monitor record，当线程成功拥有该锁后保存线程唯一标识，当锁被释放时又设置为NULL；
1. EntryQ:关联一个系统互斥锁（semaphore），阻塞所有试图锁住monitor record失败的线程
1. RcThis:表示blocked或waiting在该monitor record上的所有线程的个数。
1. Nest:用来实现重入锁的计数。
1. HashCode:保存从对象头拷贝过来的HashCode值（可能还包含GC age）。
1. Candidate:用来避免不必要的阻塞或等待线程唤醒，因为每一次只有一个线程能够成功拥有锁，如果每次前一个释放锁的线程唤醒所有正在阻塞或等待的线程，会引起不必要的上下文切换（从阻塞到就绪然后因为竞争锁失败又被阻塞）从而导致性能严重下降。Candidate只有两种可能的值0表示没有需要唤醒的线程1表示要唤醒一个继任线程来竞争锁。

###  jdk1.6开始对锁锁优化
- `synchronize`  很多都称之为重量锁，`JDK1.6` 中对 `synchronize` 进行了各种优化，为了能减少获取和释放锁带来的消耗引入了`偏向锁`和`轻量锁`。
- 锁主要存在四中状态，依次是：无锁状态、偏向锁状态、轻量级锁状态、重量级锁状态，他们会随着竞争的激烈而逐渐升级。注意锁可以升级不可降级，这种策略是为了提高获得锁和释放锁的效率。

### 轻量锁
当代码进入同步块时，如果同步对象为无锁状态时，当前线程会在栈帧中创建一个锁记录(`Lock Record`)区域，同时将锁对象的对象头中 `Mark Word` 拷贝到锁记录中，再尝试使用 `CAS` 将 `Mark Word` 更新为指向锁记录的指针。

如果更新**成功**，当前线程就获得了锁。

如果更新**失败** `JVM` 会先检查锁对象的 `Mark Word` 是否指向当前线程的锁记录。

如果是则说明当前线程拥有锁对象的锁，可以直接进入同步块。

不是则说明有其他线程抢占了锁，如果存在多个线程同时竞争一把锁，**轻量锁就会膨胀为重量锁**。

#### 解锁
轻量锁的解锁过程也是利用 `CAS` 来实现的，会尝试锁记录替换回锁对象的 `Mark Word` 。如果替换成功则说明整个同步操作完成，失败则说明有其他线程尝试获取锁，这时就会唤醒被挂起的线程(此时已经膨胀为`重量锁`)

轻量锁能提升性能的原因是：

认为大多数锁在整个同步周期都不存在竞争，所以使用 `CAS` 比使用互斥开销更少。但如果锁竞争激烈，轻量锁就不但有互斥的开销，还有 `CAS` 的开销，甚至比重量锁更慢。

### 偏向锁

为了进一步的降低获取锁的代价，`JDK1.6` 之后还引入了偏向锁。

偏向锁的特征是:锁不存在多线程竞争，并且应由一个线程多次获得锁。

当线程访问同步块时，会使用 `CAS` 将线程 ID 更新到锁对象的 `Mark Word` 中，如果更新成功则获得偏向锁，并且之后每次进入这个对象锁相关的同步块时都不需要再次获取锁了。

#### 释放锁
当有另外一个线程获取这个锁时，持有偏向锁的线程就会释放锁，释放时会等待全局安全点(这一时刻没有字节码运行)，接着会暂停拥有偏向锁的线程，根据锁对象目前是否被锁来判定将对象头中的 `Mark Word` 设置为无锁或者是轻量锁状态。

偏向锁可以提高带有同步却没有竞争的程序性能，但如果程序中大多数锁都存在竞争时，那偏向锁就起不到太大作用。可以使用 `-XX:-userBiasedLocking=false` 来关闭偏向锁，并默认进入轻量锁。


### 其他优化

### 自旋锁
- 线程的阻塞和唤醒需要CPU从用户态转为核心态，频繁的阻塞和唤醒对CPU来说是一件负担很重的工作，势必会给系统的并发性能带来很大的压力。同时我们发现在许多应用上面，对象锁的锁状态只会持续很短一段时间，为了这一段很短的时间频繁地阻塞和唤醒线程是非常不值得的。所以引入自旋锁。

 **何谓自旋锁？** 
- 所谓自旋锁，就是让该线程等待一段时间，不会被立即挂起，看持有锁的线程是否会很快释放锁。怎么等待呢？执行一段无意义的循环即可（自旋）。
- 自旋等待不能替代阻塞，先不说对处理器数量的要求,虽然它可以避免线程切换带来的开销，但是它占用了处理器的时间。如果持有锁的线程很快就释放了锁，那么自旋的效率就非常好，反之，自旋的线程就会白白消耗掉处理的资源，它不会做任何有意义的工作，典型的占着茅坑不拉屎，这样反而会带来性能上的浪费。所以说，自旋等待的时间（自旋的次数）必须要有一个限度，如果自旋超过了定义的时间仍然没有获取到锁，则应该被挂起。
- 自旋锁在JDK 1.4.2中引入，默认关闭，但是可以使用-XX:+UseSpinning开开启，在JDK1.6中默认开启。同时自旋的默认次数为10次，可以通过参数-XX:PreBlockSpin来调整；
- 如果通过参数-XX:preBlockSpin来调整自旋锁的自旋次数，会带来诸多不便。假如我将参数调整为10，但是系统很多线程都是等你刚刚退出的时候就释放了锁（假如你多自旋一两次就可以获取锁），你是不是很尴尬。于是JDK1.6引入自适应的自旋锁，让虚拟机会变得越来越聪明。

### 适应性自旋（CAS）
- 在使用 `CAS` 时，如果操作失败，`CAS` 会自旋再次尝试。由于自旋是需要消耗 `CPU` 资源的，所以如果长期自旋就白白浪费了 `CPU`。`JDK1.6`加入了适应性自旋:如果某个锁自旋很少成功获得，那么下一次就会减少自旋。
- 所谓自适应就意味着自旋的次数不再是固定的，它是由前一次在同一个锁上的自旋时间及锁的拥有者的状态来决定
- 线程如果自旋成功了，那么下次自旋的次数会更加多，因为虚拟机认为既然上次成功了，那么此次自旋也很有可能会再次成功，那么它就会允许自旋等待持续的次数更多。反之，如果对于某个锁，很少有自旋能够成功的，那么在以后要或者这个锁的时候自旋的次数会减少甚至省略掉自旋过程，以免浪费处理器资源。

### 锁粗化
- 我们知道在使用同步锁的时候，需要让同步块的作用范围尽可能小—仅在共享数据的实际作用域中才进行同步，这样做的目的是为了使需要同步的操作数量尽可能缩小，如果存在锁竞争，那么等待锁的线程也能尽快拿到锁。
- 在大多数的情况下，上述观点是正确的，LZ也一直坚持着这个观点。但是如果一系列的连续加锁解锁操作，可能会导致不必要的性能损耗，所以引入锁粗话的概念。
- 锁粗话概念比较好理解，就是将多个连续的加锁、解锁操作连接在一起，扩展成一个范围更大的锁。如：vector每次add的时候都需要加锁操作，JVM检测到对同一个对象（vector）连续加锁、解锁操作，会合并一个更大范围的加锁、解锁操作，即加锁解锁操作会移到for循环之外。

### 不同锁的比较
![输入图片说明](https://images.gitee.com/uploads/images/2019/0121/094206_5f316f33_1478371.png "在这里输入图片标题")


## 2. volatile关键字的理解
 **具有了以下两点特性：** 
- 1 . 保证了不同线程对该变量操作的内存可见性;
- 2 . 禁止指令重排序

### 内存可见性和是重排序
 **java内存模型（JMM）** 
- Java虚拟机规范试图定义一种Java内存模型（JMM）,来屏蔽掉各种硬件和操作系统的内存访问差异，让Java程序在各种平台上都能达到一致的内存访问效果。
- 简单来说，由于CPU执行指令的速度是很快的，但是内存访问的速度就慢了很多，相差的不是一个数量级，所以搞处理器的那群大佬们又在CPU里加了好几层高速缓存。
- 在Java内存模型里，对上述的优化又进行了一波抽象。JMM规定所有变量都是存在主存中的，类似于上面提到的普通内存，每个线程又包含自己的工作内存，方便理解就可以看成CPU上的寄存器或者高速缓存。所以线程的操作都是以工作内存为主，它们只能访问自己的工作内存，且工作前后都要把值在同步回主内存。

这么说得我自己都有些不清楚了，拿张纸画一下：
![输入图片说明](https://gitee.com/uploads/images/2018/0704/133856_52bf0ac2_1478371.png "clipboard.png")

在线程执行时，首先会从主存中read变量值，再load到工作内存中的副本中，然后再传给处理器执行，执行完毕后再给工作内存中的副本赋值，随后工作内存再把值传回给主存，主存中的值才更新。

使用工作内存和主存，虽然加快的速度，但是也带来了一些问题。比如看下面一个例子：

```
i = i + 1;
```
假设i初值为0，当只有一个线程执行它时，结果肯定得到1，当两个线程执行时，会得到结果2吗？这倒不一定了。可能存在这种情况：

![输入图片说明](https://gitee.com/uploads/images/2018/0704/134053_43aae32f_1478371.png "clipboard.png")



- 如果两个线程按照上面的执行流程，那么i最后的值居然是1了。如果最后的写回生效的慢，你再读取i的值，都可能是0，这就是缓存不一致问题。
- 下面就要提到你刚才问到的问题了，JMM主要就是围绕着如何在并发过程中如何处理原子性、可见性和有序性这3个特征来建立的，通过解决这三个问题，可以解除缓存不一致的问题。而volatile跟可见性和有序性都有关。


### 1.原子性(Atomicity)： 

Java中，对基本数据类型的读取和赋值操作是原子性操作，所谓原子性操作就是指这些操作是不可中断的，要做一定做完，要么就没有执行。 比如：

![输入图片说明](https://gitee.com/uploads/images/2018/0704/134216_1d4cdf07_1478371.png "clipboard.png")

- i=2是读取操作，必定是原子性操作，j=i你以为是原子性操作，其实吧，分为两步，一是读取i的值，然后再赋值给j,这就是2步操作了，称不上原子操作，i++和i = i + 1其实是等效的，读取i的值，加1，再写回主存，那就是3步操作了。所以上面的举例中，最后的值可能出现多种情况，就是因为满足不了原子性。只有简单的读取，赋值是原子操作，还只能是用数字赋值，用变量的话还多了一步读取变量值的操作。有个例外是虚拟机规范中允许对64位数据类型(long和double)，分为2次32为的操作来处理，但是最新JDK实现还是实现了原子操作的。
- JMM只实现了基本的原子性，像上面i++那样的操作，必须借助于synchronized和Lock来保证整块代码的原子性了。线程在释放锁之前，必然会把i的值刷回到主存的。


### 2.可见性(Visibility)：
- 说到可见性，Java就是利用volatile来提供可见性的。 当一个变量被volatile修饰时，那么对它的修改会立刻刷新到主存，当其它线程需要读取该变量时，会去内存中读取新值。而普通变量则不能保证这一点。
- 其实通过synchronized和Lock也能够保证可见性，线程在释放锁之前，会把共享变量值都刷回主存，但是synchronized和Lock的开销都更大。

### 3.有序性（Ordering）
JMM是允许编译器和处理器对指令重排序的，但是规定了as-if-serial语义，即不管怎么重排序，程序的执行结果不能改变。比如下面的程序段：

![输入图片说明](https://gitee.com/uploads/images/2018/0704/134324_6be6a576_1478371.png "clipboard.png")

- 上面的语句，可以按照A->B->C执行，结果为3.14,但是也可以按照B->A->C的顺序执行，因为A、B是两句独立的语句，而C则依赖于A、B，所以A、B可以重排序，但是C却不能排到A、B的前面。JMM保证了重排序不会影响到单线程的执行，但是在多线程中却容易出问题。


 **JMM具备一些先天的有序性,即不需要通过任何手段就可以保证的有序性，通常称为happens-before原则** 
1. 程序顺序规则： 一个线程中的每个操作，happens-before于该线程中的任意后续操作
1. 监视器锁规则：对一个线程的解锁，happens-before于随后对这个线程的加锁
1. volatile变量规则： 对一个volatile域的写，happens-before于后续对这个volatile域的读
1. 传递性：如果A happens-before B ,且 B happens-before C, 那么 A happens-before C
1. start()规则： 如果线程A执行操作ThreadB_start()(启动线程B) , 那么A线程的ThreadB_start()happens-before 于B中的任意操作
1. join()原则： 如果A执行ThreadB.join()并且成功返回，那么线程B中的任意操作happens-before于线程A从ThreadB.join()操作成功返回。
1. interrupt()原则： 对线程interrupt()方法的调用先行发生于被中断线程代码检测到中断事件的发生，可以通过Thread.interrupted()方法检测是否有中断发生
1. finalize()原则：一个对象的初始化完成先行发生于它的finalize()方法的开始

- 第1条规则程序顺序规则是说在一个线程里，所有的操作都是按顺序的，但是在JMM里其实只要执行结果一样，是允许重排序的，这边的happens-before强调的重点也是单线程执行结果的正确性，但是无法保证多线程也是如此。

- 第2条规则监视器规则其实也好理解，就是在加锁之前，确定这个锁之前已经被释放了，才能继续加锁。

- 第3条规则，就适用到所讨论的volatile，如果一个线程先去写一个变量，另外一个线程再去读，那么写入操作一定在读操作之前。
- 
- 第4条规则，就是happens-before的传递性。

### volatile如何满足并发的三大特性

- 如果一个变量声明成是volatile的，那么当我读变量时，总是能读到它的最新值，这里最新值是指不管其它哪个线程对该变量做了写操作，都会立刻被更新到主存里，我也能从主存里读到这个刚写入的值。也就是说volatile关键字可以保证可见性以及有序性。

 **从内存语义上来看** 
- 当写一个volatile变量时，JMM会把该线程对应的本地内存中的共享变量刷新到主内存
- 当读一个volatile变量时，JMM会把该线程对应的本地内存置为无效，线程接下来将从主内存中读取共享变量。
 
 **volatile的两点内存语义能保证可见性和有序性，但是能保证原子性吗？** 

首先我回答是不能保证原子性，要是说能保证，也只是对单个volatile变量的读/写具有原子性，但是对于类似volatile++这样的复合操作就无能为力了，比如下面的例子：

![输入图片说明](https://gitee.com/uploads/images/2018/0704/134603_2e750e61_1478371.png "clipboard.png")

- 按道理来说结果是10000，但是运行下很可能是个小于10000的值。有人可能会说volatile不是保证了可见性啊，一个线程对inc的修改，另外一个线程应该立刻看到啊！可是这里的操作inc++是个复合操作啊，包括读取inc的值，对其自增，然后再写回主存。

- 假设线程A，读取了inc的值为10，这时候被阻塞了，因为没有对变量进行修改，触发不了volatile规则。
- 线程B此时也读读inc的值，主存里inc的值依旧为10，做自增，然后立刻就被写回主存了，为11。

- 有人说，volatile不是会使缓存行无效的吗？但是这里线程A读取到线程B也进行操作之前，并没有修改inc值，所以线程B读取的时候，还是读的10。
- 又有人说，线程B将11写回主存，不会把线程A的缓存行设为无效吗？但是线程A的读取操作已经做过了啊，只有在做读取操作时，发现自己缓存行无效，才会去读主存的值，所以这里线程A只能继续做自增了。

综上所述，在这种复合操作的情景下，原子性的功能是维持不了了。但是volatile在上面那种设置flag值的例子里，由于对flag的读/写操作都是单步的，所以还是能保证原子性的。

要想保证原子性，只能借助于synchronized,Lock以及并发包下的atomic的原子操作类了，即对基本数据类型的 自增（加1操作），自减（减1操作）、以及加法操作（加一个数），减法操作（减一个数）进行了封装，保证这些操作是原子性操作。

### volatile底层的实现机制
- 如果把加入volatile关键字的代码和未加入volatile关键字的代码都生成汇编代码，会发现加入volatile关键字的代码会多出一个lock前缀指令。

 **lock前缀指令实际相当于一个内存屏障，内存屏障提供了以下功能：** 
- 1   重排序时不能把后面的指令重排序到内存屏障之前的位置
- 2 . 使得本CPU的Cache写入内存
- 3 . 写入动作也会引起别的CPU或者别的内核无效化其Cache，相当于让新写入的值对别的线程可见。

![输入图片说明](https://gitee.com/uploads/images/2018/0704/134745_53217997_1478371.png "clipboard.png")
 
## 3.  ConcurrentHashMap 实现原理

由于 `HashMap` 是一个线程不安全的容器，主要体现在容量大于`总量*负载因子`发生扩容时会出现环形链表从而导致死循环。

因此需要支持线程安全的并发容器 `ConcurrentHashMap` 。

###  数据结构
![](https://images.gitee.com/uploads/images/2019/0121/095417_399ccee0_1478371.jpeg)

如图所示，是由 `Segment` 数组、`HashEntry` 数组组成，和 `HashMap` 一样，仍然是数组加链表组成。

`ConcurrentHashMap` 采用了分段锁技术，其中 `Segment` 继承于 `ReentrantLock`。不会像 `HashTable` 那样不管是 `put` 还是 `get` 操作都需要做同步处理，理论上 ConcurrentHashMap 支持 `CurrencyLevel` (Segment 数组数量)的线程并发。每当一个线程占用锁访问一个 `Segment` 时，不会影响到其他的 `Segment`。

### get 方法
`ConcurrentHashMap` 的 `get` 方法是非常高效的，因为整个过程都不需要加锁。

只需要将 `Key` 通过 `Hash` 之后定位到具体的 `Segment` ，再通过一次 `Hash` 定位到具体的元素上。由于 `HashEntry` 中的 `value` 属性是用 `volatile` 关键词修饰的，保证了内存可见性，所以每次获取时都是最新值([volatile 相关知识点](https://github.com/crossoverJie/Java-Interview/blob/master/MD/Threadcore.md#%E5%8F%AF%E8%A7%81%E6%80%A7))。

### put 方法

内部 `HashEntry` 类 ：
```java
    static final class HashEntry<K,V> {
        final int hash;
        final K key;
        volatile V value;
        volatile HashEntry<K,V> next;

        HashEntry(int hash, K key, V value, HashEntry<K,V> next) {
            this.hash = hash;
            this.key = key;
            this.value = value;
            this.next = next;
        }
    }
```

虽然 HashEntry 中的 value 是用 `volatile` 关键词修饰的，但是并不能保证并发的原子性，所以 put 操作时仍然需要加锁处理。

首先也是通过 Key 的 Hash 定位到具体的 Segment，在 put 之前会进行一次扩容校验。这里比 HashMap 要好的一点是：HashMap 是插入元素之后再看是否需要扩容，有可能扩容之后后续就没有插入就浪费了本次扩容(扩容非常消耗性能)。

而 ConcurrentHashMap 不一样，它是先将数据插入之后再检查是否需要扩容，之后再做插入。

### size 方法

每个 `Segment` 都有一个 `volatile` 修饰的全局变量 `count` ,求整个 `ConcurrentHashMap` 的 `size` 时很明显就是将所有的 `count` 累加即可。但是 `volatile` 修饰的变量却不能保证多线程的原子性，所有直接累加很容易出现并发问题。

但如果每次调用 `size` 方法将其余的修改操作加锁效率也很低。所以做法是先尝试两次将 `count` 累加，如果容器的 `count` 发生了变化再加锁来统计 `size`。

至于 `ConcurrentHashMap` 是如何知道在统计时大小发生了变化呢，每个 `Segment` 都有一个 `modCount` 变量，每当进行一次 `put remove` 等操作，`modCount` 将会 +1。只要 `modCount` 发生了变化就认为容器的大小也在发生变化。


## 4. 什么是死锁
 **死锁：是指两个或两个以上的进程在执行过程中，因争夺资源而造成的一种互相等待的现象，若无外力作用，它们都将无法推进下去。此时称系统处于死锁状态或系统产生了死锁，这些永远在互相等待的进程称为死锁进程。 由于资源占用是互斥的，当某个进程提出申请资源后，使得有关进程在无外力协助下，永远分配不到必需的资源而无法继续运行，这就产生了一种特殊现象：死锁。”** 


```
public class MyTestSiSuo {
 
    private static  Object o1 = new Object();
    private static  Object o2 = new Object();
    
    public static void main(String[] args) {
        
        Thread t1 = new Thread(){
            @Override
            public void run(){
                //抢占资源 o1
                synchronized (o1) {
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    System.out.println("t1 ---Get o1");
                    
                    //需要资源o2 但是 t2 独占(未释放) -->互相竞争资源-->死锁
                    synchronized(o2){
                        System.out.println("t1 ---Get o2");
                    }
                    
                    
                }
            }
            
        };
        
        
        Thread t2 = new Thread(){
            @Override
            public void run(){
                //抢占资源o2
                synchronized (o2) {
                    System.out.println("t2 ---Get o2");
                    
                    //需要资源 o1,但是 t1 独占(未释放) -->互相竞争资源-->死锁
                    synchronized (o1) {
                        System.out.println("t2 ---Get o1");
                    }
                }
                
            }
            
        };
        
        
        t1.start();
        t2.start();
        
        
                
    }
    
 
}

```
 **实现过程：** 
- 有公共资源o1,o2;程序开始，线程t2抢占资源o2,在同步代码块中，o1也被抢占；线程t1睡眠等待1000ms；
- t2在需要资源o1时，此时发现被t1独占，而t1此时睡眠醒来，需要资源o2，发现被t2独占；由此，产生 死锁；


## 5. 什么是AQS
Java并发包（JUC）中提供了很多并发工具，这其中，很多我们耳熟能详的并发工具，譬如ReentrangLock、Semaphore，它们的实现都用到了一个共同的基类--AbstractQueuedSynchronizer,简称AQS。AQS是一个用来构建锁和同步器的框架

### AQS的基本实现原理
AQS使用一个int成员变量来表示同步状态，通过内置的FIFO队列来完成获取资源线程的排队工作。

```
  private volatile int state;//共享变量，使用volatile修饰保证线程可见性
```
状态信息通过procted类型的getState，setState，compareAndSetState进行操作

### AQS支持两种同步方式
1. 独占式
1. 共享式
- 独占式如ReentrantLock，共享式如Semaphore，CountDownLatch，组合式的如ReentrantReadWriteLock。总之，AQS为使用提供了底层支撑，如何组装实现，使用者可以自由发挥。

 **同步器的设计是基于模板方法模式的，一般的使用方式是这样：** 
1. 使用者继承AbstractQueuedSynchronizer并重写指定的方法。（这些重写方法很简单，无非是对于共享资源state的获取和释放）
1. 将AQS组合在自定义同步组件的实现中，并调用其模板方法，而这些模板方法会调用使用者重写的方法。

 **AQS定义的这些可重写的方法：** 
1. `protected boolean tryAcquire(int arg)` : 独占式获取同步状态，试着获取，成功返回true，反之为false
1.` protected boolean tryRelease(int arg)` ：独占式释放同步状态，等待中的其他线程此时将有机会获取到同步状态；
1. `protected int tryAcquireShared(int arg)` ：共享式获取同步状态，返回值大于等于0，代表获取成功；反之获取失败；
1. `protected boolean tryReleaseShared(int arg)` ：共享式释放同步状态，成功为true，失败为false
1. `protected boolean isHeldExclusively()` ： 是否在独占模式下被线程占用。

### 如何使用AQS
- 首先，我们需要去继承AbstractQueuedSynchronizer这个类，然后我们根据我们的需求去重写相应的方法，比如要实现一个独占锁，那就去重写tryAcquire，tryRelease方法，要实现共享锁，就去重写tryAcquireShared，tryReleaseShared；最后，在我们的组件中调用AQS中的模板方法就可以了，而这些模板方法是会调用到我们之前重写的那些方法的。也就是说，我们只需要很小的工作量就可以实现自己的同步组件，重写的那些方法，仅仅是一些简单的对于共享资源state的获取和释放操作，至于像是获取资源失败，线程需要阻塞之类的操作，自然是AQS帮我们完成了。

 **自定义同步器代码实现** 

```
package com.example.AQS;

import java.io.Serializable;
import java.util.concurrent.locks.AbstractQueuedSynchronizer;

/**
 * 基于AQS 实现自定义同步器<br>
 * @author qinxuewu
 * @create 18/7/14下午1:23
 * @since 1.0.0
 */


public class Mutex implements Serializable {

    //静态内部类 继承AQS
    private  static class Sync extends AbstractQueuedSynchronizer{
        //是否处于占用状态
        @Override
        protected boolean isHeldExclusively(){
            return getState()==1;
        }

        //当状态为0的时候获取锁，CAS操作成功，则state状态为1，
        @Override
        protected boolean tryAcquire(int arg) {
            if (compareAndSetState(0, 1)) {
                 setExclusiveOwnerThread(Thread.currentThread());
                 return true;
             }
                return false;
        }

        //释放锁，将同步状态置为0
        @Override
       protected boolean tryRelease(int releases) {
               if (getState() == 0) throw new IllegalMonitorStateException();
                  setExclusiveOwnerThread(null);
                   setState(0);
                   return true;
        }
    }

    //同步对象完成一系列复杂的操作，我们仅需指向它即可
    private final Sync sync = new Sync();
    //加锁操作，代理到acquire（模板方法）上就行，acquire会调用我们重写的tryAcquire方法
    public void lock() {
        sync.acquire(1);
    }
    public boolean tryLock() {
        return sync.tryAcquire(1);
    }
    //释放锁，代理到release（模板方法）上就行，release会调用我们重写的tryRelease方法。
    public void unlock() {
        sync.release(1);
    }
    public boolean isLocked() {
        return sync.isHeldExclusively();
    }
}

```

```
package com.example.AQS;

import java.util.concurrent.CyclicBarrier;

/**
 * @author qinxuewu
 * @create 18/7/14下午1:44
 * @since 1.0.0
 */


public class TestMutex {
    //CyclicBarrier是一个同步工具类，它允许一组线程互相等待，直到到达某个公共屏障点
    private static CyclicBarrier barrier = new CyclicBarrier(31);
    private static int a = 0;
    private static  Mutex mutex = new Mutex();


    public static void main(String []args) throws Exception {
        //说明:我们启用30个线程，每个线程对i自加10000次，同步正常的话，最终结果应为300000；
        //未加锁前
        for(int i=0;i<30;i++){
            Thread t = new Thread(new Runnable() {
                @Override
                public void run() {
                    for(int i=0;i<10000;i++){
                        increment1();//没有同步措施的a++；
                    }
                    try {
                        // barrier的await方法，在所有参与者都已经在此 barrier 上调用 await 方法之前，将一直等待。
                        barrier.await();//等30个线程累加完毕
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            });
            t.start();
        }
        barrier.await();
        System.out.println("加锁前，a="+a);

        //加锁后
        barrier.reset();//重置CyclicBarrier
        a=0;
        for(int i=0;i<30;i++){
            new Thread(new Runnable() {
                @Override
                public void run() {
                    for(int i=0;i<10000;i++){
                        increment2();//a++采用Mutex进行同步处理
                    }
                    try {
                        barrier.await();//等30个线程累加完毕
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }).start();
        }
        barrier.await();
        System.out.println("加锁后，a="+a);
    }
    /**
     * 没有同步措施的a++
     * @return
     */
    public static void increment1(){
        a++;
    }
    /**
     * 使用自定义的Mutex进行同步处理的a++
     */
    public static void increment2(){
        mutex.lock();
        a++;
        mutex.unlock();
    }
}

```



## 6. 什么是CAS
- CAS（Compare and Swap），即比较并替换，实现并发算法时常用到的一种技术，Doug lea大神在java同步器中大量使用了CAS技术，鬼斧神工的实现了多线程执行的安全性。
- CAS的思想很简单：三个参数，一个当前内存值V、旧的预期值A、即将更新的值B，当且仅当预期值A和内存值V相同时，将内存值修改为B并返回true，否则什么都不做，并返回false。

### 一个n++的问题

```
public class Case {
 
    public volatile int n;
 
    public void add() {
        n++;
    }
}
```
通过javap -verbose Case看看add方法的字节码指令

```
public void add();
    flags: ACC_PUBLIC
    Code:
      stack=3, locals=1, args_size=1
         0: aload_0       
         1: dup           
         2: getfield      #2                  // Field n:I
         5: iconst_1      
         6: iadd          
         7: putfield      #2                  // Field n:I
```

n++被拆分成了几个指令：

- 执行getfield拿到原始n；
- 执行iadd进行加1操作；
- 执行putfield写把累加后的值写回n；

通过volatile修饰的变量可以保证线程之间的可见性，但并不能保证这3个指令的原子执行，在多线程并发执行下，无法做到线程安全，得到正确的结果，那么应该如何解决呢？在add方法加上synchronized修饰解决，但是性能上差了点，除了低性能的加锁方案，我们还可以使用JDK自带的CAS方案，在CAS中，比较和替换是一组原子操作，不会被外部打断，且在性能上更占有优势。




 **在JDK 5之前Java语言是靠synchronized关键字保证同步的，这会导致有锁** 
锁机制存在以下问题：

（1）在多线程竞争下，加锁、释放锁会导致比较多的上下文切换和调度延时，引起性能问题。

（2）一个线程持有锁会导致其它所有需要此锁的线程挂起。

（3）如果一个优先级高的线程等待一个优先级低的线程释放锁会导致优先级倒置，引起性能风险。

volatile是不错的机制，但是volatile不能保证原子性。因此对于同步最终还是要回到锁机制上来。

独占锁是一种悲观锁，`synchronized`就是一种独占锁，会导致其它所有需要锁的线程挂起，等待持有锁的线程释放锁。而另一个更加有效的锁就是乐观锁。所谓乐观锁就是，每次不加锁而是假设没有冲突而去完成某项操作，如果因为冲突失败就重试，直到成功为止。乐观锁用到的机制就是CAS，Compare and Swap。

### 并发之CAS操作

- CAS即compare and set的缩写。常见于java.util.concurrent中，是构成concurrent包的基础。
- CAS有三个操作数，内存值M，旧的预期(expect)值E和更新(update)值U。在CAS操作中，只有当M==E时，才会更新U。否则什么都不做。这些操作都是原子的。

### CAS缺点

- ABA问题。 CAS操作更新的基础是如果值没有变化则更新，若有变化则不更新。但如若有一值刚开始是A，然后变为B，最后又变为A。那么CAS检查时发现它没有变化就更新了，但实际上却是已经发生了变化。
- CAS自旋。自旋CAS如果长时间不成功，会给CPU带来非常大的执行开销。 
- 只能保证一个共享变量的原子操作。当对一个共享变量执行操作时，我们可以使用循环CAS的方式来保证原子操作，但是对多个共享变量操作时，循环CAS就无法保证操作的原子性。

### 1.偏向锁

- 大多数情况下，锁不仅不存在多线程竞争，而且总是由同一线程多次获得，为了让线程获得锁的代价更低而引入了偏向锁
- 当一个线程访问同步块并获取锁时，会在对象头和栈帧中的锁记录里存储锁偏向的线程ID，以后该线程在进入和退出同步块时不需要进行CAS操作来加锁和解锁
- 偏向锁使用了一种等到竞争出现才释放锁的机制，所以当其他线程尝试竞争偏向锁时，持有偏向锁的线程才会释放锁。
- 偏向锁的撤销，需要等待全局安全点（在这个时间点上没有正
在执行的字节码）。它会首先暂停拥有偏向锁的线程，然后检查持有偏向锁的线程是否活着，如果线程不处于活动状态，则将对象头设置成无锁状态；如果线程仍然活着，拥有偏向锁的栈会被执行，遍历偏向对象的锁记录，栈中的锁记录和对象头的MarkWord要么重新偏向于其他线程，要么恢复到无锁或者标记对象不适合作为偏向锁，最后唤醒暂停的线程。
- 偏向锁在Java 6和Java7里是默认启用的，但是它在应用程序启动几秒钟之后才激活，如有必要可以使用JVM参数来关闭延迟：-XX:BiasedLockingStartupDelay=0。如果你确定应用程序里所有的锁通常情况下处于竞争状态，可以通过JVM参数关闭偏向锁：-XX:-UseBiasedLocking=false，那么程序默认会进入轻量级锁状态

### 2.轻量级锁
- 线程在执行同步块之前，JVM会先在当前线程的栈桢中创建用于存储锁记录的空间，并将对象头中的MarkWord复制到锁记录中然后线程尝试使用CAS将对象头中的MarkWord替换为指向锁记录的指针。如果成功，当前线程获得锁，如果失败，表示其他线程竞争锁，当前线程便尝试使用自旋来获取锁

- 轻量级解锁时，会使用原子的CAS操作将Displaced Mark Word替换回到对象头，如果成功，则表示没有竞争发生。如果失败，表示当前锁存在竞争，锁就会膨胀成重量级锁。


### 3.锁的优缺点对比

锁 | 优点 |缺点 | 适用场景
---|---     |        ---|---
偏向锁  |加锁和解锁不需要额外的消耗，和执行非同步方法相比仅存在纳秒级的差距| 如果线程间存在锁竞争，会带来额外的锁撤销的消耗 | 适用于只有一个线程访问同步场景
轻量级锁 | 竞争的线程不会阻塞，提高了程序的响应速度| 如果始终得不到锁竞争的线程，适用自旋消耗CPU| 追求响应时间，同步块执行速度非常快
重量级锁 |线程竞争不使用自旋，不会消耗CPU|线程阻塞，响应时间缓慢| 追求吞吐量 同步块执行速度较长

## 7. CountDownLatch 
CountDownLatch 允许一个或多个线程等待其他线程完成操作。

### 应用场景
假如有这样一个需求，当我们需要解析一个Excel里多个sheet的数据时，可以考虑使用多线程，每个线程解析一个sheet里的数据，等到所有的sheet都解析完之后，程序需要提示解析完成。在这个需求中，要实现主线程等待所有线程完成sheet的解析操作，最简单的做法是使用join。代码如下：

```
public static void main(String[] args) throws InterruptedException {
    Thread t1=new
            Thread(() -> System.out.println(Thread.currentThread().getName()+" finish"));
    Thread t2=new 
            Thread(() -> System.out.println(Thread.currentThread().getName()+" finish"));
    t1.start();
    t2.start();
    t1.join();
    t2.join();
    System.out.println("所有线程执行完毕 主线程执行。。。。。。。。。。。。");       
}

输出：

Thread-0 finish
Thread-1 finish
所有线程执行完毕 主线程执行。。。。。。。。。。。。
```
- join用于让当前执行线程等待join线程执行结束。其实现原理是不停检查join线程是否存活，如果join线程存活则让当前线程永远wait
- 直到join线程中止后，线程的this.notifyAll会被调用，调用notifyAll是在JVM里实现的，所以JDK里看不到，可以看看JVM源码。JDK不推荐在线程实例上使用wait，notify和notifyAll方法。


 **JDK1.5之后的并发包中提供的CountDownLatch也可以实现join的这个功能，并且比join的功能更多** 

```
public class CountDownLatchTest {
    static CountDownLatch c=new CountDownLatch(2);
    public static void main(String[] args) throws InterruptedException {
        new Thread(() ->{
             System.out.println(1);
             c.countDown();
             System.out.println(2);
             c.countDown();
        }).start();
         c.await();
         System.out.println("3");
    }
}
```
CountDownLatch的构造函数接收一个int类型的参数作为计数器，如果你想等待N个点完成，这里就传入N。


- 当我们调用一次`CountDownLatch`的`countDown`方法时，`N`就会减1，CountDownLatch的await会阻塞当前线程，直到N变成零。由于countDown方法可以用在任何地方，所以这里说的N个点，可以是N个线程，也可以是1个线程里的N个执行步骤。用在多个线程时，你只需要把这个CountDownLatch的引用传递到线程里。

### 其他方法
如果有某个解析sheet的线程处理的比较慢，我们不可能让主线程一直等待，所以我们可以使用另外一个带指定时间的await方法
```
这个方法等待特定时间后，就会不再阻塞当前线程。join也有类似的方法。

await(long time, TimeUnit unit): 
```
- 注意：计数器必须大于等于0，只是等于0时候，计数器就是零，调用await方法时不会阻塞当前线程。CountDownLatch不可能重新初始化或者修改CountDownLatch对象的内部计数器的值。一个线程调用countDown方法 happen-before 另外一个线程调用await方法。

## 8.  同步屏障CyclicBarrier
- CyclicBarrier 的字面意思是可循环使用（Cyclic）的屏障（Barrier）。它要做的事情是，让一组线程到达一个屏障（也可以叫同步点）时被阻塞，直到最后一个线程到达屏障时，屏障才会开门，所有被屏障拦截的线程才会继续干活。CyclicBarrier默认的构造方法是CyclicBarrier(int parties)，其参数表示屏障拦截的线程数量，每个线程调用await方法告诉CyclicBarrier我已经到达了屏障，然后当前线程被阻塞。

```
public class CyclicBarrierTest {
    static CyclicBarrier c=new CyclicBarrier(2);
    public static void main(String[] args) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                     c.await();
                } catch (Exception e) {
                }
                 System.out.println(1);
            }
        }).start();
        
        try {
             c.await();
        } catch (Exception e) {
        }
         System.out.println(2);
    }
}

输出：2 1

如果把new CyclicBarrier(2)修改成new CyclicBarrier(3)则主线程和子线程会永远等待，因为没有第三个线程执行await方法，即没有第三个线程到达屏障，所以之前到达屏障的两个线程都不会继续执行。

```
CyclicBarrier的内部是使用重入锁ReentrantLock和Condition。它有两个构造函数：
- CyclicBarrier(int parties)：创建一个新的 CyclicBarrier，它将在给定数量的参与者（线程）处于等待状态时启动，但它不会在启动 barrier 时执行预定义的操作。
- CyclicBarrier还提供一个更高级的构造函数CyclicBarrier(int parties, Runnable barrierAction)，用于在线程到达屏障时，优先执行barrierAction，方便处理更复杂的业务场景

代码如下：

```
public class CyclicBarrierTest2 {
    static class A implements Runnable{
        @Override
        public void run() {
             System.out.println(3); 
        }
    }
    static CyclicBarrier c=new CyclicBarrier(2, new A());
    
    public static void main(String[] args) {
        new Thread(new Runnable(){
            @Override
            public void run() {
                try {
                    c.await();
                } catch (Exception e) {                 
                }
                 System.out.println(1);
            }
        }).start();
        
        try {
            c.await();
        } catch (Exception e) {     
        }
            System.out.println(2);

    }

}

输出：3 1 2

```
### CyclicBarrier的应用场景
- CyclicBarrier可以用于多线程计算数据，最后合并计算结果的应用场景。比如我们用一个Excel保存了用户所有银行流水，每个Sheet保存一个帐户近一年的每笔银行流水，现在需要统计用户的日均银行流水，先用多线程处理每个sheet里的银行流水，都执行完之后，得到每个sheet的日均银行流水，最后，再用barrierAction用这些线程的计算结果，计算出整个Excel的日均银行流水。

应用示例 比如我们开会只有等所有的人到齐了才会开会，如下：

```
package com.example.lock;
import java.util.concurrent.CyclicBarrier;
/**
 *  CyclicBarrier试用与多线程结果合并的操作，用于多线程计算数据，最后合并计算结果的应用场景
 *  比如我们需要统计多个Excel中的数据，然后等到一个总结果。我们可以通过多线程处理每一个Excel，执行完成后得到相应的结果，
 *  最后通过barrierAction来计算这些线程的计算结果，得到所有Excel的总和。 
 * @author qxw
 * @data 2018年7月26日下午3:00:49
 */
public class CyclicBarrierTest3 {

    private static CyclicBarrier cyclicBarrier;
    
    static class CyclicBarrierThread extends Thread{
        @Override
        public void run() {
            System.out.println(Thread.currentThread().getName()+"到了");
            try {
                cyclicBarrier.await();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
    //应用示例 比如我们开会只有等所有的人到齐了才会开会，如下：
    public static void main(String[] args) {
        cyclicBarrier=new CyclicBarrier(5, new Runnable() {         
            @Override
            public void run() {
                    System.out.println("人到齐了 开会吧....");
                
            }
        });
        
        for (int i = 0; i <5; i++) {
            new CyclicBarrierThread().start();
        }
    }}



```
运行结果：

![输入图片说明](https://images.gitee.com/uploads/images/2018/0726/151054_8c6b0b98_1478371.png "屏幕截图.png")

在CyclicBarrier中最重要的方法莫过于await()方法，在所有参与者都已经在此 barrier 上调用 await 方法之前，将一直等待。

![输入图片说明](https://images.gitee.com/uploads/images/2018/0726/145223_d2deafdc_1478371.png "屏幕截图.png")

await()方法内部调用dowait(boolean timed, long nanos)方法：

其实await()的处理逻辑还是比较简单的：如果该线程不是到达的最后一个线程，则他会一直处于等待状态，除非发生以下情况：

![输入图片说明](https://images.gitee.com/uploads/images/2018/0726/145317_2332e0eb_1478371.png "屏幕截图.png")


### CyclicBarrier和CountDownLatch的区别
- CountDownLatch的计数器只能使用一次。而CyclicBarrier的计数器可以使用reset() 方法重置。所以CyclicBarrier能处理更为复杂的业务场景，比如如果计算发生错误，可以重置计数器，并让线程们重新执行一次。
- CyclicBarrier还提供其他有用的方法，比如getNumberWaiting方法可以获得CyclicBarrier阻塞的线程数量。isBroken方法用来知道阻塞的线程是否被中断。

比如以下代码执行完之后会返回true。

```
public class CyclicBarrierTest4 {
    static CyclicBarrier c = new CyclicBarrier(2);
    public static void main(String[] args) {
        Thread thread=new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    c.await();
                } catch (Exception e) {
                    // TODO: handle exception
                }
                
            }
        });
        thread.start();
        thread.interrupt();

        try {
            c.await();
        } catch (Exception e) {
             System.out.println(c.isBroken());
        }
    }
}
```

##  9. 并发工具类Exchanger
Exchanger，它允许在并发任务之间交换数据。具体来说，Exchanger类允许在两个线程之间定义同步点。当两个线程都到达同步点时，他们交换数据结构，因此第一个线程的数据结构进入到第二个线程中，第二个线程的数据结构进入到第一个线程中。

### 应用示例 

```
public class ExchangerTest {
    
     static class Producer implements Runnable{

        //生产者、消费者交换的数据结构
         private List<String> buffer;

        //生产者和消费者的交换对象
         private Exchanger<List<String>> exchanger;
         
         Producer(List<String> buffer,Exchanger<List<String>> exchanger){
             this.buffer=buffer;
             this.exchanger=exchanger;
         }
         
         
         
        @Override
        public void run() {
            for (int i = 0; i < 5; i++) {
                System.out.println("生产者第" +i +"次提供");
                for (int j = 0; j <=3; j++) {
                    System.out.println("生产者装入"+ i  +  "--" + j);
                    buffer.add("buffer :"+i +"--"+j);
                }
                System.out.println("生产者装满,等待与消费者交换....");
                
                try {
                    exchanger.exchange(buffer);
                } catch (InterruptedException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
            }
            
        }
         
     }
    
     static class Consumer implements Runnable{
         private List<String> buffer;
         private Exchanger<List<String>> exchanger;
         
         Consumer(List<String> buffer,Exchanger<List<String>> exchanger){
             this.buffer=buffer;
             this.exchanger=exchanger;
         }
         
        @Override
        public void run() {
            for (int i = 0; i < 5; i++) {
                //调用exchange()与消费者进行数据交换
                try {
                    buffer=exchanger.exchange(buffer);
                } catch (InterruptedException e) {
                    // TODO Auto-generated catch block
                    e.printStackTrace();
                }
                System.out.println("消费者第" + i + "次提取");
                for (int j = 0; j <=3; j++) {
                    System.out.println("消费者： "+buffer.get(0));
                    buffer.remove(0);
                }
            }    
            
        }
         
     }
    
     public static void main(String[] args) {
        List<String> buffer1=new ArrayList<String>();
        List<String> buffer2=new ArrayList<String>();
        Exchanger<List<String>> exchanger=new Exchanger<>();
        
        Thread t1=new Thread(new  Producer(buffer1, exchanger));
        Thread t2=new Thread(new  Consumer(buffer2, exchanger));
        t1.start();
        t2.start();
    }
}

```
- 首先生产者Producer、消费者Consumer首先都创建一个缓冲列表，通过Exchanger来同步交换数据。消费中通过调用Exchanger与生产者进行同步来获取数据，而生产者则通过for循环向缓存队列存储数据并使用exchanger对象消费者同步。到消费者从exchanger哪里得到数据后，他的缓冲列表中有3个数据，而生产者得到的则是一个空的列表。上面的例子充分展示了消费者-生产者是如何利用Exchanger来完成数据交换的。

在Exchanger中，如果一个线程已经到达了exchanger节点时，对于它的伙伴节点的情况有三种:
1. 如果它的伙伴节点在该线程到达之前已经调用了exchanger方法，则它会唤醒它的伙伴然后进行数据交换，得到各自数据返回。


1. 如果它的伙伴节点还没有到达交换点，则该线程将会被挂起，等待它的伙伴节点到达被唤醒，完成数据交换。
1. 如果当前线程被中断了则抛出异常，或者等待超时了，则抛出超时异常。



## 10.  控制并发线程数Semaphore
- Semaphore（信号量）是用来控制同时访问特定资源的线程数量，它通过协调各个线程，以保证合理的使用公共资源。很多年以来，我都觉得从字面上很难理解Semaphore所表达的含义，只能把它比作是控制流量的红绿灯，比如XX马路要限制流量，只允许同时有一百辆车在这条路上行使，其他的都必须在路口等待，所以前一百辆车会看到绿灯，可以开进这条马路，后面的车会看到红灯，不能驶入XX马路，但是如果前一百辆中有五辆车已经离开了XX马路，那么后面就允许有5辆车驶入马路，这个例子里说的车就是线程，驶入马路就表示线程在执行，离开马路就表示线程执行完成，看见红灯就表示线程被阻塞，不能执行。

### 构造函数
- Semaphore(int permits) ：创建具有给定的许可数和非公平的公平设置的 Semaphore。
- Semaphore(int permits, boolean fair) ：创建具有给定的许可数和给定的公平设置的 Semaphore。

![输入图片说明](https://images.gitee.com/uploads/images/2018/0727/133123_0786a3a1_1478371.png "屏幕截图.png")

 **Semaphore默认选择非公平锁。** 

当信号量Semaphore = 1 时，它可以当作互斥锁使用。其中0、1就相当于它的状态，当=1时表示其他线程可以获取，当=0时，排他，即其他线程必须要等待。



### 应用场景
- Semaphore可以用于做流量控制，特别公用资源有限的应用场景。比如数据库连接。假如有一个需求，要读取几万个文件的数据，因为都是IO密集型任务，我们可以启动几十个线程并发的读取，但是如果读到内存后，还需要存储到数据库中，而数据库的连接数只有10个，这时我们必须控制只有十个线程同时获取数据库连接保存数据，否则会报错无法获取数据库连接。

这个时候，我们就可以使用Semaphore来做流控，代码如下：

```
public class SemaphoreTest {

    private static final int SIZE=5;
    //创建固定数量的线程池
    private static  ExecutorService threadPool=Executors.newFixedThreadPool(SIZE);  
    //允许并发的线程数
    private static Semaphore s = new Semaphore(3);

    public static void main(String[] args) {
        for (int i = 0; i < SIZE; i++) {
            threadPool.execute(new Runnable() {
                @Override
                public void run() {
                    try {
                        //获取取一个许可证
                        s.acquire();
                        long time=(long)(Math.random()*10);
//                      System.out.println("此信号量中当前可用的许可证数:  "+s.availablePermits());
//                      System.out.println("正在等待获取许可证的线程数:  "+s.getQueueLength());
//                      System.out.println("是否有线程正在等待获取许可证:  "+s.hasQueuedThreads());
                        System.out.println(Thread.currentThread().getName()+"  从内存中读取存储到数据库耗时 ："+time+"秒。。。。");
                        Thread.sleep(time);                     
                        System.out.println(Thread.currentThread().getName()+" 释放数据库链接");                        
                    } catch (Exception e) {
                        e.printStackTrace();
                    }finally{
                        //使用完之后调用release()归还许可证。还可以用tryAcquire()方法尝试获取许可证。
                        s.release();
                    }
                }
            });
        }
         threadPool.shutdown();
    }
}
```
- 在代码中，虽然有5个线程在执行，但是只允许3个并发的执行。Semaphore的构造方法Semaphore(int permits) 接受一个整型的数字，表示可用的许可证数量。Semaphore(3)表示允许3个线程获取许可证，也就是最大并发数是3。Semaphore的用法也很简单，首先线程使用Semaphore的acquire()获取一个许可证，使用完之后调用release()归还许可证。还可以用tryAcquire()方法尝试获取许可证。


```
Semaphore还提供一些其他方法：

int availablePermits() ：返回此信号量中当前可用的许可证数。
int getQueueLength()：返回正在等待获取许可证的线程数。
boolean hasQueuedThreads() ：是否有线程正在等待获取许可证。
void reducePermits(int reduction) ：减少reduction个许可证。是个protected方法。
Collection getQueuedThreads() ：返回所有等待获取许可证的线程集合。是个protected方法。
```

## 11. 乐观锁与悲观锁

### 乐观锁
- 总是认为不会产生并发问题，每次去取数据的时候总认为不会有其他线程对数据进行修改，因此不会上锁，但是在更新时会判断其他线程在这之前有没有对数据进行修改，一般会使用版本号机制或CAS操作实现。
- version方式：一般是在数据表中加上一个数据版本号version字段，表示数据被修改的次数，当数据被修改时，version值会加一。当线程A要更新数据值时，在读取数据的同时也会读取version值，在提交更新时，若刚才读取到的version值为当前数据库中的version值相等时才更新，否则重试更新操作，直到更新成功。

 **核心SQL代码：** 

```
update table set x=x+1, version=version+1 where id=#{id} and version=#{version};  
```
- CAS操作方式：即compare and swap(比较并交换) 或者 compare and set，涉及到三个操作数，数据所在的内存值，预期值，新值。当需要更新时，判断当前内存值与之前取到的值是否相等，若相等，则用新值更新，若失败则重试，一般情况下是一个自旋操作，即不断的重试。

### 悲观锁
- 总是假设最坏的情况，每次取数据时都认为其他线程会修改，所以都会加锁（读锁、写锁、行锁等），当其他线程想要访问数据时，都需要阻塞挂起。可以依靠数据库实现，如行锁、读锁和写锁等，都是在操作之前加锁，在Java中，synchronized的思想也是悲观锁。


### 程序中的乐观锁与悲观锁

 **概念:** 
1. 这里抛开数据库来谈乐观锁和悲观锁,扯上数据库总会觉得和Java离得很远.
1. 悲观锁:一段执行逻辑加上悲观锁,不同线程同时执行时,只能有一个线程执行,其他的线程在入口处等待,直到锁被释放.
1. 乐观锁:一段执行逻辑加上乐观锁,不同线程同时执行时,可以同时进入执行,在最后更新数据的时候要检查这些数据是否被其他线程修改了(版本和执行初是否相同),没有修改则进行更新,否则放弃本次操作.

从解释上可以看出,悲观锁具有很强的独占性,也是最安全的.而乐观锁很开放,效率高,安全性比悲观锁低,因为在乐观锁检查数据版本一致性时也可能被其他线程修改数据.


```
package com.example.lock;

/**
 * 乐观锁实现
 * @author qinxuewu
 * @version 1.00
 * @time 20/7/2018下午 12:53
 */
public class OptimisticLock {

    public static int value = 0; // 多线程同时调用的操作对象
    /**
     * A线程要执行的方法
     */
    public static void invoke(int Avalue, String i) throws InterruptedException {
        Thread.sleep(1000L);//延长执行时间
        if (Avalue != value) {//判断value版本
            System.out.println(Avalue + ":" + value + "A版本不一致,不执行");
            value--;
        } else {
            Avalue++;//对数据操作
            value = Avalue;;//对数据操作
            System.out.println("invoke:   "+i + ":" + value);
        }
    }

    /**
     * B线程要执行的方法
     */
    public static void invoke2(int Bvalue, String i)
            throws InterruptedException {
        Thread.sleep(1000L);//延长执行时间
        if (Bvalue != value) {//判断value版本
            System.out.println(Bvalue + ":" + value + "B版本不一致,不执行");
        } else {
            System.out.println("B:利用value运算,value="+Bvalue);
        }
    }

    /**
     * 测试,期待结果:B线程执行的时候value数据总是当前最新的
     */
    public static void main(String[] args) throws InterruptedException {
        new Thread(new Runnable() {//A线程
            public void run() {
                try {
                    for (int i = 0; i < 3; i++) {
                        int Avalue = OptimisticLock.value;//A获取的value
                        OptimisticLock.invoke(Avalue, "A");
                    }

                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();
        new Thread(new Runnable() {//B线程
            public void run() {
                try {
                    for (int i = 0; i < 3; i++) {
                        int Bvalue = OptimisticLock.value;//B获取的value
                        OptimisticLock.invoke2(Bvalue, "B");
                    }
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }

}

```
测试结果:
```
A:1
0:1B版本不一致,不执行
B:利用value运算,value=1
A:2
B:利用value运算,value=2
A:3


从结果中看出,B线程在执行的时候最后发现自己的value和执行前不一致,说明被A修改了,那么放弃了本次执行.

 

多运行几次发现了下面的结果:

A:1
B:利用value运算,value=0
A:2
1:2B版本不一致,不执行
A:3
B:利用value运算,value=2
```
从结果看A修改了value值,B却没有检查出来,利用错误的value值进行了操作. 为什么会这样呢?

这里就回到前面说的乐观锁是有一定的不安全性的,B在检查版本的时候A还没有修改,在B检查完版本后更新数据前(例子中的输出语句),A更改了value值,这时B执行更新数据(例子中的输出语句)就发生了与现存value不一致的现象.

 

针对这个问题,我觉得乐观锁要解决这个问题还需要在检查版本与更新数据这个操作的时候能够使用悲观锁,比如加上synchronized,让它在最后一步保证数据的一致性.这样既保证多线程都能同时执行,牺牲最后一点的性能去保证数据的一致.

 **有两种方式来保证乐观锁最后同步数据保证它原子性的方法** 

- 1,CAS方式:Java非公开API类Unsafe实现的CAS(比较-交换),由C++编写的调用硬件操作内存,保证这个操作的原子性,concurrent包下很多乐观锁实现使用到这个类,但这个类不作为公开API使用,随时可能会被更改.我在本地测试了一下,确实不能够直接调用,源码中Unsafe是私有构造函数,只能通过getUnsafe方法获取单例,首先去掉eclipse的检查(非API的调用限制)限制以后,执行发现报 java.lang.SecurityException异常,源码中getUnsafe方法中执行访问检查,看来java不允许应用程序获取Unsafe类. 值得一提的是反射是可以得到这个类对象的.
- 

- 2,加锁方式:利用Java提供的现有API来实现最后数据同步的原子性(用悲观锁).看似乐观锁最后还是用了悲观锁来保证安全,效率没有提高.实际上针对于大多数只执行不同步数据的情况,效率比悲观加锁整个方法要高.特别注意:针对一个对象的数据同步,悲观锁对这个对象加锁和乐观锁效率差不多,如果是多个需要同步数据的对象,乐观锁就比较方便.


## 12. ReentrantLock实现原理
[原理解释](https://blog.csdn.net/yanyan19880509/article/details/52345422/)

- ReentrantLock支持两种获取锁的方式，一种是公平模型，一种是非公平模型
- 使用 synchronize 来做同步处理时，锁的获取和释放都是隐式的，实现的原理是通过编译后加上不同的机器指令来实现。
- 而 ReentrantLock 就是一个普通的类，它是基于 AQS(AbstractQueuedSynchronizer)来实现的。是一个重入锁：一个线程获得了锁之后仍然可以反复的加锁，不会出现自己阻塞自己的情况。


什么是AQS
- AQS即是AbstractQueuedSynchronizer，一个用来构建锁和同步工具的框架，包括常用的ReentrantLock、CountDownLatch、Semaphore等。
- AQS没有锁之类的概念，它有个state变量，是个int类型，在不同场合有着不同含义。本文研究的是锁，为了好理解，姑且先把state当成锁。
- AQS围绕state提供两种基本操作“获取”和“释放”，有条双向队列存放阻塞的等待线程，并提供一系列判断和处理方法，
简单说几点： state是独占的，还是共享的；

```
state被获取后，其他线程需要等待；
state被释放后，唤醒等待线程；
线程等不及时，如何退出等待。
```


### 锁类型

```
  //默认非公平锁
    public ReentrantLock() {
        sync = new NonfairSync();
    }
    
    //公平锁
    public ReentrantLock(boolean fair) {
        sync = fair ? new FairSync() : new NonfairSync();
    }
```
- 默认一般使用非公平锁，它的效率和吞吐量都比公平锁高的多
- ReentrantLock的内部类Sync继承了AQS，分为公平锁FairSync和非公平锁NonfairSync。
- 公平锁：线程获取锁的顺序和调用lock的顺序一样，FIFO；
- 非公平锁：线程获取锁的顺序和调用lock的顺序无关，全凭运气。

### 获取锁

```
//默认非公平锁，
 private ReentrantLock lock = new ReentrantLock();
// private ReentrantLock lock = new ReentrantLock(true); 公平锁
    public void run() {
        lock.lock();
        try {
            //do bussiness
        } catch (InterruptedException e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }
```


### 公平锁获取锁
首先看下获取锁的过程：

```java
    public void lock() {
        sync.lock();
    }
```

可以看到是使用 `sync`的方法，而这个方法是一个抽象方法，具体是由其子类(`FairSync`)来实现的，以下是公平锁的实现:

```java
        final void lock() {
            acquire(1);
        }
        
        //AbstractQueuedSynchronizer 中的 acquire()
        public final void acquire(int arg) {
        if (!tryAcquire(arg) &&
            acquireQueued(addWaiter(Node.EXCLUSIVE), arg))
            selfInterrupt();
        }
```

第一步是尝试获取锁(`tryAcquire(arg)`),这个也是由其子类实现：

```java
        protected final boolean tryAcquire(int acquires) {
            final Thread current = Thread.currentThread();
            int c = getState();
            if (c == 0) {
                if (!hasQueuedPredecessors() &&
                    compareAndSetState(0, acquires)) {
                    setExclusiveOwnerThread(current);
                    return true;
                }
            }
            else if (current == getExclusiveOwnerThread()) {
                int nextc = c + acquires;
                if (nextc < 0)
                    throw new Error("Maximum lock count exceeded");
                setState(nextc);
                return true;
            }
            return false;
        }
    }
```

首先会判断 `AQS` 中的 `state` 是否等于 0，0 表示目前没有其他线程获得锁，当前线程就可以尝试获取锁。

**注意**:尝试之前会利用 `hasQueuedPredecessors()` 方法来判断 AQS 的队列中中是否有其他线程，如果有则不会尝试获取锁(**这是公平锁特有的情况**)。

如果队列中没有线程就利用 CAS 来将 AQS 中的 state 修改为1，也就是获取锁，获取成功则将当前线程置为获得锁的独占线程(`setExclusiveOwnerThread(current)`)。

如果 `state` 大于 0 时，说明锁已经被获取了，则需要判断获取锁的线程是否为当前线程(`ReentrantLock` 支持重入)，是则需要将 `state + 1`，并将值更新。


###  写入队列
如果 `tryAcquire(arg)` 获取锁失败，则需要用 `addWaiter(Node.EXCLUSIVE)` 将当前线程写入队列中。

写入之前需要将当前线程包装为一个 `Node` 对象(`addWaiter(Node.EXCLUSIVE)`)。

> AQS 中的队列是由 Node 节点组成的双向链表实现的。


包装代码:

```java
    private Node addWaiter(Node mode) {
        Node node = new Node(Thread.currentThread(), mode);
        // Try the fast path of enq; backup to full enq on failure
        Node pred = tail;
        if (pred != null) {
            node.prev = pred;
            if (compareAndSetTail(pred, node)) {
                pred.next = node;
                return node;
            }
        }
        enq(node);
        return node;
    }

```

首先判断队列是否为空，不为空时则将封装好的 `Node` 利用 `CAS` 写入队尾，如果出现并发写入失败就需要调用 `enq(node);` 来写入了。

```java
    private Node enq(final Node node) {
        for (;;) {
            Node t = tail;
            if (t == null) { // Must initialize
                if (compareAndSetHead(new Node()))
                    tail = head;
            } else {
                node.prev = t;
                if (compareAndSetTail(t, node)) {
                    t.next = node;
                    return t;
                }
            }
        }
    }
```

这个处理逻辑就相当于`自旋`加上 `CAS` 保证一定能写入队列。

### 挂起等待线程

写入队列之后需要将当前线程挂起(利用`acquireQueued(addWaiter(Node.EXCLUSIVE), arg)`)：

```java
    final boolean acquireQueued(final Node node, int arg) {
        boolean failed = true;
        try {
            boolean interrupted = false;
            for (;;) {
                final Node p = node.predecessor();
                if (p == head && tryAcquire(arg)) {
                    setHead(node);
                    p.next = null; // help GC
                    failed = false;
                    return interrupted;
                }
                if (shouldParkAfterFailedAcquire(p, node) &&
                    parkAndCheckInterrupt())
                    interrupted = true;
            }
        } finally {
            if (failed)
                cancelAcquire(node);
        }
    }
```

首先会根据 `node.predecessor()` 获取到上一个节点是否为头节点，如果是则尝试获取一次锁，获取成功就万事大吉了。

如果不是头节点，或者获取锁失败，则会根据上一个节点的 `waitStatus` 状态来处理(`shouldParkAfterFailedAcquire(p, node)`)。

`waitStatus` 用于记录当前节点的状态，如节点取消、节点等待等。

`shouldParkAfterFailedAcquire(p, node)` 返回当前线程是否需要挂起，如果需要则调用 `parkAndCheckInterrupt()`：

```java
    private final boolean parkAndCheckInterrupt() {
        LockSupport.park(this);
        return Thread.interrupted();
    }
```

他是利用 `LockSupport` 的 `part` 方法来挂起当前线程的，直到被唤醒。


### 非公平锁获取锁
公平锁与非公平锁的差异主要在获取锁：

公平锁就相当于买票，后来的人需要排到队尾依次买票，**不能插队**。

而非公平锁则没有这些规则，是**抢占模式**，每来一个人不会去管队列如何，直接尝试获取锁。

非公平锁:
```java
        final void lock() {
            //直接尝试获取锁
            if (compareAndSetState(0, 1))
                setExclusiveOwnerThread(Thread.currentThread());
            else
                acquire(1);
        }
```

公平锁:
```java
        final void lock() {
            acquire(1);
        }
```

还要一个重要的区别是在尝试获取锁时`tryAcquire(arg)`，非公平锁是不需要判断队列中是否还有其他线程，也是直接尝试获取锁：

```java
        final boolean nonfairTryAcquire(int acquires) {
            final Thread current = Thread.currentThread();
            int c = getState();
            if (c == 0) {
                //没有 !hasQueuedPredecessors() 判断
                if (compareAndSetState(0, acquires)) {
                    setExclusiveOwnerThread(current);
                    return true;
                }
            }
            else if (current == getExclusiveOwnerThread()) {
                int nextc = c + acquires;
                if (nextc < 0) // overflow
                    throw new Error("Maximum lock count exceeded");
                setState(nextc);
                return true;
            }
            return false;
        }
```

### 释放锁

公平锁和非公平锁的释放流程都是一样的：

```java
    public void unlock() {
        sync.release(1);
    }
    
    public final boolean release(int arg) {
        if (tryRelease(arg)) {
            Node h = head;
            if (h != null && h.waitStatus != 0)
                   //唤醒被挂起的线程
                unparkSuccessor(h);
            return true;
        }
        return false;
    }
    
    //尝试释放锁
    protected final boolean tryRelease(int releases) {
        int c = getState() - releases;
        if (Thread.currentThread() != getExclusiveOwnerThread())
            throw new IllegalMonitorStateException();
        boolean free = false;
        if (c == 0) {
            free = true;
            setExclusiveOwnerThread(null);
        }
        setState(c);
        return free;
    }        
```

首先会判断当前线程是否为获得锁的线程，由于是重入锁所以需要将 `state` 减到 0 才认为完全释放锁。

释放之后需要调用 `unparkSuccessor(h)` 来唤醒被挂起的线程。


### 总结

由于公平锁需要关心队列的情况，得按照队列里的先后顺序来获取锁(会造成大量的线程上下文切换)，而非公平锁则没有这个限制。

所以也就能解释非公平锁的效率会被公平锁更高。

### 羊群效应
- 这里说一下羊群效应，当有多个线程去竞争同一个锁的时候，假设锁被某个线程占用，那么如果有成千上万个线程在等待锁，有一种做法是同时唤醒这成千上万个线程去去竞争锁，这个时候就发生了羊群效应，海量的竞争必然造成资源的剧增和浪费，因此终究只能有一个线程竞争成功，其他线程还是要老老实实的回去等待。AQS的FIFO的等待队列给解决在锁竞争方面的羊群效应问题提供了一个思路：保持一个FIFO队列，队列每个节点只关心其前一个节点的状态，线程唤醒也只唤醒队头等待线程。其实这个思路已经被应用到了分布式锁的实践中，见：Zookeeper分布式锁的改进实现方案。

##  13. 阻塞队列ArrayBlockingQueu
- ArrayBlockingQueue，一个由数组实现的有界阻塞队列。该队列采用FIFO的原则对元素进行排序添加的。
- ArrayBlockingQueue为有界且固定，其大小在构造时由构造函数来决定，确认之后就不能再改变了。
- ArrayBlockingQueue支持对等待的生产者线程和使用者线程进行排序的可选公平策略，但是在默认情况下不保证线程公平的访问，在构造时可以选择公平策略（fair = true）。公平性通常会降低吞吐量，但是减少了可变性和避免了“不平衡性”。

###  定义

```
 public class ArrayBlockingQueue<E> extends AbstractQueue<E> implements BlockingQueue<E>, Serializable {
        private static final long serialVersionUID = -817911632652898426L;
        final Object[] items;
        int takeIndex;
        int putIndex;
        int count;
        // 重入锁
        final ReentrantLock lock;
        // notEmpty condition
        private final Condition notEmpty;
        // notFull condition
        private final Condition notFull;
        transient ArrayBlockingQueue.Itrs itrs;
    }
```
- 可以清楚地看到ArrayBlockingQueue继承AbstractQueue，实现BlockingQueue接口。看过java.util包源码的同学应该都认识AbstractQueue，改类在Queue接口中扮演着非常重要的作用，该类提供了对queue操作的骨干实现（具体内容移驾其源码）。BlockingQueue继承java.util.Queue为阻塞队列的核心接口，提供了在多线程环境下的出列、入列操作，作为使用者，则不需要关心队列在什么时候阻塞线程，什么时候唤醒线程，所有一切均由BlockingQueue来完成。

 **ArrayBlockingQueue内部使用可重入锁ReentrantLock + Condition来完成多线程环境的并发操作。** 
- items，一个定长数组，维护ArrayBlockingQueue的元素
- takeIndex，int，为ArrayBlockingQueue对首位置
- putIndex，int，ArrayBlockingQueue对尾位置
- count，元素个数
- lock，锁，ArrayBlockingQueue出列入列都必须获取该锁，两个步骤公用一个锁
- notEmpty，出列条件
- notFull，入列条件

 **入队** 

ArrayBlockingQueue提供了诸多方法，可以将元素加入队列尾部。

- add(E e) ：将指定的元素插入到此队列的尾部（如果立即可行且不会超过该队列的容量），在成功时返回 true，如果此队列已满，则抛出 IllegalStateException
- offer(E e) :将指定的元素插入到此队列的尾部（如果立即可行且不会超过该队列的容量），在成功时返回 true，如果此队列已满，则返回 false
- offer(E e, long timeout, TimeUnit unit) :将指定的元素插入此队列的尾部，如果该队列已满，则在到达指定的等待时间之前等待可用的空间
- put(E e) :将指定的元素插入此队列的尾部，如果该队列已满，则等待可用的空间


### add(E e）

```
 public boolean add(E e) {
        return super.add(e);
    }
    
    public boolean add(E e) {
        if (offer(e))
            return true;
        else
            throw new IllegalStateException("Queue full");
    }
```
add方法调用offer(E e)，如果返回false，则直接抛出IllegalStateException异常。offer(E e)为ArrayBlockingQueue实现：

```
 public boolean offer(E e) {
        checkNotNull(e);
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            if (count == items.length)
                return false;
            else {
                enqueue(e);
                return true;
            }
        } finally {
            lock.unlock();
        }
    }
```
方法首先检查是否为null，然后获取lock锁。获取锁成功后，如果队列已满则直接返回false，否则调用enqueue(E e)，enqueue(E e)为入列的核心方法，所有入列的方法最终都将调用该方法在队列尾部插入元素：

```
 private void enqueue(E x) {
        // assert lock.getHoldCount() == 1;
        // assert items[putIndex] == null;
        final Object[] items = this.items;
        items[putIndex] = x;
        if (++putIndex == items.length)
            putIndex = 0;
        count++;
        notEmpty.signal();
    }
```
该方法就是在putIndex（对尾）为知处添加元素，最后使用notEmpty的signal()方法通知阻塞在出列的线程（如果队列为空，则进行出列操作是会阻塞）。

### 出队
- poll() :获取并移除此队列的头，如果此队列为空，则返回 null
- poll(long timeout, TimeUnit unit) :获取并移除此队列的头部，在指定的等待时间前等待可用的元素（如果有必要）
- remove(Object o) :从此队列中移除指定元素的单个实例（如果存在）
- take() :获取并移除此队列的头部，在元素变得可用之前一直等待（如果有必要）

 **poll()** 

```
 public E poll() {
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            return (count == 0) ? null : dequeue();
        } finally {
            lock.unlock();
        }
    }
```
如果队列为空返回null，否则调用dequeue()获取列头元素：

```
private E dequeue() {
        final Object[] items = this.items;
        E x = (E) items[takeIndex];
        items[takeIndex] = null;
        if (++takeIndex == items.length)
            takeIndex = 0;
        count--;
        if (itrs != null)
            itrs.elementDequeued();
        notFull.signal();
        return x;
    }
```
该方法主要是从列头（takeIndex 位置）取出元素，同时如果迭代器itrs不为null，则需要维护下该迭代器。最后调用notFull.signal()唤醒入列线程。

```
 public E take() throws InterruptedException {
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
            while (count == 0)
                notEmpty.await();
            return dequeue();
        } finally {
            lock.unlock();
        }
    }
```
take()与poll()存在一个区别就是count == 0 时的处理，poll()直接返回null，而take()则是在notEmpty上面等待直到被入列的线程唤醒。


### 代码实例
```
public class ArrayBlockingQueueTest {

    public static void main(String[] args) throws InterruptedException {
        //队列中存满20个元素 在添加新的元素 会一直阻塞
        ArrayBlockingQueue<String> queue=new ArrayBlockingQueue<>(20);
        for (int i = 0; i < 21; i++) {
            System.out.println(i);
            queue.put("put :"+i);
        }
        
        System.out.println("size:"+queue.size());
        
    }
}
```

## 13. 同步队列SynchronousQueue
- SynchronousQueue 内部没有容量，但是由于一个插入操作总是对应一个移除操作，反过来同样需要满足那么一个元素就不会再SynchronousQueue 里面长时间停留，一旦有了插入线程和移除线程，元素很快就从插入线程移交给移除线程。也就是说这更像是一种信道（管道），资源从一个方向快速传递到另一方 向。显然这是一种快速传递元素的方式， 这种情况下元素总是以最快的方式从插入着（生产者）传递给移除着（消费者），这在多任务队列中是最快处理任务的方式
- 因为没有容量，所以对应 peek, contains, clear, isEmpty ... 等方法其实是无效的。例如clear是不执行任何操作的，contains始终返回false,peek始终返回null。
- SynchronousQueue分为公平和非公平，默认情况下采用非公平性访问策略，当然也可以通过构造函数来设置为公平性访问策略（为true即可）。
- 在线程池里的一个典型应用是Executors.newCachedThreadPool()就使用了SynchronousQueue， 这个线程池根据需要（新任务到来时）创建新的线程，如果有空闲线程则会重复使用，线程空闲了60秒后会被回收。

###  方法

```
iterator() 永远返回空，因为里面没东西。 
peek() 永远返回null。 
put() 往queue放进去一个element以后就一直wait直到有其他thread进来把这个element取走。 
offer() 往queue里放一个element后立即返回，如果碰巧这个element被另一个thread取走了，offer方法返回true，认为offer成功；否则返回false。 
offer(2000, TimeUnit.SECONDS) 往queue里放一个element但是等待指定的时间后才返回，返回的逻辑和offer()方法一样。 
take() 取出并且remove掉queue里的element（认为是在queue里的。。。），取不到东西他会一直等。 
poll() 取出并且remove掉queue里的element（认为是在queue里的。。。），只有到碰巧另外一个线程正在往queue里offer数据或者put数据的时候，该方法才会取到东西。否则立即返回null。 
poll(2000, TimeUnit.SECONDS) 等待指定的时间然后取出并且remove掉queue里的element,其实就是再等其他的thread来往里塞。 
isEmpty()永远是true。 
remainingCapacity() 永远是0。 
remove()和removeAll() 永远是false。 
```

### 使用示例

```
public class SynchronousQueueTest {
 
    public static void main(String[] args) throws InterruptedException {
         final SynchronousQueue<String> queue = new SynchronousQueue<String>(true);
         //put线程
          ExecutorService exec=Executors.newCachedThreadPool();
          exec.execute(new Runnable() {
            @Override
            public void run(){
                for (int i = 0; i < 5; i++) {
                    try {
                         System.out.println(Thread.currentThread().getName()+"   put 开始");
                          queue.put("put:"+i);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                }
            }
        });
          exec.shutdown();
          Thread.sleep(1000);
          //消费线程
          ExecutorService exec2=Executors.newCachedThreadPool();
          exec2.execute(new Runnable() {
            @Override
            public void run(){
                for (int i = 0; i < 5; i++) {
                    try {       
                          System.out.println(Thread.currentThread().getName()+"  take 消费开始");
                          System.out.println(Thread.currentThread().getName() +"  take值： : " +queue.take());
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                     System.out.println(Thread.currentThread().getName()+"  take 消费结束");
                }
            }
        });
          exec2.shutdown();
          
    }

}
```

### 原理解析
与其他BlockingQueue一样，SynchronousQueue同样继承AbstractQueue和实现BlockingQueue接口：

```
public class SynchronousQueue<E> extends AbstractQueue<E>
    implements BlockingQueue<E>, java.io.Serializable
```
 **SynchronousQueue提供了两个构造函数：** 

```
 public SynchronousQueue() {
        this(false);
    }

    public SynchronousQueue(boolean fair) {
        // 通过 fair 值来决定公平性和非公平性
        // 公平性使用TransferQueue，非公平性采用TransferStack
        transferer = fair ? new TransferQueue<E>() : new TransferStack<E>();
    }
```
 **TransferQueue、TransferStack继承Transferer，Transferer为SynchronousQueue的内部类，它提供了一个方法transfer()，该方法定义了转移数据的规范，如下：** 

```
 abstract static class Transferer<E> {
        abstract E transfer(E e, boolean timed, long nanos);
    }
```
transfer()方法主要用来完成转移数据的，如果e != null，相当于将一个数据交给消费者，如果e == null，则相当于从一个生产者接收一个消费者交出的数据。

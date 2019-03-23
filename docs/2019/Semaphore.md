## 概述
* `Semaphore` 通常用于限制可以访问某些资源（物理或逻辑的）的线程数目。
* 比如数据库的连接资源是非常有限的，如果同时有上千个线程去数据获取连接，对数据造成的压力是非常的，会造成数据库无法连接而报错，`Semaphore`就可以限制此类问题
* `Semaphore`有非公平和公平模式，默认是非公平的。当`Semaphore`设置为1时，可以排它锁使用，同一个时刻，只能限制一个线程访问。和`CountDownLatch`一样的，内部都有一个Sync内部类，基于AQS实现同步状态的释放和获取。

## Semaphore提供的方法
* `Semaphore(int permits) ` 创建非公平的指定许可数的信号量
* `Semaphore(int permits, boolean fair) ` 创建指定的许可数和指定是否是公平模式的信号量
* `void acquire() ` 从此信号量获取一个许可，在提供一个许可前一直将线程阻塞，否则线程被中断
* `void acquire(int permits) `  从此信号量获取给定数目的许可，在提供这些许可前一直将线程阻塞，或者线程已被中断。
* `int availablePermits() ` 返回此信号量中当前可用的许可数。
* `int getQueueLength() ` 返回正在等待获取的线程的估计数目。
* `boolean hasQueuedThreads() ` 查询是否有线程正在等待获取。
* `Collection<Thread>   getQueuedThreads() `  返回一个 collection，包含可能等待获取的线程。
* `reducePermits(int reduction) `  根据指定的缩减量减小可用许可的数目。
* `release() ` 释放一个许可，将其返回给信号量。
* `release(int permits) ` 返回标识此信号量的字符串，以及信号量的状态。
*
## 使用方法

```java
public class SemaphoreTest {
    static Semaphore s=new Semaphore(3); //非公平

    static  class Task implements   Runnable{
        @Override
        public void run() {

            try {
                s.acquire();  //获取一个许可
                System.out.println(Thread.currentThread().getName()+" 获取一个许可开始执行...");
                Thread.sleep(1000);
                System.out.println(Thread.currentThread().getName()+" 退出。");
            }catch (Exception e){
            }finally {
                s.release();  //规划一个许可
            }
        }
    }
    public static void main(String[] args) {
        for (int i = 0; i <=5 ; i++) {
            new Thread(new Task()).start();
        }
    }
}

```
* 输出结果,可以看出同一时刻只能三个线程进入执行，当有一个线程退出归还许可后，立马就会有其余线程去竞争这个多出的许可。

```java
Thread-0 获取一个许可开始执行...
Thread-1 获取一个许可开始执行...
Thread-2 获取一个许可开始执行...
Thread-2 退出。
Thread-1 退出。
Thread-3 获取一个许可开始执行...
Thread-0 退出。
Thread-4 获取一个许可开始执行...
Thread-5 获取一个许可开始执行...
Thread-4 退出。
Thread-3 退出。
Thread-5 退出
```
## 源码分析
###  初始化一个信号时
* 当执行`new Semaphore(3)`时，默认是非公平的实现方式。看看内部是如何是实现的

```java
    public Semaphore(int permits) {
        sync = new NonfairSync(permits);
    }
```
* 源码中可以看出是通过`NonfairSync``这个`内部类返回的一个实列，`NonfairSync`是`Sync`子类。
### acquire 获取一个许可
```java
 public void acquire() throws InterruptedException {
        sync.acquireSharedInterruptibly(1);
    }
```
* 获取许可时调用的是AQS中的`acquireSharedInterruptibly`方法，以共享模式获同步状态，如果被中断则中止。

```java
    public final void acquireSharedInterruptibly(int arg)
            throws InterruptedException {
            // 判断线程是否中断
        if (Thread.interrupted())
            throw new InterruptedException();

        if (tryAcquireShared(arg) < 0)
        //获取同步状态失败 执行如下方法，这个方法以自旋的方式一直获取同步状态
            doAcquireSharedInterruptibly(arg);
    }
```
*  `tryAcquireShared`由Sync类提供实现，非公平模式调用`NonfairSync`的,否则调用`FairSync`类的方法

### 非公平
```java
   static final class NonfairSync extends Sync {
        private static final long serialVersionUID = -2694183684443567898L;

        NonfairSync(int permits) {
            super(permits);
        }
		//获取锁
        protected int tryAcquireShared(int acquires) {
        	// Sync类的非公平获取同步状态方法
            return nonfairTryAcquireShared(acquires);
        }
    }
```

### 公平
```java
    static final class FairSync extends Sync {
        private static final long serialVersionUID = 2014338818796000944L;

        FairSync(int permits) {
            super(permits);
        }
		//公平模式获取信号量
        protected int tryAcquireShared(int acquires) {
        	//自旋操作
            for (;;) {
            	//公平模式，先要判断该线程是否位于CLH同步队列的列头
                if (hasQueuedPredecessors())
                    return -1;
                    //获取同步状态总数（信号量）
                int available = getState();
                //当前信号量减去获取的acquires个信号。
                int remaining = available - acquires;
                //CAS方式设置信号量。unsafe类提供实现，返回信号量
                if (remaining < 0 ||
                    compareAndSetState(available, remaining))
                    return remaining;
            }
        }
    }
```
* Sync`是继承AQS队列同步器，是自定义同步组件的具体的实现。
```java
    abstract static class Sync extends AbstractQueuedSynchronizer {
        private static final long serialVersionUID = 1192457210091910933L;

        Sync(int permits) {
            setState(permits);
        }

        final int getPermits() {
            return getState();
        }
		//非公平获取信号量
        final int nonfairTryAcquireShared(int acquires) {
        	//自旋 
            for (;;) {
            	//获取同步状态总数（信号量）
                int available = getState();
                //当前信号量减去获取的acquires个信号。
                int remaining = available - acquires;
                //CAS方式设置信号量。unsafe类提供实现，返回信号量
                if (remaining < 0 ||
                    compareAndSetState(available, remaining))
                    return remaining;
            }
        }


        final void reducePermits(int reductions) {
            for (;;) {
                int current = getState();
                int next = current - reductions;
                if (next > current) // underflow
                    throw new Error("Permit count underflow");
                if (compareAndSetState(current, next))
                    return;
            }
        }

        final int drainPermits() {
            for (;;) {
                int current = getState();
                if (current == 0 || compareAndSetState(current, 0))
                    return current;
            }
        }
    }
```
* 从源码中得出，Semaphore获取信号量许可时，公平和非公平的区别是，公平模式首先判断当前线程是否位于CLH同步队列的队列头中。
* 而非公平模式是的竞争是抢占式，谁竞争到就谁获取。
* 先是获取当前信号总数减去`acquires`个许可信号，然后以CAS方式设置CAS方式设置信号，并返回新的信号总数。CAS内部是依赖于AQS队列同步器中的`unsafel`类提供实现。

### release归还许可

```java 
    public void release() {
        sync.releaseShared(1);
    }
   public final boolean releaseShared(int arg) {
        if (tryReleaseShared(arg)) {
            doReleaseShared();
            return true;
        }
        return false;
    }
```
* 释放信号量 `release` 首先会调用AQS`releaseShared`.
* `tryReleaseShared` 会调用`Sync`的`tryReleaseShared`方法
* 释放操作时以自旋方式执行，首先获取总的信号建去要释放的信号量，然后判断这个信号量是否小于大于总的信号量，如果大于则抛出异常，否则以CAS的方式设置信号量

```java
		//释放同步状态，也就是归还信号量
        protected final boolean tryReleaseShared(int releases) {
        	// 自旋操作
            for (;;) {
                int current = getState();
                int next = current + releases;
                if (next < current) // overflow
                    throw new Error("Maximum permit count exceeded");
                if (compareAndSetState(current, next))
                    return true;
            }
        }
```
## 总结
* 从源码中可以看出Semaphore的实现方式主要是依靠AQS实现的，以`state`同步状态成变量作为信号量的总数，获取和释放都是以CAS+自旋操作的方式设置`state`成员变量。
* JDK并发包中的工具了哦都是AQS为基石实现的。大多都是使用CAS+自旋的方式去改变state来达到锁的获和释放

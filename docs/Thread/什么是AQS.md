### 什么是AQS？
Java并发包（JUC）中提供了很多并发工具，这其中，很多我们耳熟能详的并发工具，譬如ReentrangLock、Semaphore，它们的实现都用到了一个共同的基类--AbstractQueuedSynchronizer,简称AQS。AQS是一个用来构建锁和同步器的框架

### AQS的基本实现原理
AQS使用一个int成员变量来表示同步状态，通过内置的FIFO队列来完成获取资源线程的排队工作。

```
  private volatile int state;//共享变量，使用volatile修饰保证线程可见性
```
状态信息通过procted类型的getState，setState，compareAndSetState进行操作

### AQS支持两种同步方式：
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

https://www.cnblogs.com/chengxiao/archive/2017/07/24/7141160.html

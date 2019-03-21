![类方法](https://img-blog.csdnimg.cn/20190321214421587.png)
## 概述
* 允许一个线程的或多个线程等待其他线程完成操作。和join方法类似，初始化对象时通过传入一个固定的计数器总数，线程方法执行时调用countDown给计数器减1，当计数器0时，就会恢复等待的线程继续执行。
* CountDownLatch的计数器不能重用。只能使用一次
*常用的使用场景是提升程序的并行效率，同时处理多个任务后，最后需要提示任务完成。类似的表格的批量解析读取。

## 使用方法
### 一个线程等待
```java
    static CountDownLatch c=new CountDownLatch(2);
    public static void main(String[] args) throws InterruptedException {
        System.out.println("初始化任务数："+c.getCount());
        new Thread(()->{
            System.out.println("任务1执行");
            c.countDown();
            System.out.println("任务2执行");
            c.countDown();
        }).start();;
        c.await();
        System.out.println("任务执行完毕！");
    }
```
输出结果
```java
初始化任务数：2
任务1执行
任务2执行
任务执行完毕！

```

### 多个线程等待
```java
static CountDownLatch countDownLatch=new CountDownLatch(3);
    //汇总任务
    static class T1 extends Thread{
        @Override
        public void run() {
            try {
                countDownLatch.await();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            System.out.println("所有表格已经读取完了，进行汇总处理");
        }
    }

    //批量处里表格数据任务
    static class task  extends Thread{
        @Override
        public void run() {
            System.out.println(Thread.currentThread().getName() + "：开始处理表格数据");
            //处理完计数器就减1
            countDownLatch.countDown();
        }
    }
    public static void main(String[] args) throws InterruptedException {
        new T1().start();
        for (int i = 1; i <=3; i++) {
            new task().start(); //多线程读取表格
        }

    }
```
输出结果
```java
Thread-1：开始处理表格数据
Thread-2：开始处理表格数据
Thread-3：开始处理表格数据
所有表格已经读取完了，进行汇总处理
```
## 源码分析
### 获取一个countDownLatch时
![](https://img-blog.csdnimg.cn/2019032122130289.png)
* 源码中可以看出是如果初始传入的j计数器为0时是直接抛出异常的；
* 内部是通过new Sync一个内部返回一个对象的。Sync是一个内部同步器类，继承AQS。

### Sync内部类
```java
    private static final class Sync extends AbstractQueuedSynchronizer {
        private static final long serialVersionUID = 4982264981922014374L;
        //初始化同步状态，count就是传入的计数器
        Sync(int count) {
            setState(count);
        }
        //获取同步状态总数，就好像类似锁重入的总次数
        int getCount() {
            return getState();
        }
        /**
        /共享式获取同步，类似读写锁的读写，，但是这里只是获取,没有做其它操作
        state是一个volatile修饰的成员变量
        */
        protected int tryAcquireShared(int acquires) {
            return (getState() == 0) ? 1 : -1;
        }
        //共享式的释放同步状态，
        protected boolean tryReleaseShared(int releases) {
        	// 自旋
            for (;;) {
                int c = getState();
                //为0 说明计数器已经减完了 直接返回false
                if (c == 0)
                    return false;
                  //不为0的操作。 获取当前同步状态总数减一
                int nextc = c-1;
                //CA方式设置state，成功返回true
                if (compareAndSetState(c, nextc))
                    return nextc == 0;
            }
        }
    }
```
### await方法

```java
    public void await() throws InterruptedException {
        sync.acquireSharedInterruptibly(1);
    }
```
* await方法是通过sync内部类调用AQS中的`acquireSharedInterruptibly()`方法
* 执行`await`方法的线程会在计数器没有成为0时一直处于等待，除非线程被中断，支持可中断的。

```java
    public final void acquireSharedInterruptibly(int arg)
            throws InterruptedException {
            //判断是中断了
        if (Thread.interrupted())
            throw new InterruptedException();
            //这里是执行内部类的tryAcquireShared方法提供了具体实现，
            //就是获取同步状态的值，如果获取失败就会返回-1
        if (tryAcquireShared(arg) < 0)
        	//获取同步状态失败 执行如下方法，这个方法以自旋的方式一直获取同步状态
            doAcquireSharedInterruptibly(arg);
    }
    private void doAcquireSharedInterruptibly(int arg)
        throws InterruptedException {
        final Node node = addWaiter(Node.SHARED);
        boolean failed = true;
        try {
            for (;;) {
                final Node p = node.predecessor();
                if (p == head) {
                    int r = tryAcquireShared(arg);
                    if (r >= 0) {
                        setHeadAndPropagate(node, r);
                        p.next = null; // help GC
                        failed = false;
                        return;
                    }
                }
                if (shouldParkAfterFailedAcquire(p, node) &&
                    parkAndCheckInterrupt())
                    throw new InterruptedException();
            }
        } finally {
            if (failed)
                cancelAcquire(node);
        }
    }
```
### countDown执行计数器减法操作
* countDownf方法每执行一次，计数器就减1，如果计数到达零，则释放所有等待的线程
```java
    public void countDown() {
    	//通过内部类sync执行AQS中的共享式释放同步状态
        sync.releaseShared(1);
    }
    //AQS中的方法
    public final boolean releaseShared(int arg) {
    //tryReleaseShared方法是syncs实现了重写，如果返回true则说明释放同步状态失败
        if (tryReleaseShared(arg)) {
        	//失败AQS  doReleaseShared方法， 
            doReleaseShared();
            return true;
        }
        return false;
    }
```
* doReleaseShared方法会依自旋的方式不断尝试释放同步状态

```java
private void doReleaseShared() {
    for (;;) {
            Node h = head;
            if (h != null && h != tail) {
                int ws = h.waitStatus;
              if (ws == Node.SIGNAL) {
                    if (!compareAndSetWaitStatus(h, Node.SIGNAL, 0))
                        continue;          
                    unparkSuccessor(h);
            }
           else if (ws == 0 && !compareAndSetWaitStatus(h,0,Node.PROPAGATE))
                    continue;               
          }
            if (h == head)                   
                break;
        }
    }
```
## 总结
* CountDownLatch是基于AQS实现的一个并发工具类，允许一个线程或多个线程等待其它线程操作，初始化是传入总的计数器，内部都通过`new Sync`一个返回一个对象。当调用countDown()方法 就会吧计数器做递减，当计数器为0时，就会恢复等待的线程继续执行，计数到达零之前，await 方法会一直受阻塞。

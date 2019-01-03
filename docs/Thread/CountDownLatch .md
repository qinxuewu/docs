### 简介
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

### 同步屏障CyclicBarrier
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


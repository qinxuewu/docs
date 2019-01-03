### 控制并发线程数的Semaphore
- Semaphore（信号量）是用来控制同时访问特定资源的线程数量，它通过协调各个线程，以保证合理的使用公共资源。很多年以来，我都觉得从字面上很难理解Semaphore所表达的含义，只能把它比作是控制流量的红绿灯，比如XX马路要限制流量，只允许同时有一百辆车在这条路上行使，其他的都必须在路口等待，所以前一百辆车会看到绿灯，可以开进这条马路，后面的车会看到红灯，不能驶入XX马路，但是如果前一百辆中有五辆车已经离开了XX马路，那么后面就允许有5辆车驶入马路，这个例子里说的车就是线程，驶入马路就表示线程在执行，离开马路就表示线程执行完成，看见红灯就表示线程被阻塞，不能执行。

### Semaphore提供了两个构造函数：
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
//						System.out.println("此信号量中当前可用的许可证数:  "+s.availablePermits());
//						System.out.println("正在等待获取许可证的线程数:  "+s.getQueueLength());
//						System.out.println("是否有线程正在等待获取许可证:  "+s.hasQueuedThreads());
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

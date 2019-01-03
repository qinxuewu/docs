### SynchronousQueue简介
- SynchronousQueue 内部没有容量，但是由于一个插入操作总是对应一个移除操作，反过来同样需要满足那么一个元素就不会再SynchronousQueue 里面长时间停留，一旦有了插入线程和移除线程，元素很快就从插入线程移交给移除线程。也就是说这更像是一种信道（管道），资源从一个方向快速传递到另一方 向。显然这是一种快速传递元素的方式， 这种情况下元素总是以最快的方式从插入着（生产者）传递给移除着（消费者），这在多任务队列中是最快处理任务的方式
- 因为没有容量，所以对应 peek, contains, clear, isEmpty ... 等方法其实是无效的。例如clear是不执行任何操作的，contains始终返回false,peek始终返回null。
- SynchronousQueue分为公平和非公平，默认情况下采用非公平性访问策略，当然也可以通过构造函数来设置为公平性访问策略（为true即可）。
- 在线程池里的一个典型应用是Executors.newCachedThreadPool()就使用了SynchronousQueue， 这个线程池根据需要（新任务到来时）创建新的线程，如果有空闲线程则会重复使用，线程空闲了60秒后会被回收。

### SynchronousQueue的以下方法：

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
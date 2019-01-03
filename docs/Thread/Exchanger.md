### 并发工具类：Exchanger
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
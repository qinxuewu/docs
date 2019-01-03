### J.U.C之阻塞队列：ArrayBlockingQueu
- ArrayBlockingQueue，一个由数组实现的有界阻塞队列。该队列采用FIFO的原则对元素进行排序添加的。
- ArrayBlockingQueue为有界且固定，其大小在构造时由构造函数来决定，确认之后就不能再改变了。
- ArrayBlockingQueue支持对等待的生产者线程和使用者线程进行排序的可选公平策略，但是在默认情况下不保证线程公平的访问，在构造时可以选择公平策略（fair = true）。公平性通常会降低吞吐量，但是减少了可变性和避免了“不平衡性”。

### ArrayBlockingQueue的定义：

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

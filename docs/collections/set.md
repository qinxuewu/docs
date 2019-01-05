 
 ## 简介
 **Set几乎都是内部用一个Map来实现, 因为Map里的KeySet就是一个Set，而value是假值，全部使用同一个Object。Set的特征也继承了那些内部Map实现的特征。** 

- HashSet：内部是HashMap。
- LinkedHashSet：内部是LinkedHashMap。
- TreeSet：内部是TreeMap的SortedSet。
- ConcurrentSkipListSet：内部是ConcurrentSkipListMap的并发优化的SortedSet。
- CopyOnWriteArraySet：内部是CopyOnWriteArrayList的并发优化的Set，利用其addIfAbsent()方法实现元素去重，如前所述该方法的性能很一般。

## Set接口的3种实现
- HashSet的对象必须实现hashCode方法，javaAPI大多数类实现了hashCode方法。
- LinkedHashSet实现了对HashSet的扩展，支持规则集内元素的排序，在HashSet中元素是没有顺序的，而在LinkedHashSet中，可以按元素插入集合的顺序进行提取
- TreeSet保证集中的元素是有序的，有2种方法可以实现对象之间的可比较性：1，添加到TreeSet的对象实现了Comparable接口；2，给规则集的元素指定一个比较器（Comparator）


 **如果希望按照元素插入集合的顺序进行提取元素，用LinkedHashSet，它的元素按添加的顺序存储
如果没有上述需求，应该用HashSet，它的效率比LinkedHashSet高
LinkedHashSet只是按照添加的的先后顺序在存储时保持顺序，要给集合元素添加顺序属性，需要使用TreeSet（集合元素有排序关系）。** 

## 什么是HashSet
HashSet实现了Set接口，它不允许集合中有重复的值，当我们提到HashSet时，第一件事情就是在将对象存储在HashSet之前，要先确保对象重写equals()和hashCode()方法，这样才能比较对象的值是否相等，以确保set中没有储存相等的对象。如果我们没有重写这两个方法，将会使用这个方法的默认实现。

1、数组的排序 此类中只有升序排序，而无降序排序

```
int a[]={1,5,3,8,4};
Arrays.sort(a);//实现了对数组从小到大的排序
```
2、数组元素的定位查找

```
int find;
int a[]={1,5,3,8,4};
find=Arrays.binarySearch(a,8);
//括号中前面的a为你将要查询的数组，8为想要查询的数字
//find的值为查询的数字在数组中的下标
```
3、数组的打印

```
int a[]={1,5,3,8,4};
String aString =Arrays.toString(a);//String 前的a和括号中的a均表示数组名称
System.out.println(aString);//String 前的a表示数组名称
```

4、 查看数组中是否有特定的值

```
int a[]={1,5,3,8,4};
boolean b=Arrays.asList(a).contains(1);
System.out.println(b);//注意：b的值只可能是true或false
```
5 asList将一个数组转变成一个List这个List是定长的，企图添加或者删除数据都会报

```
List<Integer>list= Arrays.asList(3,4,2,1,5,7,6);
System.out.println(list);

输出结果：[3, 4, 2, 1, 5, 7, 6]
```

6 binarySearch通过二分查找法对已排序的数组进行查找


```
String str[] = {"s2","s4","s1","s3"};
Arrays.sort(str);
System.out.println(Arrays.toString(str));
int ans = Arrays.binarySearch(str, "s1");
System.out.println(ans);

输出：
[s1, s2, s3, s4]
```

7 copyOf数组拷贝，底层采用System.arrayCopy（native方法）实现。

```
String str[] = {"s2","s4","s1","s3"};
String str2[] = Arrays.copyOf(str, str.length);
System.out.println(Arrays.toString(str2));

输出：[s2, s4, s1, s3]
```
8 copyOfRange数组拷贝，指定一定的范围底层采用System.arrayCopy

```
String str[] = {"s2","s4","s1","s3"};
String str2[] = Arrays.copyOfRange(str,1,3);
System.out.println(Arrays.toString(str2));

输出：[s4, s1]
```

9 equals判断两个数组的每一个对应的元素是否相等

```
String str1[] = {"s2","s4","s1","s3",null};
String str2[] = Arrays.copyOf(str1, str1.length);
System.out.println(Arrays.equals(str1, str2));
输出：true
```
10 sort对数组进行排序如果提供了比较器Comparator也可以适用于泛型

```
int[] array = {5, 6, -1, 4}; 
Arrays.sort(array); 
这种是默认的排序，按照字典序(ASCII)的顺序进行排序。

//数组部分排序 Arrays.sort(int[] a, int fromIndex, int toIndex)

 int[] a = {9, 8, 7, 2, 3, 4, 1, 0, 6, 5};
 Arrays.sort(a, 0, 3);
 
 
 
 public class Main {
     public static void main(String[] args) {
         //注意，要想改变默认的排列顺序，不能使用基本类型（int,double, char）
         //而要使用它们对应的类
         Integer[] a = {9, 8, 7, 2, 3, 4, 1, 0, 6, 5};
         //定义一个自定义类MyComparator的对象
         Comparator cmp = new MyComparator();
         Arrays.sort(a, cmp);
         for(int i = 0; i < a.length; i ++) {
             System.out.print(a[i] + " ");
         }
     }
 }
 //Comparator是一个接口，所以这里我们自己定义的类MyComparator要implents该接口
 //而不是extends Comparator
 class MyComparator implements Comparator<Integer>{
     @Override
     public int compare(Integer o1, Integer o2) {
         //如果o1小于o2，我们就返回正值，如果o1大于o2我们就返回负值，
         //这样颠倒一下，就可以实现反向排序了
         if(o1 < o2) { 
             return 1;
         }else if(o1 > o2) {
             return -1;
         }else {
             return 0;
         }
     }
     
 }
```


##### 类Collections是一个包装类。它包含有各种有关集合操作的静态多态方法。此类不能实例化，就像一个工具类，服务于Java的Collection框架。


#### 排序操作
```
Collections提供以下方法对List进行排序操作

void reverse(List list)：反转

void shuffle(List list),随机排序

void sort(List list),按自然排序的升序排序

void sort(List list, Comparator c);定制排序，由Comparator控制排序逻辑

void swap(List list, int i , int j),交换两个索引位置的元素

void rotate(List list, int distance),旋转。当distance为正数时，将list后distance个元素整体移到前面。当distance为负数时，将 list的前distance个元素整体移到后面。
```

```
public static void main(String[] args) {
       ArrayList nums =  new ArrayList();
        nums.add(8);
        nums.add(-3);
        nums.add(2);
        nums.add(9);
        nums.add(-2);
        System.out.println(nums);  //[8, -3, 2, 9, -2]
        Collections.reverse(nums);
        System.out.println(nums); //[-2, 9, 2, -3, 8]
        Collections.sort(nums);
        System.out.println(nums); //[-3, -2, 2, 8, 9]
        Collections.shuffle(nums);
        System.out.println(nums); //[9, -2, 8, 2, -3]
        
      
      
        Collections.sort(nums, new Comparator() {
            public int compare(Object o1, Object o2) {
                // TODO Auto-generated method stub
                String s1 = String.valueOf(o1);
                String s2 = String.valueOf(o2);
                return s1.compareTo(s2);
            }
            
        });
        System.out.println(nums); //[-2, -3, 2, 8, 9]
    }
```

#### 查找，替换操作

```
int binarySearch(List list, Object key), 对List进行二分查找，返回索引，注意List必须是有序的

int max(Collection coll),根据元素的自然顺序，返回最大的元素。 类比int min(Collection coll)

int max(Collection coll, Comparator c)，根据定制排序，返回最大元素，排序规则由Comparatator类控制。类比int min(Collection coll, Comparator c)

void fill(List list, Object obj),用元素obj填充list中所有元素

int frequency(Collection c, Object o)，统计元素出现次数

int indexOfSubList(List list, List target), 统计targe在list中第一次出现的索引，找不到则返回-1，类比int lastIndexOfSubList(List source, list target).

boolean replaceAll(List list, Object oldVal, Object newVal), 用新元素替换旧元素。
```
简单用法


```
public static void main(String[] args) {
      ArrayList num =  new ArrayList();
      num.add(3);
      num.add(-1);
      num.add(-5);
      num.add(10);
      System.out.println(num);  //[3, -1, -5, 10]
      System.out.println(Collections.max(num)); //10
      System.out.println(Collections.min(num)); //-5
      Collections.replaceAll(num, -1, -7);   
      System.out.println(Collections.frequency(num, 3)); //1
      Collections.sort(num); 
      System.out.println(Collections.binarySearch(num, -5)); //1
  }
```
#### 同步控制
Collections中几乎对每个集合都定义了同步控制方法，例如 SynchronizedList(), SynchronizedSet()等方法，来将集合包装成线程安全的集合。下面是Collections将普通集合包装成线程安全集合的用法，

```
public static void main(String[] args) {
        Collection c = Collections.synchronizedCollection(new ArrayList());
        List list = Collections.synchronizedList(new ArrayList());
        Set s = Collections.synchronizedSet(new HashSet());
        Map m = Collections.synchronizedMap(new HashMap());
    }
```


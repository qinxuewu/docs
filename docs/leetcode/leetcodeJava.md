## 两数之和
- 给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为目标值的那 两个 整数，并返回他们的数组下标。
- 你可以假设每种输入只会对应一个答案。但是，你不能重复利用这个数组中同样的元素。

示例:
```
给定 nums = [2, 7, 11, 15], target = 9

因为 nums[0] + nums[1] = 2 + 7 = 9
所以返回 [0, 1]
```

暴力破解法思路： 
- 通过for循环中嵌套一个for循坏实现。并且第二个循坏的取值的 "j" 下标每次都比第一个循坏的下标 "i"+1 
- 通过if判断  nums[i]+nums[j]==target 则返回i,j下标值

复杂度：
- 对于每个元素，我们试图通过遍历数组的其余部分来寻找它所对应的目标元素 这将耗费 O(n)O(n) 的时间。因此时间复杂度为 O(n^2)。
- 空间复杂度：O(1)O(1)。

```
public static int[] twoSum(int[] nums, int target) {
	int [] result=new int[2];
	    for (int i = 0; i < nums.length; i++) {
		for (int j = i+1; j < nums.length; j++) {
			if(nums[i]+nums[j]==target){
				result[0]=i;
				result[1]=j;
				return result;
			     }
			}
		}		 
	       return result;
	}
  ```
hashMap解法
- 为了对运行时间复杂度进行优化，我们需要一种更有效的方法来检查数组中是否存在目标元素。如果存在，我们需要找出它的索引。
- 在进行迭代并将元素插入到表中的同时，我们还会回过头来检查表中是否已经存在当前元素所对应的目标元素。如果它存在，那我们已经找到了对应解，并立即将其返回
  
```
public static int[] twoSum2(int[] nums, int target) {
	Map<Integer, Integer> map = new HashMap<>();
	for (int i = 0; i < nums.length; i++) {
		int result=target-nums[i];  //比如target=9, 		1: 第一次遍历  9-2=7 , 2: 9-7=2
		if(map.containsKey(result)){
			return new int[] {map.get(result), i };
		}
		map.put(nums[i], i);  //第一次map中没有7这个元素 	1: put(2,0)
		}
	return null;
		       
}
```

## 无重复字符的最长子串
给定一个字符串，请你找出其中不含有重复字符的 最长子串 的长度。
```
示例 1:

输入: "abcabcbb"
输出: 3 
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。
示例 2:

输入: "bbbbb"
输出: 1
解释: 因为无重复字符的最长子串是 "b"，所以其长度为 1。
示例 3:

输入: "pwwkew"
输出: 3
解释: 因为无重复字符的最长子串是 "wke"，所以其长度为 3。
     请注意，你的答案必须是 子串 的长度，"pwke" 是一个子序列，不是子串。
```
暴力法
```
/**
	 * 思路：  1 通过两个for循坏嵌套 遍历所有字符串
	 * @param s
	 * @return
	 */
	 public static int lengthOfLongestSubstring(String s) {
	        int n = s.length();
	        int ans = 0;
	        for (int i = 0; i < n; i++){
	        	 for (int j = i + 1; j <= n; j++){
	        		 	/**
	        		 	 * 内存循坏
	        		 	 * 第一次遍历：s=abcabcbb, i=0,j=1
	        		 	 * 第一次遍历：s=abcabcbb, i=0,j=2
	        		 	 * 第一次遍历：s=abcabcbb, i=0,j=3 
	        		 	 */
		                if (allUnique(s, i, j)) {	
		                	//如果返回true   说明 i 到j下标的字符串是 无重复字符的最长子串
		                	if(ans==0){
		                		ans++;
		                	}
		                	if(ans<( j - i)){
		                		ans=j - i;
		                	}
		                	 System.err.println("ans:"+ans);
		                }
		            }
	        }
	           
	          return ans;
	    }

	    public  static boolean allUnique(String s, int start, int end) {
	    	/**
	    	 * 第一次遍历：s=abcabcbb, start=0,end=1  如果子字符串中的字符都是唯一的，它会返回true
	    	 */
	        Set<Character> set = new HashSet<>();
	        for (int i = start; i < end; i++) {
	        	// 循坏遍历指定的起-终下标  取出对应下标的字符串
	            Character ch = s.charAt(i);
	            if (set.contains(ch)) {
	            	//如果存在直接返回
	            	return false;
	            }
	            //不存在放入set
	            set.add(ch);
	        }
	        return true;
	    }
```

## 整数反转

- 给出一个 32 位的有符号整数，你需要将这个整数中每位上的数字进行反转。
- 假设我们的环境只能存储得下 32 位的有符号整数，则其数值范围为 [−231,  231 − 1]。请根据这个假设，如果反转后整数溢出那么就返回 0。
``` java
public static int reverse(int x) {
		int rev = 0;   
		while(x != 0) {
			int pop = x % 10;   // 取得余数 
			x /= 10;           //进行去位 
			//判断是否正溢出
			if(rev > Integer.MAX_VALUE / 10 || (rev == Integer.MAX_VALUE / 10 && pop > 7)) {
				return 0;
			}
			//判断是否负溢出
			if(rev < Integer.MIN_VALUE / 10 || (rev == Integer.MIN_VALUE / 10 && pop < -8)) {
				return 0;
			}
			
			rev = rev * 10 + pop;    //求出反转整数
		}
		
		return rev; 
	}
```
## 回文数
判断一个整数是否是回文数。回文数是指正序（从左向右）和倒序（从右向左）读都是一样的整数。

示例 1:

```
输入: 121
输出: true
```

示例 2:

```
输入: -121
输出: false
解释: 从左向右读, 为 -121 。 从右向左读, 为 121- 。因此它不是一个回文数。
```

示例 3:

```
输入: 10
输出: false
解释: 从右向左读, 为 01 。因此它不是一个回文数。
```


进阶:

你能不将整数转为字符串来解决这个问题吗？


 **算法** 

* 首先，我们应该处理一些临界情况。所有负数都不可能是回文，例如：-123 不是回文，因为 - 不等于 3。所以我们可以对所有负数返回 false。

* 现在，让我们来考虑如何反转后半部分的数字。 对于数字 1221，如果执行 1221 % 10，我们将得到最后一位数字 1，要得到倒数第二位数字，我们可以先通过除以 10 把最后一位数字从 1221 中移除，1221 / 10 = 122，再求出上一步结果除以10的余数，122 % 10 = 2，就可以得到倒数第二位数字。如果我们把最后一位数字乘以10，再加上倒数第二位数字，1 * 10 + 2 = 12，就得到了我们想要的反转后的数字。 如果继续这个过程，我们将得到更多位数的反转数字。

 **现在的问题是，我们如何知道反转数字的位数已经达到原始数字位数的一半？** 

我们将原始数字除以 10，然后给反转后的数字乘上 10，所以，当原始数字小于反转后的数字时，就意味着我们已经处理了一半位数的数字。
``` java

  /**
     * 如果该数字是回文，其后半部分反转后应该与原始数字的前半部分相同。
     * 所以直接判断一半既可     如果数字是长度是奇数位  
     */
    public static Boolean isPalindrome(String str){
        boolean result=false;
        for(int i=0; i<str.length()/2;i++){
            if(str.charAt(i) == str.charAt(str.length()-1-i)){
                result=true;
            }else{
                return result;
            }
        }
        return result;
    }

    //不将整数转为字符串来解决这个问题
    public static boolean isPalindrome2(int x) {
    	// 特殊情况：
        // 如上所述，当 x < 0 时，x 不是回文数。
        // 同样地，如果数字的最后一位是 0，为了使该数字为回文，
        // 则其第一位数字也应该是 0
        // 只有 0 满足这一属性
    	if(x<0 || (x % 10 == 0 && x != 0) ){
    		return false;
    	} 
    	// 对于数字 1221，如果执行 1221 % 10，我们将得到最后一位数字 1
    	// 要得到倒数第二位数字，我们可以先通过除以 10 把最后一位数字从 1221 中移除，1221 / 10 = 122，
    	// 再求出上一步结果除以10的余数，122 % 10 = 2，就可以得到倒数第二位数字
    	// 如果继续这个过程，我们将得到更多位数的反转数字。
    	  int revertedNumber = 0;
          while(x > revertedNumber) {
              revertedNumber = revertedNumber * 10 + x % 10;
              x /= 10;  //表示x等于x整除10，不要余数

          }

          // 当数字长度为奇数时，我们可以通过 revertedNumber/10 去除处于中位的数字。
          // 例如，当输入为 12321 时，在 while 循环的末尾我们可以得到 x = 12，revertedNumber = 123，
          // 由于处于中位的数字不影响回文（它总是与自己相等），所以我们可以简单地将其去除。
          return x == revertedNumber || x == revertedNumber/10;
    }
```


## 罗马数字转整数
罗马数字包含以下七种字符: I， V， X， L，C，D 和 M。

```
字符          数值
I             1
V             5
X             10
L             50
C             100
D             500
M             1000
```
例如， 罗马数字 2 写做 II ，即为两个并列的 1。12 写做 XII ，即为 X + II 。 27 写做  XXVII, 即为 XX + V + II 。

通常情况下，罗马数字中小的数字在大的数字的右边。但也存在特例，例如 4 不写做 IIII，而是 IV。数字 1 在数字 5 的左边，所表示的数等于大数 5 减小数 1 得到的数值 4 。同样地，数字 9 表示为 IX。这个特殊的规则只适用于以下六种情况：

* I 可以放在 V (5) 和 X (10) 的左边，来表示 4 和 9。
* X 可以放在 L (50) 和 C (100) 的左边，来表示 40 和 90。 
* C 可以放在 D (500) 和 M (1000) 的左边，来表示 400 和 900。
* 给定一个罗马数字，将其转换成整数。输入确保在 1 到 3999 的范围内。

![示例](https://images.gitee.com/uploads/images/2019/0215/103251_ce17b732_1478371.png)

 **思路：** 
* 循环遍历字符串
* 根据条件特别判断 IV IX,XL,XC,CD,CM  这个六种特别组合 做减法
* 其余根据字母取值对应的数据做累加运算即可

``` java
public static void main(String[] args) {
		String s = "MCMXCIV";
		int temp = 0;
		for (int i = 0; i < s.length(); i++) {		
			//首先判断遍历时字符串长度是否大于1 且 遍历时 下标字母是否属于特殊组合的字母
			if((s.charAt(i)=='I'||s.charAt(i)=='X'||s.charAt(i)=='C') && i<s.length()-1){
				//如果是   截取字符串 起始下标为i 结束下标为i+2  等于没去截取两个字符组合在一起 判断是否是特殊组合
				if(s.substring(i, i+2).equals("IV")){
					//如果是 直接赋值累加 并且遍历下标i加1
					temp=temp+4;
					i=i+1;
					continue;
				}
				if(s.substring(i, i+2).equals("IX")){
					temp=temp+9;
					i=i+1;
					continue;
				}
				if(s.substring(i, i+2).equals("XL")){
					temp=temp+40;
					i=i+1;
					continue;
				}
				if(s.substring(i, i+2).equals("XC")){
					temp=temp+90;
					i=i+1;
					continue;
				}
				if(s.substring(i, i+2).equals("CD")){
					temp=temp+400;
					i=i+1;
					continue;
				}
				if(s.substring(i, i+2).equals("CM")){
					temp=temp+900;
					i=i+1;
					continue;
				}
			}	
			if (s.charAt(i) == 'I') {
				temp = temp + 1;
				continue;
			}
			if (s.charAt(i) == 'V') {
				temp = temp + 5;
				continue;
			}
			if (s.charAt(i) == 'X') {
				temp = temp + 10;
				continue;
			}
			if (s.charAt(i) == 'L') {
				temp = temp + 50;
				continue;
			}
			if (s.charAt(i) == 'C') {
				temp = temp + 100;
				continue;
			}
			if (s.charAt(i) == 'D') {
				temp = temp + 500;
				continue;
			}
			if (s.charAt(i) == 'M') {
				temp = temp + 1000;
				continue;
			}
		}

		System.out.println(temp);
	}
```

## 整数转罗马数字
示例 


```
输入: 3
输出: "III"


输入: 1994
输出: "MCMXCIV"
解释: M = 1000, CM = 900, XC = 90, IV = 4.
```

 ** 思路：** 
* 1 列出所有特例和普通组合情况，用两个数组存储
* 2 循环遍历匹配输入的整数，是否大于等于数组中所有的组合情况
* 3 如果大于或等于就把整数减去匹配到数值，且获得罗马的数字赋值给临时变量。继续while循坏 重复以上过程。

``` java
public static String romanToInt(int num) {
       int values[]={1000,900,500,400,100,90,50,40,10,9,5,4,1};
       String reps[]={"M","CM","D","CD","C","XC","L","XL","X","IX","V","IV","I"};
       String temp="";   
       for(int i=0; i<13; i++){
	      while(num>=values[i]){
	          num=num-values[i];
	          temp=temp+ reps[i];
	  }
	}
     return temp;
}
```
## 最长公共前缀
编写一个函数来查找字符串数组中的最长公共前缀。

如果不存在公共前缀，返回空字符串 ""。

示例 1:

```
输入: ["flower","flow","flight"]
输出: "fl"
```
示例 2:

```
输入: ["dog","racecar","car"]
输出: ""
解释: 输入不存在公共前缀。
```
 **解题思路：** 
* 选择第一个字符串作为标准，把它的前缀串，与其他所有字符串进行判断，看是否是它们所有人的前缀子串。这里的时间性能是O(m*n*m)

``` java
	public static String longestCommonPrefix(String[] strs) {
		//数组长度小于1 返回空
		if(strs.length==0){
			return "";
		}
		if(strs.length == 1){
			return strs[0];
		}
		//选择一个字符串作为标准
		String temStr=strs[0];
		StringBuilder str=new StringBuilder();
		boolean flag = false;
		for(int i = 0; i <strs[0].length(); i++){
				//把它的前缀串，与其他所有字符串进行判断
				char foo=temStr.charAt(i);
				for (int j = 1; j < strs.length; j++) {
					//判断遍历下标是否越界或   前缀是否相等
					if(i >=strs[j].length() || strs[j].charAt(i)!=foo){
						  flag =true;
		                  break;
					}
				}	
				if (flag){
		                break;
		            }else{
		            	str.append(foo);
		         }
		}
		return str.toString();
    }
```
## 合并两个有序链表
将两个有序链表合并为一个新的有序链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。 

示例： 
```
输入：1->2->4, 1->3->4
输出：1->1->2->3->4->4
```

``` java
public class LettCode21 {
	public static class ListNode{
		//数据域
		int val;
		//指针域 指向下一个节点
		ListNode next;
		
	
		ListNode(int x) { 
			val = x; 
		}

		public int getVal() {
			return val;
		}

		public void setVal(int val) {
			this.val = val;
		}

		public ListNode getNext() {
			return next;
		}

		public void setNext(ListNode next) {
			this.next = next;
		}
		
		
	}
	
	 public static ListNode mergeTwoLists(ListNode l1, ListNode l2) {
		 if (l1 == null) return l2;
	     if (l2 == null) return l1;
	        
		 ListNode head =new ListNode(0);
		 ListNode cur = head ;
		 while(l1!=null && l2 !=null){
			 if(l1.val<=l2.val){
				 cur.next=l1;
				 l1=l1.next;
			 }else{
				 cur.next=l2;				
				 l2=l2.next;
			 }
			 cur=cur.next;
		 }
		  //任一为空，直接连接另一条链表
	        if (l1 == null) {
	            cur.next = l2;
	        } else {
	            cur.next = l1;
	        }
		 return head.next;
	  }
	
	 public static void main(String[] args) {
		 ListNode l1=new ListNode(1);
		 ListNode l2=new ListNode(2);
		 ListNode l3=new ListNode(4);
		 l1.next=l2;
		 l2.next=l3;
		 l3.next=null;
		 
		 
		 ListNode l4=new ListNode(1);
		 ListNode l5=new ListNode(3);
		 ListNode l6=new ListNode(4);
		 l4.next=l5;
		 l5.next=l6;
		 l6.next=null;
		 

		 ListNode list=mergeTwoLists(l1, l4);
		 while(list!=null){
			 System.out.println(list.val);
			 list=list.next;
		 }
	}
}
```

## 删除排序数组中的重复项
* 给定一个排序数组，你需要在原地删除重复出现的元素，使得每个元素只出现一次，返回移除后数组的新长度。
* 不要使用额外的数组空间，你必须在原地修改输入数组并在使用 O(1) 额外空间的条件下完成。

示例 1:
```
给定数组 nums = [1,1,2], 

函数应该返回新的长度 2, 并且原数组 nums 的前两个元素被修改为 1, 2。 

你不需要考虑数组中超出新长度后面的元素。
```

``` java
public class LettCode26 {

	public static void main(String[] args) {
		int[] nums = {0,0,1,1,1,2,2,3,3,4};
	    System.out.println(removeDuplicates(nums));
	}
	
	/**
	 * 放置两个指针 ii 和 jj，其中 ii 是慢指针，而 jj 是快指针
	 * 只要 nums[i] = nums[j]，我们就增加 j 以跳过重复项
	 * 当我们遇到 nums[j] 不等于nums[i] 时，跳过重复项的运行已经结束，因此我们必须把它（nums[j]）的值复制到 nums[i + 1]。然后递增 i
	 * 接着我们将再次重复相同的过程，直到 j 到达数组的末尾为止。
	 * 
	 * @param nums
	 * @return
	 */
	public static int removeDuplicates(int[] nums) {
	    if (nums.length == 0) return 0;
	    int i = 0;
	    for (int j = 1; j < nums.length; j++) {
	    	System.out.println("nums[i]:"+nums[i]+",  nums[j]:"+nums[j]);
	        if (nums[j] != nums[i]) {
	            i++;
	            nums[i] = nums[j];
	        }
	    }
	    return i + 1;
	}
}
```

## 移除元素
给定一个数组 nums 和一个值 val，你需要原地移除所有数值等于 val 的元素，返回移除后数组的新长度。

不要使用额外的数组空间，你必须在原地修改输入数组并在使用 O(1) 额外空间的条件下完成。

元素的顺序可以改变。你不需要考虑数组中超出新长度后面的元素。

示例 1:
```
给定 nums = [3,2,2,3], val = 3,

函数应该返回新的长度 2, 并且 nums 中的前两个元素均为 2。

你不需要考虑数组中超出新长度后面的元素。
```
 **思路** 

* 现在考虑数组包含很少的要删除的元素的情况。例如，num=[1，2，3，5，4]，Val=4 num=[1，2，3，5，4]，Val=4。之前的算法会对前四个元素做不必要的复制操作。另一个例子是 num=[4，1，2，3，5]，Val=4num=[4，1，2，3，5]，Val=4。似乎没有必要将 [1，2，3，5][1，2，3，5]这几个元素左移一步，因为问题描述中提到元素的顺序可以更改。

 **算法** 

* 当我们遇到 nums[i] = valnums[i]=val 时，我们可以将当前元素与最后一个元素进行交换，并释放最后一个元素。这实际上使数组的大小减少1。
* 请注意，被交换的最后一个元素可能是您想要移除的值。但是不要担心，在下一次迭代中，我们仍然会检查这个元素。

``` java
	
	public int removeElement2(int[] nums, int val) {
	    int i = 0;
	    int n = nums.length;
	    while (i < n) {
	    	//当我们遇到 nums[i] = val 时，我们可以将当前元素与最后一个元素进行交换，并释放最后一个元素
	    	//这实际上使数组的大小减少了 1
	        if (nums[i] == val) {
	            nums[i] = nums[n - 1];
	            n--;
	        } else {
	            i++;
	        }
	    }
	    return n;
	}
```
## 实现strStr()
实现 strStr() 函数。

给定一个 haystack 字符串和一个 needle 字符串，在 haystack 字符串中找出 needle 字符串出现的第一个位置 (从0开始)。如果不存在，则返回  -1。


```
示例 1:

输入: haystack = "hello", needle = "ll"
输出: 2

示例 2:
输入: haystack = "aaaaa", needle = "bba"
输出: -1
```

``` java
/**
	 * 思路：
	 * 
	 *  从(下标0至needle+1)开始切割haystack字符串进行和needle匹配是否相同
	 *  如果不想等于则起切割的起点和重点进行加1 从新开始切割匹配。
	 *  如果匹配成功则直接返回起始下标
	 *  当前切割的长度大于 字符串的长度时 则返回-1
	 *  
	 * @param haystack
	 * @param needle
	 * @return
	 */
	 public static int strStr(String haystack, String needle) {
		 if(needle==""|| needle.length()==0){
			 return 0;
		 }
		 int n=haystack.length();
		 if(n<needle.length()){
			 return -1;
		 }
		 int index=-1;
		 int i=0;
		 int k=needle.length();
		 while(i+k<=haystack.length()){
			    if(haystack.substring(i,i+needle.length()).equals(needle)){
	                return i;
	            }else{
	                i++;
	            }
		 }
		  
		 return index;
	}
```

## 搜索插入位置
给定一个排序数组和一个目标值，在数组中找到目标值，并返回其索引。如果目标值不存在于数组中，返回它将会被按顺序插入的位置。


```
示例 1:

输入: [1,3,5,6], 5
输出: 2
```

``` java
	/**
	 * 思路：
	 * 
	 *  从(下标0至needle+1)开始切割haystack字符串进行和needle匹配是否相同
	 *  如果不想等于则起切割的起点和重点进行加1 从新开始切割匹配。
	 *  如果匹配成功则直接返回起始下标
	 *  当前切割的长度大于 字符串的长度时 则返回-1
	 *  
	 * @param haystack
	 * @param needle
	 * @return
	 */
	 public static int strStr(String haystack, String needle) {
		 if(needle==""|| needle.length()==0){
			 return 0;
		 }
		 int n=haystack.length();
		 if(n<needle.length()){
			 return -1;
		 }
		 int index=-1;
		 int i=0;
		 int k=needle.length();
		 while(i+k<=haystack.length()){
			    if(haystack.substring(i,i+needle.length()).equals(needle)){
	                return i;
	            }else{
	                i++;
	            }
		 }
		  
		 return index;
	}
```


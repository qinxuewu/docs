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
```
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
### 高斯求和
- 求和  1+2+3+4+5+6…+100 
- 求和  1+2+3+4+5+6…+n
```
	/**
	 * 1+2+3+4+......+97+98+99+100
	 * 
	 * 高斯求和：
	 * 	1+100=101
	 *  2+99=101
	 *  3+98=101
	 *  4+97=101
	 * 所以得出结果101 X 50(100的一半)
	 * @param args
	 */
	public static void main(String[] args) {
		int  sum = 0,n = 100;
		sum = (1 + n) *(n/2);
		System.out.println(sum);
	}
```

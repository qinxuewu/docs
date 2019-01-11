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


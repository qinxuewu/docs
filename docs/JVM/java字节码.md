# 简介
Java虚拟机指令由一个操作码组成，该操作码指定要执行的操作，后跟零个或多个操作数，这些操作数包含要操作的值。

## 操作数栈
在程序的解释执行过程中，每次在为Java方法分配栈桢时，jvm虚拟机需要开辟一块额外的空间作为操作数栈，用来存储计算操作数和返回结果
每一条指令执行之前,虚拟机要求该指令的操作数已被压入操作数栈中。在执行指令时， 虚拟机会将该指令所需的操作数弹出，并将指令重新压入栈中
 
## const系列指令
主要负责把简单的数值类型送到栈顶。该系列命令不带参数。
比如对应int型才该方式只能把-1,0,1,2,3,4,5（分别采用iconst_m1,iconst_0, iconst_1, iconst_2, iconst_3, iconst_4, iconst_5）
送到栈顶。 对于int型，其他的数值请使用push系列命令（比如bipush）。

* `iconst`    将int型推送至栈顶,范围 [-1,5]
* `lconst`    将long型推送至栈顶
* `fconst`    将float型推送至栈顶
* `dconst `   将double型推送至栈顶

代码实例：
```
public static void main(String[] args) {
		int a=-1;
		long b=2;
		float c=3f;
		double d=4d;


}
字节码：
public class com.example.ApplicationTests {
  public com.example.ApplicationTests();
    Code:
       0: aload_0                           // 将第一个引用类型本地变量推送至栈顶
       1: invokespecial #1                  // Method java/lang/Object."<init>":()V
       4: return

  public static void main(java.lang.String[]);
    Code:
       0: iconst_m1                        //将int型(-1)推送至栈顶
       1: istore_1                         
       2: ldc2_w        #2                  // long 2l
       5: lstore_2
       6: ldc           #4                  // float 3.0f
       8: fstore        4
      10: ldc2_w        #5                  // double 4.0d
      13: dstore        5
      15: return
}

```


## push系列指令
该系列命令负责把  一个整形数字（长度比较小）送到到栈顶。该系列命令有一个参数，用于指定要送  到栈顶的数字。
注意该系列命令只能操作一定范围内的整形数值，超出该范围的使用将使用ldc命令系列。

* `bipush`  将单字节的常量值(-128~127)推送至栈顶
* `sipush`  将一个短整型常量值(-32768~32767)推送至栈顶

## ldc系列指令
Java 虚拟机还可以通过 ldc 加载常量池中的常量值。这些常量包括 int 类型、long 类型、float 类型.double 类型、String 类型以及 Class类型的常量。对于const系列命令和push系列命令操作范围之外的数值类型常量，都放在常量池中.所有不是通过new创建的String都是放在常量池中

* `ldc`     将int, float或String型常量值从常量池中推送至栈顶
* `ldc_w`   将int, float或String型常量值从常量池中推送至栈顶（宽索引）
* `ldc2_w`  将long或double型常量值从常量池中推送至栈顶（宽索引）

## load系列指令
该系列命令负责把本地变量的送到栈顶。这里的本地变量不仅可以是数值类型，还可以是引用类型
![输入图片说明](https://images.gitee.com/uploads/images/2019/0107/181230_df279801_1478371.png "屏幕截图.png")

* `iload`                          将指定的int型本地变量推送至栈顶
* `lload `                         将指定的long型本地变量推送至栈顶
* `fload`                          将指定的float型本地变量推送至栈顶
* `dload`                         将指定的double型本地变量推送至栈顶
* `aload`                         将指定的引用类型本地变量推送至栈顶



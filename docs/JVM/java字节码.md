# 简介
Java虚拟机指令由一个操作码组成，该操作码指定要执行的操作，后跟零个或多个操作数，这些操作数包含要操作的值。

## 操作数栈
在程序的解释执行过程中，每次在为Java方法分配栈桢时，jvm虚拟机需要开辟一块额外的空间作为操作数栈，用来存储计算操作数和返回结果
每一条指令执行之前,虚拟机要求该指令的操作数已被压入操作数栈中。在执行指令时， 虚拟机会将该指令所需的操作数弹出，并将指令重新压入栈中

以加法指令 iadd 为例。假设在执行该指令前，栈顶的两个元素分别为 int 值 1 和 int 值 2，那么 iadd 指令将弹出这两个 int，并将求得的和 int 值 3 压入栈中。
 
由于 iadd 指令只消耗栈顶的两个元素，因此，对于离栈顶距离为 2 的元素，即图中的问号，iadd 指令并不关心它是否存在，更加不会对其进行修改。

Java 字节码中有好几条指令是直接作用在操作数栈上的。最为常见的便是 dup： 复制栈顶元素，以及 pop：舍弃栈顶元素。

dup 指令常用于复制 new 指令所生成的未经初始化的引用。例如在下面这段代码的 foo 方法中，当执行 new 指令时，Java 虚拟机将指向一块已分配的、未初始化的内存的引用压入操作数栈中。

## const系列指令
在 Java 字节码中，有一部分指令可以直接将常量加载到操作数栈上。以 int 类型为例，Java 虚拟机既可以通过 iconst 指令加载 -1 至 5 之间的 int 值，也可以通过 bipush、sipush 加载一个字节、两个字节所能代表的 int 值。

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

## load系列常量指令
该系列命令负责把本地变量的送到栈顶。这里的本地变量不仅可以是数值类型，还可以是引用类型
![输入图片说明](https://images.gitee.com/uploads/images/2019/0107/181230_df279801_1478371.png "屏幕截图.png")

* `iload`    将指定的int型本地变量推送至栈顶
* `lload `   将指定的long型本地变量推送至栈顶
* `fload`    将指定的float型本地变量推送至栈顶
* `dload`    将指定的double型本地变量推送至栈顶
* `aload`    将指定的引用类型本地变量推送至栈顶

## load数组相关指令
* `iaload`   将int型数组指定索引的值推送至栈顶
* `laload`   将long型数组指定索引的值推送至栈顶                  
* `faload`   将float型数组指定索引的值推送至栈顶                   
* `daload`   将double型数组指定索引的值推送至栈顶                   
* `aaload`   将引用型数组指定索引的值推送至栈顶   
* `baload`   将boolean或byte型数组指定索引的值推送至栈顶  
* `caload`   将char型数组指定索引的值推送至栈顶 
* `saload`   将short型数组指定索引的值推送至栈顶 


## 存储指令store
* `istore`  	将栈顶int型数值存入指定本地变量
* `lstore`  	将栈顶long型数值存入指定本地变量
* `fstore`  	将栈顶float型数值存入指定本地变量
* `dstore`  	将栈顶double型数值存入指定本地变量
* `astore`  	将栈顶引用型数值存入指定本地变量
* `iastore` 	将栈顶int型数值存入指定数组的指定索引位置                       
* `lastore` 	将栈顶long型数值存入指定数组的指定索引位置                       
* `fastore` 	将栈顶float型数值存入指定数组的指定索引位置 
* `dastore` 	将栈顶double型数值存入指定数组的指定索引位置     
* `aastore` 	将栈顶引用型数值存入指定数组的指定索引位置
* `bastore` 	将栈顶boolean或byte型数值存入指定数组的指定索引位置
* `castore` 	将栈顶char型数值存入指定数组的指定索引位置
* `sastore` 	 将栈顶short型数值存入指定数组的指定索引位置

## 数组访问指令
* `void`  指令 return
* `int booler,byte,char,short`  指令 ireturn
* `long`  指令 lreturn
* `float`  指令 freturn
* `double`  指令 dreturn
* `rederence`  指令 areturn

## pop系列
简单对栈顶进行操作
- pop           将栈顶数值弹出 (数值不能是long或double类型的)
- pop2          将栈顶的一个（long或double类型的)或两个数值弹出
- dup           复制栈顶数值(数值不能是long或double类型的)并将复制值压入栈顶
- dup_x1        复制栈顶数值(数值不能是long或double类型的)并将两个复制值压入栈顶
- dup_x2        复制栈顶数值(数值不能是long或double类型的)并将三个（或两个）复制值压入栈顶
- dup2          复制栈顶一个（long或double类型的)或两个（其它）数值并将复制值压入栈顶
- dup2_x1       复制栈顶数值(long或double类型的)并将两个复制值压入栈顶
- dup2_x2       复制栈顶数值(long或double类型的)并将三个（或两个）复制值压入栈顶

## 栈顶元素操作系列

- swap               将栈最顶端的两个数值互换(数值不能是long或double类型的)
- iadd               将栈顶两int型数值相加并将结果压入栈顶
- ladd               将栈顶两long型数值相加并将结果压入栈顶
- fadd               将栈顶两float型数值相加并将结果压入栈顶
- dadd               将栈顶两double型数值相加并将结果压入栈顶
- isub               将栈顶两int型数值相减并将结果压入栈顶
- lsub               将栈顶两long型数值相减并将结果压入栈顶
- fsub               将栈顶两float型数值相减并将结果压入栈顶
- dsub               将栈顶两double型数值相减并将结果压入栈顶
- imul               将栈顶两int型数值相乘并将结果压入栈顶
- lmul               将栈顶两long型数值相乘并将结果压入栈顶
- fmul               将栈顶两float型数值相乘并将结果压入栈顶
- dmul               将栈顶两double型数值相乘并将结果压入栈顶
- idiv               将栈顶两int型数值相除并将结果压入栈顶
- ldiv               将栈顶两long型数值相除并将结果压入栈顶
- fdiv               将栈顶两float型数值相除并将结果压入栈顶
- ddiv               将栈顶两double型数值相除并将结果压入栈顶
- irem               将栈顶两int型数值作取模运算并将结果压入栈顶
- lrem               将栈顶两long型数值作取模运算并将结果压入栈顶
- frem               将栈顶两float型数值作取模运算并将结果压入栈顶
- drem               将栈顶两double型数值作取模运算并将结果压入栈顶
- ineg               将栈顶int型数值取负并将结果压入栈顶
- lneg               将栈顶long型数值取负并将结果压入栈顶
- fneg               将栈顶float型数值取负并将结果压入栈顶
- dneg               将栈顶double型数值取负并将结果压入栈顶
- ishl               将int型数值左移位指定位数并将结果压入栈顶
- lshl               将long型数值左移位指定位数并将结果压入栈顶
- ishr               将int型数值右（符号）移位指定位数并将结果压入栈顶
- lshr               将long型数值右（符号）移位指定位数并将结果压入栈顶
- iushr              将int型数值右（无符号）移位指定位数并将结果压入栈顶
- lushr              将long型数值右（无符号）移位指定位数并将结果压入栈顶
- iand               将栈顶两int型数值作“按位与”并将结果压入栈顶
- land               将栈顶两long型数值作“按位与”并将结果压入栈顶
- ior                将栈顶两int型数值作“按位或”并将结果压入栈顶
- lor                将栈顶两long型数值作“按位或”并将结果压入栈顶
- ixor               将栈顶两int型数值作“按位异或”并将结果压入栈顶
- lxor               将栈顶两long型数值作“按位异或”并将结果压入栈顶

## 运算指令
运算或算术指令用于对两个操作数栈上的值进行某种特定运算，并把结果重新存入到操作栈顶。
无论是哪种算术指令，都使用Java虚拟机的数据类型，由于没有直接支持byte、short、char和boolean类型的算术指令，使用操作int类型的指令代替

- 加法指令：iadd、ladd、fadd、dadd。
- 减法指令：isub、lsub、fsub、dsub。
- 乘法指令：imul、lmul、fmul、dmul。
- 除法指令：idiv、ldiv、fdiv、ddiv。
- 求余指令：irem、lrem、frem、drem。
- 取反指令：ineg、lneg、fneg、dneg。
- 位移指令：ishl、ishr、iushr、lshl、lshr、lushr。
- 按位或指令：ior、lor。
- 按位与指令：iand、land。
- 按位异或指令：ixor、lxor。
- 局部变量自增指令：iinc。
- 比较指令：dcmpg、dcmpl、fcmpg、fcmpl、lcmp。


## 类型转换指令
类型转换指令可以将两种不同的数值类型进行相互转换。

- int类型到long、float或者double类型。
- long类型到float、double类型。
- float类型到double类型。

i2l、f2b、l2f、l2d、f2d。

窄化类型转换

i2b、i2c、i2s、l2i、f2i、f2l、d2i、d2l和d2f。

## 对象创建与访问指令
- 创建类实例的指令：new。
- 创建数组的指令：newarray、anewarray、multianewarray。
- 访问类字段（static字段，或者称为类变量）和实例字段（非static字段，或者称为实例变量）的指令：getfield、putfield、getstatic、putstatic。
- 把一个数组元素加载到操作数栈的指令：baload、caload、saload、iaload、laload、faload、daload、aaload。
- 将一个操作数栈的值存储到数组元素中的指令：bastore、castore、sastore、iastore、fastore、dastore、aastore。
- 取数组长度的指令：arraylength。
- 检查类实例类型的指令：instanceof、checkcast。

## 操作数栈管理指令

- 将操作数栈的栈顶一个或两个元素出栈：pop、pop2。
- 复制栈顶一个或两个数值并将复制值或双份的复制值重新压入栈顶：dup、dup2、dup_x1、dup2_x1、dup_x2、dup2_x2。
- 将栈最顶端的两个数值互换：swap。

## 控制转移指令
控制转移指令可以让Java虚拟机有条件或无条件地从指定的位置指令而不是控制转移指令的下一条指令继续执行程序。

- 条件分支：ifeq、iflt、ifle、ifne、ifgt、ifge、ifnull、ifnonnull、if_icmpeq、if_icmpne、if_icmplt、if_icmpgt、if_icmple、if_icmpge、if_acmpeq和if_acmpne。
- 复合条件分支：tableswitch、lookupswitch。
- 无条件分支：goto、goto_w、jsr、jsr_w、ret。

## 方法调用和返回指令
-invokevirtual 指令用于调用对象的实例方法，根据对象的实际类型进行分派（虚方法分派），这也是Java语言中最常见的方法分派方式。
- invokeinterface 指令用于调用接口方法，它会在运行时搜索一个实现了这个接口方法的对象，找出适合的方法进行调用。
- invokespecial 指令用于调用一些需要特殊处理的实例方法，包括实例初始化（＜init＞）方法、私有方法和父类方法。
- invokestatic  调用静态方法（static方法）。
- invokedynamic 指令用于在运行时动态解析出调用点限定符所引用的方法，并执行该方法，前面4条调用指令的分派逻辑都固化在Java虚拟机内部，而invokedynamic指令的分派逻辑是由用户所设定的引导方法决定的。

-方法调用指令与数据类型无关，而方法返回指令是根据返回值的类型区分的，包括ireturn（当返回值是boolean、byte、char、short和int类型时使用）、lreturn、freturn、dreturn和areturn，另外还有一条return指令供声明为void的方法、实例初始化方法以及类和接口的类初始化方法使用。



参考链接 ：https://www.cnblogs.com/tenghoo/p/jvm_opcodejvm.html

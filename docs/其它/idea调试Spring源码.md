### 源码下载地址

Spring的源码可以从GitHub上下载：https://github.com/spring-projects/spring-framework

### 下载配置gradle
https://gradle.org/releases/ 解压。配置环境变量，在cmd中使用命令：gradle -version，出现版本信息则是配置完成。

### 使用gradle编译spring
- spring目录中：import-into-eclipse.*是导入Eclipse的脚本，点击运行之后会有提示。 
- 因为我用的是idea，因此需要使用import-into-idea.md，最后一个文件是文本文件，打开之后会发现这是一个指导用户怎么编译的说明（这是一个用markdown语法写的文件）。


打开cmd，cd到spring源码目录中，使用命令：gradlew.bat cleanIdea :spring-oxm:compileTestJava。先对 Spring-oxm 模块进行预编译耐心等待。

![输入图片说明](https://images.gitee.com/uploads/images/2018/1110/165000_e2b5b485_1478371.png "屏幕截图.png")

还是在 …/spring-framework 目录 ,执行 ./gradlew build -x test  编译，整个Spring的源码。 后面的 -x test  是编译期间忽略测试用例，需要加上这个，Spring的测试用例，有些是编译不过的。编译过程时间，会随着网络的畅通程度而不同。

### 源码导入IDEA
在IDEA中 File -> New -> Project from Existing Sources -> Navigate to directory ，选择Spring源码目录，导入，然后IDEA会自动的使用Gradle进行构建。构建完成之后，需要做如下设置：

排除 spring-aspects  项目，这个是Spring 的AOP体系集成了 aspects ，但在IDEA中无法编译通过，原因可以参见：

http://youtrack.jetbrains.com/issue/IDEA-64446

选中  spring-aspects  项目 右键，选择“Load/Unload Moudules” 在弹出的窗体中进行设置(如下图所示)：
![输入图片说明](https://images.gitee.com/uploads/images/2018/1110/165142_05236606_1478371.png "屏幕截图.png")
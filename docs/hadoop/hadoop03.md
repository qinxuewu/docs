**要使用宿主机中的 java 代码访问客户机中的 hdfs，需要保证以下几点**

 - 确保宿主机与客户机的网络是互通的 确保宿主机和客户机的防火墙都关闭，因为很多端口需要通过，为了减少防火墙配置，直接关闭
 - 确保宿主机与客户机使用的 jdk 版本一致。如果客户机使用 jdk6，宿主机使用 jdk7，那么代码运行时会报不支持的版本的错误
 -  宿主机的登录用户名必须与客户机的用户名一直。比如我们 linux 使用的是 root 用户，那么 windows 也要使用 root
 -  用户，否则会报权限异常 在 eclipse 项目中覆盖 hadoop 的 org.apache.hadoop.fs.FileUtil 类的
   checkReturnValue 方 法，目的是为了避免权限错误

HDFS Api常用类
-----------
 - configuration类：此类封装了客户端或服务器的配置，通过配置文件来读取类路径实现（一般是core-site.xml）。
 - FileSystem类：一个通用的文件系统api，用该对象的一些方法来对文件进行操作。
 - FSDataInputStream：HDFS的文件输入流，FileSystem.open()方法返回的即是此类。
 - FSDataOutputStream：HDFS的文件输入出流，FileSystem.create()方法返回的即是此类。

```java
package com.example;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.net.URI;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FSDataOutputStream;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IOUtils;
/**
 * http://hadoop.apache.org/docs/r2.7.3/api/index.html（api地址）
 * 
 * 
 * https://blog.csdn.net/snwdwtm/article/details/78242805
 * 
 * 该类含有操作 HDFS 的各种方法，类似于 jdbc 中操作数据库的直接入口是 Connection 类。
 * @author qinxuewu
 * @version 1.00
 * @time 13/9/2018下午 5:19
 */
public class FileSystemApi {
   private static FileSystem fs=null;
   private static Configuration conf=null;
   static{
         try {
            URI uri = new URI("hdfs://192.168.1.191:9000");
               conf  = new Configuration();
              fs = FileSystem.get(uri,conf,"root"); //指定root用户
      } catch (Exception e) {
        e.printStackTrace();
      }
   }
    
  
   
    public static void main(String[] args) throws IOException, InterruptedException {
//      mkdirs("/usr/local/api2");
//      putFile("C:\\Users\\admin\\Desktop\\111.txt", "/usr/local/api2");
//      down("/usr/local/api2/111.txt", "C:\\Users\\admin\\Desktop", false);
//      delete("/usr/local/apifiledist", true);
//      listStatus("/usr/local");
//      rename("/usr/local/api2/111.txt", "/usr/local/api2/222.txt");
//      write("/usr/local/f1", "DDDDDDDDDDDDDDDDDDDDDDDDDDDDD");
//      open("/usr/local/api2/222.txt");
    }
    
    /**
     * 创建文件夹
     * @param path
     */
    public static void  mkdirs(String path) throws IllegalArgumentException, IOException{
      boolean exists = fs.exists(new Path(path));
      System.out.println(path+":文件夹是否存在 "+exists);
      if(!exists){
        boolean result = fs.mkdirs(new Path(path));
        System.out.println("创建文件夹："+result);
      }
    }
    
    /**
     * 上传文件导HDFS
     * @param localFile 本地文件路径
     * @param path    远程HDFS服务器路径
     */
  public static void putFile(String localFile,String dst){
      try {
      fs.copyFromLocalFile(new Path(localFile), new Path(dst));
      File f=new File(localFile);
      String fileName=f.getName();
      System.out.println("文件名："+fileName);
      boolean ex=fs.exists(new Path(dst+fileName));
      if(ex){
        System.out.println("上传成功："+dst+fileName);
      }else{
        System.out.println("上传失败："+dst+fileName);
      }
    } catch (Exception e) {
      e.printStackTrace();
    } 
  }
  
  /**
   * 下载文件
   * @param dst  远程HDFS服务器文件路径
   * @param localPath  本地存储路径
   * @param falg  若执行该值为false 则不删除 hdfs上的相应文件
   * @param   
   */
  public static void down(String dst,String localPath,boolean falg){
    try {
      //第4个参数表示使用本地原文件系统
      fs.copyToLocalFile(falg,new Path(dst), new Path(localPath),true);
  } catch (Exception e) {
    e.printStackTrace();
   }
  }
  
  /**
   * 删除文件夹
   * @param dst   远程HDFS服务器文件夹路径
   * @param falg  为true时能够将带有内容的文件夹删除，为false时，则只能删除空目录
   */
  public static void delete(String dst,boolean falg){
    try {
      boolean b= fs.delete(new Path(dst), falg);
     System.out.println("删除文件夹状态："+b);
  } catch (Exception e) {
    e.printStackTrace();
  }
  }
  
  /**
   * 查看文件及文件夹的信息
   * @param dst  远程HDFS服务器文件夹路径
   */
  public static void  listStatus(String dst){
   try {
     FileStatus[ ]  fss =   fs.listStatus(new Path(dst));
       String flag ="";
       for(FileStatus  f : fss){
           if(f.isDirectory()){
               flag = "Directory";
          }else{
            flag ="file";
           }
           System.out.println(flag + "\t" +f.getPath().getName());
       }
  } catch (Exception e) {
    e.printStackTrace();
  }
  }
  
  /**
   * 文件重命名
   * @param dst
   * @param newDst
   */
  public static void rename(String dst,String newDst){
  try {
    boolean bs = fs.rename(new Path(dst), new Path(newDst));
     System.out.println("文件重命名:"+bs);
  } catch (Exception e) {
    e.printStackTrace();
  } 
  }
  
  /**
   * 写入文件
   * @param dst   文件服务器目录
   * @param value 值
   */
  public static void write(String dst,String value){
    try {
      FSDataOutputStream fsDataOutputStream = fs.create(new Path(dst));
      IOUtils.copyBytes(new ByteArrayInputStream(value.getBytes()), fsDataOutputStream, conf, true);
      //读
      FSDataInputStream fsDataInputStream = fs.open(new Path(dst));
      IOUtils.copyBytes(fsDataInputStream, System.out, conf, true);
  } catch (Exception e) {
    e.printStackTrace();
  }
  }
  /**
   * 读文件
   * @param dst
   */
  public static void open(String dst){
    try {
      FSDataInputStream fsDataInputStream = fs.open(new Path(dst));
      IOUtils.copyBytes(fsDataInputStream, System.out, conf, true);
  } catch (Exception e) {
    e.printStackTrace();
  }
  }
  
  
}

```


## 概述
* ShardingSphere，它由Sharding-JDBC、Sharding-Proxy和Sharding-Sidecar（计划中）这3款相互独立的产品组成。定位为轻量级Java框架。其实就是一个增强版的JDBC驱动，完全兼容JDBC和各种ORM框架。内部改写了SQL的添加和查询规则。适用于任何基于Java的ORM框架，如：JPA, Hibernate, Mybatis, Spring JDBC Template或直接使用JDBC。
* 目前已经进入Apache孵化器。以4.x版本为新的发布开始

![版本历史](http://wx1.sinaimg.cn/large/006b7Nxngy1g2f75yivtsj31cu0jy0w9.jpg)

## 如何单库分表集成
* 首先集成一个不分库只分表的模式。创建一个springboot项目，这里使用Sharding-JDBC3.0版本。使用`sharding-jdbc-spring-boot-starter`集成

### pom.xml配置

```java
 <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.1.4.RELEASE</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <groupId>com.example</groupId>
    <artifactId>shatding-springboot-mybatis-generator</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>shatding-springboot-mybatis-generator</name>
    <description>SpringBoot2.x整合MyBatisGenerator 以及分库分表插件</description>

    <properties>
        <sharding.jdbc.version>3.0.0</sharding.jdbc.version>
        <mybatis.version>1.3.0</mybatis.version>
        <druid.version>1.1.10</druid.version>
        <mysql.version>5.1.38</mysql.version>
        <java.version>1.8</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>${mybatis.version}</version>
        </dependency>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>druid</artifactId>
            <version>${druid.version}</version>
        </dependency>
        <dependency>
            <groupId>io.shardingsphere</groupId>
            <artifactId>sharding-jdbc-spring-boot-starter</artifactId>
            <version>${sharding.jdbc.version}</version>
        </dependency>
```

创建测试数据局`test_order`。分别创建三张表`t_address`， `t_user0`，`t_user1`。这里假设t_user这个预计随着系统的运行。公司发展很好，以后数据量会暴增。所以提前进行水平分片存储。相对于垂直分片，它不再将数据根据业务逻辑分类，而是通过某个字段（或某几个字段），根据某种规则将数据分散至多个库或表中，每个分片仅包含数据的一部分。这样单表数据量降下来了，mysql的B+树的检索效率就提高了

### 创建测试数据
```java
CREATE TABLE `t_address` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `code` varchar(64) DEFAULT NULL COMMENT '编码',
  `name` varchar(64) DEFAULT NULL COMMENT '名称',
  `pid` varchar(64) NOT NULL DEFAULT '0' COMMENT '父id',
  `type` int(11) DEFAULT NULL COMMENT '1国家2省3市4县区',
  `lit` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8;

CREATE TABLE `t_user0` (
  `id` bigint(20) NOT NULL,
  `name` varchar(64) DEFAULT NULL COMMENT '名称',
  `city_id` int(12) DEFAULT NULL COMMENT '城市',
  `sex` tinyint(1) DEFAULT NULL COMMENT '性别',
  `phone` varchar(32) DEFAULT NULL COMMENT '电话',
  `email` varchar(32) DEFAULT NULL COMMENT '邮箱',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
  `password` varchar(32) DEFAULT NULL COMMENT '密码',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_user1` (
  `id` bigint(20) NOT NULL,
  `name` varchar(64) DEFAULT NULL COMMENT '名称',
  `city_id` int(12) DEFAULT NULL COMMENT '城市',
  `sex` tinyint(1) DEFAULT NULL COMMENT '性别',
  `phone` varchar(32) DEFAULT NULL COMMENT '电话',
  `email` varchar(32) DEFAULT NULL COMMENT '邮箱',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
  `password` varchar(32) DEFAULT NULL COMMENT '密码',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

```
下面就是基本的curd骚操作配置了

### 添加实体类
```java
public class User {
	private Long id;
	private String name;
	private String phone;
	private String email;
	private String password;
	private Integer cityId;
    private Date createTime;
    private Integer sex;
}

public class Address {
	private Long id;
	private String code;
	private String name;
	private String pid;
	private Integer type;
	private Integer lit;
}
```
### 创建Mapper

```java
@Mapper
public interface AddressMapper {
	/**
	 * 保存
	 */
	void save(Address address);
	
	/**
	 * 查询
	 * @param id
	 * @return
	 */
	Address get(Long id);
}

@Mapper
public interface UserMapper {
	/**
	 * 保存
	 */
	void save(User user);
	
	/**
	 * 查询
	 * @param id
	 * @return
	 */
	User get(Long id);
}
```
### 添加Controller
UserController
```java
@Controller
public class UserController {
	
	@Autowired
	private UserMapper userMapper;
	
	@RequestMapping("/user/save")
	@ResponseBody
	public String save() {
        for (int i = 0; i <10 ; i++) {
            User user=new User();
            user.setName("test"+i);
            user.setCityId(1%2==0?1:2);
            user.setCreateTime(new Date());
            user.setSex(i%2==0?1:2);
            user.setPhone("11111111"+i);
            user.setEmail("xxxxx");
            user.setCreateTime(new Date());
            user.setPassword("eeeeeeeeeeee");
            userMapper.save(user);
        }

		return "success";
	}
	
	@RequestMapping("/user/get/{id}")
	@ResponseBody
	public User get(@PathVariable Long id) {
		User user =  userMapper.get(id);
		System.out.println(user.getId());
		return user;
	}

}
```
AddressController
```java
@Controller
public class AddressController {

	@Autowired
	private AddressMapper addressMapper;

	@RequestMapping("/address/save")
	@ResponseBody
	public String save() {
		for (int i = 0; i <10 ; i++) {
			Address address=new Address();
			address.setCode("code_"+i);
			address.setName("name_"+i);
			address.setPid(i+"");
			address.setType(0);
			address.setLit(i%2==0?1:2);
			addressMapper.save(address);
		}

		return "success";
	}
	
	@RequestMapping("/address/get/{id}")
	@ResponseBody
	public Address get(@PathVariable Long id) {
		return addressMapper.get(id);
	}
}
```
AddressMapper.xml
```java
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.AddressMapper">
    <insert id="save" parameterType="Address">
        INSERT INTO t_address(code,name,pid,type,lit)
        VALUES
        (
        #{code},#{name},#{pid},#{type},#{lit}
        )
    </insert>
    
    <select id="get" parameterType="long" resultType="Address">
    	select * from t_address where id = #{id}
    </select>
</mapper>
```
UserMapper.xml

```java
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.UserMapper">
    <insert id="save" parameterType="User">
        INSERT INTO t_user(name,phone,email,city_id,sex,password)
        VALUES
        (
        #{name},#{phone},#{email},#{cityId},#{sex},#{password}
        )
    </insert>
    
    <select id="get" parameterType="long" resultType="User">
    	select * from t_user where id = #{id}
    </select>
</mapper>
```

### 设置分片规则
* application.yml中配置具体要进行分片存储的表规则
* 行表达式标识符可以使用${...}或$->{...}，但前者与Spring本身的属性文件占位符冲突，因此在Spring环境中使用行表达式标识符建议使用$->{...}。

```java
server:
  port: 8080
spring:
  application:
    name: shatding-springboot-mybatis
mybatis:
 mapper-locations: classpath:mybatis/mapper/*.xml
  type-aliases-package: com.example.entity
sharding:
  jdbc:
    datasource:
      names: ds0
      # 数据源ds0
      ds0:
        type: com.alibaba.druid.pool.DruidDataSource
        driver-class-name: com.mysql.jdbc.Driver
        url: jdbc:mysql://localhost:3306/test_order
        username: root
        password: 123456
    config:
      sharding:
        props:
          sql.show: true
        tables:
          t_user:  #t_user表
            key-generator-column-name: id  #主键
            actual-data-nodes: ds0.t_user${0..1}    #数据节点,均匀分布
            table-strategy:  #分表策略
              inline: #行表达式
                sharding-column: sex
                algorithm-expression: t_user${sex % 2}  #按模运算分配

```
一个简单的水平分片单库分表就完成了。进行测试就发现数据分别存储到t_user0和t_user1两个表中。这里采用的事按照字段`sex`取模分片存储。

## 如何集成分库又分表
* 既分库又分表其实只需要在配置文件修改一个分片规则即可，不用修改业务任何代码。分库分表的数据表不能用自增主键，Sharding-JDBC会自动分配一个id，默认使用雪花算法（snowflake）生成64bit的长整型数据。

```java
CREATE TABLE `t_address` (
  `id` bigint(20) NOT NULL,
  `code` varchar(64) DEFAULT NULL COMMENT '编码',
  `name` varchar(64) DEFAULT NULL COMMENT '名称',
  `pid` varchar(64) NOT NULL DEFAULT '0' COMMENT '父id',
  `type` int(11) DEFAULT NULL COMMENT '1国家2省3市4县区',
  `lit` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_user0` (
  `id` bigint(20) NOT NULL,
  `name` varchar(64) DEFAULT NULL COMMENT '名称',
  `city_id` int(12) DEFAULT NULL COMMENT '城市',
  `sex` tinyint(1) DEFAULT NULL COMMENT '性别',
  `phone` varchar(32) DEFAULT NULL COMMENT '电话',
  `email` varchar(32) DEFAULT NULL COMMENT '邮箱',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
  `password` varchar(32) DEFAULT NULL COMMENT '密码',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `t_user1` (
  `id` bigint(20) NOT NULL,
  `name` varchar(64) DEFAULT NULL COMMENT '名称',
  `city_id` int(12) DEFAULT NULL COMMENT '城市',
  `sex` tinyint(1) DEFAULT NULL COMMENT '性别',
  `phone` varchar(32) DEFAULT NULL COMMENT '电话',
  `email` varchar(32) DEFAULT NULL COMMENT '邮箱',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
  `password` varchar(32) DEFAULT NULL COMMENT '密码',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

```
修改分配规则

```java
server:
  port: 9900
spring:
  application:
    name: shard-jdbc-starter

# mybatis
mybatis:
  mapper-locations: classpath:mybatis/mapper/*.xml
  type-aliases-package: com.example.entity

###数据源名称，多数据源以逗号分隔
sharding:
  jdbc:
    datasource:
      names: ds0,ds1
      # 数据源ds0
      ds0:
        type: com.alibaba.druid.pool.DruidDataSource
        driver-class-name: com.mysql.jdbc.Driver
        url: jdbc:mysql://localhost:3306/order1
        username: root
        password: 123456
      # 数据源ds1
      ds1:
        type: com.alibaba.druid.pool.DruidDataSource
        driver-class-name: com.mysql.jdbc.Driver
        url: jdbc:mysql://localhost:3306/order2
        username: root
        password: 123456
    config:
      sharding:
        props:
          sql.show: true
        tables:
          t_user:  #t_user表
            key-generator-column-name: id  #主键
            actual-data-nodes: ds${0..1}.t_user${0..1}    #数据节点,均匀分布
            database-strategy:   #分库策略
              inline: #行表达式
                sharding-column: city_id        #列名称，多个列以逗号分隔
                algorithm-expression: ds${city_id % 2}    #按模运算分配
            table-strategy:  #分表策略
              inline: #行表达式
                sharding-column: sex
                algorithm-expression: t_user${sex % 2}
          t_address:
            key-generator-column-name: id
            actual-data-nodes: ds${0..1}.t_address
            database-strategy:
              inline:
                sharding-column: lit
                algorithm-expression: ds${lit % 2}
```
分库又分表就完成了，测试over。
### 官方配置示例
数据分片

```java
sharding.jdbc.datasource.names=ds0,ds1

sharding.jdbc.datasource.ds0.type=org.apache.commons.dbcp.BasicDataSource
sharding.jdbc.datasource.ds0.driver-class-name=com.mysql.jdbc.Driver
sharding.jdbc.datasource.ds0.url=jdbc:mysql://localhost:3306/ds0
sharding.jdbc.datasource.ds0.username=root
sharding.jdbc.datasource.ds0.password=

sharding.jdbc.datasource.ds1.type=org.apache.commons.dbcp.BasicDataSource
sharding.jdbc.datasource.ds1.driver-class-name=com.mysql.jdbc.Driver
sharding.jdbc.datasource.ds1.url=jdbc:mysql://localhost:3306/ds1
sharding.jdbc.datasource.ds1.username=root
sharding.jdbc.datasource.ds1.password=

sharding.jdbc.config.sharding.tables.t_order.actual-data-nodes=ds$->{0..1}.t_order$->{0..1}
sharding.jdbc.config.sharding.tables.t_order.table-strategy.inline.sharding-column=order_id
sharding.jdbc.config.sharding.tables.t_order.table-strategy.inline.algorithm-expression=t_order$->{order_id % 2}
sharding.jdbc.config.sharding.tables.t_order.key-generator-column-name=order_id
sharding.jdbc.config.sharding.tables.t_order_item.actual-data-nodes=ds$->{0..1}.t_order_item$->{0..1}
sharding.jdbc.config.sharding.tables.t_order_item.table-strategy.inline.sharding-column=order_id
sharding.jdbc.config.sharding.tables.t_order_item.table-strategy.inline.algorithm-expression=t_order_item$->{order_id % 2}
sharding.jdbc.config.sharding.tables.t_order_item.key-generator-column-name=order_item_id
sharding.jdbc.config.sharding.binding-tables=t_order,t_order_item
sharding.jdbc.config.sharding.broadcast-tables=t_config

sharding.jdbc.config.sharding.default-database-strategy.inline.sharding-column=user_id
sharding.jdbc.config.sharding.default-database-strategy.inline.algorithm-expression=ds$->{user_id % 2}
```
读写分离
```java
harding.jdbc.datasource.names=master,slave0,slave1

sharding.jdbc.datasource.master.type=org.apache.commons.dbcp.BasicDataSource
sharding.jdbc.datasource.master.driver-class-name=com.mysql.jdbc.Driver
sharding.jdbc.datasource.master.url=jdbc:mysql://localhost:3306/master
sharding.jdbc.datasource.master.username=root
sharding.jdbc.datasource.master.password=

sharding.jdbc.datasource.slave0.type=org.apache.commons.dbcp.BasicDataSource
sharding.jdbc.datasource.slave0.driver-class-name=com.mysql.jdbc.Driver
sharding.jdbc.datasource.slave0.url=jdbc:mysql://localhost:3306/slave0
sharding.jdbc.datasource.slave0.username=root
sharding.jdbc.datasource.slave0.password=

sharding.jdbc.datasource.slave1.type=org.apache.commons.dbcp.BasicDataSource
sharding.jdbc.datasource.slave1.driver-class-name=com.mysql.jdbc.Driver
sharding.jdbc.datasource.slave1.url=jdbc:mysql://localhost:3306/slave1
sharding.jdbc.datasource.slave1.username=root
sharding.jdbc.datasource.slave1.password=

sharding.jdbc.config.masterslave.load-balance-algorithm-type=round_robin
sharding.jdbc.config.masterslave.name=ms
sharding.jdbc.config.masterslave.master-data-source-name=master
sharding.jdbc.config.masterslave.slave-data-source-names=slave0,slave1

sharding.jdbc.config.props.sql.show=true
```
数据分片 + 读写分离

```java
sharding.jdbc.datasource.names=master0,master1,master0slave0,master0slave1,master1slave0,master1slave1

sharding.jdbc.datasource.master0.type=org.apache.commons.dbcp.BasicDataSource
sharding.jdbc.datasource.master0.driver-class-name=com.mysql.jdbc.Driver
sharding.jdbc.datasource.master0.url=jdbc:mysql://localhost:3306/master0
sharding.jdbc.datasource.master0.username=root
sharding.jdbc.datasource.master0.password=

sharding.jdbc.datasource.master0slave0.type=org.apache.commons.dbcp.BasicDataSource
sharding.jdbc.datasource.master0slave0.driver-class-name=com.mysql.jdbc.Driver
sharding.jdbc.datasource.master0slave0.url=jdbc:mysql://localhost:3306/master0slave0
sharding.jdbc.datasource.master0slave0.username=root
sharding.jdbc.datasource.master0slave0.password=
sharding.jdbc.datasource.master0slave1.type=org.apache.commons.dbcp.BasicDataSource
sharding.jdbc.datasource.master0slave1.driver-class-name=com.mysql.jdbc.Driver
sharding.jdbc.datasource.master0slave1.url=jdbc:mysql://localhost:3306/master0slave1
sharding.jdbc.datasource.master0slave1.username=root
sharding.jdbc.datasource.master0slave1.password=

sharding.jdbc.datasource.master1.type=org.apache.commons.dbcp.BasicDataSource
sharding.jdbc.datasource.master1.driver-class-name=com.mysql.jdbc.Driver
sharding.jdbc.datasource.master1.url=jdbc:mysql://localhost:3306/master1
sharding.jdbc.datasource.master1.username=root
sharding.jdbc.datasource.master1.password=

sharding.jdbc.datasource.master1slave0.type=org.apache.commons.dbcp.BasicDataSource
sharding.jdbc.datasource.master1slave0.driver-class-name=com.mysql.jdbc.Driver
sharding.jdbc.datasource.master1slave0.url=jdbc:mysql://localhost:3306/master1slave0
sharding.jdbc.datasource.master1slave0.username=root
sharding.jdbc.datasource.master1slave0.password=
sharding.jdbc.datasource.master1slave1.type=org.apache.commons.dbcp.BasicDataSource
sharding.jdbc.datasource.master1slave1.driver-class-name=com.mysql.jdbc.Driver
sharding.jdbc.datasource.master1slave1.url=jdbc:mysql://localhost:3306/master1slave1
sharding.jdbc.datasource.master1slave1.username=root
sharding.jdbc.datasource.master1slave1.password=

sharding.jdbc.config.sharding.tables.t_order.actual-data-nodes=ds$->{0..1}.t_order$->{0..1}
sharding.jdbc.config.sharding.tables.t_order.table-strategy.inline.sharding-column=order_id
sharding.jdbc.config.sharding.tables.t_order.table-strategy.inline.algorithm-expression=t_order$->{order_id % 2}
sharding.jdbc.config.sharding.tables.t_order.key-generator-column-name=order_id
sharding.jdbc.config.sharding.tables.t_order_item.actual-data-nodes=ds$->{0..1}.t_order_item$->{0..1}
sharding.jdbc.config.sharding.tables.t_order_item.table-strategy.inline.sharding-column=order_id
sharding.jdbc.config.sharding.tables.t_order_item.table-strategy.inline.algorithm-expression=t_order_item$->{order_id % 2}
sharding.jdbc.config.sharding.tables.t_order_item.key-generator-column-name=order_item_id
sharding.jdbc.config.sharding.binding-tables=t_order,t_order_item
sharding.jdbc.config.sharding.broadcast-tables=t_config

sharding.jdbc.config.sharding.default-database-strategy.inline.sharding-column=user_id
sharding.jdbc.config.sharding.default-database-strategy.inline.algorithm-expression=master$->{user_id % 2}

sharding.jdbc.config.sharding.master-slave-rules.ds0.master-data-source-name=master0
sharding.jdbc.config.sharding.master-slave-rules.ds0.slave-data-source-names=master0slave0, master0slave1
sharding.jdbc.config.sharding.master-slave-rules.ds1.master-data-source-name=master1
sharding.jdbc.config.sharding.master-slave-rules.ds1.slave-data-source-names=master1slave0, master1slave1
```
数据治理

```java
sharding.jdbc.datasource.names=ds,ds0,ds1
sharding.jdbc.datasource.ds.type=org.apache.commons.dbcp.BasicDataSource
sharding.jdbc.datasource.ds.driver-class-name=org.h2.Driver
sharding.jdbc.datasource.ds.url=jdbc:mysql://localhost:3306/ds
sharding.jdbc.datasource.ds.username=root
sharding.jdbc.datasource.ds.password=

sharding.jdbc.datasource.ds0.type=org.apache.commons.dbcp.BasicDataSource
sharding.jdbc.datasource.ds0.driver-class-name=com.mysql.jdbc.Driver
sharding.jdbc.datasource.ds0.url=jdbc:mysql://localhost:3306/ds0
sharding.jdbc.datasource.ds0.username=root
sharding.jdbc.datasource.ds0.password=

sharding.jdbc.datasource.ds1.type=org.apache.commons.dbcp.BasicDataSource
sharding.jdbc.datasource.ds1.driver-class-name=com.mysql.jdbc.Driver
sharding.jdbc.datasource.ds1.url=jdbc:mysql://localhost:3306/ds1
sharding.jdbc.datasource.ds1.username=root
sharding.jdbc.datasource.ds1.password=

sharding.jdbc.config.sharding.default-data-source-name=ds
sharding.jdbc.config.sharding.default-database-strategy.inline.sharding-column=user_id
sharding.jdbc.config.sharding.default-database-strategy.inline.algorithm-expression=ds$->{user_id % 2}
sharding.jdbc.config.sharding.tables.t_order.actual-data-nodes=ds$->{0..1}.t_order$->{0..1}
sharding.jdbc.config.sharding.tables.t_order.table-strategy.inline.sharding-column=order_id
sharding.jdbc.config.sharding.tables.t_order.table-strategy.inline.algorithm-expression=t_order$->{order_id % 2}
sharding.jdbc.config.sharding.tables.t_order.key-generator-column-name=order_id
sharding.jdbc.config.sharding.tables.t_order_item.actual-data-nodes=ds$->{0..1}.t_order_item$->{0..1}
sharding.jdbc.config.sharding.tables.t_order_item.table-strategy.inline.sharding-column=order_id
sharding.jdbc.config.sharding.tables.t_order_item.table-strategy.inline.algorithm-expression=t_order_item$->{order_id % 2}
sharding.jdbc.config.sharding.tables.t_order_item.key-generator-column-name=order_item_id
sharding.jdbc.config.sharding.binding-tables=t_order,t_order_item
sharding.jdbc.config.sharding.broadcast-tables=t_config

sharding.jdbc.config.sharding.default-database-strategy.inline.sharding-column=user_id
sharding.jdbc.config.sharding.default-database-strategy.inline.algorithm-expression=master$->{user_id % 2}

sharding.jdbc.config.orchestration.name=spring_boot_ds_sharding
sharding.jdbc.config.orchestration.overwrite=true
sharding.jdbc.config.orchestration.registry.namespace=orchestration-spring-boot-sharding-test
sharding.jdbc.config.orchestration.registry.server-lists=localhost:2181
```

### Sharding-JDBC不支持的项
#### DataSource接口
* 不支持timeout相关操作

#### Connection接口
* 不支持存储过程，函数，游标的操作
* 不支持执行native的SQL
* 不支持savepoint相关操作
* 不支持Schema/Catalog的操作
* 不支持自定义类型映射

#### Statement和PreparedStatement接口
* 不支持返回多结果集的语句（即存储过程，非SELECT多条数据）
* 不支持国际化字符的操作

#### 对于ResultSet接口
* 不支持对于结果集指针位置判断
* 不支持通过非next方法改变结果指针位置
* 不支持修改结果集内容
* 不支持获取国际化字符
* 不支持获取Array
## 官方文档
* https://shardingsphere.apache.org/document/legacy/3.x/document/cn/overview/

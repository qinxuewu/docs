# leetcode 数据库算法题

##  获取Employee第n高的薪水

编写一个 SQL 查询，获取 Employee 表中第 n 高的薪水（Salary）

```
+----+--------+
| Id | Salary |
+----+--------+
| 1  | 100    |
| 2  | 200    |
| 3  | 300    |
+----+--------+
```
例如上述 Employee 表，n = 2 时，应返回第二高的薪水 200。如果不存在第 n 高的薪水，那么查询应返回 null。
```
+------------------------+
| getNthHighestSalary(2) |
+------------------------+
| 200                    |
+------------------------+
```
分组去重加分页查询语法
```
CREATE FUNCTION getNthHighestSalary(N INT) RETURNS INT
BEGIN
SET N = N - 1;
  RETURN (
      
 select Salary from Employee  GROUP BY Salary ORDER BY Salary desc  LIMIT N,1  
  );
END
```
###  SQL查询来实现分数排名
编写一个 SQL 查询来实现分数排名。如果两个分数相同，则两个分数排名（Rank）相同。请注意，平分后的下一个名次应该是下一个连续的整数值。换句话说，名次之间不应该有“间隔”。
```
+----+-------+
| Id | Score |
+----+-------+
| 1  | 3.50  |
| 2  | 3.65  |
| 3  | 4.00  |
| 4  | 3.85  |
| 5  | 4.00  |
| 6  | 3.65  |
+----+-------+
```
例如，根据上述给定的 Scores 表，你的查询应该返回（按分数从高到低排列）：
```
+-------+------+
| Score | Rank |
+-------+------+
| 4.00  | 1    |
| 4.00  | 1    |
| 3.85  | 2    |
| 3.65  | 3    |
| 3.65  | 3    |
| 3.50  | 4    |
+-------+------+
```
 考虑两件事：1按分数降序排列  2 分数相同属同一级
- 外面的查询负责查排序后的粉数
- select里的查询语句负责排名操作 通过score条件判断 如果
```
select Score,(SELECT COUNT(DISTINCT score) from Scores WHERE score >= s.score) as Rank  from scores s ORDER BY Score DESC 
```

### 超过经理收入的员工

Employee 表包含所有员工，他们的经理也属于员工。每个员工都有一个 Id，此外还有一列对应员工的经理的 Id。
```
+----+-------+--------+-----------+
| Id | Name  | Salary | ManagerId |
+----+-------+--------+-----------+
| 1  | Joe   | 70000  | 3         |
| 2  | Henry | 80000  | 4         |
| 3  | Sam   | 60000  | NULL      |
| 4  | Max   | 90000  | NULL      |
+----+-------+--------+-----------+
```
给定 Employee 表，编写一个 SQL 查询，该查询可以获取收入超过他们经理的员工的姓名。在上面的表格中，Joe 是唯一一个收入超过他的经理的员工。

```
+----------+
| Employee |
+----------+
| Joe      |
+----------+
```
通过




解答：通过自连接 关联表两次查询 组装出员工表每个员工对应的经理信息 即可通过条件判断取出结果
```
select e1.Name Employee  from Employee e1,Employee e2 where e1.ManagerId=e2.Id
and e1.Salary>e2.Salary
```

## 部门工资最高的员工

Employee 表包含所有员工信息，每个员工有其对应的 Id, salary 和 department Id。
```
+----+-------+--------+--------------+
| Id | Name  | Salary | DepartmentId |
+----+-------+--------+--------------+
| 1  | Joe   | 70000  | 1            |
| 2  | Henry | 80000  | 2            |
| 3  | Sam   | 60000  | 2            |
| 4  | Max   | 90000  | 1            |
+----+-------+--------+--------------+
```
Department 表包含公司所有部门的信息。
```
+----+----------+
| Id | Name     |
+----+----------+
| 1  | IT       |
| 2  | Sales    |
+----+----------+
```
编写一个 SQL 查询，找出每个部门工资最高的员工。例如，根据上述给定的表格，Max 在 IT 部门有最高工资，Henry 在 Sales 部门有最高工资。


解答 内连接匹配查询出所有员工对应的部门名称 然后通过子查询条件匹配
```
select d.Name as Department,e.Name as Employee, e.Salary  
        from Department d  join Employee e on d.Id=e.DepartmentId
        where e.Salary >=(select max(Salary) from Employee where DepartmentId=d.Id)
 
```

## 部门工资前三高的员工
Employee 表包含所有员工信息，每个员工有其对应的 Id, salary 和 department Id 。
```
+----+-------+--------+--------------+
| Id | Name  | Salary | DepartmentId |
+----+-------+--------+--------------+
| 1  | Joe   | 70000  | 1            |
| 2  | Henry | 80000  | 2            |
| 3  | Sam   | 60000  | 2            |
| 4  | Max   | 90000  | 1            |
| 5  | Janet | 69000  | 1            |
| 6  | Randy | 85000  | 1            |
+----+-------+--------+--------------+
```
Department 表包含公司所有部门的信息。
```
+----+----------+
| Id | Name     |
+----+----------+
| 1  | IT       |
| 2  | Sales    |
+----+----------+
```
- 思路是查询Employee a,Employee b 而且a.salary小于b.salary，a.departmentid=b.departmengtid，其中去重后的b数量不能大于3，这样就可以查出每个部门工资前三的员工
- 链接两表，将部门id换成name
- 如何取前三高？不妨再加入一张Employee表，将其与1中的表作对比，令e2表中的salary大于e1表中的salary
- 限制条件：e2表中salary大于e1表中salary的个数少于3 ==》取前三高的salary
```
SELECT Department.Name AS Department, e1.Name AS Employee, e1.Salary AS Salary
FROM Employee e1
JOIN Department
ON e1.DepartmentId = Department.Id
WHERE 3 >   (
            SELECT COUNT(DISTINCT e2.Salary) 
            FROM Employee e2
            WHERE e2.Salary > e1.Salary AND e1.DepartmentId = e2.DepartmentId
            )
```

## 删除重复的电子邮箱

编写一个 SQL 查询，来删除 Person 表中所有重复的电子邮箱，重复的邮箱里只保留 Id 最小 的那个。
```
+----+------------------+
| Id | Email            |
+----+------------------+
| 1  | john@example.com |
| 2  | bob@example.com  |
| 3  | john@example.com |
+----+------------------+
```
Id 是这个表的主键。

#### 算法
我们可以使用以下代码，将此表与它自身在电子邮箱列中连接起来。
```
SELECT p1.* FROM Person p1,Person p2 WHERE  p1.Email = p2.Email
```
然后我们需要找到其他记录中具有相同电子邮件地址的更大 ID。所以我们可以像这样给 WHERE 子句添加一个新的条件。
```
SELECT p1.* FROM Person p1,Person p2 WHERE  p1.Email = p2.Email AND p1.Id > p2.Id
```
因为我们已经得到了要删除的记录，所以我们最终可以将该语句更改为 DELETE。
```
DELETE p1 FROM Person p1, Person p2  WHERE   p1.Email = p2.Email AND p1.Id > p2.Id
```
## 上升的温度

给定一个 Weather 表，编写一个 SQL 查询，来查找与之前（昨天的）日期相比温度更高的所有日期的 Id。

```
+---------+------------------+------------------+
| Id(INT) | RecordDate(DATE) | Temperature(INT) |
+---------+------------------+------------------+
|       1 |       2015-01-01 |               10 |
|       2 |       2015-01-02 |               25 |
|       3 |       2015-01-03 |               20 |
|       4 |       2015-01-04 |               30 |
+---------+------------------+------------------+
```
例如，根据上述给定的 Weather 表格，返回如下 Id:
```
+----+
| Id |
+----+
|  2 |
|  4 |
+----+
```
- 使用join 和datediff 日期函数 求差  自连接匹配出有昨天的数据

```
select * from  weather w1 join weather w2 on DATEDIFF(w1.RecordDate,w2.RecordDate)=1

id  RecordDate    Temperature       w2.id          昨天的日期          w2.Temperature(昨天的温度)
2	  2019-01-02	  25	              1	             2019-01-01	            10
4	  2019-01-04	  30	              3	             2019-01-03     	      20
4	  2019-01-04	  30	              3	             2019-01-03	            20

条件帅选今天比昨天温度高的数据 w1.Temperature>w2.Temperature
select w1.id  from  weather w1 join weather w2 on DATEDIFF(w1.RecordDate,w2.RecordDate)=1 where w1.Temperature>w2.Temperature

```


## 行程和用户

Trips 表中存所有出租车的行程信息。每段行程有唯一键 Id，Client_Id 和 Driver_Id 是 Users 表中 Users_Id 的外键。Status 是枚举类型，枚举成员为 (‘completed’, ‘cancelled_by_driver’, ‘cancelled_by_client’)。

```

+----+-----------+-----------+---------+--------------------+----------+
| Id | Client_Id | Driver_Id | City_Id |        Status      |Request_at|
+----+-----------+-----------+---------+--------------------+----------+
| 1  |     1     |    10     |    1    |     completed      |2013-10-01|
| 2  |     2     |    11     |    1    | cancelled_by_driver|2013-10-01|
| 3  |     3     |    12     |    6    |     completed      |2013-10-01|
| 4  |     4     |    13     |    6    | cancelled_by_client|2013-10-01|
| 5  |     1     |    10     |    1    |     completed      |2013-10-02|
| 6  |     2     |    11     |    6    |     completed      |2013-10-02|
| 7  |     3     |    12     |    6    |     completed      |2013-10-02|
| 8  |     2     |    12     |    12   |     completed      |2013-10-03|
| 9  |     3     |    10     |    12   |     completed      |2013-10-03| 
| 10 |     4     |    13     |    12   | cancelled_by_driver|2013-10-03|
+----+-----------+-----------+---------+--------------------+----------+


```

Users 表存所有用户。每个用户有唯一键 Users_Id。Banned 表示这个用户是否被禁止，Role 则是一个表示（‘client’, ‘driver’, ‘partner’）的枚举类型。

```
+----------+--------+--------+
| Users_Id | Banned |  Role  |
+----------+--------+--------+
|    1     |   No   | client |
|    2     |   Yes  | client |
|    3     |   No   | client |
|    4     |   No   | client |
|    10    |   No   | driver |
|    11    |   No   | driver |
|    12    |   No   | driver |
|    13    |   No   | driver |
+----------+--------+--------+
```

查出 2013年10月1日 至 2013年10月3日 期间非禁止用户的取消率。基于上表，你的 SQL 语句应返回如下结果，取消率（Cancellation Rate）保留两位小数。

```
+------------+-------------------+
|     Day    | Cancellation Rate |
+------------+-------------------+
| 2013-10-01 |       0.33        |
| 2013-10-02 |       0.00        |
| 2013-10-03 |       0.50        |
+------------+-------------------+
```

解法

```
#先求出非禁止用户的所有记录
 select * from  Trips t  join Users  u on t.Client_Id =u.Users_Id   where u.Banned='No' 

通过if函数加分组 2013年10月1日 至 2013年10月3日 期间非禁止用户的取消率
IF(expr1,expr2,expr3)，如果expr1的值为true，则返回expr2的值，如果expr1的值为false，
round(x,d)  ，x指要处理的数，d是指保留几位小数

select t.Request_at as Day, 
  round(count( IF ( t.Status !="completed", t.Status, NULL ) ) / count(t.Status),2) as `Cancellation Rate`
    from  Trips t   join Users u on t.Client_Id =u.Users_Id  
      where u.Banned='No'  and t.request_at between  "2013-10-01" and "2013-10-03"  group by t.Request_at 
```




## 换座位


- 小美是一所中学的信息科技老师，她有一张 seat 座位表，平时用来储存学生名字和与他们相对应的座位 id。
- 其中纵列的 id 是连续递增的 小美想改变相邻俩学生的座位。你能不能帮她写一个 SQL query 来输出小美想要的结果呢？

```
+---------+---------+
|    id   | student |
+---------+---------+
|    1    | Abbot   |
|    2    | Doris   |
|    3    | Emerson |
|    4    | Green   |
|    5    | Jeames  |
+---------+---------+
```
假如数据输入的是上表，则输出结果如下：
```
+---------+---------+
|    id   | student |
+---------+---------+
|    1    | Doris   |
|    2    | Abbot   |
|    3    | Green   |
|    4    | Emerson |
|    5    | Jeames  |
+---------+---------+
```
注意：如果学生人数是奇数，则不需要改变最后一个同学的座位。

```

先把简单的偶数都-1；然后对于非最大的奇数id+1；最后(即else)如果存在未变化的数则值不变

select
    case                                             #如果
    when id%2=0 then id-1                           # id%2为偶数 则返回 id-1 
    when id<(select max(id) from seat) then id+1   #如果表中最大的ID 小于当前返回的ID 则执行 id+1 也就是取最大ID
    else id                                          #如果存在未变化的数则值不变
    end as id,student from seat  order by  id
  ```

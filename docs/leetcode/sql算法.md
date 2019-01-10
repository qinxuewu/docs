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

## 删除重复的电子邮箱（是删除）

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
算法：使用join 和datediff 日期函数 求差
- 自链接匹配出有昨天的数据
```
select * from  weather w1 join weather w2 on DATEDIFF(w1.RecordDate,w2.RecordDate)=1

id  RecordDate    Temperature       w2.id          昨天的日期          w2.Temperature(昨天的温度)
2	  2019-01-02	  25	              1	             2019-01-01	            10
4	  2019-01-04	  30	              3	             2019-01-03     	      20
4	  2019-01-04	  30	              3	             2019-01-03	            20

# 条件帅选今天不昨天温度噶欧的数据 w1.Temperature>w2.Temperature
select w1.id  from  weather w1 join weather w2 on DATEDIFF(w1.RecordDate,w2.RecordDate)=1 where w1.Temperature>w2.Temperature
```

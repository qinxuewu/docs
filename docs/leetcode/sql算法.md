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



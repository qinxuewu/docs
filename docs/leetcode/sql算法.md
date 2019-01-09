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

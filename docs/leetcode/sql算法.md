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

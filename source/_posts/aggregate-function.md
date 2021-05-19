---
title: 聚集函数
date: 2021-05-10 20:15:02
categories: postgresql
tags:
  - 数据库
  - postgresql
---





> 最近工作和数据库有关，就借着这个机会好好学一下postgresql。



像其它的大多数关系型数据库一样，postgresql支持聚集函数(aggregate function).聚集函数从多行记录中计算出一个单一的结果。例如count,sum,avg.max,min等等



下面的例子是查询最高温度

```sql
SELECT max(temp_lo) FROM weather;
```

如果需要知道最高温度对应的城市，也许会尝试下面的查询语句

```sql
SELECT city FROM weather WHERE temp_lo = max(temp_lo)
```

但是这个查询是错误的，因为聚集函数是在where之后才执行的。但是我们可以通过子查询来实现这样的要求

```sql
SELECT city FROM weather WHERE temp_lo = (SELECT max(temp_lo) FROM weather)
```

聚集函数通常和GROUP BY一起使用，例如下面的例子，可以查询每个城市的最高温度

```sql
SELECT city, max(temp_lo)    FROM weather    GROUP BY city
```

可以通过HAVING来过滤结果,例如下面的查询最高气温小于40度的城市

```sql
SELECT city, max(temp_lo)    FROM weather    GROUP BY city    HAVING max(temp_lo) < 40
```



**聚合函数中 where 和 having 区别** 
	where发生在分组和聚合之前，控制了哪些数据需要分组和聚合，这也是为什么where条件中不能使用聚合函数的原因
	having则相反，发生在分组和聚合之后，所以having一般都包含了聚合函数。虽然也允许在having中不使用聚合函数，但是放在where中更加高效
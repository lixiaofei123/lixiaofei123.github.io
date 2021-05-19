---
title: 窗口函数
date: 2021-05-10 20:27:12
categories: postgresql
tags:
  - 数据库
  - postgresql
---





窗口函数在一组与当前行有某种联系的表行上进行计算。这个看起来和聚集函数有些相似，但是不同的是，不像聚集函数那样将结果输出为一条，而是每行保留自己的标识。这一点看下面的例子来说明：

用聚集函数来计算各地区的员工工资总和

```sql
select city,sum(salary) from empsalary group by city;
```

![聚集函数例子](https://static1.huiyuanai.cn/stroage/2021/05/10/20/1620651418-jujihanshu-example.png)



用窗口函数来计算工资总和

```sql
SELECT id,name,city,salary, sum(salary) OVER (partition by city) FROM empsalary;
```

![窗口函数例子](https://static1.huiyuanai.cn/stroage/2021/05/10/20/1620651482-window-function-example.png)



> 值得注意的是，在聚集函数中，SELECL后面不能有*没有出现在ORDER BY后面的属性*，而窗口函数是可以的



窗口函数的调用会始终在窗口函数和参数的后面加一个OVER，在语法上就将窗口函数和其它函数区分开来。OVER子句决定了如何分割查询后的行以便于窗口函数来处理。其中，OVER中的 PARTITION BY子句决定了如何将数据分区，ORDER BY子句则可以控制窗口函数处理行的顺序

例如下面的例子是根据工资进行排名

```
SELECT name,salary,rank() OVER (ORDER BY salary desc) FROM empsalary;
```

![工资排名](https://static1.huiyuanai.cn/stroage/2021/05/10/21/1620651741-window-function-order-by-example.png)

> 使用rank()函数时，排名会出现终端，例如，存在两个第一名，那么加下来的名次就是第三名，如果需要连续的名次，可以使用dense_rank()



分区函数的几个特性

1. 和聚合函数相比，聚合函数只能输出每组的单一行，而窗口函数可以输出每一行包含其它属性的结果

2. 聚合函数操作的对象是 query查询（where、group by、having之后）的结果，例如如果一行记录不满足where条件，那么这条记录对窗口函数不可见

3. 如果顺序不重要，可以省略order by，如果分区不重要，可以省略partition by，相当于全表了

4. 另外一个关于窗口函数重要的事情是，对于每一行，在其分区内都有一组叫做window frame的行。有一些窗口函数（例如sum）仅在window frame的行上起作用，而不是整个分区。默认情况下，如果指定了order by，那么frame是由从分区开始到当前行，然后加上根据order by指定的顺序和当前行相等的行。如果order by是空的，默认的frame由分区内的所有行组成。(这个是postgres的默认设置，可以更改window frame的行为)

第4条我们来看例子来理解

如果OVER子句中没有指定ORDER BY

```sql
SELECT salary, sum(salary) OVER () FROM empsalary;
```

查询的结果是

![没有order by](https://static1.huiyuanai.cn/stroage/2021/05/10/21/1620652133-no-order-by.png)

因为此时没有指定order by，所以每一行在分区内对应的window frame包含了当前分区的所有行，然后对于sum的计算，就是当前分区内所有行的salary的总和。（因为也没有指定partition by，所以window frame包含了整张表）



如果OVER子句中指定了ORDER BY

```sql
SELECT salary, sum(salary) OVER (ORDER BY salary) FROM empsalary;
```

查询的结果是

![](https://static1.huiyuanai.cn/stroage/2021/05/10/21/1620652206-order-by.png)



这时候因为指定了order by,所以每一行在分区内对应的windows frame是不一样的。例如，第3、4行在分区内对应的window frame就应该是（1，2，3，3），所以其sum的值是9
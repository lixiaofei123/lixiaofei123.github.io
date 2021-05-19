---
title: 表分区
date: 2021-05-10 21:22:39
categories: postgresql
tags:
  - 数据库
  - postgresql
---



表分区是指将一个逻辑上的大表分成几个物理小块。表分区可以提供下面几个好处

1. 当要查询的数据在同一个分区或者少数几个分区的时候，可以显著提高查询性能。分区有效代替了索引树的上层部分，看起来就像重度使用的部分放在了内存中一样。个人理解是，如果使用索引，数据库每次要从磁盘中加载索引，由于索引从上到下扫描索引树来查找数据，所以对索引树的上层部分的查询是很频繁的。使用了分区以后，分区数据已经相当于索引树的上层部分了，相当于最经常使用的部分已经放在了内存中了(原因参考最佳实践第4条)。
2. 当查询或者更新占据单独的一个分区的很大比例的时候，通过使用顺序扫描会比使用索引有性能提升。因为索引会在整个表上进行随机读取，随机读取比顺序读取慢得多。
3. 如果使用了设计模式的话，批量加载和删除可以通过分区来完成。直接加载某个分区的数据或者直接删除某个分区的数据要比批量删除快得多。
4. 很少使用的数据可以被迁移到便宜的介质上



postgres支持的几个默认的分区方法

1. Range Partitioning

   范围分区是根据表中的某个或者某几个字段进行分区，例如 1-10 11-20

2. List Partitioning

   通过显式的列出表中的键值对来进行分区

3. Hash Partitioning

   通过为每个分区指定一个除数和余来进行分区。即每一行的hash值除以除数然后得到余，根据余值来放到对应的分区里



**分区使用示例**

1. 通过指定partitioning by 创建分区表

   ```sql
   CREATE TABLE measurement (    
       city_id         int not null,    
       logdate         date not null,    
       peaktemp        int,    
       unitsales       int) PARTITION BY RANGE (logdate);
   ```

2. 分别创建每一个分区

   ```sql
   CREATE TABLE measurement_y2006m02 PARTITION OF measurement    FOR VALUES FROM ('2006-02-01') TO ('2006-03-01');
   CREATE TABLE measurement_y2006m03 PARTITION OF measurement    FOR VALUES FROM ('2006-03-01') TO ('2006-04-01') PARTITION BY RANGE (peaktemp); #创建分区表的分区表
   ```

如果插入一条不对应任何分区的数据，那么插入会报错，应该手动创建对应的分区

3. 创建索引

   ```sql
   CREATE INDEX ON measurement (logdate);
   ```

   创建索引是非必须的，分区表上的索引和约束条件都是虚拟的，实际上的索引位置和约束条件都在分区中

4. 确定 数据库配置中 enable_partition_pruning 的值不是禁用状态



**分区维护**

1. 删除某个分区的数据

   ```sql
   DROP TABLE measurement_y2006m02; # 快速删除数百万条数据，需要在主表上加ACCESS EXCLUSIVE
   ALTER TABLE measurement DETACH PARTITION measurement_y2006m02; #接触分区和分区表的关系，同时保留数据，数据可以做进一步的分析
   ```

   

2. 增加新的分区

   ```
   CREATE TABLE measurement_y2008m02 PARTITION OF measurement    FOR VALUES FROM ('2008-02-01') TO ('2008-03-01')    TABLESPACE fasttablespace;
   ```

3. 先创建表，再创建分区表

   ```sql
   CREATE TABLE measurement_y2008m02  (LIKE measurement INCLUDING DEFAULTS INCLUDING CONSTRAINTS)  TABLESPACE fasttablespace;
   ALTER TABLE measurement_y2008m02 ADD CONSTRAINT y2008m02   CHECK ( logdate >= DATE '2008-02-01' AND logdate < DATE '2008-03-01' );
   \copy measurement_y2008m02 from 'measurement_y2008m02'
   -- possibly some other data preparation work
   ALTER TABLE measurement ATTACH PARTITION measurement_y2008m02    FOR VALUES FROM ('2008-02-01') TO ('2008-03-01' );
   ```

   

4. 创建索引

   ```sql
   CREATE INDEX measurement_usls_idx ON ONLY measurement (unitsales);
   CREATE INDEX measurement_usls_200602_idx    ON measurement_y2006m02 (unitsales);
   ALTER INDEX measurement_usls_idx    ATTACH PARTITION measurement_usls_200602_idx;
   ```

    同样的方式可以用在primary和unique上	

   ```sql
   ALTER TABLE ONLY measurement ADD UNIQUE (city_id, logdate);
   ALTER TABLE measurement_y2006m02 ADD UNIQUE (city_id, logdate);
   ALTER INDEX measurement_city_id_logdate_key    ATTACH PARTITION measurement_y2006m02_city_id_logdate_key
   ```



**分区表限制**

1. 分区表的唯一约束必须包含所有的分区键列。因为各个分区只能保证在自己表中的唯一约束性，保证不了全表的唯一约束性，因此分区表自身必须负责在不同的分区中没有重复。如果唯一约束包含了分区键，那么各个分区对应的唯一约束中的分区键都不同，因此也就保证了在所有分区中的唯一约束都成立
2. 无法创建排除约束（exclusion constraint），原因同上，分区不能跨区排除
3. insert的BEFORE ROW 触发器不能更改新行的目标区。即 在BEFORE ROW触发器中修改了分区键的值，分区的结果也不会改变。
4. 分区表 临时表和永久表不能混用。分区表是临时的，那么分区也是临时的，分区表是永久的，那么分区也是永久的。



​	分区表的幕后是分区和分区表是继承关系，但并不是可以使用所有的继承特性。尤其是分区不能有分区表中不存在的字段，分区表和分区也并不能继承其它表。

​	不能使用的继承特性有

1. 分区不能有分区表中不存在的字段
2. 分区表的CHECK和NOT NULL约束会被它的所有分区继承。不能在分区表上使用被标记了NO INHERIT的CHECK。如果分区表的字段上有NOT NULL的话，分区的字段上的NOT NULL不能被删除
3. 当分区表上没有任何分区的时候可以使用ONLY来增加约束，当存在分区的时候，使用ONLY会报错。替代的可以在分区上添加和删除（如果父表中没有）约束  <span style="color:red">后续再看</span>

4. 分区表本身没有任何数据，使用TRUNCATE ONLY会报错

 <span style="color:red">跳过了使用继承的分区，后面再看</span>

 **分区修剪(Partition Pruning)**

分区修剪是一种提高性能的查询优化技术。

例如

```sql
SET enable_partition_pruning = on;                 -- the default
SELECT count(*) FROM measurement WHERE logdate >= DATE '2008-01-01';
```

如果没有分区修剪，那么pg会扫描分区表的所有的分区来计算数量。如果开启了分区修剪，计划器会查看每个分区的定义来提前排除掉不需要查询的分区。

分区修剪是基于分区键的而不是基于索引的，因此是否对分区键建立索引取决于你需要查询分区的一大部分还是一小部分，如果是一大部分，那么建立索引是没有用的。

分区修剪不仅在计划阶段有效，在执行阶段也有效



**分区约束排除(Constraint  exclusion)**

Constraint  exclusion是一种类似于分区修剪的查询优化技术。主要是利用CHECK约束实现，在计划阶段有效，比分区修剪慢

默认情况下constraint_exclusion的值是partition，这个值表示约束排除仅工作在继承分区表上，on代表在所有的查询上都检查check约束

注意点：

1. 约束排除仅在计划阶段有用
2. 约束排除仅在查询的where条件包含常量的时候有用。
3. 分区的约束应该简单，否则约束排除无法判断是否需要访问子表。

**最佳实践**

1. 最关键一点是你选择的分区的列（或者多列）。通常最好的选择是那些经常出现在where中的列。与分区绑定约束兼容的where可以用来修剪不需要的分区。然而，由于primary key和 unique约束也可能做出其它选择。删除数据也是一个计划分区策略的一个考虑因素。

2. 选择分区的数量也是一个重要的因素。分区太少导致索引仍然很大和数据的局部性仍然很低。分区太多，会导致更长的查询计划时间和查询计划和执行期间的更高的内存占用。同时，在设置分区的数目的时候，也需要为将来考虑。

3. 当预期一个分区会变的很大的时候采用子分区是有用的。而如果采用多列范围分区会导致分区的数目变多，因此要加以限制

4. 考虑查询计划和执行阶段的开销是重要的。如果查询能够允许查询计划器修剪大部分分区，那个查询计划器能够处理几千个分区的查询，否则的话，计划时间就会变长内存消耗也会变高，对UPDATE和DELETE同样如此。另一个原因是，服务器的内存消耗会随着时间的推移而显著增长，尤其是大量会话都涉及到分区的情况，这是因为每一个涉及到分区查询的会话都会把分区元数据信息加载到自己的本地内存中

5. 数据库负载类型，warehouse(数据仓库 OLAP On-line Analytical Processing)类型使用大量分区要比OLTP(On-line Transaction Processing 在线事务交易)更有意义。因为，在数据仓库类型中，查询计划时间不重要，因为大部分时间都在查询执行时间。根据数据库的负载类型早做决定。

   OLAP 在线分析处理，查询一般都非常复杂，因此执行时间会比较长，主要是提供报表之类的功能

   OLTP 在线事务处理，短时间内会有大量的插入、删除、更新语句，要求非常快的查询处理，


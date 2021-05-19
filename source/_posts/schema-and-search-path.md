---
title: schema 和 search_path
date: 2021-05-10 21:11:37
categories: postgresql
tags:
  - 数据库
  - postgresql
---



一个postgres集群中可以包含多个database，每个database包含了一个或者多个schema,schema包含了表、数据类型、函数以及操作符，不同的schema可以包含相同的表。

```sql
create schema myschema; #创建一个新的schema
drop schema mychema;  # 删除一个空的的schema
drop schema mychema cascade; # 删除一个非空的schema
CREATE SCHEMA schema_name AUTHORIZATION user_name;  #创建一个属于某用户的schema
```

在写sql语句的时候，可以通过schema.table来区分对应的schema里的表

查看schema

```sql
select nspname from pg_catalog.pg_namespace; 
SELECT schema_name FROM information_schema.schemata;
# 参考地址 https://soft-builder.com/how-to-list-all-schemas-in-postgresql/
```

```
\dn   #在psql中执行，但是看不到系统级别的schema
```



一般在写sql语句的时候不会特意指定schema，如果没有指定schema的话，数据库会根据search_path的值来查找schema里的表

查看search_path的值

```sql
show search_path;   #默认值为 $user,public
```

修改search_path

```sql
set search_path to myschema,public #将search_path的值设置成mychema和public
```

此时，如果用如下sql语句创建表(没有指定schema)，pg数据库会在search_path中第一个存在的schema创建对应的表

```sql
create table testdb(id int);   #由于search_path的值是myschema,public 所以此时表被创建在myschema中
```

![不指定schema](https://static1.huiyuanai.cn/stroage/2021/05/10/21/1620652352-create_table_no_schema.png)

可以直接指定schema让表创建在指定的schema中

```sql
create table public.testdb1(id int);  #直接在pubic中创建testdb1
create table public.testdb(id int);   #直接在pubic中创建testdb,由于在不同的schema中，所以table的名字可以重复
```

![](https://static1.huiyuanai.cn/stroage/2021/05/10/21/1620652362-create_table_with_schema.png)

此时如果用 \d 查看当前数据的表，可以看出testdb1在public中，但是没有看见public下有testdb，这是因为pg已经在位置靠前的schema中发现testdb了，会忽略靠后的schema中相同名字的表。但是这个表是真实存在的，可以通过在表名前面加scheme前缀来进行查询和更改。

安全策略

1. 约束每个用户只使用自己私有的schema，先使用下面语句禁止别的用户操作public schema，然后为每个用户创建和用户名同名的schema

   ```sql
   REVOKE CREATE ONSCHEMA public FROM PUBLIC
   ```

   

2. 通过设置 ALTER  ROLE  ALL  SET  search_path  =  "$user" 将所有用户的search_path设置成$user

3. 保持默认 仅数据库只有一个用户或者少数几个受信任的用户的时候使用
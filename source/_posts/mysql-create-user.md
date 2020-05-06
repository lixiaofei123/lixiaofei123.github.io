---
title: MYSQL创建数据库和用户
date: 2019-05-07 20:49:24
tags: mysql
---

### 创建UTF-8编码的数据库

```mysql
create database testbase default character set utf8 collate utf8_general_ci;
```

### 创建用户

```mysql
create user 'testuser'@'%' identified by 'password';
```

创建密码为 password 的 testuser 用户，%代表允许在所有地址上登陆，可以改成localhost或者127.0.0.1只允许本地登录

### 授权数据库给用户

```mysql
grant select,insert,update,delete,create,drop on test.* to testuser;
```

授权testuser对test数据库下的所有表进行查询、插入、更新、删除、新建操作

### 刷新权限

```mysql
flush  privileges
```

### 取消授权

```mysql
revoke all on *.* from testuser
```

### 删除用户

```mysql
delete from mysql.user where user='testuser'
```




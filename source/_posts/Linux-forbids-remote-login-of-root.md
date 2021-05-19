---
title: linux禁止root用户远程登录，并修改ssh端口
date: 2021-05-09 17:52:36
categories: linux
tags:
  - linux
  - 运维
---





### 前言

在创建一台新服务器以后，为了安全考虑，要修改ssh的端口为其它端口，同时禁止root用户远程登陆。

由于需要设置禁止root用户远程登陆，因此需要先创建一个普通用户，使用这个普通用户登陆以后，再使用su命令切换到root用户



### 创建新用户

例如，我们使用下面的命令创建一个名为jerry的用户

```bash
sudo adduser jerry
```

执行结果如下图所示，除了密码是必填的以外，其它的选项可以为空

![创建一个新用户](https://static1.huiyuanai.cn/stroage/2021/05/09/17/1620554393-add-new-user.png)

创建了新用户以后，就可以使用这个用户来进行登陆了。如果不想要这个用户了，可以使用下面的命令来删除此用户

```bash
sudo userdel -r jerry
```



### 禁止root用户远程登陆以及修改端口

使用vim打开/etc/ssh/sshd_config文件后进入编辑模式

在配置文件中找到下面两项分别进行修改

```bash
Port 22    # 将22修改为别的端口,例如修改成2222
PermitRootLogin yes    # 将yes修改为no
```



修改完成后保存并重启ssh服务

```bash
sudo systemctl restart sshd
```

> 注意有些云服务(比如阿里云或者腾讯云)有安全组策略，需要在安全组策略里将上面修改后的端口添加到安全组中，否则将会无法登陆



### 测试

修改完毕后，可以测试一下用root用户进行登录

```bash
ssh -p 2222 root@***.***.***.***   #注意把端口换成修改后的端口
```

从下图可以看出,root用户已经无法登陆了

![root用户无法登陆](https://static1.huiyuanai.cn/stroage/2021/05/09/18/1620555148-root-can-not-login.png)



这时候我们尝试使用jerry用户进行登陆

```
ssh -p 2222 jerry@***.***.***.***
```

jerry可以远程登陆到服务器上

![jerry用户可以远程登陆](https://static1.huiyuanai.cn/stroage/2021/05/09/18/1620555347-jerry-can-login.png)



然后切换到root用户即可

![切换到root用户](https://static1.huiyuanai.cn/stroage/2021/05/09/18/1620555442-change-root-user.png)



> 如果担心这样做还不安全的话，也可以彻底禁止使用用户名密码登陆，改用使用密钥文件登陆的方式，有兴趣的可以自己去搜索怎么做
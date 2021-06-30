---
title: theia editor
tags:
  - 软件
  - 编码
date: 2021-06-26 23:13:52
categories:
  - 实用
---





今天发现了一个由Eclipse 基金会发布的一个有意思的软件**云端编辑器-Theia**,支持golang、java、Python、C++等多种主流的编程语言，可以用浏览器直接打开，其运行界面和使用方式与VSCode几乎一摸一样，极大降低了使用者的学习成本。



### 运行截图

下面是程序运行的截图，其中包含了我写的一段简单的测试代码，运行起来也没什么问题

![theia editor](https://static1.huiyuanai.cn/stroage/2021/06/26/23/1624721058-theia_editor.png)



### 安装说明

由于我是用docker安装的，因此安装起来也非常简单

```bash
docker run -d --name theiaide --restart=always -p 3000:3000 -v /data/theia/projects:/home/project:cached theiaide/theia-full
```

等容器启动以后，就可以在浏览器通过 ip:3000 访问在线编辑器了。<span style="color:red">但是这时候也仅仅是能访问而已，如果我们尝试创建文件夹或者文件，是不能创建成功的。</span>

 这是因为权限问题导致的，容器内部并不是以root用户运行的容器的主进程，而是以theia用户运行的，因此，需要修改一下/data/theia/projects的权限。

使用如下命令进入到容器内部

```
docker exec -it theiaide /bin/bash
```

然后执行下面命令查看所有的用户，并找到theia用户，查看其用户ID

```bash
cat /etc/passwd
```

[如下图所示]()

![](https://static1.huiyuanai.cn/stroage/2021/06/26/23/1624722638-theia_editor_users.png)

可以看到其用户ID是1000

> 在新版的linux系统中，新建的普通用户，其用户ID一般都是从1000开始

然后，可以使用下面的命令来更改/data/theia/projects文件夹所属的用户

```bash
sudo chown -R 1000 /data/theia/projects
```

更改了文件夹所属的用户以后，此时就应该可以正常的创建文件以及文件夹了



### 其它说明

1. 由于需要加载一个2M的bundle.js文件以及别的一些静态的资源，如果带宽比较小，比如现在主流的1M带宽，可能需要等待20到30秒编辑器才能完全加载完毕。这里我的解决办法是到容器里面把lib目录里的内容全都拷贝了出来，然后上传到了阿里云的CDN里，然后再替换掉index.html里的bundle.js的地址。这个中间还涉及到了跨域的问题，有兴趣的话可以自己尝试一下

2. theia是没有账号密码机制，任何一个知道地址的人都可以直接使用，甚至操作我们的代码。由于我使用了nginx进行了反向代理，因此在nginx的配置文件中增加了用户的认证。这个比较简单，可以参考[这个网址](https://blog.csdn.net/dream8062/article/details/78416234) 

   配置了以后的效果如图。这样就可以在一定程度上防止别人未经授权使用我们的编辑器

   ![](https://static1.huiyuanai.cn/stroage/2021/06/27/19/1624791800-theiaide-basicauth.png)
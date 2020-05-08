---
title: 利用阿里云的OSS将markdown中的本地路径的图片替换为网络图片
date: 2020-05-07 21:09:46
categories: 实用
tags:
  - markdown
  - 图床
---

### 概述

在写markdown的时候,有时候为了更加清楚表示我们的观点,我们需要在md中插入一些图片资源。这些图片可能只存在我们本地的文件系统中，但这样就影响了我们把自己的博客发布到互联网上。

常见的有下面的方法来解决这个问题:

1. 将我们的图片存放到图床里，然后获取到一个互联网上的链接，然后在我们的markdown中使用这个互联网链接。

2. 如果我们使用的hexo+github page的话，可以使用hexo-asset-image插件([点击这里](https://whisperchi.com/posts/62275/)查看使用方法)，这个插件会把我们的本地图片资源一起打包发布到github上，从而可以在互联网上正常访问我们的博客。

这两种方法各有缺点，第一种方法的缺点是如果我们图片很多的话，每个图片都需要上传到图床，操作是非常麻烦的。第二种方法的缺点是github在国内访问速度比较慢，如果博客引用的github的资源比较多而且比较大的话，会导致页面加载时间严重变长，另外这也不是通用的解决方案。

> 我们可以参考[这篇博客](https://whisperchi.com/posts/35930/)，分别将博客托管到国内的仓库和github上，再利用阿里云的DNS的双线解析功能，针对不同的线路解析到不同的仓库上。

### 解决方案

综上，我写了一个小工具[md-img-oss](https://github.com/lixiaofei123/md-img-oss)来处理这个问题。这个工具的作用是检测markdown文件中的图片，如果发现图片的路径是本地文件路径，就将这个图片上传到阿里云OSS上,并将原文中的本地图片路径替换为阿里云OSS提供的路径。
如图，分别是替换前和替换后的效果

![替换前](https://static.huiyuanai.com/lixfio/image/Replace-the-local-path-pictures-in-markdown-with-network-pictures/localpath.png)

![替换后](https://static.huiyuanai.com/lixfio/image/Replace-the-local-path-pictures-in-markdown-with-network-pictures/networkpath.png)

### 安装md-img-oss

安装md-img-oss，如果你本地有golang环境的话，只需要一行命令，就可以安装
```bash
go get github.com/lixiaofei123/md-img-oss
```
如果本地没有golang环境，点击这里[附件:md-img-oss](https://github.com/lixiaofei123/md-img-oss/releases)下载对应平台的软件。

### 使用

安装完毕后，执行下面的命令，即可自动替换图片链接

```bash
md-img-oss -mddir "C:\Users\Administrator\Desktop\lixiaofei123.github.io\source\_posts" -endpoint oss-cn-shenzhen.aliyuncs.com -accesskeyId <替换成你的accesskeyId> -accessKeySecret <替换成你的accesskeySecret> -bucketName <替换成你的bucketName> -ossDir lixfio/image -domain https://static.huiyuanai.com
# ossDir 和 domain 是非必须的，可以不需要
```
如果觉得每次都执行这么长的命令不方便的话，可以把这个命令写到脚本里，然后通过执行脚本来运行这条命令

也可以执行下面的命令查看各个参数的意思

```bash
md-img-oss --help
```

下面是执行结果
![执行结果](https://static.huiyuanai.com/lixfio/image/Replace-the-local-path-pictures-in-markdown-with-network-pictures/output.png)


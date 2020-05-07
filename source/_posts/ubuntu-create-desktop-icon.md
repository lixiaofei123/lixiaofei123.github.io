---
title: ubuntu制作桌面图标
date: 2019-08-14 13:54:09
categories: 实用
tags: 
  - ubuntu
---





在使用ubuntu系统的时候，有些软件是直接从网上下载的安装包，为了方便启动这些软件，需要做成桌面图标的形式。

这里以typora为例说一下怎么制作，其实也很简单

进入到/usr/share/applications目录后,用你自己喜欢的文件编辑器创建一个Typora.desktop的文件，然后里面写入下面的内容

```
[Desktop Entry]
Encoding=UTF-8
Name=Typora
Comment=Typora
Exec=/home/lixf/software/Typora/Typora
Icon=/home/lixf/software/Typora/resources/app/asserts/icon/icon_32x32@2x.png
Terminal=false
starttupNotify=true
Type=Application
Categories=Application;Development;
```

保存以后，进入到ubuntu的应用程序列表里就可以看到typora了，是不是很简单呢??

![图标已经出来了](https://static.huiyuanai.com/lixfio/image/ubuntu-create-desktop-icon/typora.png)
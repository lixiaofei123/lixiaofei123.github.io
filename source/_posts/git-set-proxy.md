---
title: git和npm设置代理
date: 2021-05-19 16:04:22
categories: git
tags:
  - git
  - 代理
---

由于不知名的原因，现在github.com不设置代理的话几乎无法访问。如下图所示，从github上克隆一个postgres，每秒的速度只有3到4KB。

![不设置代理克隆](https://static1.huiyuanai.cn/stroage/2021/05/18/22/1621347934-git-clone-no-proxy.png)

下面分别提供通过https协议和ssh协议克隆仓库设置代理的方法

### HTTPS协议

如果我们本地有可以科学上网的http或者socket5代理的话，可以进行如下设置(只需要设置一个就行了)

```
git config --global http.proxy http://127.0.0.1:10809 #走http代理
git config --global http.proxy socks5://127.0.0.1:10808 #走socks5代理
```

设置完后再克隆，就可以发现拉取仓库的速度有了明显的提升（具体取决于代理的速度和当前网络的速度）。

![设置代理克隆](https://static1.huiyuanai.cn/stroage/2021/05/18/22/1621348089-git-clone-with-proxy.png)

此时，如果我们通过ssh协议克隆仓库，会发现克隆速度还是很慢(几乎是0)。如下图所示

![不配置代理克隆ssh协议仓库](https://static1.huiyuanai.cn/stroage/2021/05/18/22/1621348677-git-clone-ssh-no-proxy.png)

这种情况下需要给ssh协议配置代理。

### SSH协议

配置通过ssh协议克隆仓库的话，需要socket5代理。windows用户在 C:\Users\用户名.ssh\config 文件中增加下面的内容 (没有的话自行创建)

```
Host github.com
ProxyCommand connect -S 127.0.0.1:10808 %h %p
```

Linux在~/.ssh/config文件中增加下面内容

```
Host github.com
ProxyCommand nc -X 5 -x 127.0.0.1:10808 %h %p
```

此时再克隆，可以看到速度明显有了提示

![设置代理克隆ssh仓库](https://static1.huiyuanai.cn/stroage/2021/05/18/22/1621349149-git-clone-ssh-with-proxy.png)



### npm设置代理

npm在国内拉取仓库时，也会特别慢，可以参考下面的配置来设置代理

```bash
npm config set proxy http://127.0.0.1:10809
npm config set https-proxy http://127.0.0.1:10809
```


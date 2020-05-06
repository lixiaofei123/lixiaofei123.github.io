---
title: docker下载镜像的时候出现handshake failure
date: 2019-06-13 19:38:59
categories: kubernetes
tags: 
  - kubernetes
  - docker
---





在使用k8s的时候，发现pod的状态都是ImagePullError，查看pod的状态发现在pull镜像的时候，报下面的错误

```log
Error response from daemon: Get https://quay.io/v2/: remote error: tls: handshake failure
```



在pod所运行的服务器上执行curl https://www.baidu.com也报了下面的错误



```log
[root@k8s-master ~]# curl https://www.baidu.com
curl: (60) Peer's Certificate issuer is not recognized.
More details here: http://curl.haxx.se/docs/sslcerts.html

curl performs SSL certificate verification by default, using a "bundle"
 of Certificate Authority (CA) public keys (CA certs). If the default
 bundle file isn't adequate, you can specify an alternate file
 using the --cacert option.
If this HTTPS server uses a certificate signed by a CA represented in
 the bundle, the certificate verification probably failed due to a
 problem with the certificate (it might be expired, or the name might
 not match the domain name in the URL).
If you'd like to turn off curl's verification of the certificate, use
 the -k (or --insecure) option.
```



在**stackoverflow**上找到了问题的答案（原网址忘记了保存），那就是当前服务器的时间不对，可能差个几秒或者几十秒，解决办法就是同步一下当前服务器的时间。

```bash
ntpdate ntp1.aliyun.com
```

同步之后问题解决。

当然出现问题的原因可能有很多种，不一定能解决多有的此类问题。



为了防止后面出现同样的问题，可以将这条命令写到定时任务里。输入下面的命令打开定时任务的编辑窗口（如果没有安装crontab需要先安装一下）

```bash
crontab -e
```



在里面加上这么一行命令,让每隔1分钟同步一下时间。

```bash
*/1 * * * * /usr/sbin/ntpdate ntp1.aliyun.com > /dev/null 2>&1; /sbin/hwclock -w
```


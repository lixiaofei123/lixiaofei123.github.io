---
title: k8s相关镜像源整理
date: 2019-06-13 11:30:32
categories: kubernetes
tags: 
  - k8s
  - docker
  - helm
---









<span style='color:red'>*现在 azk8s.cn只允许azure的访问了，可以用下面的内容替代*</span>

gcr.io ==> registry.aliyuncs.com

k8s.gcr.io ==> registry.aliyuncs.com/google-containers

quay.io ==> quay-mirror.qiniu.com



在使用k8s过程中，经常会因为国内恶劣的网络环境导致镜像下载慢甚至无法下载，因此，需要配置一下镜像源。这里整理一下我在网上找到的一些镜像源



## gcr.io、k8s.gcr.io镜像加速

gcr.io和k8s.gcr.io是k8s自身的一些组件以及第三方组件经常使用的仓库地址，这个地址在国内是无法直接访问的，因此需要使用到国内的一些镜像源来进行拉取。这里使用**Azure中国镜像**

gcr.io镜像仓库的镜像可以直接把gcr.io替换成gcr.azk8s.cn

例如，gcr.io/kubernetes-helm/tiller:v2.13.1镜像，可以用下面的命令进行拉取

```bash
docker pull gcr.azk8s.cn/kubernetes-helm/tiller:v2.13.1
```



对于k8s.gcr.io镜像仓库，是将k8s.gcr.io替换成gcr.azk8s.cn/google-containers

例如，k8s.gcr.io/addon-resizer:1.8.4镜像，可以用下面的命令进行拉取

````bash
docker pull gcr.azk8s.cn/google-containers/addon-resizer:1.8.4
````



##  quay.io镜像加速

有些镜像存放在quay.io仓库里，这个镜像仓库在国内的拉取速度特别慢，因此也可以使用**Azure中国镜像**来加快拉取速度

quay.io镜像仓库是直接把quay.io替换成quay.azk8s.cn

例如quay.io/dexidp/dex:v2.10.0，可以用下面的命令进行拉取

```bash
docker pull quay.azk8s.cn/dexidp/dex:v2.10.0
```





补充一下，对于dockerhub的仓库，也可以使用dockerhub.azk8s.cn进行加速

例如

```bash
docker pull dockerhub.azk8s.cn/library/nginx
```





## helm镜像仓库

**Azure中国** 对于helm也提供了国内的镜像地址

如果是新安装的helm,可以使用下面的命令进行初始化

```bash
helm init --stable-repo-url http://mirror.azure.cn/kubernetes/charts/
```



对于已经安装号helm，可以按照下面的命令替换成Azure中国的镜像仓库

```bash
helm repo remove stable
helm repo add stable http://mirror.azure.cn/kubernetes/charts/
helm repo add incubator http://mirror.azure.cn/kubernetes/charts-incubator/
helm repo update
helm repo list

```





除了Azure中国以外，阿里云和中科大也提供了对应的镜像仓库地址






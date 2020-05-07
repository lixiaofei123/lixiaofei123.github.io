---
title: 拓展nextcloud中ocdownloader的功能
date: 2020-05-06 16:32:03
categories: 实用
tags: 
  - nextcloud
  - ocdownloader
---







**本文只针对不熟悉php的用户**



经过[上文](https://www.lixf.io/2020/04/29/nextcloud-in-docker/)的步骤在成功部署了一个nextcloud服务以及安装了nextcloud插件以后，便想自己扩展一下ocdownloader的功能，让其能够从我指定的一个视频网站（非Youtube）的某个视频链接上自动下载其对应的视频。 比较尴尬的是我虽然有一点点其它语言开发的经验，但是并不会php开发（上次接触php语言已经是6年前的事情了），但是，这个并不能难倒我，在几番尝试中，最终还是实现了自己想要的功能。

首先，我们简单看一下ocdownloader的功能，然后根据其中两个特点

1. 其能够从指定的http链接上下载其对应的文件，
2. 其大部分功能都是通过调用第三方工具实现

根据这两个特点，很容易降低我们的开发难度。我们可以使用我们自己擅长的语言来开发一个工具，这个工具可以从视频链接中提取出对应的资源链接。然后，修改ocdownloader的代码，调用我们自己的工具将视频链接处理成对应的资源链接，将这个资源链接作为参数传递给ocdownloader自己的http下载接口。



### 开发工具

这一步，可以使用自己擅长的语言进行开发。如下图所示，是我自己写的一个根据某网站视频链接提取资源链接以及标题的一个小工具

![工具例子](https://static.huiyuanai.com/lixfio/image/Expand-the-function-of-ocdownloader/tool-example.png)

该工具支持两个参数，proxy参数可以指定代理，videoUrl则是网站视频链接，执行命令后返回的json字符串中包含两个字段，title为标题，url则是提取出的视频链接

> 至于怎么从视频链接中提取出视频对应的资源链接，这个需要具体网站具体分析。以上面的视频网站为例，是将资源的链接拆散后再用js拼在一起的，虽然解析的代码工作量稍微大一点，但是难度并不大。



### 拓展代码

一旦我们开发出来上面的工具以后，后面的工作就简单了，虽然不懂PHP语言，但是可以比葫芦画瓢的修改原ocDownloader的代码，来实现我们的功能。

为了简单，我是这样实现我的功能的，用户在新HTTP下载任务中填入下载链接，然后我在代码中判断这个链接是不是指定的视频网站的链接，如果是的话，就调用工具获取这个视频链接所对应的资源链接。然后将用户填写的下载链接替换成工具所获取的资源链接，同时将输出文件名修改为工具所获取的视频的名称。

下面是修改步骤

首先，将其插件代码克隆到本地

```bash
https://github.com/e-alfred/ocdownloader.git
```

然后，进入到controller/lib目录下，新建一个php文件，我这里叫做pbutil.php，其所对应的类的功能就是调用我们上面的工具并获取对应的返回内容。

例如，下面是实现的代码。实际上，下面的代码完全是模仿同目录下youtube.php文件修改来的。

```php
<?php

namespace OCA\ocDownloader\Controller\Lib;

class PBUtil{

    private $PBDLBinary = null;
    private $URL = null;
    private $ProxyAddress = null;
    private $ProxyPort = 0;

    // 构造函数需要传入pbutil的执行文件路径，以及视频链接
    // 当然这里也可以不需要传入pbutil的路径，而是直接在这里硬编码
    public function __construct($PBDLBinary, $URL){
        $this->PBDLBinary = $PBDLBinary;
        $this->URL = $URL;
    }

    public function setProxy($ProxyAddress, $ProxyPort)
    {
        $this->ProxyAddress = $ProxyAddress;
        $this->ProxyPort = $ProxyPort;
    }
    
    //  这个叫做getVideoUrl()是因为我写的pbutil工具的第一个版本就是只返回了一个资源链接。因为后面在使用过程中发现，下载的时候可以指定一个输出文件名，因此修改了pbutil的代码，使其返回了一个包含了视频标题和资源链接的json字符串。
    public function getVideoUrl(){
        $Proxy = null;
        if (!is_null($this->ProxyAddress) && $this->ProxyPort > 0 && $this->ProxyPort <= 65536) {
            $Proxy = ' -proxy ' . rtrim($this->ProxyAddress, '/') . ':' . $this->ProxyPort;
        }
        $Output = shell_exec(
            $this->PBDLBinary.' -videoUrl \''.$this->URL.'\' '
            .(is_null($Proxy) ? '' : $Proxy)
        );
        return $Output;
    }

}
```



然后修改controller目录下的httpdownloader.php文件，

首先，在99行的上面，也就是  if($isMagnet)这个代码的上面，加入下面的代码片段

```php
$sourceUrl = $_POST['FILE'];
if (strpos($sourceUrl, '******') !== false) { //******换成视频网站的名字，例如 youku
    $pbUtil = new PBUtil('/usr/bin/pbutil', $sourceUrl); //传入执行文件路径以及视频链接
    if (!is_null($this - > ProxyAddress) && $this - > ProxyPort > 0 && $this - > ProxyPort <= 65536) {
        $pbUtil - > SetProxy($this - > ProxyAddress, $this - > ProxyPort);
    }
    $respdata = $pbUtil - > GetVideoUrl();
    $jsondata = json_decode($respdata); //获取返回结果后调用json解析
    $sourceUrl = $jsondata - > url; // 获取资源链接
    $videotitle = $jsondata - > title.'.mp4'; //获取文件名称
}

```

接下来，将 if($isMagnet)后面出现的$_POST['FILE']全部替换为$sourceUrl

然后，在114行的下面，也就是 $OPTIONS = array('dir' => $this->AbsoluteDownloadsFolder, 'out' => $Target, 'follow-torrent' => $isMagnet);这一行的代码下面，加入下面的代码

```php
if (isset($videotitle) && strlen(trim($videotitle)) > 0) {
    $OPTIONS['out'] = $videotitle;
}
```



### 部署插件

将我们修改后的ocdownloader复制到nextcloud的app/custom_apps目录下，然后到应用里启用改插件，就可以使用我们自己写的功能了!!!

![下载页面](https://static.huiyuanai.com/lixfio/image/Expand-the-function-of-ocdownloader/downloadpage.png)



### 视频封面

默认情况下，nextcloud并不会为我们的视频生成封面，而是使用默认的向右三角形的封面。我们可以使用 Preview Generator插件来为我们的视频生成封面。具体使用方法可以参考这篇博客[Nextcloud: Install Preview Generator](https://www.allerstorfer.at/nextcloud-install-preview-generator/)
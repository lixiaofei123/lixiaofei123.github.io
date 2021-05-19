---
title: ios 微信自带浏览器上webrtc不能正常使用的解决方法
date: 2021-03-26 18:34:04
categories: webrtc
tags:
  - webrtc
  - 微信浏览器
---

> 以下内容只适用于 ios版本 >= 14 微信版本 >= 8.0，其余版本请自行测试

最近使用到了webrtc，在其它各端(包括safari浏览器、iOS企业微信)测试没问题后，唯独在ios版微信浏览器上不能正常使用，查看日志，发现webrtc各个流程都已正常建立，包括onHandleTrackd都已经触发，video.srcObject也已经执行，收集的统计信息也说明webrtc的视频流数据也在正常传输，就是没有显示画面。

百度和谷歌了一下，也不知道是不是因为iOS版微信浏览器刚刚支持webrtc的缘故，只有一则3月10多日的新闻说随着ios的更新，采用wkwebview的微信浏览器也已经支持webrtc，再没有其它有用的资料。

后来看了一个使用webrtc支持ios版微信浏览器的网站，发现玄机竟然是下面的代码

```javascript
document.addEventListener("WeixinJSBridgeReady", function () {  
	document.getElementById("remoteVideo").play();
}, false);
```

加上去以后，测试OK，可以不用加班了

值得注意的是，WeixinJSBridgeReady这个事件会在页面加载后马上触发，因此，上面的这个代码最好写在window.onload=>(){}函数体中，所以video标签也要提前写在html网页中，不要等webrtc通道建立后再去动态创建video。

顺便贴一下我的video标签使用的属性

```html
<video preload="auto" autoplay="autoplay" x-webkit-airplay="true" playsinline ="true" webkit-playsinline ="true" x5-video-player-type="h5" x5-video-player-fullscreen="true" x5-video-orientation="portraint">
</video>
```

业余前端，写的不对请见谅。


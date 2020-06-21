---
title: 二维码在线生成
date: 2020-05-13 15:39:30
categories: 在线工具
tags:
  - 在线工具
  - 二维码
  - 在线生成二维码
---

在线生成二维码，也可以直接在本链接后面加入?text=要转换的文字，例如
[https://www.lixf.io/2020/05/13/text-to-qrcode/?text=hello](https://www.lixf.io/2020/05/13/text-to-qrcode/?text=hello)

<div>
    <textarea id="qrtext" style="width:100%;height:60px" oninput="generateQRcode()">待转换的文字</textarea>
    <div style="margin-top: 15px;text-align: center;"><p>二维码在下面，右键点击保存</p> <div id="qrcode" style="width:200px;height:200px;margin-left:auto;margin-right:auto"></div>
</div>
<script>
    let qrcodeImg = document.getElementById('qrcode');
    let qrtext = document.getElementById("qrtext")
    function generateQRcode() {
        qrcodeImg.innerHTML = "";
        new QRCode(qrcodeImg, { text: qrtext.value, width: 200, height: 200 });
    }
    function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            if (pair[0] == variable) { return pair[1]; }
        }
        return (false);
    }
    let text = getQueryVariable("text")
    if(text){
        qrtext.value = decodeURIComponent(text);
    }
    window.addEventListener("load",function(){
        generateQRcode()
    })
</script>

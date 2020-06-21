---
title: 临时复制粘贴处
date: 2019-06-17 15:05:19
categories: 在线工具
tags: 
  - 在线工具
  - 临时保存
---



粘贴的东西暂时没地方放？？先保存到这里吧。（您的数据只保存在浏览器本地）

<textarea id="editbox" style="padding:10px;width:80%;margin-left:auto;margin-right:auto;height:350px"> </textarea>
<span id="tips" style="color:red;font-size:12px"></span>



<script>
    Date.prototype.Format = function(fmt) {
            var o = {
                "M+" : this.getMonth() + 1,
                "d+" : this.getDate(),
                "h+" : this.getHours(),
                "m+" : this.getMinutes(),
                "s+" : this.getSeconds(),
                "q+" : Math.floor((this.getMonth() + 3) / 3),
                "S" : this.getMilliseconds()
            };
            if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        }

      var editbox =  document.getElementById("editbox");
      if(localStorage.autoSave == undefined){
        localStorage.autoSave = "";
      }
	editbox.value = localStorage.autoSave;
      setInterval(function(){
         var value = editbox.value;
         var saveValue = localStorage.autoSave;
         if(value != saveValue){
             localStorage.autoSave = value;
             document.getElementById("tips").innerText= "内容已经在"+new Date().Format("yyyy-MM-dd hh:mm:ss")+"时自动保存";
         }
      },1000 * 3);
</script>









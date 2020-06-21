---
title: 正则表达式在线匹配/替换测试
date: 2020-06-18 18:41:04
categories: 在线工具
tags:
  - 在线转换
  - 在线匹配
  - 正则表达式
---

本页面提供了在线测试正则表达式的功能。
<div><h3>请输入待匹配文本</h3>
<textarea style="width:100%;height:300px" id="matchContent"></textarea></div>
<div><h3>请输入正则表达式</h3>
<textarea style="width:100%;height:100px" id="regexStr"></textarea></div>
<div><textarea type="text" id="replaceword" style="border:1px solid black;width:calc(100% - 200px);height:60px;" placeholder="请输入替换字符串"></textarea>&nbsp;&nbsp;<button style="padding: 1px 6px;" id="matchBtn">测试匹配</button>&nbsp;&nbsp;<button style="padding: 1px 6px;" id="replaceBtn">测试替换</button></div>
<div><h3>匹配结果</h3>
<textarea style="width:100%;height:200px" id="result" disabled></textarea></div>
<script>
    let matchBtn = document.getElementById("matchBtn");
    let replaceBtn = document.getElementById("replaceBtn");
    let matchContentInput = document.getElementById("matchContent");
    let regexStrInput = document.getElementById("regexStr");
    let replacewordInput = document.getElementById("replaceword");
     let resultArea = document.getElementById("result");
    matchBtn.onclick = function(){
      let matchContent = matchContentInput.value;
      let regexStr = regexStrInput.value
      let regex = new RegExp(regexStr, "g");
      let matches = [...matchContent.matchAll(regex)]
      resultArea.value = matches.length !== 0 ? JSON.stringify(matches,null, 4) : "无匹配结果，请检查正则表达式是否正确" 
    }
    replaceBtn.onclick= function(){
        let matchContent = matchContentInput.value;
        let regexStr = regexStrInput.value
        let rw = replacewordInput.value
        let regex = new RegExp(regexStr, "g");
        matchContent = matchContent.replace(regex,rw)
        resultArea.value = matchContent
        }
</script>

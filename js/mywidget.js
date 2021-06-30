window.onload = function(){
    showPostQRCode()
    loadPostAttachments()
    addCopyBtn();
	checkUpdateTime();
}

function checkUpdateTime(){
	let timearray = [...window.location.pathname.matchAll(/(\d{4})\/(\d{2})\/(\d{2})/g)][0].splice(1,3)
	let year = parseInt(timearray[0])
	let month = parseInt(timearray[1])
	let day = parseInt(timearray[2])
	let daysApart = parseInt((new Date().getTime() - new Date(year,month,day)) / 1000 / 60 / 60 / 24)
	if(daysApart >= 180){
		let updateTime = year + '年' + month + '月' + day + '日'
		document.getElementsByClassName("post-note")[0].innerHTML = `<div style="border:1px solid #ffbb76;color:#db7c22;padding:15px;margin:20px 0px;border-radius: 5px;background:#fffcef">
		<div style="margin-bottom:8px;font-size:16px"><b>请注意</b></div>
		<div style="font-size:14px;line-height:24px">本文最后更新于${updateTime}，距今天已经有${daysApart}天，由于系统更新、软件更替等原因，本文所传达的信息或者技术可能已经过时。</div>
	</div>`
	}
}

function addCopyBtn(){
    let figures = document.getElementsByTagName("figure")
    for(let figure of figures){
        figure.style.position = "relative"
        let divbox = document.createElement("div");
        let copyBtn = document.createElement("button");
        let text = document.createElement("span");

        text.style.fontSize = "12px"
        text.style.fontWeight = 800;
        text.style.color = "green"

        divbox.style.position = "absolute"
        divbox.style.top = "5px"
        divbox.style.right = "10px"
        divbox.style.zIndex = 1000;
        divbox.style.display = "none"

        copyBtn.style.padding = "2px 10px"
        copyBtn.style.marginLeft = "10px"
        copyBtn.innerText = "复制";
        copyBtn.style.cursor = "pointer"

        divbox.appendChild(text)
        divbox.appendChild(copyBtn)

        let timer;

        let clipboard = new ClipboardJS(copyBtn,{
            text: () => {
                return figure.querySelector("td[class=code]").innerText
            }
        });
        clipboard.on('success', () => {
            text.innerText = "复制成功"
            clearTimeout(timer)
            timer = setTimeout(() => {
                text.innerText = ""
            },3000)
        });

        figure.prepend(divbox)
        figure.onmouseover = () => {
            divbox.style.display = "block"
        }
        figure.onmouseout = () => {
            divbox.style.display = "none"
        }
    }
}


function showPostQRCode(){
    let href = window.location.href
    if(href.indexOf("/?") != -1){
        href= href.substring(0,href.lastIndexOf("/?") + 1)
    }
    new QRCode(document.getElementById('qrcode-img'), {text: href, width: 140, height: 140});
}

function loadPostAttachments(){
    let re = /<a href="(.*?)".*>附件:(.*?)<\/a>/g;
    let html = "";
    let find = false;
    let postContent = document.getElementsByClassName("post-content")[0].innerHTML
    let index = 1;
    while (matches = re.exec(postContent)) {
        html += "<li class='attchment-item'><a href='" + matches[1] + "' target='_blank' ><b>" + index + ". " +matches[2] + "</b></a></li>";
        find = true;
        index ++;
    };
    if (find) {
        html = "<ul class='attchmentlist'>" + html + "</ul>";
    } else {
        html = "<span>本文不包含任何附件</span>";
    };
    document.getElementsByClassName("attachments")[0].innerHTML = html;
}


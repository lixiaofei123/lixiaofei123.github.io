window.onload = function(){
    showPostQRCode()
    loadPostAttachments()
    addCopyBtn();
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


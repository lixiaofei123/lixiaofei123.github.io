window.onload = function(){
    showPostQRCode()
    loadPostAttachments()
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


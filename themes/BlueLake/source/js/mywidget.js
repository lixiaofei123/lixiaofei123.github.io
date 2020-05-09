window.onload = function(){
    showPostQRCode()
    loadPostAttachments()
}

function showPostQRCode(){
    new QRCode(document.getElementById('qrcode-img'), {text: window.location.href , width: 140, height: 140});
}

function loadPostAttachments(){
    let re = /<a href="(.*?)".*>附件:(.*?)<\/a>/g;
    let html = "";
    let find = false;
    let postContent = document.getElementsByClassName("post-content")[0].innerHTML
    while (matches = re.exec(postContent)) {
        html += "<li class='attchment-item'><a href='" + matches[1] + "' target='_blank' ><b>" + matches[2] + "</b></a></li>";
        find = true;
    };
    if (find) {
        html = "<ul class='attchmentlist'>" + html + "</ul>";
    } else {
        html = "<span>本文不包含任何附件</span>";
    };
    document.getElementsByClassName("attachments")[0].innerHTML = html;
}
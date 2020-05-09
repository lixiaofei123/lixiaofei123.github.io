window.onload = function(){
    bindArticleCalendarEvent()
}

function bindArticleCalendarEvent(){
    let articleCalendar = document.getElementById("articleCalendar")
    for (let gnode of articleCalendar.childNodes) {
        for (let rnode of gnode.childNodes) {
            if (rnode.nodeName === "rect") {
                rnode.addEventListener("mouseover", () => {
                    rnode.setAttributeNS(null, "stroke", "#2e2e2e")
                    let text = rnode.getAttributeNS(null,"text")
                    let postnums = rnode.getAttributeNS(null,"postnums")
                    let  rect =  rnode.getBoundingClientRect()
                    showACPopInfo(rect.x,rect.y, text,postnums)
                })
                rnode.addEventListener("mouseout", () => {
                    rnode.removeAttributeNS(null, "stroke")
                    hideACPopInfo()
                })
            }
        }
    }
}

function showACPopInfo(x,y,text,num){
    let popup = document.createElement("div")
    popup.id = "ac-pop"
    popup.style.position = "fixed"

    let left = x - 45
    let top = y - 60

    if(left < 10) left = x
    if(left + 100 > window.innerWidth) left = x - 100
    if(top < 10) top = y + 20
    popup.style.left = left + "px"
    popup.style.top = top + "px"
    popup.style.background = "rgb(85,85,85)"
    popup.style.padding = "5px 10px"
    popup.style.borderRadius = "4px"
    popup.style.textAlign = "center"
    popup.style.fontSize="14px"
    popup.style.color = "white"
    if(num){
        popup.innerHTML = text + "<br> 发表了" + num + "篇博客"
    }else{
        popup.innerHTML = text 
    }
    document.body.appendChild(popup)
}

function hideACPopInfo(){
    let pop = document.getElementById("ac-pop")
    if(pop){
        pop.remove()
        
    }
}
window.addEventListener('load', init)

function init(){
    console.log("Ucitan JS")
    var h1 = document.getElementsByTagName("h1")[0]
    h1.addEventListener('click', h1_click)
}

function h1_click(){
    console.log("h1 klik")    
}
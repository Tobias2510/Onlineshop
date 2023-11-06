let showmenu=false;
let shopitems=document.getElementsByClassName("shop_item");
let total_price=0;

for(let x=0; x<shopitems.length; x++){
    let children=shopitems[x].children;
    let price=children[1].innerHTML.substring(0, children[1].innerHTML.length-1);
    let number=children[2].innerHTML.substring(0, children[2].innerHTML.length-1);
    total_price=total_price+price*number;
}

document.getElementById("total_price").innerHTML=`Total Price: ${total_price}€`;

document.getElementById("menu_div").style.display="none";

document.getElementById("menu_btn").addEventListener("click", ()=>{
    document.getElementById("menu_btn").classList.toggle("change");
    showMenu();
});

function showMenu(){
    if(showmenu==false){
        document.getElementById("menu_div").style.display="block";
        showmenu=true;
    }
    else{
        document.getElementById("menu_div").style.display="none";
        showmenu=false;
    }
}
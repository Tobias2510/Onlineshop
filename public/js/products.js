let showadd=false;
let showmenu=false;
let showchange=false;

document.getElementById("add_div").style.display="none";
document.getElementById("change_div").style.display="none";
document.getElementById("menu_div").style.display="none";

let change_btns=document.getElementsByClassName("change_btn");

document.getElementById("add_btn").addEventListener("click", ()=>{
    showAddDiv();
});

document.getElementById("menu_btn").addEventListener("click", ()=>{
    document.getElementById("menu_btn").classList.toggle("change");
    showMenu();
});

document.getElementById("close_btn").addEventListener("click", ()=>{
    showChangeDiv();
});

for(let i=0; i<change_btns.length; i++){
    change_btns[i].addEventListener("click", ()=>{
        showChangeDiv(change_btns[i].parentElement.parentElement);
    });
}

function showAddDiv(){
    if(showadd==false){
        document.getElementById("add_div").style.display="";
        showadd=true;
    }
    else{
        document.getElementById("add_div").style.display="none";
        showadd=false;
    }
}

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

function showChangeDiv(element){
    if(showchange==false){

        let values=element.children;
        let price=values[1].innerHTML.substring(0, values[1].innerHTML.length-1);

        document.getElementById("c_product_name").value=values[0].innerHTML;
        document.getElementById("c_product_desc").value=values[2].value;
        document.getElementById("c_price").value=price;
        document.getElementById("id").value=values[3].value;

        document.getElementById("change_div").style.display="block";
        showchange=true;
    }
    else{
        document.getElementById("change_div").style.display="none";
        showchange=false;
    }
}
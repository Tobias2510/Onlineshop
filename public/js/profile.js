let showmenu=false;
let showprofileoption=false;
let showchangepassw=false;

document.getElementById("profile_option_div").style.display="none";
document.getElementById("menu_div").style.display="none";

let passw=document.getElementsByClassName("password");
for(let x=0; x<passw.length; x++){
    passw[x].style.display="none";
}

document.getElementById("menu_btn").addEventListener("click", ()=>{
    document.getElementById("menu_btn").classList.toggle("change");
    showMenu();
});

document.getElementById("profile_logo").addEventListener("click", ()=>{
    document.getElementById("animation_div").classList.add("animation");
    setTimeout(()=>{
        document.getElementById("animation_div").classList.remove("animation");
    }, 300);
    setTimeout(showProfileOption, 150);
});

document.getElementById("change_passw").addEventListener("click", ()=>{
    showChangePassw();
});

if(document.getElementById("status").innerHTML!==""){
    document.getElementById("status_div").style.border="solid red 2px";
    document.getElementById("status_div").style.borderRadius="10px";
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

function showProfileOption(){
    if(showprofileoption==false){
        document.getElementById("profile_option_div").style.display="block";
        showprofileoption=true;
    }
    else{
        document.getElementById("profile_option_div").style.display="none";
        showprofileoption=false;
    }
}

function showChangePassw(){
    if(showchangepassw==false){
        for(let x=0; x<passw.length; x++){
            passw[x].style.display="";
        }
        showchangepassw=true;
    }
    else{
        for(let x=0; x<passw.length; x++){
            passw[x].style.display="none";
        }
        showchangepassw=false;
    }
}
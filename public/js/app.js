let showlogin=false;
let showsignup=false;
let show_admin_code_input=false;

document.getElementById('date').valueAsDate = new Date();

document.getElementById("login_div").style.display="none";
document.getElementById("signup_div").style.display="none";
document.getElementById("admin_code").style.display="none";

if(document.getElementById("status").innerHTML!==""){
    document.getElementById("status_div").style.border="solid red 2px";
    document.getElementById("status_div").style.borderRadius="10px";
}

document.getElementById("login_btn").addEventListener("click", ()=>{
    showLogin();
});

document.getElementById("signup_btn").addEventListener("click", ()=>{
    showSignUp();
});

document.getElementById("admin_checkbox").addEventListener("click", ()=>{
    showAdminCodeInput();
});

function showLogin(){
    if(showsignup==true){
        showSignUp();
    }
    if(showlogin==false){
        document.getElementById("login_div").style.display="block";
        showlogin=true;
    }
    else{
        document.getElementById("login_div").style.display="none";
        showlogin=false;
    }
}

function showSignUp(){
    if(showlogin==true){
        showLogin();
    }
    if(showsignup==false){
        document.getElementById("signup_div").style.display="block";
        showsignup=true;
    }
    else{
        document.getElementById("signup_div").style.display="none";
        showsignup=false;
    }
}

function showAdminCodeInput(){
    if(show_admin_code_input==false){
        document.getElementById("admin_code").style.display="";
        show_admin_code_input=true;
    }
    else{
        document.getElementById("admin_code").style.display="none";
        show_admin_code_input=false;
    }
}
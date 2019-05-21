

function hideAllInput() {
    document.querySelector(".timemap__input--companyname").style.display = "none";
    document.querySelector(".timemap__input--companycode").style.display = "none";
    document.querySelector(".timemap__input--companyemail").style.display = "none";
    document.querySelector(".timemap__input--companytelephone").style.display = "none";
    document.querySelector(".timemap__input--companydate").style.display = "none";
}

function showSelectedInput() {
    hideAllInput();

    const select = document.querySelector(".selectedInput");
    const name = document.querySelector(".timemap__input--companyname");
    const code = document.querySelector(".timemap__input--companycode");
    const email = document.querySelector(".timemap__input--companyemail");
    const phone = document.querySelector(".timemap__input--companytelephone");
    const range = document.querySelector(".timemap__input--companydate");

    if (select.value === "name") {
        name.style.display = "block";
    } else if (select.value === "code") {
        code.style.display = "block";
    } else if (select.value === "email") {
        email.style.display = "block";
    } else if (select.value === "telephone") {
        phone.style.display = "block";
    } else if (select.value === "range") {
        range.style.display = "block";
    } 
}

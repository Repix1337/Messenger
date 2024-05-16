document.addEventListener("DOMContentLoaded", () => {
    let isLoginVisible = true;
    const LoginContent = document.getElementById("LoginContent");
    const RegisterContent = document.getElementById("RegisterContent");
    const SwapButtons = document.querySelectorAll(".SwapButton");
   
    function swap(event) {
        event.preventDefault();
        if (isLoginVisible) {
            LoginContent.style.display = "none";
            RegisterContent.style.display = "block";
            isLoginVisible = false;
        } else {
            RegisterContent.style.display = "none";
            LoginContent.style.display = "block";
            isLoginVisible = true;
        }
    }
    SwapButtons.forEach(button => {
        button.addEventListener('click', swap);
    });
    document.getElementById("RegisterButton").addEventListener('click', register)
});

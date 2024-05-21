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

    document.getElementById("loginButton").addEventListener('click', function() {
        const login = document.getElementById("login").value;
        const password = document.getElementById("password").value;

        fetch('Login/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('username', data.username);
                alert(data.message);
                window.location.href = 'index.html';
            } else {
                alert(data.message);
            }
        });
    });

    document.getElementById("RegisterButton").addEventListener('click', function() {
        const login = document.getElementById("login-register").value;
        const password = document.getElementById("password-register").value;
        const repeatPassword = document.getElementById("repeat-password").value;

        fetch('Login/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `login-register=${encodeURIComponent(login)}&password-register=${encodeURIComponent(password)}&repeat-password=${encodeURIComponent(repeatPassword)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('username', data.username);
                alert(data.message);
                window.location.href = 'index.html';
            } else {
                alert(data.message);
            }
        });
    });
});

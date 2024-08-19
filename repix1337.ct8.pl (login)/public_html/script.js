document.addEventListener("DOMContentLoaded", () => {
    let isLoginVisible = true;
    const LoginContent = document.getElementById("LoginContent");
    const RegisterContent = document.getElementById("RegisterContent");
    const SwapButtons = document.querySelectorAll(".SwapButton");
    

    function swap(event) {
        event.preventDefault();
        if (isLoginVisible) {
            LoginContent.style.display = 'none';
            LoginContent.style.opacity = '0';
            RegisterContent.style.opacity = '0';
            RegisterContent.style.display = 'block';
            setTimeout(() => {
                RegisterContent.style.opacity = '1';
            }, 1);
            isLoginVisible = false;
        } else {
            RegisterContent.style.display = 'none';
            RegisterContent.style.opacity = '0';
            LoginContent.style.display = 'block';
            setTimeout(() => {
                LoginContent.style.opacity = '1';
            }, 1);
            isLoginVisible = true;
        }
    }

    SwapButtons.forEach(button => {
        button.addEventListener('click', swap);
    });

    function handleLogin() {
        const login = document.getElementById("login").value;
        const password = document.getElementById("password").value;
        fetch('login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `login=${encodeURIComponent(login)}&password=${encodeURIComponent(password)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                setCookie('loggedIn', 'true', 7,'ct8.pl');
                setCookie('username', data.username, 7,'ct8.pl');
                alert(data.message);
                location.reload()
            } else {
                alert(data.message);
            }
        });
    }
    function handleRegister() {
        const login = document.getElementById("login-register").value;
        const password = document.getElementById("password-register").value;
        const repeatPassword = document.getElementById("repeat-password").value;

        fetch('register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `login-register=${encodeURIComponent(login)}&password-register=${encodeURIComponent(password)}&repeat-password=${encodeURIComponent(repeatPassword)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                setCookie('loggedIn', 'true', 7,'ct8.pl');
                setCookie('username', data.username, 7,'ct8.pl');
                alert(data.message);
                location.reload()
            } else {
                alert(data.message);
            }
        });
    }

    function setCookie(name, value, days, domain) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/;domain=" + domain;
        console.log(`Cookie set: ${name}=${value}; domain=${domain}`);
    }
    
    

    document.getElementById("loginButton").addEventListener('click', (event) => {
        event.preventDefault();
        handleLogin();
    });

    document.getElementById("RegisterButton").addEventListener('click', (event) => {
        event.preventDefault();
        handleRegister();
    });

    document.getElementById("loginForm").addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (isLoginVisible) {
                handleLogin();
            } else {
                handleRegister();
            }
        }
    });

   
    
});

document.addEventListener("DOMContentLoaded", () => {
    let isLoginVisible = true;
    const LoginContent = document.getElementById("LoginContent");
    const RegisterContent = document.getElementById("RegisterContent");
    const SwapButtons = document.querySelectorAll(".SwapButton");
    let canChangeTheme = true;

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
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('username', data.username);
                alert(data.message);
                window.location.href = '../index.html';
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
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('username', data.username);
                alert(data.message);
                window.location.href = '../index.html';
            } else {
                alert(data.message);
            }
        });
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

    document.getElementById("theme").addEventListener('click', function() {
        if (!canChangeTheme) return;

        const otherElements = document.querySelectorAll('.side-menu, .popup, .chat, #theme');
        canChangeTheme = false;

        setTimeout(() => {
            canChangeTheme = true;
        }, 1500);

        document.body.classList.add('animate-theme');

        otherElements.forEach(element => {
            element.classList.toggle('hidden');
        });

        setTimeout(() => {
            if (document.body.classList.contains('dark-theme')) {
                document.body.style.background = "radial-gradient(circle at center, #000000, #0000ff 30%, #800080 60%, #000000 90%)";
                document.body.style.color = "white";
            } else {
                document.body.style.background = "radial-gradient(circle at center, #ffffff, #ffff00 30%, #00ff00 60%, #ffffff 90%)";
                document.body.style.color = "black";
            }

            setTimeout(() => {
                document.body.classList.remove('animate-theme');
                otherElements.forEach(element => {
                    element.classList.toggle('hidden');
                });
            }, 1300);
        }, 10);
    });
});

const loginOverlay = document.getElementById("loginOverlay");
const registerOverlay = document.getElementById("registerOverlay");

function showLogin() {
registerOverlay.style.display = "none";
loginOverlay.style.display = "flex";
}

function closeLogin() {
loginOverlay.style.display = "none";
}

function showRegister() {
loginOverlay.style.display = "none";
registerOverlay.style.display = "flex";
}

function closeRegister() {
registerOverlay.style.display = "none";
}

/* LOGIN */

document.getElementById("loginForm").addEventListener("submit", async function(event) {


event.preventDefault();

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;
const message = document.getElementById("loginMessage");

message.innerText = "Logging in...";

try {

    const response = await fetch("http://localhost:8080/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    });

const result = await response.json();

if (response.ok) {

    localStorage.setItem("homesplitUserId", result.userId);
    localStorage.setItem("homesplitUserName", result.name);
    localStorage.setItem("homesplitUserEmail", result.email);

    message.innerText = "Login successful!";

    setTimeout(function() {
        window.location.href = "dashboard.html";
    }, 500);

} else {

    message.innerText = result.message || "Login failed.";
}

} catch (error) {

    message.innerText =
        "Unable to connect to HomeSplit backend.";

    console.error(error);
}


});

/* REGISTER */

document.getElementById("registerForm").addEventListener("submit", async function(event) {


event.preventDefault();

const name = document.getElementById("registerName").value;
const email = document.getElementById("registerEmail").value;
const password = document.getElementById("registerPassword").value;

const message = document.getElementById("registerMessage");

message.innerText = "Creating account...";

try {

    const response = await fetch("http://localhost:8080/users/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })
    });

    if (!response.ok) {

        message.innerText = "Registration failed.";
        return;
    }

    const user = await response.json();

    message.innerText =
        "Account created! Welcome " + user.name;

    setTimeout(function() {
        showLogin();
    }, 1000);

} catch (error) {

    message.innerText =
        "Unable to connect to HomeSplit backend.";

    console.error(error);
}


});

/* CLOSE POPUPS WHEN CLICKING OUTSIDE */

window.addEventListener("click", function(event) {


if (event.target === loginOverlay) {
    closeLogin();
}

if (event.target === registerOverlay) {
    closeRegister();
}


});

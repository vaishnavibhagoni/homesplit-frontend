
const API_BASE_URL = "https://homesplit-backend-2.onrender.com";

const loginOverlay = document.getElementById("loginOverlay");
const registerOverlay = document.getElementById("registerOverlay");

function showLogin() {
    if (registerOverlay) registerOverlay.style.display = "none";
    if (loginOverlay) loginOverlay.style.display = "flex";
}

function closeLogin() {
    if (loginOverlay) loginOverlay.style.display = "none";
}

function showRegister() {
    if (loginOverlay) loginOverlay.style.display = "none";
    if (registerOverlay) registerOverlay.style.display = "flex";
}

function closeRegister() {
    if (registerOverlay) registerOverlay.style.display = "none";
}

// Read JSON or plain-text responses safely.
async function readResponse(response) {
    const text = await response.text();

    if (!text) return {};

    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
}

function getMessage(result) {
    return result.message || result.error || "";
}

/* LOGIN */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const message = document.getElementById("loginMessage");
        const submitButton = loginForm.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        if (!email || !password) {
            message.innerText = "Please enter your email and password.";
            return;
        }

        message.innerText =
            "Connecting to HomeSplit... The server may take a moment to respond.";

        if (submitButton) submitButton.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const result = await readResponse(response);
            console.log("LOGIN RESPONSE:", result);
            if (!response.ok) {
                message.innerText =
                    getMessage(result) || `Login failed (HTTP ${response.status}).`;
                return;
            }

            // Supports common backend response field names.
            const userId = result.userId ?? result.id ?? result.user?.id;
            const userName =
                result.name ??
                result.userName ??
                result.user?.name ??
                "";
            const userEmail =
                result.email ??
                result.user?.email ??
                email;

            // Also supports a backend returning a plain-text success message.
            const textMessage = result.message || "";
            const textIndicatesSuccess =
                typeof textMessage === "string" &&
                textMessage.toLowerCase().includes("login successful");

            const responseIndicatesSuccess =
                result.success === true ||
                result.status === "success" ||
                textIndicatesSuccess;

            if (result.success === false || result.status === "error") {
                message.innerText = getMessage(result) || "Login failed.";
                return;
            }

            // A plain-text response is accepted only if it clearly indicates success.
            // A JSON response must contain a recognizable success indicator or user data.
            const hasUserData =
                userId != null ||
                Boolean(result.user) ||
                Boolean(result.email && result.name);

            if (
                !responseIndicatesSuccess &&
                !hasUserData &&
                typeof result.message !== "string"
            ) {
                message.innerText =
                    "The server responded, but its login response was not recognized.";
                console.error("Unexpected login response:", result);
                return;
            }

            if (
                typeof result.message === "string" &&
                !responseIndicatesSuccess &&
                !hasUserData
            ) {
                message.innerText =
                    getMessage(result) || "The server did not confirm login.";
                return;
            }

            // Clear stale IDs so data from a previous login is not reused.
            localStorage.removeItem("homesplitUserId");

            if (userId != null) {
                localStorage.setItem("homesplitUserId", String(userId));
            }

            localStorage.setItem("homesplitUserName", userName);
            localStorage.setItem("homesplitUserEmail", userEmail);

            message.innerText = "Login successful! Opening your dashboard...";

            // Use an absolute path within the current website.
            setTimeout(() => {
                window.location.href = new URL(
                    "dashboard.html",
                    window.location.href
                ).href;
            }, 400);

        } catch (error) {
            console.error("Login request failed:", error);
            message.innerText =
                "Could not connect to HomeSplit. Please check your internet connection and try again.";
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

/* REGISTER */

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const message = document.getElementById("registerMessage");
        const submitButton = registerForm.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        if (!name || !email || !password) {
            message.innerText = "Please fill in all fields.";
            return;
        }

        message.innerText = "Creating your account...";

        if (submitButton) submitButton.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/users/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });

            const result = await readResponse(response);

            if (!response.ok) {
                message.innerText =
                    getMessage(result) ||
                    `Registration failed (HTTP ${response.status}).`;
                return;
            }

            const registeredName =
                result.name ?? result.user?.name ?? name;

            message.innerText =
                `Account created successfully! Welcome ${registeredName}.`;

            registerForm.reset();

            setTimeout(() => {
                showLogin();
            }, 1000);

        } catch (error) {
            console.error("Registration request failed:", error);
            message.innerText =
                "Could not connect to HomeSplit. Please try again.";
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

/* CLOSE POPUPS WHEN CLICKING OUTSIDE */

window.addEventListener("click", function (event) {
    if (event.target === loginOverlay) closeLogin();
    if (event.target === registerOverlay) closeRegister();
});

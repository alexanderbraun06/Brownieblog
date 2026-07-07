function getInputValue(id: string): string {
    const element = document.getElementById(id) as HTMLInputElement | null;
    return element?.value?.trim() ?? "";
}

function setMessage(message: string, isError: boolean): void {
    const messageBox = document.getElementById("message") as HTMLDivElement | null;
    if (messageBox) {
        messageBox.textContent = message;
        messageBox.style.color = isError ? "#b00020" : "#1b5e20";
    }
}

async function registerUser(): Promise<void> {
    const username = getInputValue("username");
    const password = getInputValue("password");
    const name = getInputValue("name");
    const email = getInputValue("email");
    const birthDate = getInputValue("birthDate");

    if (!username || !password || !name || !email || !birthDate) {
        setMessage("Please fill in all fields.", true);
        return;
    }

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, name, email, birthDate })
        });
        const result = await response.json() as { error?: string; message?: string };

        if (!response.ok) {
            setMessage(result.error || "Registrazione fallita.", true);
            return;
        }

        setMessage(result.message || "Registrazione effettuata con successo!", false);
    } catch (error) {
        setMessage("Impossibile contattare il server.", true);
    }
}

async function loginUser(): Promise<void> {
    const email = getInputValue("loginEmail");
    const password = getInputValue("loginPassword");

    if (!email || !password) {
        setMessage("Please fill in both email and password.", true);
        return;
    }

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json() as { error?: string; message?: string };

        if (!response.ok) {
            setMessage(result.error || "Login fallito.", true);
            return;
        }

        setMessage(result.message || "Login effettuato con successo!", false);
    } catch (error) {
        setMessage("Impossibile contattare il server.", true);
    }
}

if (typeof window !== "undefined") {
    window.registerUser = registerUser;
    window.loginUser = loginUser;
}
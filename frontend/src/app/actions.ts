import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { apiRequest } from "@/lib/api";

export async function registerUser(formData: FormData) {
    const username = formData.get("name") as string; // В Django используется username
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("name") as string;

    if (!username || !email || !password) {
        return { error: "Все поля обязательны" };
    }

    try {
        await apiRequest("/users/register/", {
            method: "POST",
            body: JSON.stringify({
                username,
                email,
                password,
                password_confirm: password, // Бэкенд требует подтверждения
                full_name: fullName
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });

        // Automatically sign in after registration
        try {
            await signIn("credentials", {
                email,
                password,
                redirect: false,
            });
            return { success: true };
        } catch (error) {
            return { success: true, warning: "Аккаунт создан, но не удалось выполнить автоматический вход" };
        }
    } catch (error: any) {
        console.error("Registration error:", error);
        return { error: error.message || "Ошибка при регистрации" };
    }
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        await signIn("credentials", {
            ...Object.fromEntries(formData),
            redirect: false,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Неверный email или пароль";
                default:
                    return "Произошла ошибка при входе";
            }
        }
        throw error;
    }

    redirect("/profile");
}

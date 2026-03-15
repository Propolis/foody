import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
    const session = await auth() as any;
    if (!session?.user?.accessToken) {
        return { error: "Необходимо войти в систему" };
    }

    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const file = formData.get("avatar") as File;

    if (!name) {
        return { error: "Имя обязательно" };
    }

    try {
        // В Django обновление профиля обычно происходит через PATCH /users/me/
        // или аналогичный эндпоинт. Пока он не реализован, возвращаем ошибку.
        
        /* Пример реализации если бы эндпоинт был:
        const body = new FormData();
        body.append("full_name", name);
        body.append("bio_text", bio);
        if (file && file.size > 0) body.append("avatar", file);

        await apiRequest("/users/me/", {
            method: "PATCH",
            body,
            headers: {
                "Authorization": `Bearer ${session.user.accessToken}`
            }
        });
        */

        return { error: "Обновление профиля временно недоступно на бэкенде" };
    } catch (error) {
        console.error("Update profile error:", error);
        return { error: "Ошибка при обновлении профиля" };
    }

    // revalidatePath("/");
    // revalidatePath("/profile");
    // redirect("/profile");
}

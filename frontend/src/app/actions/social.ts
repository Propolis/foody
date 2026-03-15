"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api";
import { redirect } from "next/navigation";

export async function toggleLike(postId: string) {
    const session = await auth() as any;
    if (!session?.user?.accessToken) {
        redirect("/login");
    }

    try {
        await apiRequest(`/posts/${postId}/like/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${session.user.accessToken}`
            }
        });

        revalidatePath("/");
        revalidatePath(`/dish/${postId}`);
        revalidatePath("/profile");
        return { success: true };
    } catch (error: any) {
        console.error("Toggle like error:", error);
        return { error: error.message || "Failed to toggle like" };
    }
}

export async function toggleSave(postId: string) {
    const session = await auth() as any;
    if (!session?.user?.accessToken) {
        redirect("/login");
    }

    try {
        await apiRequest(`/posts/${postId}/save_post/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${session.user.accessToken}`
            }
        });

        revalidatePath("/");
        revalidatePath(`/dish/${postId}`);
        revalidatePath("/profile");
        revalidatePath("/favorites");
        return { success: true };
    } catch (error: any) {
        console.error("Toggle save error:", error);
        return { error: error.message || "Failed to toggle save" };
    }
}

export async function toggleFollow(targetUserId: string) {
    // Подписки пока не реализованы на бэкенде
    return { error: "Подписки временно недоступны" };
}

export async function getFriendsPosts(accessToken?: string) {
    // Получение постов друзей требует системы подписок
    return [];
}

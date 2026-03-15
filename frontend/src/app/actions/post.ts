"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Dish, User } from "@/lib/data";

function mapDjangoPostToDish(post: any): Dish {
    const stats = post.statistics || {};
    // Считаем средний рейтинг из трех если они есть, иначе 0
    const taste = stats.rating_taste || 0;
    const appearance = stats.rating_appearance || 0;
    const satiety = stats.rating_satiety || 0;
    const userRating = (taste + appearance + satiety) / 3 || 0;

    return {
        id: post.id.toString(),
        type: "user_post",
        title: post.dish_name || "Без названия",
        description: post.description || "",
        imageUrl: post.images?.[0]?.image || "/placeholder.png",
        images: post.images?.map((img: any) => img.image) || [],
        userRating: parseFloat(userRating.toFixed(1)),
        matchScore: 0, // Пока не реализовано на бэкенде
        author: {
            id: post.user?.id?.toString() || "unknown",
            name: post.user?.full_name || post.user?.username || "Аноним",
            avatar: post.user?.avatar || "https://i.pravatar.cc/150",
            bio: post.user?.bio,
        },
        restaurant: {
            id: post.restaurant?.toString() || "unknown",
            name: post.restaurant_name || "Неизвестно",
            location: { lat: 0, lng: 0 },
            address: post.restaurant_address || "",
        },
        stats: {
            likes: stats.likes_count || 0,
            calories: 0, // Не отдается в PostListSerializer бэкенда пока
            protein: 0,
            fat: 0,
            carbs: 0,
        },
        tags: post.tags?.map((t: any) => t.name) || [],
        createdAt: post.created_at,
    };
}

export async function createPost(formData: FormData) {
    const session = await auth() as any;
    if (!session?.user?.accessToken) {
        return { error: "Необходимо войти в систему" };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const taste = formData.get("userRating") as string; // Используем как базу для вкуса
    
    // В Django нам нужно 3 оценки. Фронтенд пока дает одну.
    // Пробросим одну и ту же во все три для начала, или предложим дефолты.
    const ratingValue = parseFloat(taste) || 0;

    const newFormData = new FormData();
    newFormData.append("dish_name", title);
    newFormData.append("description", description);
    newFormData.append("taste", ratingValue.toString());
    newFormData.append("appearance", ratingValue.toString());
    newFormData.append("satiety", ratingValue.toString());
    newFormData.append("restaurant_name", (formData.get("restaurantName") as string) || "Неизвестно");
    newFormData.append("restaurant_address", (formData.get("restaurantAddress") as string) || "");
    
    const category = formData.get("category") as string;
    if (category) {
        newFormData.append("tags_list", category);
    }

    // Обработка тегов
    const tags = formData.getAll("tags") as string[];
    tags.forEach(tag => newFormData.append("tags_list", tag));

    // Обработка изображений
    const files = formData.getAll("image") as File[];
    files.forEach(file => {
        if (file.size > 0) {
            newFormData.append("uploaded_images", file);
        }
    });

    try {
        await apiRequest("/posts/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${session.user.accessToken}`
            },
            body: newFormData as any
        });

        revalidatePath("/");
        revalidatePath("/profile");
    } catch (error: any) {
        console.error("Create post error:", error);
        return { error: error.message || "Ошибка при создании поста" };
    }

    redirect("/profile");
}

export async function deletePost(postId: string) {
    const session = await auth() as any;
    if (!session?.user?.accessToken) {
        return { error: "Unauthorized" };
    }

    try {
        await apiRequest(`/posts/${postId}/`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${session.user.accessToken}`
            }
        });

        revalidatePath("/profile");
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Delete post error:", error);
        return { error: error.message || "Failed to delete post" };
    }
}

export async function getSearchPosts(query?: string, category?: string, accessToken?: string) {
    try {
        let endpoint = "/posts/";
        const params = new URLSearchParams();
        
        if (query) {
            params.append("search", query);
        }
        
        const queryString = params.toString();
        if (queryString) {
            endpoint += `?${queryString}`;
        }

        const options: any = {};
        if (accessToken) {
            options.headers = {
                "Authorization": `Bearer ${accessToken}`
            };
        }

        const data = await apiRequest(endpoint, options);
        
        const results = data.results || data;
        
        if (!Array.isArray(results)) return [];

        return results.map(mapDjangoPostToDish);
    } catch (error) {
        console.error("Search error:", error);
        return [];
    }
}
export async function getGroupedSearchDishes(query?: string, category?: string) {
    try {
        const posts = await getSearchPosts(query, category);

        // Упрощенная группировка: просто возвращаем посты смапленные в нужный формат
        // В будущем здесь можно добавить логику группировки по dish_name если нужно
        return posts.map(dish => ({
            ...dish,
            weightedRating: dish.userRating,
            reviewCount: 1, // В API пока нет агрегации
            stats: {
                ...dish.stats,
                likes: dish.stats.likes,
            },
            latestPost: dish
        }));
    } catch (error) {
        console.error("Grouped search error:", error);
        return [];
    }
}

export async function getGroupedDishDetails(title: string, restaurantName: string) {
    try {
        // В Django мы можем искать по dish_name и restaurant_name
        const params = new URLSearchParams();
        params.append("search", title); // Или более точный фильтр если есть
        
        const data = await apiRequest(`/posts/?search=${encodeURIComponent(title)}`);
        const results = data.results || data;
        
        if (!Array.isArray(results) || results.length === 0) return null;

        // Фильтруем точное совпадение если API вернуло лишнее
        const filtered = results.filter((p: any) => 
            p.dish_name?.toLowerCase() === title.toLowerCase() &&
            p.restaurant_name?.toLowerCase() === restaurantName.toLowerCase()
        );

        if (filtered.length === 0) return null;

        const posts = filtered.map(mapDjangoPostToDish);
        const first = posts[0];

        return {
            title,
            restaurantName,
            restaurantAddress: first.restaurant.address,
            category: "Все",
            weightedRating: first.userRating,
            reviewCount: posts.length,
            stats: first.stats,
            images: posts.flatMap(p => p.images),
            tags: Array.from(new Set(posts.flatMap(p => p.tags))),
            posts: posts.map(p => ({
                id: p.id,
                userRating: p.userRating,
                description: p.description,
                createdAt: p.createdAt,
                author: p.author,
                likes: p.stats.likes,
                image: p.imageUrl
            }))
        };
    } catch (error) {
        console.error("Error fetching grouped dish details:", error);
        return null;
    }
}

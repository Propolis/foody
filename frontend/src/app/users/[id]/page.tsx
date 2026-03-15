import ProfileHeader from "@/components/ProfileHeader";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { apiRequest, mapDjangoPostToDish } from "@/lib/api";

export default async function UserProfile({ params, searchParams }: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ tab?: string }>
}) {
    const { id } = await params;
    const { tab } = await searchParams;
    const activeTab = tab || "posts";
    const session = await auth() as any;

    // Редирект на собственный профиль, если ID совпадает
    if (session?.user?.id?.toString() === id) {
        redirect("/profile");
    }

    try {
        const options: any = {};
        if (session?.user?.accessToken) {
            options.headers = {
                "Authorization": `Bearer ${session.user.accessToken}`
            };
        }

        const data = await apiRequest(`/posts/user_posts/?user_id=${id}`, options);
        const posts = Array.isArray(data.results || data) 
            ? (data.results || data).map(mapDjangoPostToDish) 
            : [];

        // Извлекаем данные пользователя из первого поста или используем заглушку
        // PostListSerializer -> user (FeedPostAuthorSerializer)
        const firstPost = Array.isArray(data.results || data) ? (data.results || data)[0] : null;
        
        const mappedUser = {
            id: id,
            name: firstPost?.user?.username || "Пользователь",
            avatar: firstPost?.user?.avatar || "",
            bio: "Заядлый кулинар", // На бэкенде пока нет био в списке постов
            stats: {
                posts: posts.length,
                followers: 0,
                following: 0
            }
        };

        return (
            <div style={{ paddingBottom: "80px" }}>
                <ProfileHeader
                    user={mappedUser}
                    stats={mappedUser.stats}
                    isCurrentUser={false}
                    initialIsFollowing={false} // Бэкенд пока не отдает статус подписки
                />

                <div style={{ padding: "0 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", marginTop: "16px" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Посты</h2>
                    </div>

                    {posts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
                            <p>У пользователя пока нет постов.</p>
                        </div>
                    ) : (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "2px",
                            margin: "0 -16px"
                        }}>
                            {posts.map((dish: any) => (
                                <Link key={dish.id} href={`/dish/${dish.id}`} style={{ position: "relative", aspectRatio: "1/1" }}>
                                    <Image
                                        src={dish.imageUrl}
                                        alt={dish.title}
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error("User profile load error:", error);
        return <div style={{ padding: "40px", textAlign: "center" }}>Ошибка при загрузке профиля</div>;
    }
}

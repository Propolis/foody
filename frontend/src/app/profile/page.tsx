import ProfileHeader from "@/components/ProfileHeader";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { apiRequest, mapDjangoPostToDish } from "@/lib/api";

export default async function Profile({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    const { tab } = await searchParams;
    const activeTab = tab || "posts";
    const session = await auth() as any;

    if (!session?.user?.accessToken) {
        redirect("/login");
    }

    try {
        // Получаем посты текущего пользователя
        const data = await apiRequest("/posts/my/", {
            headers: {
                "Authorization": `Bearer ${session.user.accessToken}`
            }
        });

        const posts = Array.isArray(data.results || data) 
            ? (data.results || data).map(mapDjangoPostToDish) 
            : [];

        // Используем данные из сессии для хедера профиля
        const mappedUser = {
            id: session.user.id || "me",
            name: session.user.name || "Пользователь",
            avatar: session.user.image || "",
            bio: "Гурман и любитель еды", // Заглушка, так как био пока не отдается отдельно
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
                    isCurrentUser={true}
                />

                <div style={{ padding: "0 16px" }}>
                    {activeTab === "posts" ? (
                        <>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", marginTop: "16px" }}>
                                <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Посты</h2>
                                <Link href="/create" style={{ color: "var(--primary)" }}>
                                    <PlusCircle size={28} />
                                </Link>
                            </div>

                            {posts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
                                    <p>У вас пока нет постов.</p>
                                    <Link href="/create" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Создать первый пост</Link>
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
                        </>
                    ) : (
                        <div className="following-list">
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
                                <p>Функционал подписок скоро появится.</p>
                                <Link href="/" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>На главную</Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error("Profile load error:", error);
        return <div style={{ padding: "20px", textAlign: "center" }}>Ошибка при загрузке профиля</div>;
    }
}

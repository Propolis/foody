import { auth } from "@/auth";
import { getGroupedDishDetails } from "@/app/actions/post";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Flame, Star, MessageSquare } from "lucide-react";
import DishActions from "@/components/DishActions";
import AuthorSection from "@/components/AuthorSection";
import DishGallery from "@/components/DishGallery";
import { apiRequest, mapDjangoPostToDish } from "@/lib/api";
import styles from "./page.module.css";

export default async function DishPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const isGrouped = id.startsWith("grouped_");
    const session = await auth() as any;

    let dish: any = null;
    let groupedData: any = null;

    try {
        if (isGrouped) {
            // ID format: grouped_Title:::Restaurant
            const decodedId = decodeURIComponent(id);
            const parts = decodedId.split(":::");
            const titlePart = parts[0]; 
            const title = titlePart.replace("grouped_", "");
            const restaurantName = parts[1];
            groupedData = await getGroupedDishDetails(title, restaurantName);

            if (groupedData) {
                dish = {
                    id,
                    title: groupedData.title,
                    restaurant: {
                        name: groupedData.restaurantName,
                        address: groupedData.restaurantAddress
                    },
                    stats: groupedData.stats,
                    userRating: groupedData.weightedRating,
                    reviewCount: groupedData.reviewCount,
                    images: groupedData.images,
                    tags: groupedData.tags || [],
                    matchScore: 95
                };
            }
        } else {
            // Одиночный пост из Django
            const options: any = {};
            if (session?.user?.accessToken) {
                options.headers = {
                    "Authorization": `Bearer ${session.user.accessToken}`
                };
            }
            
            const rawPost = await apiRequest(`/posts/${id}/`, options);
            if (rawPost) {
                dish = mapDjangoPostToDish(rawPost);
                // Дополнительные поля, которые есть в PostListSerializer бэкенда
                dish.isLiked = rawPost.is_liked;
                dish.isSaved = rawPost.is_saved;
            }
        }

        if (!dish) {
            return <div className={styles.container} style={{ padding: "40px", textAlign: "center" }}>Блюдо не найдено</div>;
        }

        const isAuthor = !isGrouped && dish.author && (session?.user?.id?.toString() === dish.author.id);
        const images = dish.images && dish.images.length > 0 ? dish.images : [dish.imageUrl];

        return (
            <div className={styles.container}>
                <DishGallery
                    images={images}
                    title={dish.title}
                    matchScore={dish.matchScore}
                />

                <div className={styles.content}>
                    {!isGrouped && dish.author && (
                        <AuthorSection
                            author={dish.author}
                            initialIsSubscribed={false} // Бэкенд пока не отдает is_subscribed
                        />
                    )}
                    <div className={styles.titleRow}>
                        <h1 className={styles.title}>{dish.title}</h1>
                        {!isGrouped && (
                            <DishActions dishId={dish.id} isAuthor={!!isAuthor} initialIsLiked={dish.isLiked} />
                        )}
                    </div>

                    {isGrouped && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <div className={styles.rating} style={{ fontSize: '20px' }}>
                                <Star size={20} fill="#FFD700" stroke="none" />
                                <span>{dish.userRating}</span>
                            </div>
                            <div style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
                                ({dish.reviewCount} отзывов) • Честный рейтинг
                            </div>
                        </div>
                    )}

                    <div className={styles.restaurantRow}>
                        <div className={styles.restaurantInfo}>
                            <MapPin size={18} className={styles.icon} />
                            <div>
                                <div className={styles.restaurantName}>{dish.restaurant.name}</div>
                                <div className={styles.address}>{dish.restaurant.address}</div>
                            </div>
                        </div>
                        <button className={styles.mapBtn}>На карте</button>
                    </div>

                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <Flame size={20} className={styles.statIcon} />
                            <span className={styles.statValue}>{dish.stats.calories || 0}</span>
                            <span className={styles.statLabel}>ккал</span>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.macroValue}>{dish.stats.protein || 0}г</div>
                            <span className={styles.statLabel}>Белки</span>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.macroValue}>{dish.stats.fat || 0}г</div>
                            <span className={styles.statLabel}>Жиры</span>
                        </div>
                        <div className={styles.statItem}>
                            <div className={styles.macroValue}>{dish.stats.carbs || 0}г</div>
                            <span className={styles.statLabel}>Углеводы</span>
                        </div>
                    </div>

                    {!isGrouped ? (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Описание</h2>
                            <p className={styles.description}>{dish.description}</p>
                        </div>
                    ) : (
                        <div className={styles.section}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                <MessageSquare size={20} className={styles.icon} />
                                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Отзывы пользователей</h2>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {groupedData.posts.map((post: any) => (
                                    <div key={post.id} style={{
                                        paddingLeft: '12px',
                                        borderLeft: '3px solid var(--border)',
                                        marginBottom: '8px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ position: 'relative', width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden' }}>
                                                    <Image
                                                        src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.name}`}
                                                        alt={post.author.name}
                                                        fill
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                </div>
                                                <span style={{ fontWeight: '600', fontSize: '14px' }}>{post.author.name}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '700' }}>
                                                <Star size={12} fill="#FFD700" stroke="none" />
                                                {post.userRating}
                                            </div>
                                        </div>
                                        <p style={{ margin: '4px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>{post.description}</p>
                                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {dish.tags && dish.tags.length > 0 && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Теги</h2>
                            <div className={styles.tags}>
                                {dish.tags.map((tag: string) => (
                                    <span key={tag} className={styles.tag}>#{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error("Dish page load error:", error);
        return <div style={{ padding: "40px", textAlign: "center" }}>Ошибка при загрузке данных блюда</div>;
    }
}

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import { Dish } from "@/lib/data";
import { toggleLike, toggleFollow } from "@/app/actions/social";
import styles from "./FeedItem.module.css";

interface FeedItemProps {
    dish: Dish;
    initialIsLiked?: boolean;
    initialIsSubscribed?: boolean;
    communityRating?: number;
}

const FeedItem = ({ dish, initialIsLiked = false, initialIsSubscribed = false, communityRating }: FeedItemProps) => {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    // ...
    const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
    const [likesCount, setLikesCount] = useState(dish.stats.likes);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const { data: session } = useSession();
    const router = useRouter();

    const images = dish.images && dish.images.length > 0 ? dish.images : [dish.imageUrl];

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            router.push("/login");
            return;
        }

        // Optimistic update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

        const res = await toggleLike(dish.id);
        if (res?.error) {
            // Revert on error
            setIsLiked(!newIsLiked);
            setLikesCount(prev => !newIsLiked ? prev + 1 : prev - 1);
        }
    };

    const handleSubscribe = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            router.push("/login");
            return;
        }

        // Optimistic update
        const newIsSubscribed = !isSubscribed;
        setIsSubscribed(newIsSubscribed);

        const res = await toggleFollow(dish.author.id);
        if (res?.error) {
            setIsSubscribed(!newIsSubscribed);
        }
    };

    const nextImage = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (currentImageIndex < images.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
        }
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && currentImageIndex < images.length - 1) {
            nextImage();
        }
        if (isRightSwipe && currentImageIndex > 0) {
            prevImage();
        }

        setTouchStart(null);
        setTouchEnd(null);
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <Link href={dish.author.id === session?.user?.id ? "/profile" : `/users/${dish.author.id}`} className={styles.authorLink}>
                    <div className={styles.author}>
                        <Image
                            src={dish.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dish.author.name}`}
                            alt={dish.author.name}
                            width={32}
                            height={32}
                            className={styles.avatar}
                        />
                        <span className={styles.authorName}>{dish.author.name}</span>
                    </div>
                </Link>
                <button
                    className={`${styles.subscribeBtn} ${isSubscribed ? styles.subscribed : ""}`}
                    onClick={handleSubscribe}
                >
                    {isSubscribed ? "Вы подписаны" : "Подписаться"}
                </button>
            </div>

            <div
                className={styles.imageContainer}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <Link href={`/dish/${dish.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                    <Image
                        src={images[currentImageIndex]}
                        alt={dish.title}
                        fill
                        className={styles.image}
                        sizes="(max-width: 768px) 100vw, 600px"
                        priority
                    />
                </Link>

                {images.length > 1 && (
                    <div className={styles.imageCounter}>
                        {currentImageIndex + 1}/{images.length}
                    </div>
                )}

                {/* Optional: Add click areas for desktop navigation if needed, 
                    but swipe is requested. We can add arrows later if needed. */}
            </div>

            <div className={styles.content}>
                <div className={styles.titleRow}>
                    <Link href={`/dish/${dish.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                        <h3 className={styles.title}>{dish.title}</h3>
                    </Link>
                    <button
                        className={`${styles.likeBtn} ${isLiked ? styles.liked : ""}`}
                        onClick={handleLike}
                    >
                        <Heart size={24} fill={isLiked ? "#e74c3c" : "none"} stroke={isLiked ? "#e74c3c" : "currentColor"} />
                    </button>
                </div>

                {dish.description && (
                    <p className={styles.description}>{dish.description}</p>
                )}

                <div className={styles.metaRow}>
                    <div className={styles.rating}>
                        <span className={styles.ratingLabel}>От автора:</span>
                        <span className={styles.ratingValue}>{dish.userRating}/10</span>
                    </div>
                    {communityRating !== undefined && (
                        <div className={styles.rating}>
                            <span className={styles.ratingLabel}>Общая:</span>
                            <span className={styles.ratingValue}>{communityRating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {dish.tags && dish.tags.length > 0 && (
                    <div className={styles.tagRow}>
                        {dish.tags.slice(0, 3).map(tag => (
                            <span key={tag} className={styles.tagChip}>{tag}</span>
                        ))}
                    </div>
                )}

                <div className={styles.restaurant}>
                    <MapPin size={16} />
                    <span>{dish.restaurant.name}</span>
                </div>

                <div className={styles.stats}>
                    <span>{likesCount} лайков</span>
                    <span className={styles.dot}>•</span>
                    <span>{dish.stats.calories} ккал</span>
                </div>
            </div>
        </div>
    );
};

export default FeedItem;

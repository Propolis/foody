"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Dish } from "@/lib/data";
import styles from "./RestaurantCard.module.css";

interface RestaurantCardProps {
    dish: Dish;
}

const RestaurantCard = ({ dish }: RestaurantCardProps) => {
    return (
        <Link href={`/dish/${dish.id}`} className={styles.card}>
            <div className={styles.imageContainer}>
                <Image
                    src={dish.imageUrl}
                    alt={dish.title}
                    fill
                    className={styles.image}
                    sizes="(max-width: 768px) 100vw, 300px"
                />
                <div className={styles.matchBadge}>{dish.matchScore}%</div>
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{dish.title}</h3>

                <div className={styles.restaurant}>
                    <div className={styles.restaurantName}>{dish.restaurant.name}</div>
                </div>

                <div className={styles.footer}>
                    <div className={styles.rating}>
                        <Star size={14} fill="#FFD700" stroke="none" />
                        <span>{dish.userRating}</span>
                        {dish.reviewCount && (
                            <span className={styles.reviewCount}>({dish.reviewCount})</span>
                        )}
                    </div>
                    <div className={styles.distance}>
                        <MapPin size={14} />
                        <span>1.2 km</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default RestaurantCard;

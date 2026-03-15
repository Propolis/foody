"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "./DishGallery.module.css";

interface DishGalleryProps {
    images: string[];
    title: string;
    matchScore?: number;
}

const DishGallery = ({ images, title, matchScore }: DishGalleryProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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

        if (isLeftSwipe && currentIndex < images.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
        if (isRightSwipe && currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }

        setTouchStart(null);
        setTouchEnd(null);
    };

    return (
        <div className={styles.gallery}>
            <Link href="/" className={styles.backBtn}>
                <ArrowLeft size={24} />
            </Link>

            <div
                className={styles.slidesContainer}
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {images.map((src, index) => (
                    <div key={`${src}-${index}`} className={styles.slide}>
                        <Image
                            src={src}
                            alt={`${title} - image ${index + 1}`}
                            fill
                            className={styles.image}
                            priority={index === 0}
                            sizes="100vw"
                        />
                        <div className={styles.overlay} />
                    </div>
                ))}
            </div>

            {images.length > 1 && (
                <div className={styles.indicators}>
                    {images.map((_, index) => (
                        <div
                            key={index}
                            className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ""}`}
                            onClick={() => setCurrentIndex(index)}
                        />
                    ))}
                </div>
            )}

            {matchScore !== undefined && (
                <div className={styles.matchBadge}>
                    {matchScore}% Совпадение
                </div>
            )}
        </div>
    );
};

export default DishGallery;

"use client";

import styles from "./CategoryFilter.module.css";

interface CategoryFilterProps {
    categories: string[];
    activeCategory: string;
    onSelect: (category: string) => void;
}

const CategoryFilter = ({ categories, activeCategory, onSelect }: CategoryFilterProps) => {
    return (
        <div className={styles.container}>
            {categories.map((category) => (
                <button
                    key={category}
                    className={`${styles.chip} ${activeCategory === category ? styles.active : ""}`}
                    onClick={() => onSelect(category)}
                >
                    {category}
                </button>
            ))}
        </div>
    );
};

export default CategoryFilter;

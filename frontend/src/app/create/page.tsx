"use client";

import { createPost } from "@/app/actions/post";
import { useState, useRef } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import styles from "./page.module.css";

import { CATEGORIES } from "@/lib/data";

export default function CreatePostPage() {
    const [error, setError] = useState<string | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState("");
    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length > 0) {
            const validFiles = selectedFiles.filter(file => {
                if (!file.type.startsWith("image/")) {
                    setError(`Файл ${file.name} не является изображением`);
                    return false;
                }
                return true;
            });

            if (validFiles.length > 0) {
                setError(null);
                setFiles(prev => [...prev, ...validFiles]);
                const newPreviews = validFiles.map(file => URL.createObjectURL(file));
                setPreviews(prev => [...prev, ...newPreviews]);
            }
        }
    };

    const removePhoto = (index: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            newFiles.splice(index, 1);
            return newFiles;
        });
        setPreviews(prev => {
            const newPreviews = [...prev];
            URL.revokeObjectURL(newPreviews[index]);
            newPreviews.splice(index, 1);
            return newPreviews;
        });
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    };

    const addTag = () => {
        const trimmed = currentTag.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags(prev => [...prev, trimmed]);
            setCurrentTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(prev => prev.filter(tag => tag !== tagToRemove));
    };

    async function handleSubmit(formData: FormData) {
        // Replace 'image' field with all our selected files
        formData.delete("image");
        files.forEach(file => {
            formData.append("image", file);
        });

        // Add tags
        formData.delete("tags");
        tags.forEach(tag => {
            formData.append("tags", tag);
        });

        const res = await createPost(formData);
        if (res?.error) {
            setError(res.error);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Новый пост</h1>
                <form ref={formRef} action={handleSubmit} className={styles.form}>

                    {/* Multi-Photo Upload Area */}
                    <div className={styles.uploadSection}>
                        <div
                            className={`${styles.fileUpload} ${previews.length > 0 ? styles.hasFile : ""}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                className={styles.fileInput}
                                id="image"
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleFileChange}
                                multiple
                                style={{ display: 'none' }}
                            />
                            {previews.length === 0 ? (
                                <>
                                    <div className={styles.uploadIcon}>
                                        <Upload size={32} />
                                    </div>
                                    <span className={styles.uploadText}>Выберите фотографии</span>
                                    <span className={styles.uploadHint}>JPG, PNG до 5MB (можно несколько)</span>
                                </>
                            ) : (
                                <div className={styles.previewList}>
                                    {previews.map((url, index) => (
                                        <div key={url} className={styles.previewItem}>
                                            <Image
                                                src={url}
                                                alt={`Preview ${index}`}
                                                fill
                                                className={styles.previewImage}
                                            />
                                            <button
                                                type="button"
                                                className={styles.removeBtn}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removePhoto(index);
                                                }}
                                            >
                                                <Upload size={14} style={{ transform: 'rotate(45deg)' }} />
                                            </button>
                                        </div>
                                    ))}
                                    <div className={styles.addMore}>
                                        <Upload size={20} />
                                        <span>Добавить</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="title">Название блюда</label>
                        <input
                            className={styles.input}
                            id="title"
                            type="text"
                            name="title"
                            placeholder="Например, Борщ"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="restaurantName">Где вы ели? (Название)</label>
                        <input
                            className={styles.input}
                            id="restaurantName"
                            type="text"
                            name="restaurantName"
                            placeholder="Например, Burger King"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="restaurantAddress">Адрес (необязательно)</label>
                        <input
                            className={styles.input}
                            id="restaurantAddress"
                            type="text"
                            name="restaurantAddress"
                            placeholder="Улица Ленина, 1"
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="tags">Теги (Например: Острое, Веган)</label>
                        <div className={styles.tagInputContainer}>
                            <input
                                className={styles.input}
                                id="tags"
                                type="text"
                                placeholder="Введите тег и нажмите Enter"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                            />
                            <button type="button" onClick={addTag} className={styles.addTagBtn}>
                                +
                            </button>
                        </div>
                        {tags.length > 0 && (
                            <div className={styles.tagList}>
                                {tags.map(tag => (
                                    <span key={tag} className={styles.tagChip}>
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className={styles.removeTagBtn}>×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="category">Категория</label>
                        <select
                            className={styles.input}
                            id="category"
                            name="category"
                            defaultValue="Все"
                        >
                            <option value="Все">Обычное</option>
                            {CATEGORIES.filter(c => c !== "Все").map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="description">Описание</label>
                        <textarea
                            className={`${styles.input} ${styles.textarea}`}
                            id="description"
                            name="description"
                            placeholder="Как это было вкусно?"
                            rows={3}
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="userRating">Ваша оценка (1-10)</label>
                        <input
                            className={styles.input}
                            id="userRating"
                            type="number"
                            name="userRating"
                            min="1"
                            max="10"
                            defaultValue="10"
                            required
                        />
                    </div>

                    {error && (
                        <div className={styles.error}>{error}</div>
                    )}

                    <button className={styles.button} type="submit">
                        Опубликовать
                    </button>
                </form>
            </div>
        </div>
    );
}

"use client";

import { updateProfile } from "@/app/actions/profile";
import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import Image from "next/image";
import styles from "./page.module.css";

interface User {
    name: string | null;
    image: string | null;
    bio: string | null;
}

export default function EditProfileForm({ user }: { user: User }) {
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(user.image);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setError("Пожалуйста, загрузите изображение (JPG, PNG)");
                return;
            }
            setError(null);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    async function handleSubmit(formData: FormData) {
        const res = await updateProfile(formData);
        if (res?.error) {
            setError(res.error);
        }
    }

    return (
        <form action={handleSubmit} className={styles.form}>
            <div className={styles.avatarUpload}>
                <div className={styles.avatarPreview} onClick={triggerFileInput}>
                    <Image
                        src={previewUrl || "/placeholder-avatar.png"}
                        alt="Avatar"
                        fill
                        className={styles.avatarImage}
                    />
                    <div className={styles.overlay}>
                        <Camera color="white" size={32} />
                    </div>
                </div>
                <input
                    ref={fileInputRef}
                    className={styles.fileInput}
                    type="file"
                    name="avatar"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="name">Имя</label>
                <input
                    className={styles.input}
                    id="name"
                    type="text"
                    name="name"
                    defaultValue={user.name || ""}
                    placeholder="Ваше имя"
                    required
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="bio">О себе</label>
                <textarea
                    className={`${styles.input} ${styles.textarea}`}
                    id="bio"
                    name="bio"
                    defaultValue={user.bio || ""}
                    placeholder="Расскажите о своих вкусах..."
                    rows={4}
                />
            </div>

            {error && (
                <div className={styles.error}>{error}</div>
            )}

            <button className={styles.button} type="submit">
                Сохранить
            </button>
        </form>
    );
}
